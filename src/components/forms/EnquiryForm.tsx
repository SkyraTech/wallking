"use client";

import { useState, type FormEvent } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { ButtonEl, cx } from "@/components/ui/primitives";
import { site, whatsappLink, applications } from "@/lib/site";

/**
 * Enquiry form.
 *
 * There is no backend yet, so rather than a dead "Submit" that silently
 * discards a lead, the form composes the enquiry and hands it to WhatsApp or
 * the visitor's mail client — both of which land in an inbox you already
 * watch. To switch to a stored/CRM submission later, replace `handleSend`
 * with a server action; the markup and validation stay as they are.
 */

const fieldBase =
  "h-12 w-full border border-line bg-transparent px-4 text-[0.875rem] text-ink outline-none transition-colors duration-300 placeholder:text-ink-3 focus:border-accent";

export type EnquiryKind = "general" | "project" | "dealer" | "catalogue";

const intents: { value: EnquiryKind; label: string }[] = [
  { value: "general", label: "General enquiry" },
  { value: "project", label: "Project / specification" },
  { value: "dealer", label: "Dealer & distribution" },
  { value: "catalogue", label: "Request a catalogue" },
];

export function EnquiryForm({
  defaultKind = "general",
  compact = false,
  className,
}: {
  defaultKind?: EnquiryKind;
  compact?: boolean;
  className?: string;
}) {
  const [kind, setKind] = useState<EnquiryKind>(defaultKind);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [application, setApplication] = useState<string>("Residential");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = name.trim().length > 1 && (phone.trim().length > 7 || email.includes("@"));

  const compose = () =>
    [
      `Enquiry type: ${intents.find((i) => i.value === kind)?.label}`,
      `Name: ${name}`,
      phone && `Phone: ${phone}`,
      email && `Email: ${email}`,
      city && `City: ${city}`,
      `Application: ${application}`,
      "",
      message || "(no additional detail)",
    ]
      .filter(Boolean)
      .join("\n");

  const send = (channel: "whatsapp" | "email") => (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;

    const body = compose();
    if (channel === "whatsapp") {
      window.open(whatsappLink(body), "_blank", "noopener,noreferrer");
    } else {
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
        `Website enquiry — ${name}`,
      )}&body=${encodeURIComponent(body)}`;
    }
  };

  return (
    <form className={cx("space-y-5", className)} noValidate>
      <fieldset>
        <legend className="eyebrow mb-3 text-ink-3">I am enquiring about</legend>
        <div className="flex flex-wrap gap-1.5">
          {intents.map((i) => (
            <button
              key={i.value}
              type="button"
              onClick={() => setKind(i.value)}
              aria-pressed={kind === i.value}
              className={cx(
                "border px-3 py-2 text-[0.75rem] transition-colors duration-300",
                kind === i.value
                  ? "border-accent bg-accent text-void"
                  : "border-line text-ink-2 hover:border-ink-3 hover:text-ink",
              )}
            >
              {i.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={cx("grid gap-4", compact ? "" : "sm:grid-cols-2")}>
        <label className="block">
          <span className="eyebrow mb-2 block text-ink-3">Name *</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cx(fieldBase, touched && name.trim().length < 2 && "border-alert")}
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <span className="eyebrow mb-2 block text-ink-3">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldBase}
            placeholder="+91 …"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
          />
        </label>

        <label className="block">
          <span className="eyebrow mb-2 block text-ink-3">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldBase}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="eyebrow mb-2 block text-ink-3">City</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={fieldBase}
            placeholder="Hyderabad"
            autoComplete="address-level2"
          />
        </label>
      </div>

      <label className="block">
        <span className="eyebrow mb-2 block text-ink-3">Application</span>
        <select
          value={application}
          onChange={(e) => setApplication(e.target.value)}
          className={cx(fieldBase, "cursor-pointer")}
        >
          {applications.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="eyebrow mb-2 block text-ink-3">
          Tell us about the wall
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={compact ? 3 : 5}
          className="w-full resize-y border border-line bg-transparent p-4 text-[0.875rem] leading-relaxed text-ink outline-none transition-colors duration-300 placeholder:text-ink-3 focus:border-accent"
          placeholder="Room, approximate dimensions, a design number if you have one, and when you need it."
        />
      </label>

      {touched && !valid && (
        <p role="alert" className="text-[0.8125rem] text-alert">
          Please add your name and at least one way to reach you.
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-1">
        <ButtonEl type="submit" size="lg" onClick={send("whatsapp")}>
          <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
          Send on WhatsApp
        </ButtonEl>
        <ButtonEl type="button" tone="outline" size="lg" onClick={send("email")}>
          <Mail className="h-4 w-4" strokeWidth={1.5} />
          Send by email
        </ButtonEl>
      </div>

      <p className="pt-1 text-[0.75rem] leading-relaxed text-ink-3">
        Your details go straight to our team — we do not pass them to anyone
        else. We usually reply the same working day.
      </p>
    </form>
  );
}
