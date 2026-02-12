"use client";

import { useSubscriptionPlans } from "@/hooks/useSubscriptions";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Shield } from "lucide-react";
import Link from "next/link";

const getPlanIcon = (name: string) => {
    if (name.toLowerCase().includes('premium')) return <Crown className="w-10 h-10 text-yellow-500" />;
    if (name.toLowerCase().includes('free')) return <Zap className="w-10 h-10 text-blue-500" />;
    return <Shield className="w-10 h-10 text-primary" />;
};

const getPlanFeatures = (name: string) => {
    if (name.toLowerCase().includes('premium')) {
        return [
            "Приоритетное размещение",
            "Безлимитные объявления",
            "Доступ к расширенной аналитике",
            "Выделенная поддержка 24/7",
            "Значок проверенного партнера"
        ];
    }
    return [
        "Базовое размещение",
        "До 3 активных объявлений",
        "Стандартная поддержка",
        "Базовая статистика"
    ];
};

export default function SubscriptionsPage() {
    const { data: plans = [], isLoading } = useSubscriptionPlans();

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Hero Header */}
            <section className="bg-blue-950 py-24 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
                <div className="container relative z-10 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black">Тарифные планы</h1>
                    <p className="text-blue-100/70 text-lg max-w-2xl mx-auto">
                        Выберите подходящий тариф для вашего бизнеса и начните зарабатывать на аренде авто уже сегодня.
                    </p>
                </div>
            </section>

            <div className="container -mt-16 relative z-20 pb-24">
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl h-[500px] animate-pulse shadow-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-3xl p-8 shadow-xl border border-blue-50 flex flex-col hover:scale-105 transition-transform duration-300 ${plan.name.toLowerCase().includes('premium') ? 'ring-2 ring-primary ring-offset-4' : ''
                                    }`}
                            >
                                <div className="mb-8">
                                    {getPlanIcon(plan.name)}
                                    <h3 className="text-2xl font-bold mt-4">{plan.name}</h3>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-5xl font-black tracking-tight">{plan.price} ₸</span>
                                        <span className="ml-1 text-slate-500">/ {plan.period} дней</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    {getPlanFeatures(plan.name).map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="bg-blue-50 p-1 rounded-full">
                                                <Check className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-slate-600 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                                    asChild={plan.price === 0}
                                >
                                    {plan.price === 0 ? (
                                        <Link href="/dashboard">Начать бесплатно</Link>
                                    ) : (
                                        "Выбрать тариф"
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-20 text-center max-w-3xl mx-auto space-y-6">
                    <h2 className="text-3xl font-bold">Остались вопросы?</h2>
                    <p className="text-slate-500 text-lg">
                        Наша команда всегда готова помочь вам выбрать наиболее подходящий вариант для ваших целей.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" size="lg" className="rounded-full px-8">Чат с поддержкой</Button>
                        <Button variant="ghost" size="lg" className="rounded-full px-8">Часто задаваемые вопросы</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
