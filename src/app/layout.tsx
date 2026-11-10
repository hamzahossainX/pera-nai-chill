import type { Metadata, Viewport } from "next";
import { Luckiest_Guy, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/shell/ServiceWorkerRegister";
import { OrientationGuard } from "@/components/shell/OrientationGuard";

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
  title: "Pera Nai Chill — ঢাকা রেজ রানার (Dhaka Rage Runner)",
  description:
    "A satirical 2D comic action runner game set in the streets of Dhaka. Customize your target villain, throw chappals, dodge obstacles, and chill! প্যারা নাই চিল!",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pera Nai Chill",
  },
  openGraph: {
    title: "Pera Nai Chill — Dhaka Rage Runner",
    description: "Satirical 2D comic runner game set on the streets of Dhaka.",
    siteName: "Pera Nai Chill",
    type: "website",
    locale: "bn_BD",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${comicFont.variable} ${banglaFont.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden select-none bg-slate-900 text-slate-100 font-sans">
        <ServiceWorkerRegister />
        <OrientationGuard />
        {children}
      </body>
    </html>
  );
}
