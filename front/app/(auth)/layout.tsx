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
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand via-brand to-brand-dark p-10 text-white">
        <Link href="/" className="flex items-center gap-3 font-bold text-2xl text-white hover:opacity-90 transition-opacity w-fit">
          <Image
            src="/logo-dark.png"
            alt=""
            width={220}
            height={60}
            className="h-10 w-auto"
            priority
          />
          <span className="font-bold text-2xl tracking-tight">AutoPro</span>
        </Link>
        <div className="space-y-4">
          <blockquote className="text-lg font-medium leading-relaxed">
            "AutoPro помог мне найти идеальный автомобиль для моего путешествия по Казахстану. Сервис на высшем уровне!"
          </blockquote>
          <div className="font-semibold">Омар А., Алматы</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <Link href="/" className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8 justify-center">
          <Image
            src="/logo-light.png"
            alt=""
            width={220}
            height={60}
            className="h-10 w-auto"
            priority
          />
           <span className="font-bold text-2xl tracking-tight">AutoPro</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
