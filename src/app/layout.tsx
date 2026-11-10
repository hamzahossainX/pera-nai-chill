import type { Metadata, Viewport } from "next";
import { Luckiest_Guy, Hind_Siliguri } from "next/font/google";
import "./globals.css";

const comicFont = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-comic",
});

const banglaFont = Hind_Siliguri({
  weight: ["400", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-bangla",
});

export const metadata: Metadata = {
  title: "Pera Nai Chill — Dhaka Rage Runner",
  description: "A satirical, stress-relief 2D action-runner set in the streets of Dhaka.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${comicFont.variable} ${banglaFont.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden select-none bg-slate-900 text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
