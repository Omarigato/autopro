"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Upload, X } from "lucide-react";
import { getCachedDictionaries } from "@/lib/dictionaries";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const MAX_MESSAGE_LENGTH = 1000;

function FindContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [formData, setFormData] = useState<{
    city_id: number | null;
    category_id: number | null;
    vehicle_mark_id: number | null;
    vehicle_model_id: number | null;
    requested_at: string;
    message: string;
    images: File[];
  }>({
    city_id: null,
    category_id: null,
    vehicle_mark_id: null,
    vehicle_model_id: null,
    requested_at: "",
    message: "",
    images: [],
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const returnUrl = searchParams.get("returnUrl") || "/find";
      router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }
    loadDictionaries();
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    if (user && (user as any).city_id && cities.length > 0 && formData.city_id === null) {
      const match = cities.find((c: any) => c.id === (user as any).city_id);
      if (match) {
        setFormData((prev) => ({ ...prev, city_id: match.id }));
      } else {
        setFormData((prev) => ({ ...prev, city_id: cities[0]?.id ?? null }));
      }
    } else if (cities.length > 0 && formData.city_id === null) {
      setFormData((prev) => ({ ...prev, city_id: cities[0]?.id ?? null }));
    }
  }, [user, cities]);

  useEffect(() => {
    if (formData.vehicle_mark_id) {
      apiClient.get(`/dictionaries/model/${formData.vehicle_mark_id}`).then((res: any) => {
        const data = Array.isArray(res) ? res : res?.data || [];
        setModels(data);
      }).catch(() => setModels([]));
    } else {
      setModels([]);
    }
  }, [formData.vehicle_mark_id]);

  const loadDictionaries = async () => {
    setLoading(true);
    try {
      const [categoriesData, marksData, citiesData] = await Promise.all([
        getCachedDictionaries("CATEGORY"),
        getCachedDictionaries("MARKA"),
        getCachedDictionaries("CITY"),
      ]);
      setCategories(categoriesData || []);
      setMarks(marksData || []);
      setCities(citiesData || []);
      if (!formData.city_id && citiesData?.length) {
        const defaultCity = (user as any)?.city_id
          ? citiesData.find((c: any) => c.id === (user as any).city_id) || citiesData[0]
          : citiesData[0];
        setFormData((prev) => ({ ...prev, city_id: defaultCity?.id ?? null }));
      }
    } catch {
      toast.error("Ошибка загрузки справочников");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "vehicle_mark_id") {
      setFormData((prev) => ({ ...prev, vehicle_model_id: null }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city_id) {
      toast.error("Выберите город");
      return;
    }
    if (formData.message.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Сообщение не более ${MAX_MESSAGE_LENGTH} символов`);
      return;
    }

    const fd = new FormData();
    fd.append("city_id", String(formData.city_id));
    if (formData.category_id != null) fd.append("category_id", String(formData.category_id));
    if (formData.vehicle_mark_id != null) fd.append("vehicle_mark_id", String(formData.vehicle_mark_id));
    if (formData.vehicle_model_id != null) fd.append("vehicle_model_id", String(formData.vehicle_model_id));
    if (formData.requested_at) fd.append("requested_at", formData.requested_at);
    if (formData.message) fd.append("message", formData.message);
    formData.images.forEach((file) => fd.append("images", file));

    try {
      const res: any = await apiClient.post("/applications", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res?.data ?? res;
      const count = data?.matching_cars_count ?? data?.matching_cars?.length ?? 0;
      toast.success(`Заявка создана. Найдено объявлений: ${count}`);
      router.push("/profile/requests?tab=my");
    } catch (err: any) {
      const msg = err?.message?.ru ?? err?.message ?? "Ошибка при создании заявки";
      toast.error(msg);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-pulse rounded-xl bg-muted h-64 w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold mb-2">Найти авто</h1>
      <p className="text-muted-foreground mb-8">
        Заполните заявку — мы подберём подходящие объявления и отправим уведомление владельцам.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Город *</Label>
          <Select
            value={formData.city_id != null ? String(formData.city_id) : ""}
            onValueChange={(v) => handleChange("city_id", v ? Number(v) : null)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите город" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Категория</Label>
          <Select
            value={formData.category_id != null ? String(formData.category_id) : ""}
            onValueChange={(v) => handleChange("category_id", v ? Number(v) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Любая" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Марка</Label>
            <Select
              value={formData.vehicle_mark_id != null ? String(formData.vehicle_mark_id) : ""}
              onValueChange={(v) => handleChange("vehicle_mark_id", v ? Number(v) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Не выбрано" />
              </SelectTrigger>
              <SelectContent>
                {marks.map((m: any) => (
                  <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Модель</Label>
            <Select
              value={formData.vehicle_model_id != null ? String(formData.vehicle_model_id) : ""}
              onValueChange={(v) => handleChange("vehicle_model_id", v ? Number(v) : null)}
              disabled={!formData.vehicle_mark_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Не выбрано" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m: any) => (
                  <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Дата и время</Label>
          <Input
            type="datetime-local"
            value={formData.requested_at}
            onChange={(e) => handleChange("requested_at", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Сообщение ({formData.message.length}/{MAX_MESSAGE_LENGTH})</Label>
          <Textarea
            placeholder="Например: нужен на завтра на свадьбу с водителем"
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Фото (по желанию)</Label>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center justify-center h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            </label>
            {formData.images.map((file, i) => (
              <div key={i} className="relative h-24 w-24 rounded-lg border bg-muted overflow-hidden">
                <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground truncate px-1">
                  {file.name}
                </span>
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1"
                  onClick={() => removeImage(i)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Отправка…" : "Отправить заявку"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/profile/requests">Мои заявки</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function FindPage() {
  return (
    <Suspense fallback={<div className="container py-12 flex justify-center"><div className="animate-pulse rounded-xl bg-muted h-64 w-full max-w-md" /></div>}>
      <FindContent />
    </Suspense>
  );
}
