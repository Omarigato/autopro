import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { CarResponse } from "@/types/cars";

export function useCars(filters?: Record<string, any>) {
  return useQuery<{ items: CarResponse[], total: number }>({
    queryKey: ['cars', filters],
    queryFn: async () => {
      const params = filters ? { ...filters } : {};
      const res = await apiClient.get('/cars', { params }) as any;
      if (res && Array.isArray(res.items)) {
        return res;
      }
      const data = Array.isArray(res) ? res : (res?.data || []);
      const items = Array.isArray(data) ? data : (data.items || []);
      const total = data.total ?? items.length;
      return { items, total };
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
