import { Badge, Button, Container } from '@shared/ui'

function scrollToSteps() {
  document.getElementById('steps')?.scrollIntoView({ behavior: 'smooth' })
}

export function Hero() {
  return (
    <section className="pt-[140px] pb-[120px]">
      <Container>
        <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
          <Badge variant="accent">Карьера в эпоху ИИ</Badge>

          <h1 className="mt-6 font-heading text-[36px] font-bold leading-[1.05] tracking-tight text-ink md:text-[56px]">
            Превратите страх перед ИИ в ясный план действий
          </h1>

          <p className="mt-5 max-w-[560px] text-base text-muted md:text-lg">
            Диагностика опирается на факторные профили 178 профессий и открытые исследования.
            Результат показывает и внешнее давление автоматизации, и вашу личную готовность.
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Button to="/auth" variant="accent" size="lg" className="w-full sm:w-auto">
              Начать бесплатно
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={scrollToSteps}
            >
              Как это работает
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
