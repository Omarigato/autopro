"use client";

import Link from "next/link";
import { Home, PlusCircle, User } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { useAppState } from "@/lib/store";

export function MobileNav() {
  const { lang } = useAppState();
  const t = useTranslation(lang);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-border flex justify-around items-center h-20 px-2 lg:hidden z-[100] shadow-2xl shadow-primary/20">
      <Link href="/" className="flex flex-col items-center gap-1.5 p-3 text-accent group">
        <Home className="w-6 h-6 transition-transform group-active:scale-90" strokeWidth={2.5} />
        <span className="text-[10px] font-black uppercase tracking-widest">{t('home')}</span>
      </Link>
      <div className="w-4 lg:hidden"></div>
      <Link href="/add" className="relative -mt-16 bg-accent p-5 rounded-[2rem] shadow-2xl shadow-accent/40 border-4 border-white transform active:scale-90 transition-all">
        <PlusCircle className="w-8 h-8 text-white" />
      </Link>
      <Link href="/profile" className="flex flex-col items-center gap-1.5 p-3 text-muted-foreground group">
        <User className="w-6 h-6 transition-transform group-active:scale-90" strokeWidth={2.5} />
        <span className="text-[10px] font-black uppercase tracking-widest">{t('profile')}</span>
      </Link>
    </nav>
  );
}
