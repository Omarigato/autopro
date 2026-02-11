import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface Car {
  id: number;
  name: string;
  description: string;
  price: number;
  images: { id: number; url: string }[];
  city?: string;
  release_year?: number;
  transmission?: string;
  category_id?: number;
  author?: {
    address?: string;
  }
}

export function useCars(filters?: Record<string, string>) {
  return useQuery<Car[]>({
    queryKey: ['cars', filters],
    queryFn: async () => {
      // In a real app, passing filters as query params
      // const params = new URLSearchParams(filters).toString();
      const res = await apiClient.get('/cars') as any;
      return res || [];
    },
  });
}

export function useCar(id: number) {
  return useQuery<Car>({
    queryKey: ['car', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.get(`/cars/${id}`) as any;
      return res?.data || res; // depending on API structure
    },
    enabled: !!id,
  });
}
