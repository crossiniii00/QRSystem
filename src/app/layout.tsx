import type { Metadata } from "next";
import { EB_Garamond, Cinzel, Inter } from "next/font/google";
import "./globals.css";
import "../index.css"; // Ensure index.css is loaded globally

const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "St. Francis College",
  description: "St. Francis College - Liberal Arts • Sciences • Governance",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({ children }: any) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${cinzel.variable} ${inter.variable} h-full antialiased font-serif`}
    >
      <body className="min-h-full flex flex-col font-serif">{children}</body>
    </html>
  );
}
