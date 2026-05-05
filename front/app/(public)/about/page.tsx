"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function AboutPage() {
    const { t } = useTranslation();

    return (
        <div className="container max-w-4xl py-16">
            <h1 className="text-4xl font-black mb-8">{t("about.title")}</h1>

            <div className="prose prose-slate max-w-none space-y-6">
                <p className="text-lg text-slate-600">
                    {t("about.description")}
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">{t("about.mission_title")}</h2>
                <p className="text-slate-600">
                    {t("about.mission_desc")}
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">{t("about.why_us_title")}</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>{t("about.why_1")}</li>
                    <li>{t("about.why_2")}</li>
                    <li>{t("about.why_3")}</li>
                    <li>{t("about.why_4")}</li>
                    <li>{t("about.why_5")}</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">{t("about.contacts_title")}</h2>
                <p className="text-slate-600">
                    {t("about.contacts_desc")}
                </p>
                <ul className="list-none space-y-2 text-slate-600">
                    <li>📞 {t("about.phone")}: +7 (777) 123-45-67</li>
                    <li>📧 {t("about.email")}: support@autorentgo.kz</li>
                    <li>📍 {t("about.address")}: {t("about.address_val")}</li>
                </ul>
            </div>
        </div>
    );
}
