"use client";

import "./globals.css";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Car,
  PlusCircle,
  MessageSquare,
  User,
  Search,
  Bell,
  Globe,
  Settings
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/lib/translations";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState("ru");
  const [isAdmin, setIsAdmin] = useState(false);
  const t = useTranslation(lang);

  useEffect(() => {
    const savedLang = window.localStorage.getItem("lang") || "ru";
    setLang(savedLang);

    // Check if user is admin
    const token = window.localStorage.getItem("token");
    if (token) {
      apiClient.get("/auth/me").then((res: any) => {
        if (res.data.role === "admin") {
          setIsAdmin(true);
        }
      }).catch(() => setIsAdmin(false));
    }
  }, []);

  const changeLang = (newLang: string) => {
    setLang(newLang);
    window.localStorage.setItem("lang", newLang);
    window.location.reload(); // Quick way to apply to all components
  };

  return (
    <html lang={lang}>
      <body className="min-h-screen bg-background text-primary selection:bg-accent/10 selection:text-accent font-sans no-scrollbar">
        <div className="flex flex-col min-h-screen">

          {/* Premium Header */}
          <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-20">

              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-primary p-2 rounded-2xl group-hover:bg-accent transition-all duration-300 shadow-lg shadow-primary/10">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-primary flex items-center">
                  AUTO<span className="text-accent ml-0.5">PRO</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-10 font-bold text-sm tracking-wide text-slate-500">
                <Link href="/" className="hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-accent tracking-tight">{t('home')}</Link>
                <Link href="/catalog" className="hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-accent tracking-tight">{t('catalog')}</Link>
                <Link href="/add" className="hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-accent tracking-tight uppercase text-[11px] font-black">{t('add')}</Link>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all shadow-xl shadow-slate-900/20">
                    <Settings size={14} /> {t('admin_panel')}
                  </Link>
                )}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2 md:gap-5">

                {/* Language Switcher */}
                <div className="relative group mr-2">
                  <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-2xl transition-all">
                    <Globe size={18} className="text-slate-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">{lang}</span>
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-slate-100 rounded-[1.5rem] shadow-premium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                    {["ru", "kk", "en"].map(l => (
                      <button
                        key={l}
                        onClick={() => changeLang(l)}
                        className={`w-full px-5 py-2 text-left text-[10px] font-black uppercase tracking-[0.2em] hover:text-accent transition-colors ${lang === l ? 'text-accent' : 'text-slate-400'}`}
                      >
                        {l === 'ru' ? '🇷🇺 RU' : l === 'kk' ? '🇰🇿 KK' : '🇺🇸 EN'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block"></div>

                <Link href="/login" className="flex items-center gap-3 p-1.5 md:pr-4 rounded-full border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-accent transition-colors">
                    <User className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 hidden md:block tracking-tight">{t('login')}</span>
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 pb-24 lg:pb-12 animate-in fade-in duration-700">
            {children}
          </main>

          {/* Desktop Footer */}
          <footer className="bg-white border-t border-slate-100 hidden lg:block">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col items-center md:items-start gap-4">
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-accent" />
                  <span className="font-bold text-xl tracking-tight text-primary">AUTO<span className="text-accent">PRO</span></span>
                </div>
                <p className="text-sm text-slate-400 font-medium tracking-tight">© {new Date().getFullYear()} AUTOPRO. Все права защищены.</p>
              </div>

              <div className="flex gap-10 text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                <Link href="/terms" className="hover:text-accent transition-colors">Условия</Link>
                <Link href="/privacy" className="hover:text-accent transition-colors">Конфиденциальность</Link>
                <Link href="/contact" className="hover:text-accent transition-colors">Контакты</Link>
              </div>
            </div>
          </footer>

          {/* Premium Mobile Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center h-20 px-2 lg:hidden z-[100] shadow-2xl shadow-primary/20">
            <Link href="/" className="flex flex-col items-center gap-1.5 p-3 text-accent group">
              <Home className="w-6 h-6 transition-transform group-active:scale-90" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('home')}</span>
            </Link>
            <Link href="/catalog" className="flex flex-col items-center gap-1.5 p-3 text-slate-400 group">
              <Search className="w-6 h-6 transition-transform group-active:scale-90" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('search')}</span>
            </Link>
            <Link href="/add" className="relative -mt-16 bg-accent p-5 rounded-[2rem] shadow-2xl shadow-accent/40 border-4 border-white transform active:scale-90 transition-all">
              <PlusCircle className="w-8 h-8 text-white" />
            </Link>
            <Link href="/login" className="flex flex-col items-center gap-1.5 p-3 text-slate-400 group">
              <User className="w-6 h-6 transition-transform group-active:scale-90" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('profile')}</span>
            </Link>
          </nav>

        </div>
      </body>
    </html>
  );
}

