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

const formSchema = z.object({
  name: z.string().min(2, "Имя должно быть не менее 2 символов"),
  phone_number: z.string().min(11, "Введите корректный номер телефона"),
  login: z.string().min(3, "Логин должен быть не менее 3 символов"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mask logic handled by InputMask comp
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone_number: "+7",
      login: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function checkExistence(field: "email" | "phone_number", value: string) {
    if (!value) return;
    try {
      const payload = field === "email" ? { email: value } : { phone_number: value };
      const res: any = await apiClient.post("/auth/check-exists", payload);

      if (field === "email" && res?.email_exists) {
        form.setError("login", { type: "manual", message: "Этот email уже зарегистрирован" });
        toast.error("Этот email уже зарегистрирован", { style: { background: 'red', color: 'white' } });
      } else if (field === "email") {
        form.clearErrors("login");
      }

      if (field === "phone_number" && res?.phone_exists) {
        form.setError("phone_number", { type: "manual", message: "Этот номер уже зарегистрирован" });
        toast.error("Этот номер уже зарегистрирован", { style: { background: 'red', color: 'white' } });
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
      await apiClient.post("/auth/register", payload);
      toast.success("Регистрация успешна! Теперь вы можете войти.");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.detail || "Ошибка регистрации";
      toast.error(msg);
      if (msg.includes("телефона")) {
        form.setError("phone_number", { message: msg });
      }
      if (msg.includes("email")) {
        form.setError("login", { message: msg });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Создать аккаунт</h1>
        <p className="text-muted-foreground">Присоединяйтесь к сообществу AutoPro</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Полное имя <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Иван Иванов" {...field} />
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
                <FormLabel>Телефон <span className="text-red-500">*</span></FormLabel>
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
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Логин (Email) <span className="text-red-500">*</span></FormLabel>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль <span className="text-red-500">*</span></FormLabel>
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
                <FormLabel>Подтвердите пароль <span className="text-red-500">*</span></FormLabel>
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
          <Button type="submit" className="w-full">
            Зарегистрироваться
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Войти
        </Link>
      </div>
    </div >
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
