import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Grain } from "@/components/chrome/Grain";
import { SmoothScroll } from "@/components/chrome/SmoothScroll";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Living Bank — Standard Reserve",
  description:
    "The Standard Reserve is a 4,000-line onchain central bank. You're about to run its economy for two hundred epochs — and understand every rule it lives by.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-paper text-ink selection:bg-gold-bright selection:text-ink antialiased">
        <SmoothScroll>
          <Grain />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
