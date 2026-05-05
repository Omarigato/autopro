"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PUBLIC_SETTINGS_QUERY_KEY } from "@/hooks/usePublicSettings";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

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
        queryClient.invalidateQueries({ queryKey: PUBLIC_SETTINGS_QUERY_KEY });
      })
      .finally(() => setLoading(false));
  };

  if (loading && Object.keys(settings).length === 0) {
    return <div className="text-slate-500">{t("common.loading")}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t("admin.settings_page.title")}</h2>
      <div className="bg-white rounded-xl border border-slate-100 p-6 max-w-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-base font-medium">
              {subscriptionsEnabled ? t("admin.settings_page.subs_enabled") : t("admin.settings_page.subs_disabled")}
            </Label>
            <p className="text-sm text-slate-500 mt-1">
              {t("admin.settings_page.subs_desc")}
            </p>
          </div>
          <Button
            variant={subscriptionsEnabled ? "default" : "outline"}
            onClick={toggleSubscriptions}
            disabled={loading}
          >
            {subscriptionsEnabled ? t("admin.settings_page.on") : t("admin.settings_page.off")}
          </Button>
        </div>
      </div>
      <p className="text-slate-500 mt-4 text-sm">
        {t("admin.settings_page.info_note")}
      </p>
    </div>
  );
}
