"use client";

import { useState, Suspense } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import InputMask from "react-input-mask";
import { useTranslation } from "@/hooks/useTranslation";
import { EyeIcon, EyeOffIcon } from "lucide-react";

function LoginContent() {
  const { t, formatMessage } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  // Основные вкладки: вход по телефону (OTP) и по email
  const [mode, setMode] = useState<"PHONE" | "EMAIL">("PHONE");
  // Для email‑вкладки: режим по паролю или по коду
  const [emailMode, setEmailMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const formSchema = z.object({
    phone_number: z.string().optional(),
    email: z.string().email(t("login.email_error")).optional().or(z.literal("")),
    password: z.string().optional(),
    otp_code: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: "",
      email: "",
      password: "",
      otp_code: "",
    },
  });

  const handleRequestOtp = async () => {
    const values = form.getValues();
    const target = mode === "PHONE" ? values.phone_number : values.email;
    if (!target) {
      toast.error(mode === "PHONE" ? t("login.phone_empty") : t("login.email_empty"));
      return;
    }
    try {
      await apiClient.post("/auth/otp/request", { target });
      setOtpSent(true);
      toast.success(t("login.otp_sent"));
    } catch (e: any) {
      toast.error(formatMessage(e?.message) || t("login.otp_error"));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Валидация по режимам
      if (mode === "EMAIL" && emailMode === "PASSWORD" && !values.password) {
        form.setError("password", { message: t("login.password_empty") });
        return;
      }
      if ((mode === "PHONE" || (mode === "EMAIL" && emailMode === "OTP")) && !values.otp_code) {
        form.setError("otp_code", { message: t("login.otp_empty") });
        return;
      }

      let loginIdentifier: string | undefined;
      if (mode === "PHONE") {
        loginIdentifier = values.phone_number || undefined;
      } else {
        loginIdentifier = values.email || undefined;
      }

      if (!loginIdentifier) {
        toast.error(mode === "PHONE" ? t("login.phone_empty") : t("login.email_empty"));
        return;
      }

      await login({
        login: loginIdentifier,
        password: mode === "EMAIL" && emailMode === "PASSWORD" ? values.password : undefined,
        otp_code: (mode === "PHONE" || (mode === "EMAIL" && emailMode === "OTP")) ? values.otp_code : undefined
      });
      toast.success(t("login.success"));
      router.push(returnUrl);
    } catch (error: any) {
      console.log(error);
      toast.error(formatMessage(error?.message) || t("login.error"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t("login.title")}</h1>
        <p className="text-muted-foreground">{t("login.subtitle")}</p>
      </div>

      <div className="space-y-4">
        <Tabs
          value={mode}
          onValueChange={(val) => {
            setMode(val as "PHONE" | "EMAIL");
            setOtpSent(false);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="PHONE">{t("login.phone_tab")}</TabsTrigger>
            <TabsTrigger value="EMAIL">{t("login.email_tab")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {mode === "PHONE" && (
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.phone_label")}</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="+7 (999) 999-99-99"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          placeholder="+7 (777) 000-00-00"
                          type="tel"
                        />
                      )}
                    </InputMask>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {mode === "EMAIL" && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.email_tab")}</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {mode === "EMAIL" && emailMode === "PASSWORD" && (
            <>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{t("login.password_label")}</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                        tabIndex={-1}
                      >
                        {t("login.forgot_password")}
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
              <div className="text-center text-xs">
                <button
                  type="button"
                  onClick={() => { setEmailMode("OTP"); setOtpSent(false); }}
                  className="text-primary hover:underline"
                >
                  {t("login.login_by_code")}
                </button>
              </div>
            </>
          )}

          {(mode === "PHONE" || (mode === "EMAIL" && emailMode === "OTP")) && (
            <div className="space-y-4">
              {!otpSent ? (
                <Button type="button" variant="secondary" onClick={handleRequestOtp} className="w-full">
                  {t("login.get_code")}
                </Button>
              ) : (
                <FormField
                  control={form.control}
                  name="otp_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("login.otp_label")}</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {otpSent && (
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-primary hover:underline"
                  >
                    {t("login.resend_code")}
                  </button>
                  {mode === "EMAIL" && (
                    <button
                      type="button"
                      onClick={() => setEmailMode("PASSWORD")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {t("login.login_by_password")}
                    </button>
                  )}
                </div>
              )}
              {mode === "EMAIL" && !otpSent && (
                <div className="text-center text-xs">
                  <button
                    type="button"
                    onClick={() => setEmailMode("PASSWORD")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t("login.login_by_password")}
                  </button>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full">
            {t("login.submit")}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        {t("login.no_account")}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t("login.register")}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-slate-500">{t("common.loading")}</div>}>
      <LoginContent />
    </Suspense>
  );
}

