import Image from "next/image";
import Link from "next/link";
import { CarResponse } from "@/types/cars";
import { useTranslation } from "@/hooks/useTranslation";

interface CarMiniCardProps {
    car: CarResponse;
    href?: string;
}

export function CarMiniCard({ car, href }: CarMiniCardProps) {
    const { t } = useTranslation();
    const imageUrl = car.images?.[0]?.url || "https://via.placeholder.com/300x200?text=No+Image";

    const content = (
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="relative w-24 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                <Image
                    src={imageUrl}
                    alt={car.name}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 truncate">
                    {car.mark ? `${car.mark} ${car.model || ""}` : car.name}
                </h4>
                <div className="text-primary font-bold mt-1">
                    {car.price_per_day}  {'₸' + t("home.per_day")}
                </div>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block">{content}</Link>;
    }

    return content;
}
