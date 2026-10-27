import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

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
      <body className="antialiased font-sans selection:bg-[#00E5FF]/20">
        {children}
      </body>
    </html>
  );
}
