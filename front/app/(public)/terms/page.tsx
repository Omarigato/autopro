"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppState } from "@/lib/store";

export default function TermsPage() {
    const { t } = useTranslation();
    const { lang } = useAppState();

    return (
        <div className="container max-w-4xl py-16">
            <h1 className="text-4xl font-black mb-8">{t("terms.title")}</h1>

            <div className="prose prose-slate max-w-none space-y-6">
                <p className="text-sm text-slate-500">
                    {t("terms.last_update")}: {new Date().toLocaleDateString(lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US')}
                </p>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.general_title")}</h2>
                    <p className="text-slate-600">
                        {t("terms.general_text")}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.registration_title")}</h2>
                    <p className="text-slate-600">
                        {t("terms.registration_text")}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.ads_title")}</h2>
                    <p className="text-slate-600">
                        {t("terms.ads_text")}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.payments_title")}</h2>
                    <p className="text-slate-600">
                        {t("terms.payments_text")}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.liability_title")}</h2>
                    <p className="text-slate-600">
                        {t("terms.liability_text")}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("terms.termination_title")}</h2>
                    <p className="text-slate-600">
                        {t("terms.termination_text")}
                    </p>
                </section>

                <section className="mt-12 p-6 bg-slate-50 rounded-2xl">
                    <p className="text-slate-600">
                        {t("terms.contact_text") || "По вопросам использования обращайтесь"}:
                        <a href="mailto:legal@autorentgo.kz" className="text-primary hover:underline ml-1">
                            legal@autorentgo.kz
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}
