"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function FailPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4">Ошибка оплаты</h1>
                <p className="text-slate-500 font-medium mb-8">
                    Во время проведения платежа произошла ошибка или вы отменили транзакцию. Пожалуйста, попробуйте еще раз.
                </p>
                <div className="space-y-3">
                    <Link href="/subscriptions" className="block">
                        <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg">
                            Попробовать снова
                        </Button>
                    </Link>
                    <Link href="/profile" className="block">
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-black text-lg hover:bg-slate-50">
                            Вернуться в профиль
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
