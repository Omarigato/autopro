"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SubscriptionsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<number | null>(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const res = await apiClient.get("/subscriptions/plans") as any;
            setPlans(res?.data || res || []);
        } catch (error) {
            toast.error("Ошибка при загрузке тарифов");
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId: number) => {
        if (!user) {
            router.push("/login?redirect=/subscriptions");
            return;
        }

        setPurchasing(planId);
        try {
            const res = await apiClient.post("/subscriptions/checkout", {
                plan_id: planId,
                provider: "kassa24"
            }) as any;

            const data = res?.data || res;
            if (data?.payment_url) {
                window.location.href = data.payment_url;
            } else {
                toast.error("Не удалось получить ссылку на оплату");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Ошибка при создании платежа");
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container max-w-5xl mx-auto px-4">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors border border-slate-200 shadow-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад в профиль
                </Link>

                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
                        Выберите подходящий тариф
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Получите полный доступ ко всем функциям и увеличьте количество заявок.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <Card key={plan.id} className="relative flex flex-col p-8 rounded-[2.5rem] bg-white border-none shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-slate-900">{plan.price_kzt} ₸</span>
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">/ {plan.period_days} дней</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-slate-600 font-medium text-sm">Полный доступ к платформе</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-slate-600 font-medium text-sm">Поддержка WhatsApp уведомлений</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-slate-600 font-medium text-sm">Приоритетная поддержка</span>
                                    </li>
                                </ul>

                                <Button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={purchasing === plan.id}
                                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-lg shadow-slate-900/20"
                                >
                                    {purchasing === plan.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        "Оплатить"
                                    )}
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
