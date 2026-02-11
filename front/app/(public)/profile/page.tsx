"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
    const { user, logout, isLoading } = useAuth();
    
    if (isLoading) return <div className="container py-20 text-center animate-pulse">Загрузка профиля...</div>;
    
    if (!user) {
        // ideally redirect in middleware or useEffect, but for now:
        return <div className="container py-20 text-center">Вы не авторизованы</div>;
    }

    return (
        <div className="container py-12 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Sidebar Card */}
                <div className="w-full md:w-1/3 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg text-center space-y-4">
                     <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-sm">
                         <Image src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} fill className="object-cover" />
                     </div>
                     <div>
                         <h2 className="text-xl font-bold">{user.name}</h2>
                         <p className="text-slate-400 text-sm">{user.email || user.login}</p>
                     </div>
                     <div className="pt-4 w-full space-y-2">
                         <Button variant="outline" className="w-full justify-start gap-2 rounded-xl h-12" disabled>
                             <Settings size={18} /> Настройки
                         </Button>
                         <Button variant="ghost" className="w-full justify-start gap-2 rounded-xl h-12 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => logout()}>
                             <LogOut size={18} /> Выйти
                         </Button>
                     </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full space-y-8">
                     <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                         <h3 className="text-lg font-bold mb-6">Мои объявления</h3>
                         <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                             <p>У вас пока нет активных объявлений</p>
                             <Button variant="link" className="mt-2 text-primary">Добавить авто</Button>
                         </div>
                     </div>

                     <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                         <h3 className="text-lg font-bold mb-6">История бронирований</h3>
                         <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                             <p>История пуста</p>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
}
