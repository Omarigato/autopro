import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { CarResponse } from "@/types/cars";

export function useCars(filters?: Record<string, string>) {
  return useQuery<CarResponse[]>({
    queryKey: ['cars', filters],
    queryFn: async () => {
      const params = filters ? { ...filters } : {};
      const res = await apiClient.get('/cars', { params }) as any;
      if (Array.isArray(res)) return res;
      return res?.data || [];
    },
  });
}

export function useCar(id: number) {
  return useQuery<CarResponse>({
    queryKey: ['car', id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const res = await apiClient.get(`/cars/${id}`) as any;
      if (res && res.id) return res;
      return res?.data || null;
    },
    enabled: !!id,
  });
}
