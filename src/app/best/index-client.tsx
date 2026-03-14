"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

interface Collection {
  slug: string;
  title: string;
  description: string;
  count: number;
}

export default function BestToolsIndexClient({
  collections,
}: {
  collections: Collection[];
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <PageHero
        eyebrow="Curated Collections"
        title="Best AI & SaaS Tools"
        subtitle="Browse curated collections of the best tools for every use case, ranked by community reviews and Laud votes."
        accent="amber"
        layout="default"
        size="md"
      />

      <div
        className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 lg:px-10"
        style={{ paddingTop: "32px", paddingBottom: "64px", flex: 1 }}
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: "20px" }}
        >
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/best/${c.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "24px",
                background: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #E8ECF0",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <Sparkles
                  style={{ width: "16px", height: "16px", color: "#F59E0B" }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#B45309",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {c.count} tools
                </span>
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#171717",
                  marginBottom: "6px",
                  lineHeight: 1.3,
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6B7280",
                  lineHeight: 1.5,
                  flex: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {c.description}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#D97706",
                }}
              >
                Browse collection
                <ArrowRight style={{ width: "13px", height: "13px" }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
