"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";

interface SimResult {
  found: boolean;
  designNo?: string;
  brand?: string;
  quantityOnHand?: number;
  available?: boolean;
  error?: string;
}

interface ChatMsg {
  sender: "dealer" | "bot";
  text: string;
  time: string;
}

export function WhatsAppAutoResponderPanel() {
  const [inputMsg, setInputMsg] = useState("7517-04");
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([
    { sender: "dealer", text: "7517-04", time: "10:14 AM" },
    { sender: "bot", text: "📦 Wall King Stock Update\n\nDesign No: *7517-04*\nBrand: *Erismann*\nStatus: ✅ *Available -- 99 Rolls*\n\nStock is subject to final order confirmation.", time: "10:14 AM" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSimulateSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setChatHistory((prev) => [...prev, { sender: "dealer", text: userText, time: nowTime }]);
    setInputMsg("");
    setLoading(true);

    try {
      const res = await fetch(`/api/internal/stock?designNo=${encodeURIComponent(userText)}`, {
        cache: "no-store",
      });
      const data: SimResult = await res.json();

      let replyText = "";

      if (data.error === "db_error" || res.status === 503) {
        replyText =
          "Sorry, I'm unable to check live stock right now. Our team has been notified. Please try again in a moment.";
      } else if (!data.found) {
        replyText = `🔎 I couldn't find that design number.\n\nPlease verify it and send it again, for example *7517-04*.`;
      } else if (!data.available) {
        replyText = `📦 Wall King Stock Update\n\nDesign No: *${data.designNo}*\nStatus: ❌ *Out of Stock*\n\nReply *AGENT* if you would like our team to check incoming stock.`;
      } else {
        replyText = [
          `📦 Wall King Stock Update`,
          ``,
          `Design No: *${data.designNo}*`,
          `Brand: *${data.brand}*`,
          `Status: ✅ *Available -- ${data.quantityOnHand} Rolls*`,
          ``,
          `Stock is subject to final order confirmation.`,
        ]
          .filter(Boolean)
          .join("\n");
      }

      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: replyText, time: nowTime },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I'm unable to check live stock right now. Please try again in a moment.",
          time: nowTime,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const processSteps = [
    {
      n: "1",
      title: "Admin Updates Stock",
      desc: "Upload CSV/Excel or use the admin form at /admin/stock.",
      color: "accent",
    },
    {
      n: "2",
      title: "Dealer Texts WhatsApp",
      desc: "Sends design code (e.g. 7517-04) to Wall King's business number.",
      color: "accent",
    },
    {
      n: "3",
      title: "Meta Webhook Fires",
      desc: "Meta calls /api/whatsapp/webhook with the message.",
      color: "accent",
    },
    {
      n: "4",
      title: "Live DB Lookup",
      desc: "System queries Supabase stock_items table in real time.",
      color: "emerald-500",
    },
    {
      n: "5",
      title: "Instant Reply",
      desc: "Available -- 99 Rolls or Out of Stock sent back via Meta API.",
      color: "emerald-500",
    },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
      <div className="mb-8 border-b border-line pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-500">
          <MessageSquare className="h-3.5 w-3.5" /> Meta WhatsApp Business Cloud API
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold text-ink">
          WhatsApp Stock Bot -- Live Preview
        </h3>
        <p className="mt-1 text-xs text-ink-3">
          Dealers message a design number -- webhook queries live Supabase inventory -- instant reply via Meta Cloud API.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Phone Chat Simulator */}
        <div className="flex flex-col rounded-2xl border border-emerald-500/30 bg-slate-950 p-4 text-white shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm">
              WK
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Wall King Stock Bot</h4>
              <p className="text-[0.65rem] text-emerald-400">
                Powered by Meta WhatsApp Cloud API * Supabase Live DB
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 py-4 max-h-[320px] overflow-y-auto pr-1">
            {chatHistory.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === "dealer" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                    m.sender === "dealer"
                      ? "bg-emerald-700 text-white rounded-tr-none font-bold"
                      : "bg-slate-800 text-emerald-400 font-bold rounded-tl-none border border-slate-700"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed font-sans">{m.text}</p>
                  <span className="mt-1 block text-[0.6rem] text-slate-400 text-right font-normal">
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs border border-slate-700">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSimulateSend} className="flex gap-2 border-t border-white/10 pt-3">
            <input
              id="wa-sim-input"
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Test a design no. (e.g. 7517-04)..."
              className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Process flow */}
        <div className="space-y-3">
          <h4 className="font-display text-sm font-bold text-ink mb-3">
            Official Cloud API Flow
          </h4>
          {processSteps.map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-line bg-panel p-3 text-xs text-ink-2 flex items-center gap-3"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-[0.7rem] ${
                  s.color === "emerald-500"
                    ? "bg-emerald-500/20 text-emerald-500"
                    : "bg-accent/20 text-accent"
                }`}
              >
                {s.n}
              </span>
              <div>
                <strong className="text-ink">{s.title}:</strong> {s.desc}
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs text-sky-300/80 mt-2">
            <CheckCircle2 className="inline h-3.5 w-3.5 mr-1 text-sky-400" />
            <strong className="text-sky-400">No QR scan, no phone pairing.</strong>{" "}
            The webhook runs on Vercel -- always-on, no desktop PC required.
          </div>
        </div>
      </div>
    </div>
  );
}
