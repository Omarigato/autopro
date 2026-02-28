"use client";

import { Car, LayoutDashboard, Users, FileText, Settings, LogOut, CreditCard, BookOpen, Package, Menu, KeyRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLink = (href: string, label: string, Icon: LucideIcon) => ({
  href,
  label,
  Icon,
});

const nav = [
  navLink("/admin-supersecret", "Обзор", LayoutDashboard),
  navLink("/admin-supersecret/users", "Пользователи", Users),
  navLink("/admin-supersecret/cars", "Объявления", FileText),
  navLink("/admin-supersecret/applications", "Заявки", FileText),
  navLink("/admin-supersecret/payments", "Платежи", CreditCard),
  navLink("/admin-supersecret/subscriptions", "Подписки", Package),
  navLink("/admin-supersecret/dictionaries", "Словари", BookOpen),
  navLink("/admin-supersecret/otp", "OTP коды", KeyRound),
  navLink("/admin-supersecret/settings", "Настройки", Settings),
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
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === href ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const goToMain = () => {
    setMobileOpen(false);
    window.location.href = "/";
  };

  if (authLoading || !user || user.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white hidden md:flex flex-col flex-shrink-0">
        <Link href="/" className="p-6 flex items-center gap-2 font-bold text-xl border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
          <Image
            src="/logo-dark.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="text-white">AutoPro</span>
        </Link>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={goToMain}
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
                  <SheetTitle asChild>
                    <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-bold text-white hover:opacity-90">
                      <Image
                        src="/logo-dark.png"
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                        priority
                      />
                      <span>AutoPro</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="p-4 space-y-1">
                  <NavLinks onLinkClick={() => setMobileOpen(false)} />
                </nav>
                <div className="p-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={goToMain}
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
            <span className="text-xs sm:text-sm font-medium text-slate-600 hidden sm:inline truncate max-w-[180px]">
              {user?.name || "Администратор"}
            </span>
            <Avatar className="h-8 w-8 border border-slate-200">
              <AvatarImage src={user?.avatar_url || ""} alt={user?.name || ""} />
              <AvatarFallback className="bg-zinc-200 text-slate-600 text-xs">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
