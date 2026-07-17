import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@shared/styles/globals.css'

const LandingPage = lazy(() => import('@landing/pages/LandingPage'))
const AppHome = lazy(() => import('@frontend/pages/AppHome'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }} />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AppHome />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
