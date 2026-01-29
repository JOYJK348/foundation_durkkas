import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { Toaster } from "@/components/ui/toaster";
import { NavigationProvider } from "@/components/layout/navigation-provider";

// Lazy load Footer for faster initial load
const Footer = dynamic(
  () => import("@/components/layout/footer").then((mod) => ({ default: mod.Footer })),
  { 
    ssr: true,
    loading: () => <div className="h-32" />, // Placeholder height
  }
);

// Font setup - Ensure proper loading and visibility
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: true,
  fallback: ["system-ui", "arial", "sans-serif"],
});

// Plus Jakarta Sans for headings
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  preload: true, // Preload for better visibility
  weight: ["500", "600", "700"],
  adjustFontFallback: true,
  fallback: ["var(--font-inter)", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "DURKKAS EMS - Learn. Upgrade. Achieve",
  description: "A modern learning platform for students, tutors, and institutions. Conduct workshops, manage courses, and learn smarter — all in one place.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>",
  },
  other: {
    "x-ua-compatible": "IE=edge",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className={`${inter.className} font-sans antialiased`} style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <ConditionalLayout>
          <NavigationProvider>
            <main className="min-h-screen">{children}</main>
          </NavigationProvider>
        </ConditionalLayout>
        <Toaster />
      </body>
    </html>
  );
}

