"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminOtpPage() {
  const { t, lang } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState("");

  const load = (t_val?: string) => {
    setLoading(true);
    apiClient
      .get("/admin/otp", { params: { target: t_val || undefined } })
      .then((res: any) => {
        const d = res?.data ?? res;
        setItems(Array.isArray(d) ? d : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t("admin.otp_page.title")}</h2>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder={t("admin.otp_page.search_placeholder")}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => load(target || undefined)} disabled={loading}>
          {t("admin.otp_page.search_button")}
        </Button>
      </div>

      {loading ? (
        <div className="text-slate-500">{t("common.loading")}</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-2">{t("admin.otp_page.id")}</th>
                <th className="text-left p-2">{t("admin.otp_page.target")}</th>
                <th className="text-left p-2">{t("admin.otp_page.code")}</th>
                <th className="text-left p-2">{t("admin.otp_page.type")}</th>
                <th className="text-left p-2">{t("admin.otp_page.used")}</th>
                <th className="text-left p-2">{t("admin.otp_page.created_at")}</th>
                <th className="text-left p-2">{t("admin.otp_page.expires_at")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o: any) => (
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="p-2">{o.id}</td>
                  <td className="p-2 font-mono">{o.target}</td>
                  <td className="p-2 font-mono font-semibold">{o.code}</td>
                  <td className="p-2">{o.type}</td>
                  <td className="p-2">{o.is_used ? t("admin.users_page.yes") : t("admin.users_page.no")}</td>
                  <td className="p-2">
                    {o.created_at ? new Date(o.created_at).toLocaleString(lang === "en" ? "en-US" : lang === "kk" ? "kk-KZ" : "ru-RU") : "—"}
                  </td>
                  <td className="p-2">
                    {o.expires_at ? new Date(o.expires_at).toLocaleString(lang === "en" ? "en-US" : lang === "kk" ? "kk-KZ" : "ru-RU") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="p-6 text-center text-slate-400">{t("admin.otp_page.no_items")}</div>
          )}
        </div>
      )}
    </div>
  );
}

