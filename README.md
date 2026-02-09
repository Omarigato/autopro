# AUTOPRO

Backend‑MVP для сервиса аренды автомобилей, спецтехники, водного транспорта,
оборудования и грузового транспорта.

## Запуск

1. Установить зависимости:

```bash
pip install -r requirements.txt
```

2. Создать `.env` по примеру `.env.example`.

3. Инициализировать БД (SQLite создаётся автоматически):

```bash
python -m app.init_db
```

4. Запустить сервер:

```bash
uvicorn app.main:app --reload
```

Основной API: `http://localhost:8000/api/v1`.
