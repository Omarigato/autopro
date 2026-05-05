# AutoPro

Полноценный сервис аренды автомобилей, спецтехники и оборудования. Включает в себя веб-фронтенд (Next.js), мощный API-бэкенд (FastAPI), а также микросервис WhatsApp Gateway для отправки сервисных уведомлений.

## Продакшен-домены
- Frontend: `https://autopro.kz`
- Backend Swagger: `https://api.autopro.kz/docs`
- WhatsApp Gateway: `https://gateway.autopro.kz`

## Запуск через Docker Compose (Локально)

Запуск всего проекта (БД, Backend, Frontend, WhatsApp Gateway):

```bash
docker-compose up --build -d
```

После запуска:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/v1`
- Swagger документация: `http://localhost:8000/docs`
- WhatsApp Gateway: `http://localhost:3001` (откройте `/` для авторизации и сканирования QR-кода)

## Инициализация БД
База данных создается автоматически, но для загрузки справочников марок, моделей и тестовых тарифов выполните:

```bash
docker-compose exec back python -m app.init_db
```

## Конфигурация (.env)
Скопируйте `.env.example` в `.env` и укажите необходимые токены:
- Cloudinary (для хранения картинок)
- Kassa24 (для онлайн-оплат)
- WhatsApp Gateway Token (для защиты отправки сообщений)
- JWT ключи (для авторизации)
