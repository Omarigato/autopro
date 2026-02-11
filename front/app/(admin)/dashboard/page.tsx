"use client";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-slate-400 font-medium text-sm text-transform uppercase">Всего пользователей</h3>
        <p className="text-3xl font-black mt-2">1,234</p>
        <div className="text-emerald-500 text-sm font-medium mt-2">+12% за месяц</div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-slate-400 font-medium text-sm text-transform uppercase">Активные объявления</h3>
        <p className="text-3xl font-black mt-2">56</p>
        <div className="text-emerald-500 text-sm font-medium mt-2">+5 новых сегодня</div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-slate-400 font-medium text-sm text-transform uppercase">Общий доход</h3>
        <p className="text-3xl font-black mt-2">4.2M ₸</p>
        <div className="text-emerald-500 text-sm font-medium mt-2">Рекордный месяц</div>
      </div>

      <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-64 flex items-center justify-center text-slate-300">
        График активности (Placeholder)
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold">Последние регистрации</h3>
        {[1,2,3].map(i => (
           <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100" />
              <div>
                  <div className="text-sm font-bold">User {i}</div>
                  <div className="text-xs text-slate-400">user{i}@example.com</div>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}
