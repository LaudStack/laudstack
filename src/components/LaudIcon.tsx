"use client";

import React from "react";

interface LaudIconProps {
  style?: React.CSSProperties;
  className?: string;
}

/**
 * ProductHunt-style upward triangle icon used as the universal "Laud" icon
 * across the LaudStack platform. Drop-in replacement for ChevronUp in Laud contexts.
 */
export default function LaudIcon({ style, className }: LaudIconProps) {
  const w = style?.width ?? 16;
  const h = style?.height ?? 16;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      fill="none"
      viewBox="0 0 16 16"
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      <path
        fill="#FFFFFF"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z"
      />
    </svg>
  );
}
