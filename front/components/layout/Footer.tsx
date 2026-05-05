"use client";

import Link from "next/link";
import { Instagram, Send } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-blue-50/50 border-t border-blue-100/50 py-12 text-slate-500">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 h-6 mb-4">
            <Image src="/logo-dark.png" alt="Logo" width={480} height={120} className="h-10 w-auto sm:h-12" />
            <span className="inline-flex items-baseline gap-0">
              <span className="font-bold text-xl sm:text-2xl tracking-tight text-black">AutoRent</span>
              <span className="font-bold text-xl sm:text-2xl tracking-tight text-slate-500">Go</span>
            </span>
          </div>
          <p className="text-sm max-w-sm leading-relaxed">
            {t("footer.description")}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-4 h-6 flex items-center">{t("footer.clients_title")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/help" className="hover:text-primary">{t("footer.help")}</Link></li>
            <li><Link href="/terms" className="hover:text-primary">{t("footer.terms")}</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">{t("footer.privacy")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-4 h-6 flex items-center">{t("footer.contacts_title")}</h4>
          <div className="flex gap-4 mb-4">
            <Link
              href="#"
              className="p-2.5 bg-white rounded-xl shadow-sm hover:text-[#E4405F] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
            >
              <Instagram size={20} className="group-hover:scale-110 transition-transform" />
            </Link>
            <Link
              href="https://t.me/your_telegram"
              target="_blank"
              className="p-2.5 bg-white rounded-xl shadow-sm hover:text-[#0088cc] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
            >
              <Send size={20} className="group-hover:scale-110 transition-transform" />
            </Link>
            <Link
              href="https://wa.me/77771234567"
              target="_blank"
              className="p-2.5 bg-white rounded-xl shadow-sm hover:text-[#25D366] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-current group-hover:scale-110 transition-transform"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </Link>
          </div>
          <p className="text-sm">support@autorentgo.kz</p>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t border-slate-200 text-center text-xs">
        &copy; {new Date().getFullYear()} AutoRentGo. {t("footer.rights")}
      </div>
    </footer >
  );
}
