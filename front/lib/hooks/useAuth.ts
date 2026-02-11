import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: number;
  email: string;
  role: string;
  name?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No token");
        return await apiClient.get('/auth/me') as any; // Cast because apiClient returns data directly
    },
    retry: false,
    staleTime: Infinity, // User data rarely changes automatically
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await apiClient.post('/auth/login', credentials) as any;
      return res as LoginResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success("Вы успешно вошли в систему");
    },
    onError: (error: any) => {
      toast.error(error.detail || "Ошибка входа");
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
       // Optional: call logout endpoint if exists
       return true;
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      queryClient.setQueryData(['user'], null);
      toast.info("Вы вышли из системы");
      // window.location.reload(); // Optional
    }
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    isLoginPending: loginMutation.isPending
  };
}
