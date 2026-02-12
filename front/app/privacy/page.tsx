export default function PrivacyPage() {
    return (
        <div className="container max-w-4xl py-16">
            <h1 className="text-4xl font-black mb-8">Политика конфиденциальности</h1>

            <div className="prose prose-slate max-w-none space-y-6">
                <p className="text-sm text-slate-500">
                    Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
                </p>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">1. Введение</h2>
                    <p className="text-slate-600">
                        Мы в AutoPro серьезно относимся к защите ваших персональных данных.
                        Данная Политика конфиденциальности описывает, какую информацию мы собираем,
                        как мы ее используем и защищаем.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">2. Собираемая информация</h2>
                    <p className="text-slate-600 mb-2">Мы собираем следующую информацию:</p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>Имя и контактные данные (телефон, email)</li>
                        <li>Информацию об автомобилях, которые вы размещаете</li>
                        <li>Данные о платежах и подписках</li>
                        <li>Техническую информацию (IP-адрес, тип браузера, cookies)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">3. Использование информации</h2>
                    <p className="text-slate-600 mb-2">Мы используем вашу информацию для:</p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>Предоставления наших услуг</li>
                        <li>Обработки платежей</li>
                        <li>Отправки уведомлений и важной информации</li>
                        <li>Улучшения качества сервиса</li>
                        <li>Предотвращения мошенничества</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">4. Защита данных</h2>
                    <p className="text-slate-600">
                        Мы применяем современные технологии шифрования и безопасности для защиты ваших данных.
                        Доступ к персональной информации имеют только авторизованные сотрудники.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">5. Передача данных третьим лицам</h2>
                    <p className="text-slate-600">
                        Мы не продаем ваши персональные данные. Мы можем передавать информацию
                        только нашим доверенным партнерам (платежные системы, облачные сервисы)
                        для обеспечения работы платформы.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">6. Cookies</h2>
                    <p className="text-slate-600">
                        Мы используем cookies для улучшения пользовательского опыта.
                        Вы можете отключить cookies в настройках браузера, но это может повлиять
                        на функциональность сайта.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">7. Ваши права</h2>
                    <p className="text-slate-600 mb-2">Вы имеете право:</p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>Запросить копию ваших данных</li>
                        <li>Исправить неточные данные</li>
                        <li>Удалить вашу учетную запись и данные</li>
                        <li>Отозвать согласие на обработку данных</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">8. Изменения в политике</h2>
                    <p className="text-slate-600">
                        Мы можем обновлять данную политику. О существенных изменениях мы уведомим
                        вас по электронной почте.
                    </p>
                </section>

                <section className="mt-12 p-6 bg-slate-50 rounded-2xl">
                    <p className="text-slate-600">
                        По вопросам конфиденциальности обращайтесь:
                        <a href="mailto:privacy@autopro.kz" className="text-primary hover:underline ml-1">
                            privacy@autopro.kz
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}
