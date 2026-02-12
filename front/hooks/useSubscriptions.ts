"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { SubscriptionPlan } from "@/types/subscriptions";

export function useSubscriptionPlans() {
    return useQuery<SubscriptionPlan[]>({
        queryKey: ['subscription-plans'],
        queryFn: async () => {
            const res = await apiClient.get('/subscriptions/plans') as any;
            return Array.isArray(res) ? res : (res?.data || []);
        },
    });
}
