import { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Card } from '@shared/ui'
import { useAuth } from '@frontend/auth/AuthProvider'
import { getOverview } from '@backend/services/dashboardService'
import type { OverviewData } from '@backend/services/dashboardService'

function pluralRu(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

function formatToday(): string {
  const formatted = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function firstNameFrom(fullName: string | undefined, email: string | undefined): string {
  const trimmed = (fullName ?? '').trim()
  if (trimmed.length > 0) return trimmed.split(' ')[0] ?? trimmed
  return email ?? 'друг'
}

function CardTitle({ children }: { children: string }) {
  return <h3 className="font-heading text-base font-medium text-ink">{children}</h3>
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[2px] border border-border p-6">
      <div className="h-4 w-24 rounded-[2px] bg-[#f0f0f0]" />
      <div className="mt-4 h-10 w-full rounded-[2px] bg-[#f0f0f0]" />
      <div className="mt-4 h-9 w-32 rounded-[2px] bg-[#f0f0f0]" />
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setFailed(false)
    const result = await getOverview()
    if ('error' in result) {
      setFailed(true)
      setLoading(false)
      return
    }
    setData(result.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const fullName =
    typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined
  const firstName = firstNameFrom(fullName, user?.email)

  return (
    <div>
      <header>
        <h1 className="font-heading text-[28px] font-medium tracking-tight text-ink">
          Здравствуйте, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted">{formatToday()}</p>
      </header>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : failed ? (
          <div className="rounded-[2px] border border-[#b42318] bg-white px-4 py-4">
            <p className="text-sm text-[#b42318]">Не удалось загрузить данные</p>
            <Button variant="ghost" className="mt-2 px-0" onClick={() => void load()}>
              Попробовать снова
            </Button>
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <AssessmentCard data={data} />
            <RoadmapCard data={data} />
            <TrackerCard data={data} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function AssessmentCard({ data }: { data: OverviewData }) {
  return (
    <Card>
      <CardTitle>Диагностика</CardTitle>
      {data.assessment ? (
        <>
          <div className="mt-4 font-heading text-5xl font-bold tabular-nums text-ink">
            {data.assessment.riskScore}
          </div>
          <p className="mt-1 text-sm text-muted">
            {data.assessment.professionName ?? 'Профессия не указана'}
          </p>
          <Button to="/app/assessment" variant="outline" size="sm" className="mt-4">
            Открыть
          </Button>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">Вы еще не проходили диагностику</p>
          <Button to="/app/assessment" variant="accent" size="sm" className="mt-4">
            Пройти диагностику
          </Button>
        </>
      )}
    </Card>
  )
}

function RoadmapCard({ data }: { data: OverviewData }) {
  const { roadmap } = data
  if (!roadmap) {
    return (
      <Card className="opacity-50">
        <CardTitle>План</CardTitle>
        <div className="mt-4">
          <Badge variant="neutral">Откроется после диагностики</Badge>
        </div>
        <p className="mt-3 text-sm text-muted">
          План появится, когда вы пройдете диагностику профессии.
        </p>
      </Card>
    )
  }

  const percent = roadmap.total > 0 ? Math.round((roadmap.completed / roadmap.total) * 100) : 0
  return (
    <Card>
      <CardTitle>План</CardTitle>
      <p className="mt-4 text-sm text-ink">
        {roadmap.completed} из {roadmap.total}{' '}
        {pluralRu(roadmap.total, 'шага', 'шагов', 'шагов')}
      </p>
      <div className="mt-3 h-[2px] w-full bg-surface">
        <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
      </div>
      <Button to="/app/roadmap" variant="outline" size="sm" className="mt-4">
        Открыть
      </Button>
    </Card>
  )
}

function TrackerCard({ data }: { data: OverviewData }) {
  const count = data.journalCountLast7Days
  return (
    <Card>
      <CardTitle>Трекер</CardTitle>
      <p className="mt-4 text-sm text-ink">
        {count} {pluralRu(count, 'запись', 'записи', 'записей')} за неделю
      </p>
      <Button to="/app/tracker" variant="outline" size="sm" className="mt-4">
        Открыть трекер
      </Button>
    </Card>
  )
}
