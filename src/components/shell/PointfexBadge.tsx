/**
 * PointfexBadge — reusable "Developed By Pointfex" branding strip.
 * Shows on every screen: Loading, Lobby (footer), Game Over, HUD (gameplay).
 *
 * Props:
 *   theme  – "dark"  → amber logo text, for dark backgrounds  (default)
 *            "light" → dark logo text, for the amber loading screen
 *            "hud"   → compact pill for the in-game HUD ticker bar
 */
import Image from "next/image";

interface PointfexBadgeProps {
  theme?: "dark" | "light" | "hud";
  className?: string;
}

export function PointfexBadge({
  theme = "dark",
  className = "",
}: PointfexBadgeProps) {
  if (theme === "hud") {
    return (
      <a
        href="https://pointfex.com"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex shrink-0 items-center gap-1 select-none group px-2 ${className}`}
        aria-label="Developed By Pointfex"
      >
        <Image
          src="/pointfex-logo.png"
          alt="Pointfex"
          width={14}
          height={14}
          className="rounded-sm opacity-80 group-hover:opacity-100 transition-opacity"
          priority={false}
        />
        <span className="font-sans text-[10px] font-semibold text-slate-400 whitespace-nowrap">
          By{" "}
          <span className="text-amber-400 group-hover:text-amber-300 transition-colors">
            Pointfex
          </span>
        </span>
      </a>
    );
  }

  const textColor =
    theme === "light" ? "text-slate-900/70" : "text-slate-400";
  const linkColor =
    theme === "light"
      ? "text-slate-900 hover:text-slate-700"
      : "text-amber-400 hover:text-amber-300";

  return (
    <a
      href="https://pointfex.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 select-none group ${className}`}
      aria-label="Developed By Pointfex"
    >
      <Image
        src="/pointfex-logo.png"
        alt="Pointfex"
        width={22}
        height={22}
        className="rounded-sm opacity-80 group-hover:opacity-100 transition-opacity"
        priority={false}
      />
      <span className={`font-sans text-xs font-medium leading-none ${textColor}`}>
        Developed By{" "}
        <span
          className={`font-bold underline underline-offset-2 transition-colors ${linkColor}`}
        >
          Pointfex
        </span>
      </span>
    </a>
  );
}

