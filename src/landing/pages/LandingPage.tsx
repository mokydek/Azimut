import { LandingHeader } from '@landing/components/LandingHeader'
import { Hero } from '@landing/components/Hero'
import { Steps } from '@landing/components/Steps'
import { Modules } from '@landing/components/Modules'
import { Methodology } from '@landing/components/Methodology'
import { Manifesto } from '@landing/components/Manifesto'
import { FinalCta } from '@landing/components/FinalCta'
import { LandingFooter } from '@landing/components/LandingFooter'
import { useDocumentTitle } from '@shared/useDocumentTitle'

export default function LandingPage() {
  useDocumentTitle('Azimut')

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <main>
        <Hero />
        <Steps />
        <Modules />
        <Methodology />
        <Manifesto />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
