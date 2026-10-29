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
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("nova_theme")==="light"){document.documentElement.classList.add("light-theme");}}catch(e){}` }} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="antialiased font-sans bg-[#040B14] text-slate-100 selection:bg-[#00E5FF]/20">
        {children}
      </body>
    </html>
  );
}
