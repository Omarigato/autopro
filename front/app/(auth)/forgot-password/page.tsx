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
import { useTranslation } from "@/hooks/useTranslation";

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [step, setStep] = useState<"EMAIL" | "OTP" | "PASSWORD" | "SUCCESS">("EMAIL");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    // Schemas - redefined inside component or with t() logic
    const emailSchema = z.object({
        email: z.string().email(t("auth.invalid_email")),
    });

    const otpSchema = z.object({
        otp: z.string().min(4, t("auth.enter_code")),
    });

    const passwordSchema = z.object({
        password: z.string().min(6, t("auth.password_min_length")),
        confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t("auth.passwords_dont_match"),
        path: ["confirmPassword"],
    });

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
            toast.success(t("auth.otp_sent"));
        } catch (error: any) {
            const msg = error?.response?.data?.message || t("common.error");
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    }

    // Step 2: Verify OTP
    async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
        try {
            await apiClient.post("/auth/otp/verify", { target: email, otp_code: values.otp });
            setOtp(values.otp);
            setStep("PASSWORD");
            toast.success(t("auth.otp_accepted"));
        } catch (error: any) {
            const msg = error?.response?.data?.message || t("common.error");
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
            toast.success(t("auth.password_updated"));
        } catch (error: any) {
            const msg = error?.response?.data?.message || t("common.error");
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">{t("auth.forgot_password_title")}</h1>
                <p className="text-muted-foreground">
                    {step === "EMAIL" && t("auth.forgot_password_email_desc")}
                    {step === "OTP" && t("auth.forgot_password_otp_desc", { email })}
                    {step === "PASSWORD" && t("auth.forgot_password_new_desc")}
                    {step === "SUCCESS" && t("auth.forgot_password_success_desc")}
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
                                    <FormLabel>{t("auth.email")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="user@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            {t("auth.get_code")}
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
                                    <FormLabel>{t("auth.verification_code")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            {t("auth.confirm")}
                        </Button>
                        <div className="text-center text-sm">
                            <button type="button" onClick={() => setStep("EMAIL")} className="text-primary hover:underline">
                                {t("auth.change_email")}
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
                                    <FormLabel>{t("auth.new_password")}</FormLabel>
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
                                    <FormLabel>{t("auth.repeat_password")}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            {t("auth.save_password")}
                        </Button>
                    </form>
                </Form>
            )}

            {step === "SUCCESS" && (
                <div className="text-center space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                    <p>{t("auth.new_password_ready")}</p>
                    <Button onClick={() => router.push("/login")} className="w-full">
                        {t("auth.go_to_login")}
                    </Button>
                </div>
            )}

            {step !== "SUCCESS" && (
                <div className="text-center text-sm">
                    <Link href="/login" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" /> {t("auth.back_to_login")}
                    </Link>
                </div>
            )}
        </div>
    );
}
