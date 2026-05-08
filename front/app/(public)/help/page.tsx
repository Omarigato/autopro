export default function HelpPage() {
    return (
        <div className="container max-w-4xl py-16">
            <h1 className="text-4xl font-black mb-8">Помощь</h1>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-bold mb-4">Часто задаваемые вопросы</h2>

                    <div className="space-y-4">
                        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">Как разместить объявление?</h3>
                            <p className="text-slate-600">
                                Для размещения объявления необходимо зарегистрироваться на сайте,
                                затем перейти в раздел "Сдать авто" и заполнить форму с информацией о вашем автомобиле.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">Нужна ли подписка для публикации объявлений?</h3>
                            <p className="text-slate-600">
                                Да, для публикации объявлений требуется активная подписка.
                                Мы предлагаем различные тарифные планы в зависимости от ваших потребностей.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">Как связаться с продавцом?</h3>
                            <p className="text-slate-600">
                                В каждом объявлении указаны контактные данные продавца.
                                Вы можете связаться с ним по телефону или через форму обратной связи.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">Как долго модерируется объявление?</h3>
                            <p className="text-slate-600">
                                Обычно модерация занимает от 1 до 24 часов.
                                После одобрения вы получите уведомление на email.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <h2 className="text-2xl font-bold mb-4">Не нашли ответ?</h2>
                    <p className="text-slate-600 mb-4">
                        Свяжитесь с нашей службой поддержки, и мы обязательно вам поможем!
                    </p>
                    <div className="space-y-2 text-slate-600">
                        <p>📞 Телефон: +7 (777) 123-45-67</p>
                        <p>📧 Email: support@autopro.kz</p>
                        <p>⏰ Время работы: Пн-Пт 9:00-18:00</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
