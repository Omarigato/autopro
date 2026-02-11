import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 py-12 text-slate-500">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">AutoPro</h3>
          <p className="text-sm">
            Ваш надежный партнер в мире аренды автомобилей. Мы предлагаем лучшие условия и широкий выбор транспорта.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-foreground mb-4">Компания</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-primary">О нас</Link></li>
            <li><Link href="/careers" className="hover:text-primary">Вакансии</Link></li>
            <li><Link href="/blog" className="hover:text-primary">Блог</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-4">Клиентам</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/help" className="hover:text-primary">Помощь</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Условия использования</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">Конфиденциальность</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-4">Контакты</h4>
          <div className="flex gap-4 mb-4">
            <Link href="#" className="p-2 bg-white rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all"><Instagram size={18} /></Link>
            <Link href="#" className="p-2 bg-white rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all"><Facebook size={18} /></Link>
            <Link href="#" className="p-2 bg-white rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all"><Twitter size={18} /></Link>
          </div>
          <p className="text-sm">+7 (777) 123-45-67</p>
          <p className="text-sm">support@autopro.kz</p>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t border-slate-200 text-center text-xs">
        &copy; {new Date().getFullYear()} AutoPro. All rights reserved.
      </div>
    </footer>
  );
}
