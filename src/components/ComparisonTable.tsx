"use client";

/**
 * ComparisonTable — LaudStack
 * Renders a comparison table of tools within a category for SEO pages.
 * Shows key attributes: rating, reviews, pricing, lauds side by side.
 */

import { Star, ExternalLink, ThumbsUp, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { Tool } from "@/lib/types";

interface Props {
  tools: Tool[];
  maxRows?: number;
}

export default function ComparisonTable({ tools, maxRows = 10 }: Props) {
  const displayTools = tools.slice(0, maxRows);

  if (displayTools.length === 0) return null;

  return (
    <div style={{ marginBottom: "48px" }}>
      <h2
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "22px",
          fontWeight: 800,
          color: "#0C1830",
          letterSpacing: "-0.025em",
          marginBottom: "20px",
        }}
      >
        Quick Comparison
      </h2>

      <div
        style={{
          overflowX: "auto",
          borderRadius: "14px",
          border: "1px solid #E2E8F0",
          background: "#fff",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "700px",
          }}
        >
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid #E2E8F0",
                  width: "30%",
                }}
              >
                Stack
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                Rating
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                Reviews
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                Lauds
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                Pricing
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                Visit
              </th>
            </tr>
          </thead>
          <tbody>
            {displayTools.map((tool, idx) => (
              <tr
                key={tool.id}
                style={{
                  borderBottom:
                    idx < displayTools.length - 1
                      ? "1px solid #F1F5F9"
                      : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F8FAFC")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Stack name + logo */}
                <td style={{ padding: "14px 16px" }}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                      }}
                    >
                      {tool.logo_url ? (
                        <img
                          src={tool.logo_url}
                          alt={tool.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#94A3B8",
                          }}
                        >
                          {tool.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#0C1830",
                          display: "block",
                          lineHeight: 1.3,
                        }}
                      >
                        {idx + 1}. {tool.name}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#94A3B8",
                          lineHeight: 1.3,
                        }}
                      >
                        {tool.tagline?.slice(0, 50)}
                        {(tool.tagline?.length ?? 0) > 50 ? "..." : ""}
                      </span>
                    </div>
                  </Link>
                </td>

                {/* Rating */}
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    <Star
                      style={{
                        width: "14px",
                        height: "14px",
                        fill: "#F59E0B",
                        color: "#F59E0B",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#0C1830",
                      }}
                    >
                      {tool.average_rating.toFixed(1)}
                    </span>
                  </div>
                </td>

                {/* Reviews */}
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    <MessageSquare
                      style={{
                        width: "12px",
                        height: "12px",
                        color: "#94A3B8",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      {tool.review_count}
                    </span>
                  </div>
                </td>

                {/* Lauds */}
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    <ThumbsUp
                      style={{
                        width: "12px",
                        height: "12px",
                        color: "#94A3B8",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      {tool.upvote_count}
                    </span>
                  </div>
                </td>

                {/* Pricing */}
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: "100px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background:
                        tool.pricing_model === "Free"
                          ? "#F0FDF4"
                          : tool.pricing_model === "Open Source"
                            ? "#ECF2FF"
                            : "#F8FAFC",
                      border: `1px solid ${
                        tool.pricing_model === "Free"
                          ? "#DCFCE7"
                          : tool.pricing_model === "Open Source"
                            ? "#D6E2FF"
                            : "#E2E8F0"
                      }`,
                      color:
                        tool.pricing_model === "Free"
                          ? "#16A34A"
                          : tool.pricing_model === "Open Source"
                            ? "#5178FF"
                            : "#475569",
                    }}
                  >
                    {tool.pricing_model}
                  </span>
                </td>

                {/* Visit link */}
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#D97706",
                      textDecoration: "none",
                    }}
                  >
                    View
                    <ExternalLink style={{ width: "11px", height: "11px" }} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
