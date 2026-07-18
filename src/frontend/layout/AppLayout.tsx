import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="pt-14 md:pl-60 md:pt-0">
        <div className="mx-auto max-w-[960px] p-6 md:p-10">
          <Suspense fallback={<div className="min-h-[40vh]" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
