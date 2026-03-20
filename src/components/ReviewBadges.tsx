"use client";

/**
 * ReviewBadges — LaudStack
 * Displays milestone badges next to reviewer names based on their review count.
 * Badges: First Review (1), Reviewer (5), Category Expert (10+), Top Reviewer (25+)
 */

import { Award, Star, Zap, Crown } from "lucide-react";

interface Props {
  reviewCount: number;
  size?: "sm" | "md";
}

interface Badge {
  label: string;
  icon: typeof Award;
  bg: string;
  border: string;
  color: string;
  minReviews: number;
}

const BADGES: Badge[] = [
  {
    label: "Top Reviewer",
    icon: Crown,
    bg: "#FEF3C7",
    border: "#FDE68A",
    color: "#B45309",
    minReviews: 25,
  },
  {
    label: "Category Expert",
    icon: Zap,
    bg: "#ECF2FF",
    border: "#D6E2FF",
    color: "#5178FF",
    minReviews: 10,
  },
  {
    label: "Reviewer",
    icon: Star,
    bg: "#D6E2FF",
    border: "#5178FF",
    color: "#5178FF",
    minReviews: 5,
  },
  {
    label: "First Review",
    icon: Award,
    bg: "#F0FDF4",
    border: "#DCFCE7",
    color: "#16A34A",
    minReviews: 1,
  },
];

export default function ReviewBadges({ reviewCount, size = "sm" }: Props) {
  if (reviewCount < 1) return null;

  // Find the highest badge the user qualifies for
  const badge = BADGES.find((b) => reviewCount >= b.minReviews);
  if (!badge) return null;

  const Icon = badge.icon;
  const iconSize = size === "sm" ? 10 : 12;
  const fontSize = size === "sm" ? "10px" : "11px";
  const padding = size === "sm" ? "2px 6px" : "3px 8px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        fontSize,
        fontWeight: 700,
        padding,
        borderRadius: "100px",
        background: badge.bg,
        border: `1px solid ${badge.border}`,
        color: badge.color,
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
      title={`${badge.label} — ${reviewCount} review${reviewCount !== 1 ? "s" : ""} written`}
    >
      <Icon style={{ width: iconSize, height: iconSize }} />
      {badge.label}
    </span>
  );
}
