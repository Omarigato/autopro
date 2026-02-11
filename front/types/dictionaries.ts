export interface DictionaryItem {
  id: number;
  name: string;
  code?: string;
  parent_id?: number;
  icon?: string;
  color?: string;
  translations?: any[];
}

export type DictionaryType = "CATEGORY" | "CITY" | "MARKA" | "MODEL" | "TRANSMISSION" | "FUEL" | "COLOR";
