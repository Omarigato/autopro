import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { CarResponse } from "@/types/cars";

export function useCars(filters?: Record<string, string>) {
  return useQuery<CarResponse[]>({
    queryKey: ['cars', filters],
    queryFn: async () => {
      const params = filters ? { ...filters } : {};
      const res = await apiClient.get('/cars', { params }) as any;
      const data = Array.isArray(res) ? res : (res?.data || []);
      return data;
    },
  });
}

export function useCar(id: number) {
  return useQuery<CarResponse | null>({
    queryKey: ['car', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await apiClient.get(`/cars/${id}`) as any;
        const data = res && res.id ? res : (res?.data ?? null);
        return data || null;
      } catch {
        return null;
      }
    },
    enabled: !!id,
  });
}
