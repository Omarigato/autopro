"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAppState } from "@/lib/store";

export default function PrivacyPage() {
    const { t } = useTranslation();
    const { lang } = useAppState();

    return (
        <div className="container max-w-4xl py-16">
            <h1 className="text-4xl font-black mb-8">{t("privacy.title")}</h1>

            <div className="prose prose-slate max-w-none space-y-6">
                <p className="text-sm text-slate-500">
                    {t("privacy.last_update")}: {new Date().toLocaleDateString(lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US')}
                </p>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.intro_title")}</h2>
                    <p className="text-slate-600">
                        {t("privacy.intro_text")}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.info_title")}</h2>
                    <p className="text-slate-600 mb-2">{t("privacy.info_text")}</p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>{t("privacy.info_item1")}</li>
                        <li>{t("privacy.info_item2")}</li>
                        <li>{t("privacy.info_item3")}</li>
                        <li>{t("privacy.info_item4")}</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.usage_title")}</h2>
                    <p className="text-slate-600 mb-2">{t("privacy.usage_text")}</p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>{t("privacy.usage_item1")}</li>
                        <li>{t("privacy.usage_item2")}</li>
                        <li>{t("privacy.usage_item3")}</li>
                        <li>{t("privacy.usage_item4")}</li>
                        <li>{t("privacy.usage_item5")}</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.protection_title")}</h2>
                    <p className="text-slate-600">
                        {t("privacy.protection_text")}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.sharing_title")}</h2>
                    <p className="text-slate-600">
                        {t("privacy.sharing_text")}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.cookies_title")}</h2>
                    <p className="text-slate-600">
                        {t("privacy.cookies_text")}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.rights_title")}</h2>
                    <p className="text-slate-600 mb-2">{t("privacy.rights_text")}</p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>{t("privacy.rights_item1")}</li>
                        <li>{t("privacy.rights_item2")}</li>
                        <li>{t("privacy.rights_item3")}</li>
                        <li>{t("privacy.rights_item4")}</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t("privacy.changes_title")}</h2>
                    <p className="text-slate-600">
                        {t("privacy.changes_text")}
                    </p>
                </section>

                <section className="mt-12 p-6 bg-blue-50/50 rounded-2xl">
                    <p className="text-slate-600">
                        {t("privacy.contact_text")}:
                        <a href="mailto:privacy@autorentgo.kz" className="text-primary hover:underline ml-1">
                            privacy@autorentgo.kz
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}
