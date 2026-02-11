"use client";

import Link from "next/link";
import {
  Car,
  Settings,
  Globe,
  Search,
  User,
  LogOut
} from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { useAppState } from "@/lib/store";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { lang, setLang } = useAppState();
  const { user, isAuthenticated, logout } = useAuth();
  const t = useTranslation(lang);
  
  const isAdmin = user?.role === 'admin';

  const changeLang = (newLang: string) => {
    setLang(newLang);
    // window.location.reload(); 
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-border">
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
        <nav className="hidden lg:flex items-center gap-10 font-bold text-sm tracking-wide text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-accent tracking-tight">{t('home')}</Link>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 rounded-2xl">
                <Globe size={18} className="text-muted-foreground" />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px] rounded-xl">
              <DropdownMenuItem onClick={() => changeLang('ru')}>🇷🇺 RU</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang('kk')}>🇰🇿 KK</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang('en')}>🇺🇸 EN</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block"></div>

          {/* Search Icon */}
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => (window as any).toggleSearch && (window as any).toggleSearch()}
            className="rounded-2xl text-muted-foreground hover:text-accent"
          >
            <Search size={20} />
          </Button>

          <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block"></div>

          {isAuthenticated ? (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                   <Avatar className="h-10 w-10">
                     <AvatarImage src="/avatars/01.png" alt={user?.name || "@user"} />
                     <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                   </Avatar>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="w-56" align="end" forceMount>
                 <DropdownMenuLabel className="font-normal">
                   <div className="flex flex-col space-y-1">
                     <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                     <p className="text-xs leading-none text-muted-foreground">
                       {user?.email}
                     </p>
                   </div>
                 </DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                    <Link href="/profile">{t('profile')}</Link>
                 </DropdownMenuItem>
                 {isAdmin && (
                   <DropdownMenuItem asChild>
                      <Link href="/admin">{t('admin_panel')}</Link>
                   </DropdownMenuItem>
                 )}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                   <LogOut className="mr-2 h-4 w-4" />
                   <span>{t('logout')}</span>
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          ) : (
            <Link href="/login" className="flex items-center gap-3 p-1.5 md:pr-4 rounded-full border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-accent transition-colors">
                <User className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-bold text-slate-700 hidden md:block tracking-tight">{t('login')}</span>
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}
