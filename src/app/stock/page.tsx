import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { StockAvailabilityWidget } from "@/components/stock/StockAvailabilityWidget";
import { LiveWhatsAppQRCode } from "@/components/stock/LiveWhatsAppQRCode";
import { AdminStockExcelPortal } from "@/components/stock/AdminStockExcelPortal";
import { WhatsAppAutoResponderPanel } from "@/components/stock/WhatsAppAutoResponderPanel";
import { Reveal } from "@/components/motion/Reveal";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Stock Availability & Dealer Portal -- Wall King",
  description:
    "Check real-time wallpaper roll stock availability across 25+ global brands. Instant WhatsApp bot powered by Meta WhatsApp Business Cloud API and live Supabase inventory.",
  alternates: { canonical: "/stock" },
};

export default function StockPage() {
  return (
    <>
      <PageHero
        eyebrow="B2B Dealer Network * 24x7 Instant Stock Engine"
        crumbs={[{ label: "Live Stock Availability" }]}
        titleLines={["Real-Time Stock", "Availability Engine."]}
        lede="Search design numbers for instant warehouse roll quantities. Dealers can also message design codes on WhatsApp for automated replies powered by Meta WhatsApp Business Cloud API."
        art={{
          kind: "ashlar",
          palette: ["#080a0d", "#1c222c", "#0d131c", "#2a3444"],
          scale: 1.1,
        }}
        seed="stock-hero"
      />

      {/* Benefits Banner */}
      <section className="border-b border-line bg-deep/60 py-8">
        <Container wide>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "24x7 Instant Lookup", desc: "No waiting for office hours or manual replies." },
              { title: "Official Meta API", desc: "WhatsApp Business Cloud API -- enterprise-grade, no QR scan." },
              { title: "Real-time Quantity", desc: "Live roll balances from Hyderabad central warehouse." },
              { title: "Excel & CSV Import", desc: "Update thousands of SKUs from daily stock sheets with full preview." },
            ].map((b) => (
              <div key={b.title} className="rounded-xl border border-line bg-panel/80 p-5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-accent font-display text-sm font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{b.title}</span>
                </div>
                <p className="mt-1 text-xs text-ink-3">{b.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* WhatsApp Webhook Setup */}
      <section className="pt-16 pb-8 border-b border-line bg-deep/40">
        <Container wide>
          <Reveal>
            <LiveWhatsAppQRCode />
          </Reveal>
        </Container>
      </section>

      {/* Main Stock Availability Search */}
      <section className="py-16 lg:py-24">
        <Container wide>
          <Reveal>
            <div className="mb-10 max-w-3xl">
              <Eyebrow className="mb-4">Dealer Stock Search</Eyebrow>
              <h2 className="display-xl text-ink">
                Check Roll Availability Instantly
              </h2>
              <p className="lede mt-4">
                Enter your required design number (e.g. 7517-04, ONYX-102, BEL-804) to see live roll counts from the Hyderabad central warehouse.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <StockAvailabilityWidget />
          </Reveal>
        </Container>
      </section>

      {/* WhatsApp Auto-Responder */}
      <section className="border-t border-line bg-deep/30 py-16 lg:py-24">
        <Container wide>
          <Reveal>
            <div className="mb-10 max-w-3xl">
              <Eyebrow className="mb-4">Automated WhatsApp Messaging</Eyebrow>
              <h2 className="display-xl text-ink">
                WhatsApp Stock Bot -- Live Demo
              </h2>
              <p className="lede mt-4">
                Dealers send design numbers directly on WhatsApp. The official Meta WhatsApp Business Cloud API webhook queries your live Supabase inventory and auto-replies with exact roll availability.
              </p>
            </div>
          </Reveal>

          <Reveal delay={110}>
            <WhatsAppAutoResponderPanel />
          </Reveal>
        </Container>
      </section>

      {/* Admin Excel Stock Update Portal */}
      <section className="border-t border-line bg-deep/50 py-16 lg:py-24">
        <Container wide>
          <Reveal>
            <div className="mb-10 max-w-3xl">
              <Eyebrow className="mb-4">Inventory Management</Eyebrow>
              <h2 className="display-xl text-ink">
                Daily Excel Stock Update Portal
              </h2>
              <p className="lede mt-4">
                Update stock balances directly from your daily Excel inventory sheets. Upload, preview, and apply changes atomically -- with full audit history.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <AdminStockExcelPortal />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
