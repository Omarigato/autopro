import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { UserResponse, OwnerLoginRequest, LoginResponse } from "@/types/auth"; 


export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery<UserResponse | null>({
    queryKey: ['user'],
    queryFn: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return null;
        try {
            return await apiClient.get('/auth/me') as UserResponse;
        } catch (e) {
            localStorage.removeItem('token');
            return null;
        }
    },
    retry: false,
    staleTime: Infinity, 
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: OwnerLoginRequest) => {
      const res = await apiClient.post('/auth/login', credentials) as any;
      return res as LoginResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success("Вы успешно вошли в систему"); 
    },
    onError: (error: any) => {
      throw error;
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
       return true;
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      queryClient.setQueryData(['user'], null);
      queryClient.clear(); 
      // toast.info("Вы вышли из системы");
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
