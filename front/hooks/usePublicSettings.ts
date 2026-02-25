import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export const PUBLIC_SETTINGS_QUERY_KEY = ["public-settings"];

export function usePublicSettings() {
  const { data, isLoading } = useQuery({
    queryKey: PUBLIC_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const r = await apiClient.get("/settings") as { subscriptions_enabled?: boolean } | undefined;
      const val = (r as any)?.subscriptions_enabled;
      return { subscriptions_enabled: val !== false && val !== "false" };
    },
    staleTime: 60 * 1000,
  });
  return {
    subscriptionsEnabled: data?.subscriptions_enabled ?? true,
    isLoading,
  };
}
