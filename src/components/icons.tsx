import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { categoryEmoji } from "@/lib/constants";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function I({ size = 20, className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconMenu = (p: IconProps) => (
  <I {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </I>
);
export const IconClose = (p: IconProps) => (
  <I {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </I>
);
export const IconLogin = (p: IconProps) => (
  <I {...p}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="m10 17 5-5-5-5" />
    <path d="M15 12H3" />
  </I>
);
export const IconUserPlus = (p: IconProps) => (
  <I {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M22 11h-6" />
  </I>
);
export const IconLogout = (p: IconProps) => (
  <I {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </I>
);
export const IconBell = (p: IconProps) => (
  <I {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </I>
);
export const IconSearch = (p: IconProps) => (
  <I {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3-3" />
  </I>
);
export const IconPlus = (p: IconProps) => (
  <I {...p}>
    <path d="M12 5v14M5 12h14" />
  </I>
);
export const IconStar = (p: IconProps) => (
  <I {...p}>
    <path d="m12 3 2.6 5.7 6.2.7-4.6 4.2 1.3 6.1L12 16.8 6.5 19.7 7.8 13.6 3.2 9.4l6.2-.7z" />
  </I>
);
export const IconStarFill = (p: IconProps) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" className={cn("shrink-0", p.className)} fill="currentColor" aria-hidden>
    <path d="m12 3 2.6 5.7 6.2.7-4.6 4.2 1.3 6.1L12 16.8 6.5 19.7 7.8 13.6 3.2 9.4l6.2-.7z" />
  </svg>
);
export const IconMapPin = (p: IconProps) => (
  <I {...p}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </I>
);
export const IconCheck = (p: IconProps) => (
  <I {...p}>
    <path d="M20 6 9 17l-5-5" />
  </I>
);
export const IconBadgeCheck = (p: IconProps) => (
  <I {...p}>
    <path d="M12 3 14.5 5.1 17.8 5l1.2 3.1 2.7 2-1.2 3.1.3 3.3-3.1 1.2-2 2.7-3.2-1.1L9.2 20.5l-2-2.7-3.1-1.2.3-3.3L3.2 10.2l2.7-2L7.1 5.1 10.4 5.2z" />
    <path d="m9 12 2 2 4-4" />
  </I>
);
export const IconCamera = (p: IconProps) => (
  <I {...p}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </I>
);
export const IconHeart = (p: IconProps) => (
  <I {...p}>
    <path d="M19 14c1.5-1.5 3-3.4 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4.8-4.5 2.1A6 6 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.1 1.5 4 3 5.5l7 7z" />
  </I>
);
export const IconWrench = (p: IconProps) => (
  <I {...p}>
    <path d="M14.7 6.3a4 4 0 0 0-5.6 5.4L3 18l3 3 6.3-6.1a4 4 0 0 0 5.4-5.6L16 11z" />
  </I>
);
export const IconUser = (p: IconProps) => (
  <I {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </I>
);
export const IconZap = (p: IconProps) => (
  <I {...p}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
  </I>
);
export const IconFlame = (p: IconProps) => (
  <I {...p}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1.5-3.5S8 5.5 8 4c0 2.2-2 3.8-2 6.5a5 5 0 0 0 10 0c0-2.2-1.5-3.8-1.5-6 .5 2 2.5 3 2.5 6a7 7 0 1 1-14 0c0-2 1.5-4 3-6 .5 2 2.5 3.3 2.5 5.5z" />
  </I>
);
export const IconHardHat = (p: IconProps) => (
  <I {...p}>
    <path d="M2 18h20" />
    <path d="M4 18V12a8 8 0 0 1 16 0v6" />
    <path d="M10 6V4h4v2" />
  </I>
);
export const IconHammer = (p: IconProps) => (
  <I {...p}>
    <path d="m15 12-8.5 8.5c-.8.8-2.2.8-3 0s-.8-2.2 0-3L12 9" />
    <path d="m17.6 15.4 3.5-3.5a2 2 0 0 0 0-2.8l-4.2-4.2a2 2 0 0 0-2.8 0L11 8" />
  </I>
);
export const IconPaint = (p: IconProps) => (
  <I {...p}>
    <path d="M18 4 8 14l2 2 10-10z" />
    <path d="M8 14s-2 2-2 4a2 2 0 0 0 4 0" />
  </I>
);
export const IconChair = (p: IconProps) => (
  <I {...p}>
    <path d="M4 11h16v3H4z" />
    <path d="M7 11V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v4" />
    <path d="M6 14v6M18 14v6M6 20h4M14 20h4" />
  </I>
);
export const IconSnowflake = (p: IconProps) => (
  <I {...p}>
    <path d="M12 2v20M4.9 7.5l14.2 9M4.9 16.5l14.2-9" />
  </I>
);
export const IconPhone = (p: IconProps) => (
  <I {...p}>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18h2" />
  </I>
);
export const IconMonitor = (p: IconProps) => (
  <I {...p}>
    <rect x="2" y="4" width="20" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </I>
);
export const IconCar = (p: IconProps) => (
  <I {...p}>
    <path d="M3 13h18l-1.5-5.5A2 2 0 0 0 17.6 6H6.4a2 2 0 0 0-1.9 1.5z" />
    <path d="M5 13v4h2M17 13v4h2" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="16.5" cy="17.5" r="1.5" />
  </I>
);
export const IconSparkles = (p: IconProps) => (
  <I {...p}>
    <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
    <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </I>
);
export const IconScissors = (p: IconProps) => (
  <I {...p}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M8.5 7.5 20 18M8.5 16.5 20 6" />
  </I>
);
export const IconLaptop = (p: IconProps) => (
  <I {...p}>
    <rect x="4" y="5" width="16" height="11" rx="1" />
    <path d="M2 20h20" />
  </I>
);
export const IconPackage = (p: IconProps) => (
  <I {...p}>
    <path d="m12 3 8 4.5v9L12 21 4 16.5v-9z" />
    <path d="M12 12 20 7.5M12 12v9M12 12 4 7.5" />
  </I>
);
export const IconBuilding = (p: IconProps) => (
  <I {...p}>
    <path d="M4 21V6l8-3 8 3v15" />
    <path d="M9 21v-6h6v6" />
    <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
  </I>
);
export const IconClock = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </I>
);
export const IconWallet = (p: IconProps) => (
  <I {...p}>
    <path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M3 7V6a2 2 0 0 1 2-2h12" />
    <circle cx="17" cy="13" r="1" />
  </I>
);

export function CategoryIcon({
  slug,
  icon,
  name,
  size = 28,
  className,
}: {
  slug?: string | null;
  icon?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const emoji = categoryEmoji(slug, icon, name);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-muted-bg)]",
        className,
      )}
      style={{ width: size + 28, height: size + 28, fontSize: size }}
    >
      {emoji}
    </span>
  );
}

export function InlineCatIcon({
  slug,
  icon,
  name,
  size = 16,
}: {
  slug?: string | null;
  icon?: string | null;
  name?: string | null;
  size?: number;
}) {
  return (
    <span className="leading-none" style={{ fontSize: size }} aria-hidden>
      {categoryEmoji(slug, icon, name)}
    </span>
  );
}
