import { apiClient } from "@/lib/api";

const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours
const CACHE_KEY_PREFIX = "dict_";

const memoryCache = new Map<string, { data: any[]; timestamp: number }>();
const pendingRequests = new Map<string, Promise<any[]>>();

export const getCachedDictionaries = async (
    type: string,
    parentId?: number
): Promise<any[]> => {
    let cacheKey = `${CACHE_KEY_PREFIX}${type}`;
    if (parentId) cacheKey += `_${parentId}`;

    const memMatch = memoryCache.get(cacheKey);
    if (memMatch && Date.now() - memMatch.timestamp < CACHE_DURATION) {
        return memMatch.data;
    }

    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION && Array.isArray(data) && data.length > 0) {
                    memoryCache.set(cacheKey, { data, timestamp });
                    return data;
                }
            } catch (e) {
                localStorage.removeItem(cacheKey);
            }
        }
    }

    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey)!;
    }

    const fetchPromise = (async () => {
        try {
            const params: any = { type };
            if (parentId) params.parent_id = parentId;

            const res: any = await apiClient.get("/dictionaries", { params });

            let data: any[] = [];
            if (Array.isArray(res)) data = res;
            else if (res && res.data && Array.isArray(res.data)) data = res.data;
            else if (res && typeof res === 'object') data = res.data || [];

            if (data.length > 0) {
                const payload = { data, timestamp: Date.now() };
                memoryCache.set(cacheKey, payload);
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem(cacheKey, JSON.stringify(payload));
                    } catch (e) {
                        console.warn("LocalStorage space limit reached for dictionaries");
                    }
                }
            }
            return data;
        } catch (e) {
            console.error(`Failed to fetch dictionary ${type}`, e);
            return [];
        } finally {
            pendingRequests.delete(cacheKey);
        }
    })();

    pendingRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
};
export const findDictionaries = async (
    params: {
        type?: string;
        parent_id?: number;
        q?: string;
        limit?: number;
        offset?: number;
    }
): Promise<any[]> => {
    try {
        const res: any = await apiClient.get("/dictionaries", { params });
        if (Array.isArray(res)) return res;
        if (res && res.data && Array.isArray(res.data)) return res.data;
        return res?.data || [];
    } catch (e) {
        console.error("Failed to find dictionaries", e);
        return [];
    }
};
