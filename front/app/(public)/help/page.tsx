"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function HelpPage() {
    const { t } = useTranslation();

    return (
        <div className="container max-w-4xl py-12 sm:py-16">
            <h1 className="text-3xl sm:text-4xl font-black mb-8 px-4 sm:px-0">{t("help.title")}</h1>

            <div className="space-y-8 px-4 sm:px-0">
                <section>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("help.faq_title")}</h2>

                    <div className="space-y-4">
                        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">{t("help.q1")}</h3>
                            <p className="text-slate-600">
                                {t("help.a1")}
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">{t("help.q2")}</h3>
                            <p className="text-slate-600">
                                {t("help.a2")}
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">{t("help.q3")}</h3>
                            <p className="text-slate-600">
                                {t("help.a3")}
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">{t("help.q4")}</h3>
                            <p className="text-slate-600">
                                {t("help.a4")}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <h2 className="text-2xl font-bold mb-4">{t("help.no_answer")}</h2>
                    <p className="text-slate-600 mb-4">
                        {t("help.support_text")}
                    </p>
                    <div className="space-y-2 text-slate-600 font-medium">
                        <p>📞 {t("help.phone")}: +7 (777) 123-45-67</p>
                        <p>📧 {t("help.email")}: support@autopro.kz</p>
                        <p>⏰ {t("help.work_time")}: {t("help.work_days")}</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
