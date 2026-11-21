/**
 * PointfexBadge — reusable "Developed By Pointfex" branding strip.
 * Shows on every screen: Loading, Lobby (footer), Game Over.
 *
 * Props:
 *   theme  – "dark"  → amber logo text, for dark backgrounds  (default)
 *            "light" → dark logo text, for the amber loading screen
 */
import Image from "next/image";

interface PointfexBadgeProps {
  theme?: "dark" | "light";
  className?: string;
}

export function PointfexBadge({
  theme = "dark",
  className = "",
}: PointfexBadgeProps) {
  const textColor =
    theme === "light" ? "text-slate-900/60" : "text-slate-500/70";
  const linkColor =
    theme === "light"
      ? "text-slate-900/80 hover:text-slate-900"
      : "text-amber-400/90 hover:text-amber-300";

  return (
    <a
      href="https://pointfex.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-1.5 select-none group ${className}`}
      aria-label="Developed By Pointfex"
    >
      <Image
        src="/pointfex-logo.png"
        alt="Pointfex"
        width={16}
        height={16}
        className="rounded-sm opacity-70 group-hover:opacity-100 transition-opacity"
        priority={false}
      />
      <span className={`font-sans text-[10px] leading-none ${textColor}`}>
        Developed By{" "}
        <span
          className={`font-semibold underline underline-offset-2 transition-colors ${linkColor}`}
        >
          Pointfex
        </span>
      </span>
    </a>
  );
}
