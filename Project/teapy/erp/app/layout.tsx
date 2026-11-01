import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Quicksand } from "next/font/google";
import { Toaster } from "@/components/ui";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand" });

export const metadata: Metadata = {
  title: "Teapy — Operating System",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export const viewport: Viewport = { themeColor: "#fdf8f6", width: "device-width", initialScale: 1, interactiveWidget: "resizes-content" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${jetbrains.variable} ${quicksand.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
