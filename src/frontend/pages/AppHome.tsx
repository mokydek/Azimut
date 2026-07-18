import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { useAuth } from '@frontend/auth/AuthProvider'

export default function AppHome() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  // temporary, replaced by the app shell in phase 6.
  // Navigate to the landing first so we leave the protected route before the
  // session clears, otherwise ProtectedRoute redirects to /auth mid sign out.
  async function handleSignOut() {
    navigate('/', { replace: true })
    await signOut()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* temporary, replaced by the app shell in phase 6 */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="font-heading text-lg font-bold text-ink">Dashboard</span>
        <Button variant="outline" onClick={handleSignOut}>
          Выйти
        </Button>
      </div>
    </div>
  )
}
