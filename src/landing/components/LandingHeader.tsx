import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button, Container } from '@shared/ui'

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="Azimut">
            <Compass size={20} strokeWidth={1.75} className="text-ink" aria-hidden />
            <span className="font-heading text-lg font-bold tracking-tight text-ink">Azimut</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex">
              <Button to="/auth" variant="ghost">
                Войти
              </Button>
            </span>
            <Button to="/auth" variant="accent">
              Начать
            </Button>
          </div>
        </div>
      </Container>
    </header>
  )
}
