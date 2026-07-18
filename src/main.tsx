import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/500.css'
import '@fontsource/archivo/600.css'
import '@shared/styles/globals.css'
import { AuthProvider } from '@frontend/auth/AuthProvider'
import { ProtectedRoute } from '@frontend/auth/ProtectedRoute'
import { GuestRoute } from '@frontend/auth/GuestRoute'

const LandingPage = lazy(() => import('@landing/pages/LandingPage'))
const AuthPage = lazy(() => import('@frontend/pages/AuthPage'))
const AppLayout = lazy(() => import('@frontend/layout/AppLayout'))
const Dashboard = lazy(() => import('@frontend/pages/Dashboard'))
const AssessmentPage = lazy(() => import('@frontend/modules/assessment/pages/AssessmentPage'))
const RoadmapPlaceholder = lazy(() => import('@frontend/modules/roadmap/pages/RoadmapPlaceholder'))
const TrackerPlaceholder = lazy(() => import('@frontend/modules/tracker/pages/TrackerPlaceholder'))
// internal page, will be removed before deployment
const Styleguide = lazy(() => import('@frontend/pages/Styleguide'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
              <Route path="roadmap" element={<RoadmapPlaceholder />} />
              <Route path="tracker" element={<TrackerPlaceholder />} />
            </Route>
            {/* internal page, will be removed before deployment */}
            <Route path="/styleguide" element={<Styleguide />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
