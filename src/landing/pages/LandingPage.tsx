import { LandingHeader } from '@landing/components/LandingHeader'
import { Hero } from '@landing/components/Hero'
import { Steps } from '@landing/components/Steps'
import { Modules } from '@landing/components/Modules'
import { Manifesto } from '@landing/components/Manifesto'
import { FinalCta } from '@landing/components/FinalCta'
import { LandingFooter } from '@landing/components/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <main>
        <Hero />
        <Steps />
        <Modules />
        <Manifesto />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
