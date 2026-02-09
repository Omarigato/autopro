import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Home,
  Car,
  PlusSquare,
  MessageCircle,
  User,
  Search,
  Bell
} from "lucide-react";

export const metadata = {
  title: "AUTOPRO",
  description: "Аренда авто, спецтехники, водного транспорта и оборудования"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-50 text-gray-900 pb-20 md:pb-0 font-sans">
        <div className="flex flex-col min-h-screen">

          {/* Desktop/Tablet Header */}
          <header className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] sticky top-0 z-50">
            <div className="container-page flex items-center justify-between py-3 h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-primary p-1.5 rounded-lg group-hover:bg-accent transition-colors">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="font-black text-2xl tracking-tighter text-gray-900 flex items-center">
                  AUTO<span className="text-primary ml-0.5">PRO</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8 font-semibold text-gray-600">
                <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
                <Link href="/add" className="hover:text-primary transition-colors">Подать объявление</Link>
                <Link href="/messages" className="hover:text-primary transition-colors">Сообщения</Link>
              </nav>

              {/* Right Icons (Search/Notif/User) */}
              <div className="flex items-center gap-2 md:gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                  <Bell className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.15} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <Link href="/login" className="flex items-center gap-2 p-1 md:pr-4 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 hidden md:block">Войти</span>
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 w-full max-w-5xl mx-auto md:px-4 py-6">
            {children}
          </main>

          {/* Footer (Desktop only) */}
          <footer className="bg-white border-t hidden md:block mt-auto">
            <div className="container-page py-8 text-center">
              <span className="font-black text-xl tracking-tighter text-gray-300">
                AUTO<span className="text-gray-200 ml-0.5">PRO</span>
              </span>
              <p className="mt-2 text-xs text-gray-400">© {new Date().getFullYear()} Все права защищены.</p>
            </div>
          </footer>

          {/* Mobile Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t flex justify-around items-center py-2 pb-5 px-2 md:hidden z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <Link href="/" className="flex flex-col items-center gap-1 p-2 text-primary transition-colors">
              <Home className="w-6 h-6" strokeWidth={2.5} />
            </Link>
            <Link href="/catalog" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-primary transition-colors">
              <Car className="w-6 h-6" strokeWidth={2} />
            </Link>
            <Link href="/add" className="flex flex-col items-center gap-1 p-2 -mt-10 relative">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 transform active:scale-90 transition-all">
                <PlusSquare className="w-8 h-8 text-white" />
              </div>
            </Link>
            <Link href="/messages" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-primary transition-colors">
              <MessageCircle className="w-6 h-6" strokeWidth={2} />
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-primary transition-colors">
              <User className="w-6 h-6" strokeWidth={2} />
            </Link>
          </div>

        </div>
      </body>
    </html>
  );
}

