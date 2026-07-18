import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/500.css'
import '@fontsource/archivo/600.css'
import '@shared/styles/globals.css'
import { ErrorBoundary } from '@shared/ui'
import { AuthProvider } from '@frontend/auth/AuthProvider'
import { ProtectedRoute } from '@frontend/auth/ProtectedRoute'
import { GuestRoute } from '@frontend/auth/GuestRoute'

const LandingPage = lazy(() => import('@landing/pages/LandingPage'))
const AuthPage = lazy(() => import('@frontend/pages/AuthPage'))
const AppLayout = lazy(() => import('@frontend/layout/AppLayout'))
const Dashboard = lazy(() => import('@frontend/pages/Dashboard'))
const AssessmentPage = lazy(() => import('@frontend/modules/assessment/pages/AssessmentPage'))
const RoadmapPage = lazy(() => import('@frontend/modules/roadmap/pages/RoadmapPage'))
const TrackerPage = lazy(() => import('@frontend/modules/tracker/pages/TrackerPage'))
const ReviewPage = lazy(() => import('@frontend/modules/review/pages/ReviewPage'))
const LibraryPage = lazy(() => import('@frontend/modules/library/pages/LibraryPage'))
const NotFound = lazy(() => import('@frontend/pages/NotFound'))

// Warm up the connection to Supabase early. The origin is derived from the env
// value used at build time (project origin, e.g. https://<ref>.supabase.co).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
if (supabaseUrl) {
  try {
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = new URL(supabaseUrl).origin
    preconnect.crossOrigin = ''
    document.head.appendChild(preconnect)
  } catch {
    // Ignore a malformed URL; the app still works without the hint.
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }} />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/auth"
                element={
                  <GuestRoute>
                    <AuthPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="assessment" element={<AssessmentPage />} />
                <Route path="roadmap" element={<RoadmapPage />} />
                <Route path="tracker" element={<TrackerPage />} />
                <Route path="review" element={<ReviewPage />} />
                <Route path="library" element={<LibraryPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
