import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import QueryProvider from "@/components/ui/QueryProvider";
import GlobalNav from "@/components/ui/GlobalNav";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-900 text-gray-100">
              <GlobalNav />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}