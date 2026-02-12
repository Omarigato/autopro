import { create } from 'zustand';

interface AppState {
  lang: string;
  setLang: (lang: string) => void;
  city: string;
  setCity: (city: string) => void;
  initialize: () => void;
}

export const useAppState = create<AppState>((set) => ({
  lang: 'ru',
  city: 'Алматы',
  setLang: (lang) => {
    localStorage.setItem('lang', lang);
    set({ lang });
  },
  setCity: (city) => {
    localStorage.setItem('city', city);
    set({ city });
  },
  initialize: () => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      set({ lang: savedLang });
    }
    const savedCity = localStorage.getItem('city');
    if (savedCity) {
      set({ city: savedCity });
    }
  },
}));
