"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminPaymentsPage() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const [accPage, setAccPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    Promise.all([
      apiClient.get("/admin/payments/transactions").then((r: any) => r?.data ?? r ?? []),
      apiClient.get("/admin/payments/accounts").then((r: any) => r?.data ?? r ?? []),
    ])
      .then(([tx, acc]) => {
        setTransactions(Array.isArray(tx) ? tx : []);
        setAccounts(Array.isArray(acc) ? acc : []);
      })
      .catch(() => { setTransactions([]); setAccounts([]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500">{t("common.loading")}</div>;

  const totalTxPages = Math.ceil(transactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTx = transactions.slice((txPage - 1) * ITEMS_PER_PAGE, txPage * ITEMS_PER_PAGE);

  const totalAccPages = Math.ceil(accounts.length / ITEMS_PER_PAGE) || 1;
  const paginatedAcc = accounts.slice((accPage - 1) * ITEMS_PER_PAGE, accPage * ITEMS_PER_PAGE);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t("admin.payments_page.title")}</h2>
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">{t("admin.payments_page.tabs.transactions")}</TabsTrigger>
          <TabsTrigger value="accounts">{t("admin.payments_page.tabs.accounts")}</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-4">
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-3">{t("admin.payments_page.table.id")}</th>
                  <th className="text-left p-3">{t("admin.payments_page.table.provider")}</th>
                  <th className="text-left p-3">{t("admin.payments_page.table.order_id")}</th>
                  <th className="text-left p-3">{t("admin.payments_page.table.status")}</th>
                  <th className="text-left p-3">{t("admin.payments_page.table.amount")}</th>
                  <th className="text-left p-3">{t("admin.payments_page.table.owner_id")}</th>
                  <th className="text-left p-3">{t("admin.payments_page.table.created")}</th>
                  <th className="text-left p-3">{t("admin.payments_page.table.updated")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTx.map((t_v: any) => (
                  <tr key={t_v.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-3">{t_v.id}</td>
                    <td className="p-3">{t_v.provider}</td>
                    <td className="p-3 font-mono text-xs">{t_v.order_id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${t_v.status === "success" ? "bg-green-100 text-green-800" :
                        t_v.status === "failed" ? "bg-red-100 text-red-800" : "bg-slate-100"
                        }`}>{t_v.status}</span>
                    </td>
                    <td className="p-3">{t_v.amount_kzt}</td>
                    <td className="p-3">{t_v.owner_id}</td>
                    <td className="p-3">{t_v.create_date ? new Date(t_v.create_date).toLocaleString() : "—"}</td>
                    <td className="p-3">{t_v.update_date ? new Date(t_v.update_date).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paginatedTx.length === 0 && <div className="p-8 text-center text-slate-400">{t("admin.payments_page.no_transactions")}</div>}
          </div>

          {totalTxPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 mb-4">
              <button
                disabled={txPage === 1}
                onClick={() => setTxPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 text-sm border bg-white rounded-xl disabled:opacity-50"
              >
                {t("common.back")}
              </button>
              <span className="text-sm font-medium text-slate-500">
                {t("admin.users_page.page")} {txPage} {t("admin.users_page.of")} {totalTxPages}
              </span>
              <button
                disabled={txPage === totalTxPages}
                onClick={() => setTxPage(p => Math.min(totalTxPages, p + 1))}
                className="px-4 py-2 text-sm border bg-white rounded-xl disabled:opacity-50"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="accounts" className="mt-4">
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-3">{t("admin.payments_page.table.id")}</th>
                  <th className="text-left p-3">{t("admin.payments_page.table.provider")}</th>
                  <th className="text-left p-3">{t("admin.payments_page.table.merchant_id")}</th>
                  <th className="text-left p-3">{t("admin.payments_page.table.active")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAcc.map((a: any) => (
                  <tr key={a.id} className="border-b border-slate-50">
                    <td className="p-3">{a.id}</td>
                    <td className="p-3">{a.provider}</td>
                    <td className="p-3">{a.merchant_id || "—"}</td>
                    <td className="p-3">{a.is_active ? t("admin.users_page.yes") : t("admin.users_page.no")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paginatedAcc.length === 0 && <div className="p-8 text-center text-slate-400">{t("admin.payments_page.no_accounts")}</div>}
          </div>

          {totalAccPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 mb-4">
              <button
                disabled={accPage === 1}
                onClick={() => setAccPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 text-sm border bg-white rounded-xl disabled:opacity-50"
              >
                {t("common.back")}
              </button>
              <span className="text-sm font-medium text-slate-500">
                {t("admin.users_page.page")} {accPage} {t("admin.users_page.of")} {totalAccPages}
              </span>
              <button
                disabled={accPage === totalAccPages}
                onClick={() => setAccPage(p => Math.min(totalAccPages, p + 1))}
                className="px-4 py-2 text-sm border bg-white rounded-xl disabled:opacity-50"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
