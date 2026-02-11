import { useQuery } from "@tanstack/react-query";
import { getCachedDictionaries } from "@/lib/dictionaries";

export function useDictionaries() {
  return useQuery({
    queryKey: ['dictionaries'],
    queryFn: async () => {
      const [categories, cities] = await Promise.all([
        getCachedDictionaries('CATEGORY'),
        getCachedDictionaries('CITY'),
      ]);
      return { categories, cities };
    },
    staleTime: Infinity, // Dictionaries rarely change
  });
}

export function useFullDictionaries() {
   return useQuery({
    queryKey: ['full_dictionaries'],
    queryFn: async () => {
        const [categories, marks, transmissions, fuels, colors, cities] = await Promise.all([
            getCachedDictionaries("CATEGORY"),
            getCachedDictionaries("MARKA"),
            getCachedDictionaries("TRANSMISSION"),
            getCachedDictionaries("FUEL"),
            getCachedDictionaries("COLOR"),
            getCachedDictionaries("CITY")
        ]);
        return { categories, marks, transmissions, fuels, colors, cities };
    },
    staleTime: Infinity
   });
}
