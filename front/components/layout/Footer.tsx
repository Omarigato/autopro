"use client";

import Link from "next/link";
import { Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border hidden lg:block">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <Car className="h-5 w-5 text-accent" />
            <span className="font-bold text-xl tracking-tight text-primary">AUTO<span className="text-accent">PRO</span></span>
          </div>
          <p className="text-sm text-muted-foreground font-medium tracking-tight">© {new Date().getFullYear()} AUTOPRO. Все права защищены.</p>
        </div>

        <div className="flex gap-10 text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">
          <Link href="/terms" className="hover:text-accent transition-colors">Условия</Link>
          <Link href="/privacy" className="hover:text-accent transition-colors">Конфиденциальность</Link>
          <Link href="/contact" className="hover:text-accent transition-colors">Контакты</Link>
        </div>
      </div>
    </footer>
  );
}
