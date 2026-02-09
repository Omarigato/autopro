"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("username", phone);
      form.append("password", password);
      const res = await apiClient.post("/auth/login", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", res.data.access_token);
      }
      router.push("/");
    } catch (err) {
      setError("Неверный телефон или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-md mx-auto px-6">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">
          Добро пожаловать <br />в <span className="text-primary">AUTOPRO</span>
        </h1>
        <p className="text-gray-500 text-sm">Авторизируйтесь чтобы продолжить</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Ваш телефон</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Укажите свой телефон"
            className="w-full border-gray-200 border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Пароль</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Укажите пароль"
              className="w-full border-gray-200 border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-primary text-white text-base font-bold hover:bg-accent disabled:opacity-60 shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]"
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/forgot" className="text-sm font-medium text-gray-500 hover:text-primary underline">
          Забыли пароль?
        </Link>
      </div>

      <div className="mt-auto pt-10 pb-6 text-center text-sm">
        <span className="text-gray-500">Еще нет аккаунта? </span>
        <Link href="/register" className="font-bold text-gray-900 hover:text-primary transition-colors underline">
          Зарегистрируйтесь
        </Link>
      </div>
    </div>
  );
}
