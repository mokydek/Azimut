import { Link } from 'react-router-dom'
import { Container } from '@shared/ui'

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-8">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-heading text-sm font-bold text-ink">Azimut 2026</span>
          <nav className="flex items-center gap-6">
            <Link to="/auth" className="text-sm text-muted transition-colors hover:text-ink">
              Вход
            </Link>
            <Link to="/auth" className="text-sm text-muted transition-colors hover:text-ink">
              Регистрация
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  )
}
