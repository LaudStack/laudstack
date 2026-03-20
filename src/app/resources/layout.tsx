import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFFFFF" }}>
      <Navbar />
      {/* Spacer for fixed 72px navbar */}
      <div style={{ height: "72px", flexShrink: 0 }} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
