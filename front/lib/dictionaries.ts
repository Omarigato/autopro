import { apiClient } from "./api";

let dictionaryCache: Record<string, any> = {};

export async function getCachedDictionaries(type: string, parentId?: string | number) {
    const cacheKey = parentId ? `${type}_${parentId}` : type;

    if (dictionaryCache[cacheKey]) {
        return dictionaryCache[cacheKey];
    }

    const endpoint = parentId
        ? `/dictionaries?type=${type}&parent_id=${parentId}`
        : `/dictionaries?type=${type}`;

    try {
        const res: any = await apiClient.get(endpoint);
        dictionaryCache[cacheKey] = res || [];
        return dictionaryCache[cacheKey];
    } catch (e) {
        console.error(`Failed to fetch dict ${type}`, e);
        return [];
    }
}

export function clearDictionaryCache() {
    dictionaryCache = {};
}
