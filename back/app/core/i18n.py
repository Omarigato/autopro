MESSAGES = {
    "ru": {
        "success": "Успешно",
        "client_application_sent": "Заявка успешно отправлена владельцу",
        "car_not_found": "Автомобиль не найден",
        "not_authorized": "Нет прав для этого действия",
        "car_deleted": "Автомобиль и фотографии удалены",
        "auth_failed": "Неверный логин или пароль",
        "user_exists": "Пользователь с таким логином уже существует",
        "car_limit_reached": "Лимит автомобилей исчерпан для вашей подписки",
        "no_subscription": "У вас нет активной подписки",
        "otp_sent": "Код подтверждения отправлен",
        "invalid_otp": "Неверный код",
        "otp_expired": "Срок действия кода истек",
        "login_success": "Вы успешно вошли",
    },
    "kk": {
        "success": "Сәтті",
        "client_application_sent": "Өтінім иесіне сәтті жіберілді",
        "car_not_found": "Автокөлік табылмады",
        "not_authorized": "Бұл әрекетке құқығыңыз жоқ",
        "car_deleted": "Автокөлік пен фотосуреттер жойылды",
        "auth_failed": "Логин немесе пароль қате",
        "user_exists": "Мұндай логині бар пайдаланушы бұрыннан бар",
        "car_limit_reached": "Сіздің жазылымыңыз үшін автокөлік лимиті таусылды",
        "no_subscription": "Сізде белсенді жазылым жоқ",
        "otp_sent": "Растау коды жіберілді",
        "invalid_otp": "Қате код",
        "otp_expired": "Кодтың жарамдылық мерзімі өтті",
        "login_success": "Сәтті кірдіңіз",
    },
    "en": {
        "success": "Success",
        "client_application_sent": "Application successfully sent to owner",
        "car_not_found": "Car not found",
        "not_authorized": "Not authorized for this action",
        "car_deleted": "Car and images deleted",
        "auth_failed": "Incorrect login or password",
        "user_exists": "User with this login already exists",
        "car_limit_reached": "Car limit reached for your subscription",
        "no_subscription": "No active subscription",
        "otp_sent": "Security code sent",
        "invalid_otp": "Invalid security code",
        "otp_expired": "Code expired",
        "login_success": "Login successful",
    }
}

def get_message(key: str, lang: str = "ru") -> str:
    lang_messages = MESSAGES.get(lang, MESSAGES["ru"])
    return lang_messages.get(key, MESSAGES["ru"].get(key, key))
