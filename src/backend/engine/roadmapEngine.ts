// Pure roadmap generator. No imports from supabase or react.

import type { TemplateCategory } from './roadmapTemplates'
import { roadmapTemplates } from './roadmapTemplates'

export interface GeneratedStep {
  title: string
  description: string
  category: string
  order_index: number
}

export interface RoadmapInput {
  category: 'low' | 'moderate' | 'high'
  focusAreas: string[]
  aiuse: number
}

// Focus areas that map onto a template category. The "aiuse" focus area is
// covered by the ai_tools rule below rather than its own category.
const FOCUS_CATEGORIES: TemplateCategory[] = ['communication', 'creative']

export function generateRoadmapSteps(input: RoadmapInput): GeneratedStep[] {
  const { category, focusAreas, aiuse } = input

  const collected: { title: string; description: string; category: string }[] = []

  const push = (templateCategory: TemplateCategory, templates: { title: string; description: string }[]) => {
    for (const template of templates) {
      collected.push({ title: template.title, description: template.description, category: templateCategory })
    }
  }

  // 1. ai_tools: all templates when AI use is low, otherwise just the first.
  const aiTools = roadmapTemplates.ai_tools
  push('ai_tools', aiuse < 50 ? aiTools : aiTools.slice(0, 1))

  // 2. focus area categories, in the order the assessment ranked them.
  const seen = new Set<string>()
  for (const area of focusAreas) {
    if (!FOCUS_CATEGORIES.includes(area as TemplateCategory) || seen.has(area)) continue
    seen.add(area)
    push(area as TemplateCategory, roadmapTemplates[area as TemplateCategory].slice(0, 3))
  }

  // 3. positioning: first two, or all for a high category.
  const positioning = roadmapTemplates.positioning
  push('positioning', category === 'high' ? positioning : positioning.slice(0, 2))

  // 4. resilience: scaled by category.
  const resilience = roadmapTemplates.resilience
  const resilienceCount = category === 'high' ? resilience.length : category === 'moderate' ? 2 : 1
  push('resilience', resilience.slice(0, resilienceCount))

  return collected.map((step, index) => ({ ...step, order_index: index }))
}
