import { NeonBorder } from "@/components/ui/NeonBorder";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <img
      src="/wk-mark-transparent.png"
      alt="Wall King"
      className={`object-contain ${className}`}
    />
  );
}

export function Wordmark({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <NeonBorder
      color="#CC9149"
      rounded={28}
      thickness={4}
      borderSize={45}
      glow={80}
      speed={14}
      className="p-1"
    >
      <span className={`inline-flex shrink-0 items-center gap-2.5 sm:gap-3 px-2 py-1 ${className}`}>
        <LogoMark className="h-8 w-auto shrink-0 transition-transform duration-600 [transition-timing-function:var(--ease-cut)] group-hover:scale-95 sm:h-9" />
        <span className="flex shrink-0 flex-col leading-none">
          <span className="font-display whitespace-nowrap text-[1.0625rem] font-extrabold uppercase leading-none tracking-[-0.03em] text-ink sm:text-[1.1875rem]">
            Wall King
          </span>
          {/* The strapline is hidden on compact screens */}
          {!compact && (
            <span className="eyebrow mt-1 hidden whitespace-nowrap text-[0.48rem] font-bold tracking-wider text-black dark:text-white md:block">
              HOUSE OF WALLPAPER — EST. 1984
            </span>
          )}
        </span>
      </span>
    </NeonBorder>
  );
}

