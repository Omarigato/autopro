"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  User,
  AlertCircle
} from "lucide-react";

type LoginTab = "phone" | "classic";
type FlowState = "input" | "password" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LoginTab>("phone");
  const [target, setTarget] = useState(""); // phone or login
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [flow, setFlow] = useState<FlowState>("input");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Reset state when tab changes
  useEffect(() => {
    setFlow("input");
    setError(null);
    setMessage(null);
    setPassword("");
    setOtp("");
  }, [activeTab]);

  const getErrorMessage = (err: any) => {
    const lang = (typeof window !== "undefined" ? window.localStorage.getItem("lang") : "ru") || "ru";
    return err?.message?.[lang] || err?.message?.ru || "Ошибка";
  }

  const handleContinue = async () => {
    if (!target) return setError("Введите данные");
    setLoading(true);
    setError(null);
    try {
      // Отправляем platform: 'web', чтобы бэкенд знал, что нужно слать OTP
      const res: any = await apiClient.post("/auth/check-entrance", {
        login: target,
        platform: "web"
      });

      const { exists, type } = res.data;
      const lang = (typeof window !== "undefined" ? window.localStorage.getItem("lang") : "ru") || "ru";
      const welcomeMsg = res.message?.[lang] || res.message?.ru;

      if (type === "otp") {
        setFlow("otp");
        setMessage(welcomeMsg || "Мы отправили код подтверждения на ваш номер.");
      } else if (type === "password") {
        setFlow("password");
        setMessage(welcomeMsg || "Пользователь найден. Введите пароль для входа.");
      } else if (type === "pin") {
        // На вебе обычно пин не используем, но на всякий случай обработаем
        setFlow("password");
        setMessage(welcomeMsg || "Введите ваш код быстрого доступа.");
      } else {
        // Fallback
        setFlow(exists ? "password" : "otp");
        setMessage(welcomeMsg || (exists ? "Введите пароль" : "Введите код из SMS"));
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res: any;
      if (flow === "password" || activeTab === "classic") {
        res = await apiClient.post("/auth/login-json", {
          login: target,
          password: password
        });
      } else {
        res = await apiClient.post("/auth/otp/verify", {
          phone_number: target.includes("@") ? null : target,
          email: target.includes("@") ? target : null,
          otp_code: otp
        });
      }

      window.localStorage.setItem("token", res.data.access_token);

      const profile: any = await apiClient.get("/auth/me");
      const userRole = profile.data.role;

      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get("redirect") || "/";

      if (userRole === "admin") {
        router.push("/admin");
      } else {
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!target) return setError("Сначала введите телефон или email");
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/password/reset/request", { login: target });
      setFlow("otp");
      setMessage("Код сброса пароля отправлен.");
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 bg-slate-50/30">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium p-10 space-y-10">

          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-primary uppercase">Вход в систему</h1>
            <p className="text-slate-400 font-medium text-sm tracking-tight px-6">Выберите удобный способ идентификации</p>
          </div>

          {/* Adaptive Tabs */}
          <div className="flex p-1.5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
            <button
              onClick={() => setActiveTab("phone")}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest
                ${activeTab === "phone" ? "bg-white shadow-xl shadow-primary/5 text-primary" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Smartphone size={16} /> По номеру
            </button>
            <button
              onClick={() => { setActiveTab("classic"); setFlow("password"); }}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest
                ${activeTab === "classic" ? "bg-white shadow-xl shadow-primary/5 text-primary" : "text-slate-400 hover:text-slate-600"}`}
            >
              <User size={16} /> Логин и пароль
            </button>
          </div>

          <div className="space-y-8">
            {flow === "input" ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Контактные данные</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                      <Smartphone size={20} />
                    </div>
                    <input
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="77071234567"
                      className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] pl-14 pr-6 py-5 text-sm font-bold focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-primary placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-4 py-6"
                >
                  {loading ? "Проверка..." : (
                    <>Продолжить <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            ) : flow === "password" ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500">
                {message && <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 text-center">{message}</div>}

                <div className="space-y-6">
                  {activeTab === "classic" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Логин / Телефон</label>
                      <input
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 text-sm font-bold focus:outline-none focus:bg-white focus:border-primary/20 transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Пароль</label>
                      <button onClick={handleForgotPassword} className="text-[9px] font-black text-slate-300 hover:text-primary uppercase tracking-widest transition-colors">Забыли пароль?</button>
                    </div>
                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 text-sm font-bold focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-primary placeholder:text-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleFinalSubmit()}
                    disabled={loading}
                    className="btn-primary w-full py-6"
                  >
                    {loading ? "Входим..." : "Войти в аккаунт"}
                  </button>
                  <button onClick={() => setFlow("input")} className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-primary transition-colors text-center">Назад к выбору</button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500">
                <div className="text-center space-y-4">
                  <h3 className="text-sm font-black text-primary tracking-widest uppercase">Подтверждение кода</h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight px-10">
                    Мы отправили секретный код на <span className="text-primary">{target}</span>
                  </p>
                </div>

                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000 000"
                  maxLength={6}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-4 py-8 text-center text-4xl font-black tracking-[0.2em] focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all text-primary placeholder:text-slate-100"
                />

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleFinalSubmit()}
                    disabled={loading}
                    className="btn-primary w-full py-6"
                  >
                    {loading ? "Проверка..." : "Подтвердить вход"}
                  </button>
                  <button onClick={() => setFlow("input")} className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-primary transition-colors text-center flex items-center justify-center gap-2">
                    <ChevronLeft size={14} /> Изменить данные
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-5 bg-danger/5 rounded-[1.5rem] border border-danger/10 flex items-start gap-4 animate-in shake duration-500">
              <AlertCircle className="text-danger shrink-0 mt-0.5" size={18} />
              <p className="text-[10px] text-danger font-black tracking-tight uppercase leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
          AUTOPRO SECURITY PROTOCOL v1.0
        </p>
      </div>
    </div>
  );
}
