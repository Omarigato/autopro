export default function TermsPage() {
    return (
        <div className="container max-w-4xl py-16">
            <h1 className="text-4xl font-black mb-8">Условия использования</h1>

            <div className="prose prose-slate max-w-none space-y-6">
                <p className="text-sm text-slate-500">
                    Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
                </p>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">1. Общие положения</h2>
                    <p className="text-slate-600">
                        Настоящие Условия использования регулируют отношения между пользователями
                        и нашей платформой. Используя наш сервис, вы соглашаетесь с данными условиями.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">2. Регистрация и учетная запись</h2>
                    <p className="text-slate-600">
                        Для размещения объявлений необходимо создать учетную запись.
                        Вы несете ответственность за сохранность своих учетных данных и все действия,
                        совершенные через вашу учетную запись.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">3. Размещение объявлений</h2>
                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                        <li>Объявления должны содержать достоверную информацию</li>
                        <li>Запрещено размещение дубликатов объявлений</li>
                        <li>Фотографии должны соответствовать описываемому автомобилю</li>
                        <li>Запрещено использование ненормативной лексики</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">4. Модерация</h2>
                    <p className="text-slate-600">
                        Все объявления проходят модерацию. Мы оставляем за собой право отклонить
                        или удалить объявления, не соответствующие нашим требованиям.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">5. Оплата и подписки</h2>
                    <p className="text-slate-600">
                        Для публикации объявлений требуется активная подписка.
                        Оплата производится через безопасные платежные системы.
                        Возврат средств возможен в соответствии с нашей политикой возврата.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">6. Ответственность</h2>
                    <p className="text-slate-600">
                        Мы не несем ответственности за сделки между пользователями.
                        Мы рекомендуем проявлять осторожность и проверять всю информацию перед совершением сделки.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mt-8 mb-4">7. Изменения условий</h2>
                    <p className="text-slate-600">
                        Мы оставляем за собой право изменять данные условия.
                        О существенных изменениях мы уведомим пользователей по электронной почте.
                    </p>
                </section>

                <section className="mt-12 p-6 bg-slate-50 rounded-2xl">
                    <p className="text-slate-600">
                        По вопросам, связанным с условиями использования, обращайтесь:
                        <a href="mailto:legal@autopro.kz" className="text-primary hover:underline ml-1">
                            legal@autopro.kz
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}
