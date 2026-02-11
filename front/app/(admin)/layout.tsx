import { Car, LayoutDashboard, Users, FileText, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 font-bold text-xl border-b border-zinc-800">
           <Car className="h-6 w-6 text-primary" /> AutoPro Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800/50 text-white font-medium hover:bg-zinc-800 transition-colors">
            <LayoutDashboard size={20} /> Обзор
          </Link>
          <Link href="/dashboard/users" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-colors">
            <Users size={20} /> Пользователи
          </Link>
          <Link href="/dashboard/cars" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-colors">
            <FileText size={20} /> Объявления
          </Link>
           <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-colors">
            <Settings size={20} /> Настройки
          </Link>
        </nav>
        <div className="p-4 border-t border-zinc-800">
           <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 font-medium hover:bg-zinc-800 transition-colors">
             <LogOut size={20} /> Выйти
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
           <h1 className="font-bold text-xl">Панель управления</h1>
           <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Администратор</span>
              <div className="w-8 h-8 rounded-full bg-zinc-200" />
           </div>
        </header>
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
