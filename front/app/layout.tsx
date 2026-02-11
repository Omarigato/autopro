"use client";

import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { MainLayout } from "@/components/layout/MainLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background text-primary selection:bg-accent/10 selection:text-accent font-sans no-scrollbar">
        <ReactQueryProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
