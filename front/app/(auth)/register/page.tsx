"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import InputMask from "react-input-mask";
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
import { useTranslation } from "@/hooks/useTranslation";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function RegisterPage() {
  const { t, formatMessage } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2, t("register.name_min")),
    phone_number: z.string().min(11, t("register.phone_error")),
    email: z.string().email(t("login.email_error")).optional().or(z.literal("")),
    password: z.string().min(6, t("register.password_min")).optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  }).refine((data) => {
    // Если пароль не введён — ничего не проверяем
    if (!data.password) return true;
    return data.password === data.confirmPassword;
  }, {
    message: t("register.passwords_not_match"),
    path: ["confirmPassword"],
  });

  // Mask logic handled by InputMask comp
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone_number: "+7",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchEmail = form.watch("email");

  async function checkExistence(field: "email" | "phone_number", value: string) {
    if (!value) return;
    try {
      const payload = field === "email" ? { email: value } : { phone_number: value };
      const res: any = await apiClient.post("/auth/check-exists", payload);

      if (field === "email" && res?.email_exists) {
        form.setError("email", { type: "manual", message: t("register.email_exists") });
        toast.error(t("register.email_exists"), { style: { background: 'red', color: 'white' } });
      } else if (field === "email") {
        form.clearErrors("email");
      }

      if (field === "phone_number" && res?.phone_exists) {
        form.setError("phone_number", { type: "manual", message: t("register.phone_exists") });
        toast.error(t("register.phone_exists"), { style: { background: 'red', color: 'white' } });
      } else if (field === "phone_number") {
        form.clearErrors("phone_number");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { confirmPassword, ...payload } = values;
      const normalizedPayload = {
        ...payload,
        email: payload.email || undefined,
        password: payload.password || undefined,
      };
      await apiClient.post("/auth/register", normalizedPayload);
      toast.success(t("register.success"));
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      const msg = formatMessage(error?.message) || t("register.error");
      toast.error(msg);
      if (msg.includes("телефона")) {
        form.setError("phone_number", { message: msg });
      }
      if (msg.includes("email")) {
        form.setError("email", { message: msg });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t("register.title")}</h1>
        <p className="text-muted-foreground">{t("register.subtitle")}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("register.name_label")} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder={t("register.name_placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("register.phone_label")} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <InputMask
                    mask="+7 (999) 999-99-99"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                      field.onBlur();
                      checkExistence("phone_number", e.target.value);
                    }}
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
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("register.email_label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="user@example.com"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      checkExistence("email", e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {watchEmail && watchEmail.trim() !== "" && (
            <>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  {t("register.email_login_note")}
                </p>
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("register.password_label")}</FormLabel>
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
                          {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("register.confirm_password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="******"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <Button type="submit" className="w-full">
            {t("register.submit")}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        {t("register.have_account")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("register.login")}
        </Link>
      </div>
    </div >
  );
}


