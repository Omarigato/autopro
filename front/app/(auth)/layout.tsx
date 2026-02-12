import { Car } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="h-8 w-8 object-contain" />
        </div>
        <div className="space-y-4">
          <blockquote className="text-lg font-medium leading-relaxed">
            "Этот сервис помог мне найти идеальный автомобиль для моего путешествия по Казахстану. Сервис на высшем уровне!"
          </blockquote>
          <div className="font-semibold">Айдос Е., Алматы</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <Link href="/" className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8 justify-center">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="h-6 w-6 object-contain" />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
