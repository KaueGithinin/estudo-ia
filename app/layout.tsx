import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ixa — Aprenda de verdade",
  description:
    "Estude com active recall e IA. Explique com suas palavras e descubra o que você realmente sabe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className="h-full">
        <body
          className={`${inter.className} min-h-full bg-gray-950 text-white antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
