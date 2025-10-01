import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import { CustomToaster } from "@/components/custom-toaster";
import { ListsProvider } from "@/contexts/ListsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { KeyboardShortcutsProvider } from "@/components/KeyboardShortcutsProvider";
import { CommandPalette } from "@/components/CommandPalette";
import { ShortcutsDialog } from "@/components/ShortcutsDialog";
import { TitleBar } from "@/components/TitleBar";
import { PageTransition } from "@/components/PageTransition";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Levent Elektrik",
  description: "Mikro ERP Stok Yönetimi ve Analiz Sistemi",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} font-inter antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <TitleBar />
            <ListsProvider>
              <KeyboardShortcutsProvider>
                <PageTransition>
                  {children}
                </PageTransition>
                <CommandPalette />
                <ShortcutsDialog />
              </KeyboardShortcutsProvider>
            </ListsProvider>
          </AuthProvider>
        </ThemeProvider>
        <CustomToaster />
      </body>
    </html>
  );
}