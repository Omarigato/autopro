"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/admin/settings")
      .then((r: any) => {
        const d = r?.data ?? r;
        setSettings(d || {});
      })
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, []);

  const subscriptionsEnabled = settings.subscriptions_enabled !== "false";

  const toggleSubscriptions = () => {
    const next = !subscriptionsEnabled;
    setLoading(true);
    apiClient.patch("/admin/settings", { subscriptions_enabled: next })
      .then((r: any) => {
        const d = r?.data ?? r;
        setSettings(d || {});
      })
      .finally(() => setLoading(false));
  };

  if (loading && Object.keys(settings).length === 0) {
    return <div className="text-slate-500">Загрузка...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Настройки</h2>
      <div className="bg-white rounded-xl border border-slate-100 p-6 max-w-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-base font-medium">Подписки включены</Label>
            <p className="text-sm text-slate-500 mt-1">
              Если включено: первое объявление бесплатно, далее нужна подписка. Если выключено — всем бесплатно.
            </p>
          </div>
          <Button
            variant={subscriptionsEnabled ? "default" : "outline"}
            onClick={toggleSubscriptions}
            disabled={loading}
          >
            {subscriptionsEnabled ? "Вкл" : "Выкл"}
          </Button>
        </div>
      </div>
      <p className="text-slate-500 mt-4 text-sm">
        Платёжные аккаунты и тарифы подписок — в разделах «Платежи» и «Подписки» (через API /admin/subscriptions/plans).
      </p>
    </div>
  );
}
