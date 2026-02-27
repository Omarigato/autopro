"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Car, User, Menu, X, MapPin, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppState } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { usePublicSettings } from "@/hooks/usePublicSettings";

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, refreshUser } = useAuth();
  const { city, setCity } = useAppState();
  const [cities, setCities] = useState<any[]>([]);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);
  const { subscriptionsEnabled } = usePublicSettings();

  useEffect(() => {
    apiClient.get('/dictionaries', { params: { type: 'CITY' } })
      .then(res => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        setCities(data || []);
      })
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    if (!user) {
      setApplicationsCount(0);
      return;
    }
    apiClient.get('/applications/to-my-ads/count')
      .then((res: any) => {
        const d = res?.data ?? res;
        setApplicationsCount(typeof d?.count === 'number' ? d.count : 0);
      })
      .catch(() => setApplicationsCount(0));
  }, [user]);

  useEffect(() => {
    if (user && cities.length > 0 && (user as any).city_id != null) {
      const c = cities.find((x: any) => x.id === (user as any).city_id);
      if (c?.name && city !== c.name) setCity(c.name);
    }
  }, [user, cities]);

  const routes = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    { href: "/find", label: "Найти авто" },
    { href: "/add", label: "Сдать авто" },
    ...(subscriptionsEnabled ? [{ href: "/subscriptions", label: "Тарифы" }] : []),
  ];

  const handleCitySelect = (c: { id: number; name: string }) => {
    setCity(c.name);
    if (user) {
      apiClient.put('/auth/me', { city_id: c.id }).then(() => refreshUser()).catch(() => { });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-primary rounded-lg p-1.5">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">AutoPro</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">


          <NavigationMenu>
            <NavigationMenuList>
              {routes.map((route) => (
                <NavigationMenuItem key={route.href}>
                  <Link href={route.href} legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                      {route.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* City Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-muted-foreground hover:text-foreground rounded-xl border-slate-200">
                <MapPin className="h-4 w-4" />
                {city}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
              {cities.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => handleCitySelect(c)}
                  className={city === c.name ? "bg-accent" : ""}
                >
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-border mx-2" />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user.avatar_url || ""} alt={user.name || ""} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile">Профиль</Link></DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/applications" className="flex items-center justify-between">
                    Заявки
                    {applicationsCount > 0 && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        +{applicationsCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild><Link href="/admin-supersecret">Админ панель</Link></DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600">
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Регистрация</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t p-4 bg-background space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent",
                  pathname === route.href ? "bg-accent text-accent-foreground" : "text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-accent rounded-md">
                  <User size={16} /> Профиль
                </Link>
                <Link href="/applications" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-accent rounded-md">
                  <FileText size={16} /> Заявки
                  {applicationsCount > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">+{applicationsCount}</span>
                  )}
                </Link>
                <button onClick={() => logout()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md text-left">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Button className="w-full" asChild><Link href="/login">Войти</Link></Button>
                <Button variant="outline" className="w-full" asChild><Link href="/register">Регистрация</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
