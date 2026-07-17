import { Container } from '@shared/ui'

export function Manifesto() {
  return (
    <section className="bg-surface py-[120px]">
      <Container>
        <p className="mx-auto max-w-[760px] text-center font-heading text-2xl font-medium leading-snug text-ink">
          Спокойствие приходит не из того, что мы не замечаем перемен. Оно рождается из ясности.
          Когда виден следующий шаг, тревога уступает место работе.
        </p>
      </Container>
    </section>
  )
}
