"use client";

import React from "react";
import { cx } from "@/components/ui/primitives";

export interface LiquidGlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "glass" | "primary" | "secondary" | "accent" | "outline" | "active";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  href?: string;
}

export const LiquidGlassButton = React.forwardRef<
  HTMLButtonElement,
  LiquidGlassButtonProps
>(
  (
    {
      variant = "glass",
      size = "md",
      fullWidth = false,
      children,
      icon,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-8 px-3.5 text-xs rounded-full gap-1.5",
      md: "h-9.5 px-4.5 text-[0.8125rem] rounded-full gap-2",
      lg: "h-11 px-6 text-sm rounded-full gap-2.5",
      icon: "w-9 h-9 p-0 rounded-full flex items-center justify-center shrink-0",
    };

    const variantStyles = {
      glass: cx(
        "text-slate-900 dark:text-white font-semibold tracking-wide drop-shadow-xs",
        "bg-gradient-to-b from-white/60 via-white/30 to-white/15 dark:from-white/25 dark:via-white/10 dark:to-white/5",
        "backdrop-blur-md saturate-[220%]",
        "border border-white/85 dark:border-white/25",
        "shadow-[0_12px_28px_-6px_rgba(15,23,42,0.2),inset_0_2px_1.5px_0px_rgba(255,255,255,0.95),inset_0_-3px_6px_0px_rgba(0,0,0,0.12)]",
        "dark:shadow-[0_16px_32px_-6px_rgba(0,0,0,0.7),inset_0_2px_1.5px_0px_rgba(255,255,255,0.35)]",
        "hover:bg-gradient-to-b hover:from-white/75 hover:via-white/45 hover:to-white/20 dark:hover:from-white/35 dark:hover:via-white/15 dark:hover:to-white/10 hover:shadow-[0_16px_35px_-6px_rgba(15,23,42,0.28)]"
      ),
      active: cx(
        "text-white font-bold tracking-wide drop-shadow-sm",
        "bg-gradient-to-b from-blue-400 via-blue-600 to-indigo-600",
        "backdrop-blur-md saturate-[220%]",
        "border border-white/80 dark:border-white/40",
        "shadow-[0_10px_25px_-2px_rgba(37,99,235,0.7),0_0_20px_2px_rgba(59,130,246,0.5),inset_0_2.5px_2px_0px_rgba(255,255,255,0.9),inset_0_-4px_8px_0px_rgba(10,50,130,0.5)]"
      ),
      primary: cx(
        "text-white font-semibold tracking-wide drop-shadow-xs",
        "bg-gradient-to-b from-[#ff6a3d]/90 via-[#ee3e26]/85 to-[#c31e14]/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_14px_30px_-4px_rgba(238,62,38,0.6),inset_0_2.5px_2px_0px_rgba(255,230,220,0.95),inset_0_-4px_8px_0px_rgba(130,15,0,0.5)]"
      ),
      secondary: cx(
        "text-slate-800 dark:text-slate-100 font-semibold",
        "bg-gradient-to-b from-white/55 via-white/25 to-slate-200/20 dark:from-white/20 dark:via-white/10 dark:to-slate-900/40",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/75 dark:border-white/25",
        "shadow-[0_12px_28px_-6px_rgba(15,23,42,0.18),inset_0_2px_1.5px_0px_rgba(255,255,255,0.95)]"
      ),
      accent: cx(
        "text-white font-semibold tracking-wide drop-shadow-xs",
        "bg-gradient-to-b from-cyan-400/90 via-blue-600/85 to-indigo-700/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_14px_30px_-4px_rgba(0,114,255,0.5),inset_0_2.5px_2px_0px_rgba(220,245,255,0.95)]"
      ),
      outline: cx(
        "text-slate-800 dark:text-slate-100 font-semibold border border-white/80 dark:border-white/25",
        "bg-white/25 dark:bg-white/10 backdrop-blur-md saturate-[200%]",
        "shadow-[0_12px_28px_-5px_rgba(0,0,0,0.15),inset_0_2px_1px_0px_rgba(255,255,255,0.9)]"
      ),
    };

    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cx(
          "relative outline-none border-none cursor-pointer font-sans select-none overflow-hidden",
          "inline-flex items-center justify-center backdrop-blur-md saturate-[220%]",
          "transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.97]",
          sizeClasses[size],
          variantStyles[variant],
          fullWidth && "w-full flex-1",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {/* Top glossy curved glare reflection */}
        <span
          className="absolute top-[1px] left-1 right-1 h-[48%] pointer-events-none rounded-[100px_100px_45%_45%] transition-all duration-200"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 40%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Bottom internal prism refraction ring */}
        <span
          className="absolute bottom-[1.5px] left-1.5 right-1.5 h-[28%] pointer-events-none rounded-[0_0_100px_100px] transition-all duration-200"
          style={{
            background:
              "linear-gradient(0deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-1.5">
          {icon}
          {children}
        </span>
      </button>
    );
  }
);
LiquidGlassButton.displayName = "LiquidGlassButton";
