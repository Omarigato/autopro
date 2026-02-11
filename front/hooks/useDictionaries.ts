import { useQuery } from "@tanstack/react-query";
import { getCachedDictionaries } from "@/lib/dictionaries";
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
    staleTime: Infinity,
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
        return { 
            categories: categories as DictionaryItem[],
            marks: marks as DictionaryItem[],
            transmissions: transmissions as DictionaryItem[],
            fuels: fuels as DictionaryItem[],
            colors: colors as DictionaryItem[],
            cities: cities as DictionaryItem[]
        };
    },
    staleTime: Infinity
   });
}
