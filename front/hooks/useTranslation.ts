import { useAppState } from '@/lib/store';
import kk from '@/locales/kk.json';
import ru from '@/locales/ru.json';
import en from '@/locales/en.json';

const translations: any = { kk, ru, en };

export function useTranslation() {
    const { lang } = useAppState();
    const currentLang = translations[lang] || translations['kk'];

    const t = (path: string, vars?: Record<string, any>) => {
        const keys = path.split('.');
        let result = currentLang;
        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                return path;
            }
        }

        if (typeof result === 'string' && vars) {
            Object.keys(vars).forEach(v => {
                result = result.replace(`{${v}}`, String(vars[v]));
            });
        }

        return result;
    };

    /**
     * Helper to format backend messages that come in as objects: { ru, kk, en }
     */
    const formatMessage = (msg: any) => {
        if (!msg) return "";
        if (typeof msg === "string") return msg;
        if (typeof msg === "object") {
            return msg[lang] || msg['kk'] || msg['ru'] || msg['en'] || Object.values(msg)[0] || "";
        }
        return String(msg);
    };

    return { t, lang, formatMessage };
}
