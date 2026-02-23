import { Car, LayoutDashboard, Users, FileText, Settings, LogOut, CreditCard, BookOpen, Package, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 font-bold text-xl border-b border-zinc-800">
           <Car className="h-6 w-6 text-primary" /> AutoPro Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {nav.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                pathname === href ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon size={20} /> {label}
            </Link>
          ))}
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
