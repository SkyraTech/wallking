"use client";

import { useState } from "react";
import { MessageSquare, CheckCircle2, Copy, Check, ExternalLink, AlertCircle, Webhook } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://wallking.in";
const WEBHOOK_URL = `${APP_URL}/api/whatsapp/webhook`;

export function LiveWhatsAppQRCode() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WEBHOOK_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const steps = [
    {
      step: "1",
      title: "Create Meta App",
      desc: "Go to developers.facebook.com -- My Apps -- Create App -- Select Business.",
    },
    {
      step: "2",
      title: "Add WhatsApp Product",
      desc: "In your app dashboard, click Add Product and select WhatsApp.",
    },
    {
      step: "3",
      title: "Configure Webhook",
      desc: "In WhatsApp -- Configuration, set Callback URL to the URL below, set Verify Token to the value in META_VERIFY_TOKEN, then subscribe to the messages field.",
    },
    {
      step: "4",
      title: "Get Phone Number ID",
      desc: "In WhatsApp -- API Setup, note your Phone Number ID and add it to META_WA_PHONE_NUMBER_ID.",
    },
    {
      step: "5",
      title: "Set Environment Variables",
      desc: "Copy .env.example -- .env.local and fill in META_APP_SECRET, META_WA_ACCESS_TOKEN, and the remaining fields.",
    },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
      <div className="mb-6 border-b border-line pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <Webhook className="h-3.5 w-3.5" /> Meta WhatsApp Cloud API
          </div>
          <h3 className="mt-2 font-display text-2xl font-bold text-ink">
            WhatsApp Business Webhook Setup
          </h3>
          <p className="mt-1 text-xs text-ink-3">
            Official Meta WhatsApp Business Cloud API -- enterprise-grade, serverless, no phone pairing required.
          </p>
        </div>
        <a
          href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition-colors shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Meta Docs
        </a>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] items-start">
        {/* Webhook URL box */}
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-void/80 p-4">
            <label className="block text-[0.65rem] font-bold text-accent uppercase tracking-wider mb-2">
              Your Webhook URL:
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-void border border-line px-3 py-2 font-mono text-xs text-ink break-all">
                {WEBHOOK_URL}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-lg border border-line bg-panel px-3 py-2 text-ink-3 hover:border-accent hover:text-accent transition-colors"
                title="Copy webhook URL"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4" /> What this webhook does
            </h4>
            <ul className="space-y-1.5 text-emerald-300/80 list-disc list-inside">
              <li>Receives messages from dealers via WhatsApp Business</li>
              <li>Verifies Meta signature (X-Hub-Signature-256)</li>
              <li>Deduplicates webhook retries automatically</li>
              <li>Queries live Supabase stock database</li>
              <li>Replies with accurate roll counts or safe error message</li>
              <li>Logs all events for audit & monitoring</li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300/80">
            <AlertCircle className="inline h-3.5 w-3.5 mr-1 text-amber-400" />
            <strong className="text-amber-400">MVP note:</strong> Processing runs in-process after Meta acknowledgment. For &gt;500 messages/day, upgrade to a durable queue (e.g., Upstash QStash).
          </div>
        </div>

        {/* Setup steps */}
        <div>
          <h4 className="font-display text-sm font-bold text-ink mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-accent" /> One-Time Setup Steps
          </h4>
          <ol className="space-y-3">
            {steps.map((s) => (
              <li key={s.step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 font-bold text-accent text-[0.7rem]">
                  {s.step}
                </span>
                <div>
                  <strong className="block text-xs text-ink">{s.title}</strong>
                  <p className="mt-0.5 text-xs text-ink-3 leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
