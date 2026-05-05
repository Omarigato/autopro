import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getCachedDictionaries, findDictionaries } from "@/lib/dictionaries";
import { DictionaryItem } from "@/types/dictionaries";

export function useDictionaries() {
  return useQuery({
    queryKey: ['dictionaries'],
    queryFn: async () => {
      const [categories, cities] = await Promise.all([
        getCachedDictionaries('CATEGORY'),
        getCachedDictionaries('CITY'),
      ]);
      return {
        categories: categories as DictionaryItem[],
        cities: cities as DictionaryItem[]
      };
    },
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}

export function useFullDictionaries() {
  return useQuery({
    queryKey: ['full_dictionaries'],
    queryFn: async () => {
      // Fetch everything except potentially huge ones like MARKA/MODEL if we want them separate
      // For now, let's keep it but with better caching
      const [categories, marks, transmissions, fuels, colors, cities, car_classes] = await Promise.all([
        getCachedDictionaries("CATEGORY"),
        getCachedDictionaries("MARKA"),
        getCachedDictionaries("TRANSMISSION"),
        getCachedDictionaries("FUEL"),
        getCachedDictionaries("COLOR"),
        getCachedDictionaries("CITY"),
        getCachedDictionaries("CAR_CLASS")
      ]);
      return {
        categories: categories as DictionaryItem[],
        marks: marks as DictionaryItem[],
        transmissions: transmissions as DictionaryItem[],
        fuels: fuels as DictionaryItem[],
        colors: colors as DictionaryItem[],
        cities: cities as DictionaryItem[],
        car_classes: car_classes as DictionaryItem[]
      };
    },
    staleTime: 1000 * 60 * 60 // 1 hour
  });
}

export function useInfiniteDictionaries(type: string, parentId?: number, q?: string) {
  return useInfiniteQuery({
    queryKey: ['dictionaries', type, parentId, q],
    queryFn: ({ pageParam = 0 }) => findDictionaries({
      type,
      parent_id: parentId,
      q,
      offset: pageParam,
      limit: 50
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 50 ? allPages.length * 50 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}
