"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

type UserMe = {
  id: number;
  name: string;
  role: "owner" | "admin";
};

export default function AdminPage() {
  const [me, setMe] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<UserMe>("/auth/me")
      .then((res) => setMe(res.data))
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container-page">
        <p className="text-sm text-muted">Загрузка админ‑панели...</p>
      </div>
    );
  }

  if (!me || me.role !== "admin") {
    return (
      <div className="container-page">
        <p className="text-sm text-red-500">
          Доступ в админ‑панель есть только у пользователей с ролью администратора.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page space-y-4">
      <h1 className="text-xl font-semibold mb-2">Админ‑панель</h1>
      <div className="flex gap-2 border-b pb-2 text-sm">
        <button className="px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">
          Клиенты
        </button>
        <button className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium">
          Владелцы автомобилей
        </button>
        <button className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium">
          Подписки и платежи
        </button>
      </div>
      <p className="text-sm text-muted">
        Здесь позже добавим списки клиентов, владельцев (с их машинами), настроек подписок и
        платёжных аккаунтов Kassa24/Kaspi.
      </p>
    </div>
  );
}

