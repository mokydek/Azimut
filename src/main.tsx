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
const AppHome = lazy(() => import('@frontend/pages/AppHome'))
const AuthPage = lazy(() => import('@frontend/pages/AuthPage'))
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
              path="/app"
              element={
                <ProtectedRoute>
                  <AppHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auth"
              element={
                <GuestRoute>
                  <AuthPage />
                </GuestRoute>
              }
            />
            {/* internal page, will be removed before deployment */}
            <Route path="/styleguide" element={<Styleguide />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
