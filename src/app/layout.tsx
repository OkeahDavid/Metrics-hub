import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import QueryProvider from "@/components/ui/QueryProvider";

// Replace Geist with Inter (a popular sans-serif font)
const inter = Inter({
  variable: "--font-geist-sans", // keeping the same variable name for compatibility
  subsets: ["latin"],
});

// Replace Geist_Mono with JetBrains_Mono (a popular monospace font)
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono", // keeping the same variable name for compatibility
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Metrics Hub",
  description: "Create and manage your projects with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}