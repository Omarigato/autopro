import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AUTOPRO",
  description: "Аренда авто, спецтехники, водного транспорта и оборудования"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background">
        <div className="flex flex-col min-h-screen">
          <header className="border-b bg-white">
            <div className="container-page flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="font-bold text-lg">
                  AUTO<span className="text-primary">PRO</span>
                </span>
              </div>
              <nav className="flex gap-4 text-sm text-muted">
                <a href="/" className="hover:text-primary">Главная</a>
                <a href="/login" className="hover:text-primary">Вход для владельцев</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-white">
            <div className="container-page text-xs text-muted flex justify-between py-4">
              <span>© {new Date().getFullYear()} AUTOPRO</span>
              <span>Аренда авто и спецтехники</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

