"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2); // In real app, first call backend to send SMS
    // For now, mockup the flow
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // In real app, call backend to verify code and register
      await apiClient.post("/auth/register-owner", {
        name,
        phone_number: phone,
        login: phone, // Using phone as login for simplicity
        password
      });
      router.push("/login");
    } catch (err) {
      setError("Не удалось зарегистрироваться. Проверьте данные.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center max-w-md mx-auto px-6">
        <button onClick={() => setStep(1)} className="absolute top-6 left-6 p-2 rounded-full border border-gray-100 bg-white shadow-sm">
          <ChevronLeft size={20} />
        </button>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2">
            Подтвердите свой <br />номер <span className="text-primary">телефона</span>
          </h1>
          <p className="text-gray-500 text-sm">Код отправлен на номер {phone || "+ 7 777 333 55 44"}</p>
        </div>

        <div className="flex justify-between gap-4 mb-8">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`code-${idx}`}
              type="number"
              value={digit}
              onChange={(e) => handleCodeChange(idx, e.target.value)}
              className="w-full aspect-square border-gray-200 border rounded-xl text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          ))}
        </div>

        <div className="text-center mb-10">
          <p className="text-gray-400 text-sm mb-4">
            00:{timer < 10 ? `0${timer}` : timer}
          </p>
          <button
            disabled={timer > 0}
            className={`text-sm font-bold underline ${timer > 0 ? "text-gray-300" : "text-gray-900"}`}
            onClick={() => setTimer(20)}
          >
            Не пришел номер? Отправить еще
          </button>
        </div>

        <button
          onClick={handleConfirmSubmit}
          disabled={loading || code.some(d => !d)}
          className="w-full py-4 rounded-xl bg-primary text-white text-base font-bold hover:bg-accent disabled:opacity-60 shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]"
        >
          {loading ? "Загрузка..." : "Продолжить"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-md mx-auto px-6">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">
          Добро пожаловать <br />в <span className="text-primary">AUTOPRO</span>
        </h1>
        <p className="text-gray-500 text-sm">Зарегистрируйтесь чтобы продолжить</p>
      </div>

      <form onSubmit={handleRegisterSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Ваше имя</label>
          <input
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            placeholder="Укажите свое имя"
            className="w-full border-gray-200 border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Ваш телефон</label>
          <input
            value={phone}
            required
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
              required
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
          className="w-full py-4 rounded-xl bg-primary text-white text-base font-bold hover:bg-accent shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]"
        >
          Продолжить
        </button>
      </form>

      <div className="mt-auto pt-10 pb-6 text-center text-sm">
        <span className="text-gray-500">Уже есть аккаунт? </span>
        <Link href="/login" className="font-bold text-gray-900 hover:text-primary transition-colors underline">
          Войти
        </Link>
      </div>
    </div>
  );
}
