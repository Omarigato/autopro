"use client";

import { useFullDictionaries } from "@/hooks/useDictionaries";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AddCarPage() {
    const { data: dicts, isLoading } = useFullDictionaries();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Using basic controlled form state for simplicity with Selects
    // Ideally use react-hook-form with Zod like Login/Register, but this is a complex dynamic form.
    // For this rewrite, I'll stick to a simpler implementation that works.
    
    const [formData, setFormData] = useState<any>({});
    
    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelect = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
             // Construct payload
             const payload = new FormData();
             // Append standard fields
             Object.entries(formData).forEach(([key, val]: [string, any]) => {
                 payload.append(key, val);
             });
             // Basic implementation - needs more rigorous validation
             await apiClient.post("/cars", payload);
             toast.success("Автомобиль добавлен на модерацию!");
             router.push("/profile");
        } catch(error: any) {
             console.error(error);
             toast.error("Ошибка при создании объявления");
        } finally {
             setSubmitting(false);
        }
    };

    if (isLoading) return <div className="container py-20 animate-pulse text-center">Загрузка справочников...</div>;

    return (
        <div className="container max-w-2xl py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black">Добавить автомобиль</h1>
                <p className="text-slate-400">Заполните форму, чтобы разместить объявление</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Основная информация</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Категория</label>
                            <Select onValueChange={(val) => handleSelect("category_id", val)}>
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Выберите..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {dicts?.categories?.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium">Марка</label>
                            <Select onValueChange={(val) => handleSelect("vehicle_mark_id", val)}>
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-transparent">
                                    <SelectValue placeholder="Выберите..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {dicts?.marks?.map((m: any) => (
                                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Название объявления</label>
                        <Input 
                            name="name" 
                            placeholder="Например: Toyota Camry 70, 2021" 
                            className="rounded-xl h-12 bg-slate-50 border-transparent" 
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Описание</label>
                        <Textarea 
                            name="description" 
                            placeholder="Расскажите подробнее об автомобиле..." 
                            className="rounded-xl min-h-[120px] bg-slate-50 border-transparent resize-none" 
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" size="lg" className="w-full rounded-xl h-14 text-lg" disabled={submitting}>
                        {submitting ? "Отправка..." : "Опубликовать объявление"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
