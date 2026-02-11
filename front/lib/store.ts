import { create } from 'zustand';

interface AppState {
  lang: string;
  setLang: (lang: string) => void;
  initialize: () => void;
}

export const useAppState = create<AppState>((set) => ({
  lang: 'ru',
  setLang: (lang) => {
    localStorage.setItem('lang', lang);
    set({ lang });
  },
  initialize: () => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      set({ lang: savedLang });
    }
  },
}));
