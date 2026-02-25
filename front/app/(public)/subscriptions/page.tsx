"use client";

import { useSubscriptionPlans } from "@/hooks/useSubscriptions";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Shield, MessageCircle, HelpCircle, Star, Sparkles, Rocket } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const getPlanIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('premium')) return <Crown className="w-12 h-12 text-amber-500 fill-amber-50" />;
    if (n.includes('free') || n.includes('бесплат')) return <Zap className="w-12 h-12 text-indigo-500 fill-indigo-50" />;
    if (n.includes('business') || n.includes('бизнес')) return <Rocket className="w-12 h-12 text-blue-600 fill-blue-50" />;
    return <Shield className="w-12 h-12 text-indigo-600 fill-indigo-50" />;
};

const getPlanFeatures = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('premium') || n.includes('бизнес')) {
        return [
            "Приоритетное размещение в поиске",
            "Безлимитное количество объявлений",
            "Расширенная аналитика просмотров",
            "Персональный менеджер 24/7",
            "Значок проверенного партнера",
            "Подсветка объявлений в каталоге"
        ];
    }
    return [
        "Базовое размещение в каталоге",
        "До 3 активных объявлений",
        "Стандартная техподдержка",
        "Базовая статистика в личном кабинете",
        "Доступ к общему чату владельцев"
    ];
};

export default function SubscriptionsPage() {
    const { data: plans = [], isLoading } = useSubscriptionPlans();

    return (
        <div className="min-h-screen bg-slate-50/30 pb-20">
            {/* Hero Header */}
            <section className="bg-indigo-600 py-32 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
                </div>

                <div className="container relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-indigo-100 text-sm font-bold border border-white/10 animate-pulse">
                        <Sparkles size={16} />
                        <span>Новые возможности для вашего заработка</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
                        Масштабируйте свой <br className="hidden md:block" />
                        <span className="text-indigo-200">бизнес с AutoPro</span>
                    </h1>
                    <p className="text-indigo-100/80 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        Выберите тариф, который идеально подходит под ваши цели — от частного арендодателя до крупного автопарка.
                    </p>
                </div>
            </section>

            <div className="container -mt-20 relative z-20 px-4 mx-auto">
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-[2.5rem] h-[600px] animate-pulse shadow-xl shadow-indigo-100/50" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                        {plans.map((plan) => {
                            const isPremium = plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('бизнес');
                            return (
                                <div
                                    key={plan.id}
                                    className={cn(
                                        "bg-white rounded-[2.5rem] p-10 flex flex-col transition-all duration-500 group hover:-translate-y-2",
                                        isPremium
                                            ? "shadow-2xl shadow-indigo-200/50 border-2 border-indigo-500 relative"
                                            : "shadow-xl shadow-slate-200/50 border border-slate-100"
                                    )}
                                >
                                    {isPremium && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                            Рекомендуем
                                        </div>
                                    )}

                                    <div className="mb-10 text-center flex flex-col items-center">
                                        <div className={cn(
                                            "w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500",
                                            isPremium ? "bg-indigo-50" : "bg-slate-50"
                                        )}>
                                            {getPlanIcon(plan.name)}
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 leading-tight">{plan.name}</h3>
                                        <div className="mt-4 flex flex-col items-center">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-black tracking-tighter text-indigo-600">{plan.price.toLocaleString()} ₸</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 px-3 py-1 bg-slate-50 rounded-full">
                                                период: {plan.period} дней
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-5 mb-12 flex-1">
                                        {getPlanFeatures(plan.name).map((feature, i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className={cn(
                                                    "mt-1 p-0.5 rounded-full flex-shrink-0",
                                                    isPremium ? "text-indigo-600" : "text-slate-400"
                                                )}>
                                                    <Check className="w-5 h-5" strokeWidth={3} />
                                                </div>
                                                <span className="text-slate-600 text-sm font-semibold leading-relaxed">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        size="lg"
                                        className={cn(
                                            "w-full h-16 rounded-2xl text-lg font-black transition-all duration-300 shadow-lg",
                                            isPremium
                                                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                                                : "bg-slate-900 hover:bg-slate-800 shadow-slate-200"
                                        )}
                                        asChild={plan.price === 0}
                                    >
                                        {plan.price === 0 ? (
                                            <Link href="/dashboard">Начать бесплатно</Link>
                                        ) : (
                                            "Оформить тариф"
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* FAQ Section */}
                <div className="mt-32 text-center max-w-4xl mx-auto space-y-10 px-4">
                    <div className="space-y-4">
                        <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-3xl mx-auto">
                            <HelpCircle size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Остались вопросы?</h2>
                        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Наша команда экспертов всегда готова помочь вам выбрать наиболее стратегически выгодный вариант для масштабирования ваших целей.
                        </p>
                    </div>

                    {/* Fixed: responsiveness with flex-col on mobile and flex-row on larger screens */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto rounded-2xl px-10 h-16 border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-black text-lg gap-3"
                        >
                            <MessageCircle size={22} />
                            Чат с поддержкой
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-full sm:w-auto rounded-2xl px-10 h-16 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-black text-lg gap-3"
                        >
                            <HelpCircle size={22} />
                            Помощь и FAQ
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
