"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const formSchema = z.object({
    login: z.string().min(1, "Введите логин"),
    password: z.string().optional(),
    otp_code: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: "",
      password: "",
      otp_code: "",
    },
  });

  const handleRequestOtp = async () => {
    const loginVal = form.getValues("login");
    if (!loginVal) {
      toast.error("Введите логин");
      return;
    }
    try {
      await apiClient.post("/auth/otp/request", { target: loginVal });
      setOtpSent(true);
      toast.success("Код отправлен");
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Ошибка отправки кода";
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (mode === "PASSWORD" && !values.password) {
        form.setError("password", { message: "Введите пароль" });
        return;
      }
      if (mode === "OTP" && !values.otp_code) {
        form.setError("otp_code", { message: "Введите код" });
        return;
      }

      await login({
        login: values.login,
        password: mode === "PASSWORD" ? values.password : undefined,
        otp_code: mode === "OTP" ? values.otp_code : undefined
      });
      toast.success("Вы успешно вошли!");
      router.push("/");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Ошибка входа");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">С возвращением</h1>
        <p className="text-muted-foreground">Введите данные для входа в систему</p>
      </div>

      <div className="space-y-4">
        <Tabs value={mode} onValueChange={(val) => setMode(val as "PASSWORD" | "OTP")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="PASSWORD">Пароль</TabsTrigger>
            <TabsTrigger value="OTP">Код</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Логин</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === "PASSWORD" ? (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Пароль</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary hover:underline"
                      tabIndex={-1}
                    >
                      Забыли пароль?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <Button type="button" variant="secondary" onClick={handleRequestOtp} className="w-full">
                  Получить код
                </Button>
              ) : (
                <FormField
                  control={form.control}
                  name="otp_code"
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
              )}
              {otpSent && (
                <div className="text-center text-xs">
                  <button type="button" onClick={() => setOtpSent(false)} className="text-primary hover:underline">Отправить повторно</button>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full">
            Войти
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}

function EyeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.022 1.28-.07" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}
