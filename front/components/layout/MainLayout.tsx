"use client";

import { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppState } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { initialize } = useAppState();
  // We don't necessarily need to fetch the user here if useAuth does it automatically
  // but let's keep it simple. useAuth hook calls fetchCurrentUser internally via useQuery.

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className={`flex flex-col min-h-screen font-sans antialiased`}>
       <Header />
       <main className="flex-1 pb-24 lg:pb-12 animate-in fade-in duration-700">
         {children}
       </main>
       <Footer />
       <MobileNav />
       <Toaster />
    </div>
  );
}
