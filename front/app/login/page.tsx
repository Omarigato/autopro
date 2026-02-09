"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
      router.push("/owner");
    } catch (err) {
      setError("Неверный телефон или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page max-w-md">
      <h1 className="text-2xl font-bold mb-1">
        Добро пожаловать в <span className="text-primary">AUTOPRO</span>
      </h1>
      <p className="text-sm text-muted mb-6">Авторизируйтесь, чтобы продолжить как владелец.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted mb-1 block">Ваш телефон</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Укажите свой телефон"
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted mb-1 block">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Укажите пароль"
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-accent disabled:opacity-60"
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
    </div>
  );
}

