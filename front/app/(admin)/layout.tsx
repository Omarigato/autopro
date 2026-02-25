"use client";

import { Car, LayoutDashboard, Users, FileText, Settings, LogOut, CreditCard, BookOpen, Package, Menu, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLink = (href: string, label: string, Icon: LucideIcon) => ({
  href,
  label,
  Icon,
});

const nav = [
  navLink("/dashboard", "Обзор", LayoutDashboard),
  navLink("/dashboard/users", "Пользователи", Users),
  navLink("/dashboard/cars", "Объявления", FileText),
  navLink("/dashboard/payments", "Платежи", CreditCard),
  navLink("/dashboard/subscriptions", "Подписки", Package),
  navLink("/dashboard/dictionaries", "Словари", BookOpen),
  navLink("/dashboard/settings", "Настройки", Settings),
];

function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {nav.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
            pathname === href ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <Icon size={22} /> {label}
        </Link>
      ))}
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-2 font-bold text-xl border-b border-zinc-800">
          <Car className="h-6 w-6 text-primary" /> AutoPro Admin
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 font-medium hover:bg-zinc-800 transition-colors"
          >
            <LogOut size={20} /> Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 flex flex-col min-w-0">
        <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 rounded-xl shrink-0" aria-label="Меню">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] max-w-[85vw] p-0 bg-zinc-900 text-white border-zinc-800">
                <SheetHeader className="p-4 border-b border-zinc-800 text-left">
                  <SheetTitle className="flex items-center gap-2 font-bold text-white">
                    <Car className="h-6 w-6" /> AutoPro Admin
                  </SheetTitle>
                </SheetHeader>
                <nav className="p-4 space-y-1">
                  <NavLinks onLinkClick={() => setMobileOpen(false)} />
                </nav>
                <div className="p-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 font-medium hover:bg-zinc-800 transition-colors"
                  >
                    <LogOut size={20} /> Выйти
                  </button>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="font-bold text-base sm:text-xl truncate">Панель управления</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className="text-xs sm:text-sm font-medium text-slate-600 hidden sm:inline">Администратор</span>
            <div className="w-8 h-8 rounded-full bg-zinc-200" />
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
