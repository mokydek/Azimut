import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// This file is a Vercel serverless function and is intentionally self contained:
// it does not import from src (different runtime, no path aliases). Types are
// declared locally.

interface AiAnalysis {
  analysis: string
  recommendations: string[]
  reframe: string
}

interface AssessmentRow {
  id: string
  profession_id: number | null
  answers: Record<string, unknown>
  risk_score: number
  breakdown: Record<string, unknown> | null
}

interface ProfessionRow {
  name: string
  routine_level: number
  social_level: number
  creative_level: number
  physical_level: number
  llm_exposure: number
}

const QUADRANT_NAMES: Record<string, string> = {
  rebuild: 'Перестройка в силе',
  attention: 'Зона внимания',
  stable: 'Устойчивая позиция',
  calm: 'Спокойная зона',
}

const SYSTEM_PROMPT = `Ты спокойный опытный карьерный консультант. Ты помогаешь человеку понять, как его профессия меняется под влиянием ИИ, и что он может сделать.

Строгие правила:
- Обращайся к человеку на вы.
- Тон фактический и теплый.
- Не используй эмодзи.
- Не используй восклицательные знаки.
- Не придумывай статистику и числа, которых нет во входных данных.
- Не давай гарантий результата.
- Не ставь медицинских или психологических диагнозов.
- Пиши простым языком, без модных составных слов через дефис.

Ответь строго в формате JSON без пояснений и без разметки кода. Структура:
{"analysis": строка из двух или трех абзацев, которая разбирает именно это сочетание профессии, распределения задач, диапазона давления, готовности и квадранта; "recommendations": массив ровно из трех строк, каждая это конкретное персональное действие, связанное с реальными ответами человека, а не общий совет; "reframe": один абзац, который переводит тревогу в зону контроля человека}

Верни только этот объект JSON.`

function stripFences(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()
  }
  return trimmed
}

function buildSummary(
  answers: Record<string, unknown>,
  breakdown: Record<string, unknown>,
  profession: ProfessionRow | null,
): string {
  const allocation = (answers.allocation ?? {}) as Record<string, number>
  const branch = (answers.branch ?? []) as number[]
  const readiness = (answers.readiness ?? []) as number[]
  const context = (answers.context ?? []) as number[]
  const branchId = String(answers.branchId ?? '')

  const lines: string[] = []
  lines.push(`Профессия: ${profession?.name ?? 'не указана'}`)
  if (profession) {
    lines.push(
      `Факторы профессии от 0 до 100: рутина ${profession.routine_level}, общение ${profession.social_level}, творчество ${profession.creative_level}, физический труд ${profession.physical_level}, применимость ИИ ${profession.llm_exposure}`,
    )
  }
  lines.push(
    `Распределение задач в процентах: рутина ${allocation.routine ?? 0}, общение ${allocation.social ?? 0}, творчество ${allocation.creative ?? 0}, физический труд ${allocation.physical ?? 0}, работа с информацией ${allocation.info ?? 0}`,
  )
  lines.push(`Ветка уточняющих вопросов: ${branchId}, ответы: ${branch.join(', ')}`)
  lines.push(`Ответы про готовность: ${readiness.join(', ')}`)
  lines.push(`Ответы про среду: ${context.join(', ')}`)
  lines.push(
    `Давление автоматизации: ${String(breakdown.exposureScore)} в диапазоне от ${String(breakdown.exposureMin)} до ${String(breakdown.exposureMax)}`,
  )
  lines.push(`Готовность к переменам: ${String(breakdown.readinessScore)}`)
  lines.push(`Квадрант: ${QUADRANT_NAMES[String(breakdown.quadrant)] ?? String(breakdown.quadrant)}`)

  const focus: string[] = []
  if ((allocation.social ?? 100) < 20) focus.push('коммуникация и эмпатия')
  if ((allocation.creative ?? 100) < 20) focus.push('нестандартное мышление')
  lines.push(`Слабые устойчивые области для развития: ${focus.length > 0 ? focus.join(', ') : 'не выявлены'}`)

  return lines.join('\n')
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // 1. POST only.
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // 2. Bearer token.
  const authHeader = req.headers.authorization
  const token =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' })
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: 'Server is not configured' })
    return
  }

  // 3. User scoped Supabase client. Validate the token.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) {
    res.status(401).json({ error: 'Invalid session' })
    return
  }

  // 4. Body and assessment fetch (RLS scopes to the owner).
  const body = (req.body ?? {}) as { assessmentId?: unknown }
  const assessmentId = typeof body.assessmentId === 'string' ? body.assessmentId : null
  if (!assessmentId) {
    res.status(400).json({ error: 'assessmentId is required' })
    return
  }

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('id, profession_id, answers, risk_score, breakdown')
    .eq('id', assessmentId)
    .maybeSingle()
  if (assessmentError) {
    res.status(500).json({ error: 'Failed to load assessment' })
    return
  }
  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found' })
    return
  }

  const row = assessment as AssessmentRow
  const breakdown = row.breakdown
  if (!breakdown || breakdown.version !== 2) {
    res.status(422).json({ error: 'Assessment is not version 2' })
    return
  }
  // Idempotency and cost guard: return the existing analysis if present.
  if (breakdown.ai) {
    res.status(200).json({ ai: breakdown.ai })
    return
  }

  // 5. Linked profession (name and factors).
  let profession: ProfessionRow | null = null
  if (row.profession_id != null) {
    const { data: prof } = await supabase
      .from('professions')
      .select('name, routine_level, social_level, creative_level, physical_level, llm_exposure')
      .eq('id', row.profession_id)
      .maybeSingle()
    profession = (prof as ProfessionRow | null) ?? null
  }

  // 6. Call the Claude API.
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    res.status(500).json({ error: 'Server is not configured' })
    return
  }
  const userMessage = buildSummary(row.answers, breakdown, profession)
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'
  const anthropic = new Anthropic({ apiKey: anthropicKey })

  let raw = ''
  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 1500,
      thinking: { type: 'disabled' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })
    const textBlock = message.content.find((block) => block.type === 'text')
    raw = textBlock && textBlock.type === 'text' ? textBlock.text : ''
  } catch {
    res.status(502).json({ error: 'Model request failed' })
    return
  }

  // 7. Parse the reply as JSON (strip accidental code fences).
  let parsed: AiAnalysis
  try {
    const candidate = JSON.parse(stripFences(raw)) as Partial<AiAnalysis>
    if (
      typeof candidate.analysis !== 'string' ||
      !Array.isArray(candidate.recommendations) ||
      candidate.recommendations.length !== 3 ||
      typeof candidate.reframe !== 'string'
    ) {
      throw new Error('Unexpected shape')
    }
    parsed = {
      analysis: candidate.analysis,
      recommendations: candidate.recommendations.map((item) => String(item)),
      reframe: candidate.reframe,
    }
  } catch {
    res.status(502).json({ error: 'Не удалось разобрать ответ модели' })
    return
  }

  // 8. Return the analysis. The function never writes to the database.
  res.status(200).json({ ai: parsed })
}
