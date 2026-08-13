"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { ButtonEl, CTA, Eyebrow, cx } from "@/components/ui/primitives";
import { collections } from "@/lib/data/collections";
import { whatsappLink } from "@/lib/site";

/**
 * Roll calculator.
 *
 * The arithmetic follows the way a fitter actually works, which is not the
 * same as dividing wall area by roll area:
 *
 *  1. Each drop must be a whole drop. You cannot join half a drop mid-wall.
 *  2. A patterned paper wastes up to one full repeat per drop for matching,
 *     so the usable drop length is rounded UP to a whole number of repeats.
 *  3. Only whole drops can be cut from a roll — the remainder is offcut.
 *  4. Doors and windows are deducted by area, but conservatively: a wall is
 *     never fewer drops because of an opening in the middle of it, so the
 *     deduction is capped and applied after the drop count.
 *
 * Getting (2) wrong is the single most common reason a job runs short.
 */

const BAND_PRICE: Record<1 | 2 | 3 | 4, number> = {
  1: 2200,
  2: 3800,
  3: 6500,
  4: 11500,
};

type Opening = { count: number; w: number; h: number };

export function WallpaperCalculator() {
  const [width, setWidth] = useState(4);      // metres, total wall run
  const [height, setHeight] = useState(3);    // metres
  const [walls, setWalls] = useState(1);
  const [doors, setDoors] = useState<Opening>({ count: 1, w: 0.9, h: 2.1 });
  const [windows, setWindows] = useState<Opening>({ count: 1, w: 1.2, h: 1.2 });
  const [slug, setSlug] = useState(collections[0].slug);
  const [wastage, setWastage] = useState(10);

  const collection = collections.find((c) => c.slug === slug)!;
  const { rollWidthCm, rollLengthM, repeatCm } = collection.spec;

  const result = useMemo(() => {
    const rollW = rollWidthCm / 100;
    const repeat = repeatCm / 100;

    const totalRun = Math.max(0, width) * Math.max(1, walls);
    const wallH = Math.max(0, height);

    // 1 — whole drops across the run
    const dropsNeeded = Math.ceil(totalRun / rollW);

    // 2 — a patterned drop must be cut to a whole number of repeats
    const dropLength =
      repeat > 0 ? Math.ceil(wallH / repeat) * repeat : wallH;

    // 3 — whole drops per roll
    const dropsPerRoll = Math.floor(rollLengthM / dropLength);

    const openingArea =
      doors.count * doors.w * doors.h + windows.count * windows.w * windows.h;
    const grossArea = totalRun * wallH;
    // Cap the deduction: an opening rarely saves a full drop.
    const deductibleDrops = Math.floor(
      Math.min(openingArea / (rollW * dropLength), dropsNeeded * 0.4),
    );

    const netDrops = Math.max(1, dropsNeeded - deductibleDrops);

    const baseRolls =
      dropsPerRoll > 0 ? Math.ceil(netDrops / dropsPerRoll) : Infinity;
    const rolls =
      dropsPerRoll > 0 ? Math.ceil(baseRolls * (1 + wastage / 100)) : 0;

    const netArea = Math.max(0, grossArea - openingArea);
    // Ready-mixed adhesive covers roughly 5 m² per kg on non-woven.
    const adhesiveKg = Math.ceil((netArea / 5) * 10) / 10;

    const cost = rolls * BAND_PRICE[collection.band];

    return {
      totalRun,
      grossArea,
      netArea,
      openingArea,
      dropsNeeded,
      netDrops,
      dropLength,
      dropsPerRoll,
      rolls: Number.isFinite(rolls) ? rolls : 0,
      adhesiveKg,
      cost,
      impossible: dropsPerRoll === 0,
    };
  }, [width, height, walls, doors, windows, wastage, rollWidthCm, rollLengthM, repeatCm, collection.band]);

  const reset = () => {
    setWidth(4);
    setHeight(3);
    setWalls(1);
    setDoors({ count: 1, w: 0.9, h: 2.1 });
    setWindows({ count: 1, w: 1.2, h: 1.2 });
    setWastage(10);
  };

  const summary = `Wallpaper estimate — ${collection.name}
Wall run: ${result.totalRun.toFixed(2)} m across ${walls} wall(s), ${height} m high
Openings deducted: ${doors.count} door(s), ${windows.count} window(s)
Rolls required: ${result.rolls} (incl. ${wastage}% wastage)
Adhesive: approx. ${result.adhesiveKg} kg
Indicative material cost: ₹${result.cost.toLocaleString("en-IN")}
Please confirm availability and final pricing.`;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_25rem] lg:gap-14">
      {/* ------------------------------------------------------ inputs */}
      <div className="space-y-10">
        <section>
          <Eyebrow className="mb-5">The wall</Eyebrow>
          <div className="grid gap-5 sm:grid-cols-3">
            <NumberField label="Total width" unit="m" value={width} onChange={setWidth} step={0.1} min={0.5} />
            <NumberField label="Wall height" unit="m" value={height} onChange={setHeight} step={0.1} min={1} />
            <NumberField label="Number of walls" unit="" value={walls} onChange={setWalls} step={1} min={1} integer />
          </div>
          <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-3">
            Enter the width of one wall and how many identical walls you are
            papering, or the total run across all of them with the count at 1.
          </p>
        </section>

        <section>
          <Eyebrow className="mb-5">Openings</Eyebrow>
          <div className="grid gap-6 sm:grid-cols-2">
            <OpeningField label="Doors" value={doors} onChange={setDoors} />
            <OpeningField label="Windows" value={windows} onChange={setWindows} />
          </div>
        </section>

        <section>
          <Eyebrow className="mb-5">The paper</Eyebrow>
          <label className="block">
            <span className="sr-only">Collection</span>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-12 w-full cursor-pointer border border-line bg-transparent px-4 text-[0.875rem] text-ink outline-none focus:border-accent"
            >
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} — {c.spec.rollWidthCm}cm × {c.spec.rollLengthM}m
                  {c.spec.repeatCm ? `, ${c.spec.repeatCm}cm repeat` : ", free match"}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="eyebrow text-ink-3">Wastage allowance</span>
              <span className="tnum text-[0.8125rem] text-ink">{wastage}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              step={1}
              value={wastage}
              onChange={(e) => setWastage(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
              aria-label="Wastage allowance percentage"
            />
            <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-3">
              We recommend 10% on a plain wall and 15–20% where there are many
              openings, an irregular ceiling, or a large pattern repeat.
            </p>
          </div>
        </section>

        <ButtonEl tone="ghost" size="sm" onClick={reset} className="px-0">
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} /> Reset
        </ButtonEl>
      </div>

      {/* ------------------------------------------------------ result */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-line bg-deep">
          <div className="border-b border-line p-7">
            <Eyebrow className="mb-5">Your estimate</Eyebrow>
            {result.impossible ? (
              <p className="text-[0.875rem] leading-relaxed text-alert">
                A {height} m drop with a {repeatCm} cm repeat will not yield a
                single full drop from a {rollLengthM} m roll. Reduce the height
                or choose a longer roll — or call us and we will find a
                specification that works.
              </p>
            ) : (
              <>
                <p className="font-display text-6xl leading-none text-ink">
                  {result.rolls}
                </p>
                <p className="mt-3 text-[0.875rem] text-ink-2">
                  rolls of <span className="text-ink">{collection.name}</span>,
                  including {wastage}% wastage
                </p>
              </>
            )}
          </div>

          <dl className="divide-y divide-line-faint text-[0.8125rem]">
            {[
              ["Wall area", `${result.grossArea.toFixed(2)} m²`],
              ["Openings deducted", `${result.openingArea.toFixed(2)} m²`],
              ["Net area", `${result.netArea.toFixed(2)} m²`],
              ["Drops required", `${result.netDrops}`],
              ["Cut length per drop", `${result.dropLength.toFixed(2)} m`],
              ["Drops per roll", `${result.dropsPerRoll || "—"}`],
              ["Adhesive", `≈ ${result.adhesiveKg} kg`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-7 py-3">
                <dt className="text-ink-3">{k}</dt>
                <dd className="tnum text-ink">{v}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between bg-void px-7 py-4">
              <dt className="text-ink-3">Indicative material cost</dt>
              <dd className="tnum font-display text-xl text-accent">
                ₹{result.cost.toLocaleString("en-IN")}
              </dd>
            </div>
          </dl>

          <div className="space-y-3 border-t border-line p-7">
            <CTA href={whatsappLink(summary)} external size="lg" className="w-full" arrow={false}>
              Send this estimate to us
            </CTA>
            <CTA href={`/collections/${slug}`} tone="outline" className="w-full">
              View {collection.name}
            </CTA>
            <p className="pt-1 text-[0.6875rem] leading-relaxed text-ink-3">
              Indicative only. Pricing varies by collection, colourway and
              quantity; confirm with our team before ordering. Always order all
              rolls from a single batch.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* --------------------------------------------------------------- fields */

function NumberField({
  label,
  unit,
  value,
  onChange,
  step,
  min,
  integer = false,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  integer?: boolean;
}) {
  const set = (v: number) => onChange(Math.max(min, integer ? Math.round(v) : Number(v.toFixed(2))));
  return (
    <div>
      <span className="eyebrow mb-2 block text-ink-3">{label}</span>
      <div className="flex h-12 items-center border border-line focus-within:border-accent">
        <button
          type="button"
          onClick={() => set(value - step)}
          aria-label={`Decrease ${label}`}
          className="grid h-full w-11 shrink-0 place-items-center text-ink-3 transition-colors hover:text-accent"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={(e) => set(Number(e.target.value))}
          className="tnum min-w-0 flex-1 bg-transparent text-center text-[0.9375rem] text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          aria-label={`${label} in ${unit || "units"}`}
        />
        {unit && <span className="pr-1 text-[0.75rem] text-ink-3">{unit}</span>}
        <button
          type="button"
          onClick={() => set(value + step)}
          aria-label={`Increase ${label}`}
          className="grid h-full w-11 shrink-0 place-items-center text-ink-3 transition-colors hover:text-accent"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

function OpeningField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Opening;
  onChange: (v: Opening) => void;
}) {
  return (
    <div className="border border-line p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[0.875rem] font-medium text-ink">{label}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...value, count: Math.max(0, value.count - 1) })}
            aria-label={`One fewer ${label.toLowerCase()}`}
            className="grid h-7 w-7 place-items-center border border-line text-ink-3 transition-colors hover:border-accent hover:text-accent"
          >
            <Minus className="h-3 w-3" strokeWidth={2} />
          </button>
          <span className="tnum w-5 text-center text-[0.9375rem] text-ink">
            {value.count}
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...value, count: value.count + 1 })}
            aria-label={`One more ${label.toLowerCase()}`}
            className="grid h-7 w-7 place-items-center border border-line text-ink-3 transition-colors hover:border-accent hover:text-accent"
          >
            <Plus className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className={cx("grid grid-cols-2 gap-3", value.count === 0 && "opacity-40")}>
        <label className="block">
          <span className="mb-1.5 block text-[0.6875rem] text-ink-3">Width (m)</span>
          <input
            type="number"
            step={0.1}
            min={0}
            value={value.w}
            disabled={value.count === 0}
            onChange={(e) => onChange({ ...value, w: Number(e.target.value) })}
            className="tnum h-10 w-full border border-line bg-transparent px-3 text-[0.8125rem] text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[0.6875rem] text-ink-3">Height (m)</span>
          <input
            type="number"
            step={0.1}
            min={0}
            value={value.h}
            disabled={value.count === 0}
            onChange={(e) => onChange({ ...value, h: Number(e.target.value) })}
            className="tnum h-10 w-full border border-line bg-transparent px-3 text-[0.8125rem] text-ink outline-none focus:border-accent"
          />
        </label>
      </div>
    </div>
  );
}
