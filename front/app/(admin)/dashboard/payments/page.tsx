"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-slate-500">Загрузка...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Платежи</h2>
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          <TabsTrigger value="accounts">Платёжные аккаунты</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-4">
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Провайдер</th>
                  <th className="text-left p-3">order_id</th>
                  <th className="text-left p-3">Статус</th>
                  <th className="text-left p-3">Сумма (₸)</th>
                  <th className="text-left p-3">owner_id</th>
                  <th className="text-left p-3">Создан</th>
                  <th className="text-left p-3">Обновлён</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-3">{t.id}</td>
                    <td className="p-3">{t.provider}</td>
                    <td className="p-3 font-mono text-xs">{t.order_id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        t.status === "success" ? "bg-green-100 text-green-800" :
                        t.status === "failed" ? "bg-red-100 text-red-800" : "bg-slate-100"
                      }`}>{t.status}</span>
                    </td>
                    <td className="p-3">{t.amount_kzt}</td>
                    <td className="p-3">{t.owner_id}</td>
                    <td className="p-3">{t.create_date ? new Date(t.create_date).toLocaleString() : "—"}</td>
                    <td className="p-3">{t.update_date ? new Date(t.update_date).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && <div className="p-8 text-center text-slate-400">Нет транзакций</div>}
          </div>
        </TabsContent>
        <TabsContent value="accounts" className="mt-4">
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Провайдер</th>
                  <th className="text-left p-3">merchant_id</th>
                  <th className="text-left p-3">Активен</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50">
                    <td className="p-3">{a.id}</td>
                    <td className="p-3">{a.provider}</td>
                    <td className="p-3">{a.merchant_id || "—"}</td>
                    <td className="p-3">{a.is_active ? "Да" : "Нет"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {accounts.length === 0 && <div className="p-8 text-center text-slate-400">Нет аккаунтов</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
