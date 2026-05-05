"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

export default function SuccessPage() {
    const { refreshUser } = useAuth();

    useEffect(() => {
        // Запросить бэкенд для обновления статуса сразу по возврату
        const checkStatus = async () => {
            try {
                await apiClient.get("/subscriptions/me");
                refreshUser();
            } catch (e) {
                // ignore
            }
        };
        checkStatus();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4">Оплата успешно завершена!</h1>
                <p className="text-slate-500 font-medium mb-8">
                    Ваш платеж успешно обработан. В течение пары минут подписка станет активной в вашем профиле.
                </p>
                <Link href="/profile">
                    <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg">
                        Перейти в профиль
                    </Button>
                </Link>
            </div>
        </div>
    );
}
