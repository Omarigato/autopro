import { apiClient } from "@/lib/api";

const CACHE_DURATION = 1000 * 60 * 60; // 1 час
const CACHE_KEY_PREFIX = "dict_";

export const getCachedDictionaries = async (
  type: string,
  parentId?: number
) => {
    // Only run on client
    if (typeof window === 'undefined') return [];

    let cacheKey = `${CACHE_KEY_PREFIX}${type}`;
    if (parentId) cacheKey += `_${parentId}`;

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    try {
        const params: any = { type };
        if (parentId) params.parent_id = parentId;
        
        // Ensure endpoint is correct based on backend. Usually /dictionaries?type=...
        const res: any = await apiClient.get("/dictionaries", { params });
        const data = res?.data || res || [];

        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        return data;
    } catch (e) {
        console.error(`Failed to fetch dictionary ${type}`, e);
        return [];
    }
};
