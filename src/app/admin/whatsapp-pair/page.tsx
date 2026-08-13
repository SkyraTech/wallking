"use client";

import { useState, useEffect } from "react";
import { QrCode, Smartphone, RefreshCw, CheckCircle2, ShieldCheck, Lock, ExternalLink, Zap } from "lucide-react";
import { Container } from "@/components/ui/primitives";

export default function AdminWhatsAppPairPage() {
  const [pairingData, setPairingData] = useState<{
    qrImageUrl?: string;
    pairingCode?: string;
    status?: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchPairingData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/whatsapp-qr?t=${Date.now()}`);
      const data = await res.json();
      setPairingData(data);
    } catch (e) {
      console.error("Error fetching pairing data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairingData();
  }, [refreshCount]);

  return (
    <div className="min-h-screen bg-void py-16 text-ink">
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Header Badge */}
          <div className="mb-8 border-b border-line pb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-500">
              <Lock className="h-3.5 w-3.5" /> Admin Only · iPhone Device Pairing Portal
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Pair iPhone with Stock Auto-Responder
            </h1>
            <p className="mt-2 text-sm text-ink-2">
              Scan the 1-time WhatsApp Web pairing QR code below using your iPhone to activate 24×7 automated dealer stock replies.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-[320px_1fr] items-center">
            {/* Live Pairing QR & Phone Pairing Display Box */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-accent/40 bg-panel p-6 shadow-2xl backdrop-blur-xl">
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500 border border-amber-500/30">
                  Live Socket Pairing Required
                </span>
                <h4 className="mt-2 font-display text-sm font-bold text-ink">
                  WhatsApp Web Protocol QR
                </h4>
                <p className="mt-1 text-[0.72rem] text-ink-3">
                  WhatsApp Web requires a 60-second live WebSocket handshake from your office computer to pair successfully.
                </p>
              </div>

              <div className="w-full rounded-xl border border-dashed border-line bg-void/80 p-4 text-center">
                <p className="text-xs font-bold text-ink mb-1">To generate your live iPhone pairing QR:</p>
                <code className="block rounded bg-slate-950 p-2 font-mono text-xs text-accent border border-line">
                  npx @whiskeysockets/baileys
                </code>
                <p className="mt-2 text-[0.7rem] text-ink-3">
                  Run the command above in Terminal/Command Prompt on your computer to open the live 60s WhatsApp socket QR code.
                </p>
              </div>
            </div>

            {/* Step-by-Step iPhone Pairing Steps */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-panel/80 p-6 backdrop-blur-md">
                <h3 className="font-display text-lg font-bold text-ink mb-4 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-emerald-500" />
                  iPhone Pairing Guide (1-Time Setup)
                </h3>

                <ol className="space-y-4 text-xs text-ink-2">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 font-bold text-accent border border-accent/30 text-xs">
                      1
                    </span>
                    <div>
                      <strong className="text-ink">Run live socket command on computer</strong>
                      <p className="text-ink-3 mt-0.5">Open Terminal or Command Prompt on your computer and run <code className="text-accent font-mono font-bold">npx @whiskeysockets/baileys</code>.</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 font-bold text-accent border border-accent/30 text-xs">
                      2
                    </span>
                    <div>
                      <strong className="text-ink">Open WhatsApp on your iPhone</strong>
                      <p className="text-ink-3 mt-0.5">Go to Settings (bottom right corner) ➔ <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong>.</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 font-bold text-accent border border-accent/30 text-xs">
                      3
                    </span>
                    <div>
                      <strong className="text-ink">Scan Live Terminal QR or Link via Phone Number</strong>
                      <p className="text-ink-3 mt-0.5">Point your iPhone camera at the live terminal QR code, or tap <strong>&ldquo;Link with phone number instead&rdquo;</strong> to pair with an 8-character code!</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Status Notice */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Website API Endpoint Active</span>
                </div>
                Endpoint: <code className="font-mono font-bold text-emerald-300">https://wallking-amber.vercel.app/api/whatsapp-stock</code>
                <p className="mt-1 text-[0.72rem] text-emerald-500/90">
                  Connected to your website stock database. Once paired, incoming dealer WhatsApp queries (e.g. 7517-04) receive live roll availability auto-answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
