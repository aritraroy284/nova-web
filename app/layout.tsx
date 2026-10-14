import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova AI - Autonomous On-Device Co-Pilot",
  description: "Executive control plane for Nova AI core routing, provider credentials, and tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#080E18] text-white">
        {children}
      </body>
    </html>
  );
}
