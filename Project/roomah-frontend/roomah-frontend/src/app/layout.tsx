// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import DynamicLayout from "@/components/layout/DynamicLayout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Roomah - Mewujudkan Pernikahan Membangun Peradaban",
  description:
    "Platform Ta'aruf Islami yang membantu Anda menemukan pasangan shaleh/shalehah untuk membangun keluarga sakinah.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={poppins.className}>
        <AuthProvider>
          <DynamicLayout>{children}</DynamicLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
