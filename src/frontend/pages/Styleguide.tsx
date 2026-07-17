// internal page, will be removed before deployment
import type { ReactNode } from 'react'
import { ArrowRight, Plus, Check } from 'lucide-react'
import { Badge, Button, Card, Container, Input } from '@shared/ui'

const palette = [
  { name: 'Ink', value: '#111111', note: 'Primary text' },
  { name: 'Muted', value: '#666666', note: 'Secondary text' },
  { name: 'Border', value: '#e5e5e5', note: 'All borders' },
  { name: 'Surface', value: '#fafafa', note: 'Subtle background blocks' },
  { name: 'Accent', value: '#002FA7', note: 'Klein blue, the only accent' },
  { name: 'Accent hover', value: '#00238a', note: 'Accent pressed state' },
  { name: 'Error', value: '#b42318', note: 'Validation messages only' },
  { name: 'White', value: '#ffffff', note: 'Page background' },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-border pt-10">
      <h2 className="text-2xl font-bold text-ink">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4">{children}</div>
}

export default function Styleguide() {
  return (
    <main className="min-h-screen bg-white py-16">
      <Container>
        <header className="pb-10">
          <h1 className="text-4xl font-bold text-ink">Azimut design system</h1>
          <p className="mt-3 max-w-2xl text-base text-muted">
            The shared foundation for the landing site and the application. Every future page is
            built from these tokens and components.
          </p>
        </header>

        <div className="flex flex-col gap-12">
          <Section
            title="Typography"
            description="Space Grotesk is used only for headings and large numeric values. Archivo carries everything else."
          >
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                  Space Grotesk
                </span>
                <h1 className="text-5xl font-bold text-ink">Adapt with a clear head</h1>
                <h2 className="text-3xl font-bold text-ink">Adapt with a clear head</h2>
                <h3 className="text-2xl font-medium text-ink">Adapt with a clear head</h3>
                <h4 className="text-xl font-medium text-ink">Adapt with a clear head</h4>
                <div className="mt-2 font-heading text-7xl font-bold tabular-nums text-ink">72</div>
                <span className="text-[13px] text-muted">Large numeric value, risk score sample</span>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                  Archivo
                </span>
                <p className="max-w-2xl text-base text-ink">
                  Your work changes over time, and so does the map. This paragraph shows Archivo at
                  the regular weight, the default voice for reading across the product.
                </p>
                <p className="text-base font-normal text-ink">Archivo regular, weight 400</p>
                <p className="text-base font-medium text-ink">Archivo medium, weight 500</p>
                <p className="text-base font-semibold text-ink">Archivo semibold, weight 600</p>
              </div>
            </div>
          </Section>

          <Section title="Color" description="Black, white, grays and a single Klein blue accent.">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {palette.map((color) => (
                <div key={color.name} className="flex flex-col gap-2">
                  <div
                    className="h-20 w-full rounded-[2px] border border-border"
                    style={{ backgroundColor: color.value }}
                  />
                  <div>
                    <div className="text-sm font-medium text-ink">{color.name}</div>
                    <div className="text-[13px] uppercase text-muted">{color.value}</div>
                    <div className="text-[13px] text-muted">{color.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Buttons" description="Four variants, three sizes, disabled and icon support.">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-[13px] font-medium text-muted">Variants</span>
                <Row>
                  <Button variant="primary">Primary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </Row>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[13px] font-medium text-muted">Sizes</span>
                <Row>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </Row>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[13px] font-medium text-muted">With icon</span>
                <Row>
                  <Button variant="accent" icon={ArrowRight}>
                    Continue
                  </Button>
                  <Button variant="outline" icon={Plus}>
                    Add step
                  </Button>
                  <Button variant="primary" icon={Check}>
                    Mark done
                  </Button>
                </Row>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[13px] font-medium text-muted">Disabled</span>
                <Row>
                  <Button variant="primary" disabled>
                    Primary
                  </Button>
                  <Button variant="accent" disabled>
                    Accent
                  </Button>
                  <Button variant="outline" disabled>
                    Outline
                  </Button>
                  <Button variant="ghost" disabled>
                    Ghost
                  </Button>
                </Row>
              </div>
            </div>
          </Section>

          <Section title="Input" description="Label above the field, quiet focus, optional error state.">
            <div className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
              <Input label="Full name" placeholder="Jane Cooper" />
              <Input
                label="Email"
                placeholder="you@example.com"
                defaultValue="not an email"
                error="Enter a valid email address"
              />
            </div>
          </Section>

          <Section title="Card" description="White surface, one pixel border, no shadow.">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Card>
                <h3 className="text-lg font-medium text-ink">Default card</h3>
                <p className="mt-2 text-sm text-muted">
                  Padding defaults to 24 pixels. Use cards to group related content without any
                  shadow or elevation.
                </p>
              </Card>
              <Card padding={32}>
                <h3 className="text-lg font-medium text-ink">Roomier card</h3>
                <p className="mt-2 text-sm text-muted">
                  This card sets padding to 32 pixels through the padding prop.
                </p>
              </Card>
            </div>
          </Section>

          <Section title="Badge" description="Small uppercase labels for status and category.">
            <Row>
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="neutral">Office and admin</Badge>
              <Badge variant="accent">High risk</Badge>
            </Row>
          </Section>
        </div>
      </Container>
    </main>
  )
}
