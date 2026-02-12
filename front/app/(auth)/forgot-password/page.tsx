"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

// Schemas for each step
const emailSchema = z.object({
    email: z.string().email("Введите корректный Email"),
});

const otpSchema = z.object({
    otp: z.string().min(4, "Введите код"),
});

const passwordSchema = z.object({
    password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
});

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"EMAIL" | "OTP" | "PASSWORD" | "SUCCESS">("EMAIL");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    // Forms
    const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
    const otpForm = useForm<z.infer<typeof otpSchema>>({ resolver: zodResolver(otpSchema) });
    const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

    // Step 1: Request OTP
    async function onEmailSubmit(values: z.infer<typeof emailSchema>) {
        try {
            await apiClient.post("/auth/otp/request", { target: values.email });
            setEmail(values.email);
            setStep("OTP");
            toast.success("Код отправлен на ваш Email");
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Ошибка отправки кода";
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    }

    // Step 2: Verify OTP
    async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
        try {
            await apiClient.post("/auth/otp/verify", { target: email, otp_code: values.otp });
            setOtp(values.otp);
            setStep("PASSWORD");
            toast.success("Код принят");
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Неверный код";
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    }

    // Step 3: Reset Password
    async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
        try {
            await apiClient.post("/auth/change-password", {
                target: email,
                otp_code: otp,
                password: values.password,
            });
            setStep("SUCCESS");
            toast.success("Пароль успешно обновлен");
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Ошибка смены пароля";
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Восстановление пароля</h1>
                <p className="text-muted-foreground">
                    {step === "EMAIL" && "Введите Email для получения кода"}
                    {step === "OTP" && `Введите код, отправленный на ${email}`}
                    {step === "PASSWORD" && "Придумайте новый пароль"}
                    {step === "SUCCESS" && "Пароль успешно изменен!"}
                </p>
            </div>

            {step === "EMAIL" && (
                <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                        <FormField
                            control={emailForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="user@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Получить код
                        </Button>
                    </form>
                </Form>
            )}

            {step === "OTP" && (
                <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                        <FormField
                            control={otpForm.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Код подтверждения</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Подтвердить
                        </Button>
                        <div className="text-center text-sm">
                            <button type="button" onClick={() => setStep("EMAIL")} className="text-primary hover:underline">
                                Изменить Email
                            </button>
                        </div>
                    </form>
                </Form>
            )}

            {step === "PASSWORD" && (
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                            control={passwordForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Новый пароль</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Повторите пароль</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Сохранить пароль
                        </Button>
                    </form>
                </Form>
            )}

            {step === "SUCCESS" && (
                <div className="text-center space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                    <p>Теперь вы можете войти с новым паролем.</p>
                    <Button onClick={() => router.push("/login")} className="w-full">
                        Перейти к входу
                    </Button>
                </div>
            )}

            {step !== "SUCCESS" && (
                <div className="text-center text-sm">
                    <Link href="/login" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" /> Вернуться к входу
                    </Link>
                </div>
            )}
        </div>
    );
}
