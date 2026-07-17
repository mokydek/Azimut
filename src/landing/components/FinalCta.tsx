import { Button, Container } from '@shared/ui'

export function FinalCta() {
  return (
    <section className="border-t border-border py-[120px]">
      <Container>
        <div className="mx-auto flex max-w-[560px] flex-col items-center text-center">
          <h2 className="font-heading text-[32px] font-bold tracking-tight text-ink md:text-[40px]">
            Начните с диагностики
          </h2>
          <p className="mt-4 text-muted">Первый шаг занимает несколько минут.</p>
          <Button to="/auth" variant="accent" size="lg" className="mt-8">
            Создать аккаунт
          </Button>
        </div>
      </Container>
    </section>
  )
}
