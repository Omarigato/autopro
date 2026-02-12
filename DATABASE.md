# AutoPro - База данных через Docker

## Запуск базы данных PostgreSQL

### 1. Запустить только базу данных

```bash
docker-compose up db -d
```

### 2. Запустить базу данных и pgAdmin

```bash
docker-compose up db pgadmin -d
```

Доступ к pgAdmin: http://localhost:5050
- Email: admin@autopro.kz
- Password: admin

### 3. Запустить все сервисы (бэкенд, фронтенд, БД, nginx)

```bash
docker-compose up -d
```

## Настройки подключения к БД

### Локальная разработка (Docker)
```
Host: localhost
Port: 5432
Database: autopro
Username: autopro
Password: autopro123
```

### Connection String
```
postgresql://autopro:autopro123@localhost:5432/autopro
```

## Миграции базы данных

### Создать новую миграцию
```bash
cd back
alembic revision -m "migration_name"
```

### Применить миграции
```bash
cd back
alembic upgrade head
```

### Откатить миграцию
```bash
cd back
alembic downgrade -1
```

## Инициализация базы данных

Для первоначальной инициализации базы данных с тестовыми данными:

```bash
cd back
python -m app.init_db
```

## Остановка сервисов

### Остановить все сервисы
```bash
docker-compose down
```

### Остановить и удалить данные
```bash
docker-compose down -v
```

## Полезные команды

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Только база данных
docker-compose logs -f db

# Только бэкенд
docker-compose logs -f back
```

### Подключение к PostgreSQL через CLI
```bash
docker exec -it autopro_db psql -U autopro -d autopro
```

### Backup базы данных
```bash
docker exec autopro_db pg_dump -U autopro autopro > backup.sql
```

### Restore базы данных
```bash
cat backup.sql | docker exec -i autopro_db psql -U autopro autopro
```

## Структура проекта

```
autopro/
├── back/               # FastAPI backend
├── front/              # Next.js frontend
├── nginx/              # Nginx config
├── docker-compose.yml  # Docker services
└── .env               # Environment variables
```

## Troubleshooting

### База данных не запускается
1. Проверьте, что порт 5432 свободен: `netstat -ano | findstr :5432`
2. Остановите локальный PostgreSQL если он запущен
3. Проверьте логи: `docker-compose logs db`

### Не удается подключиться к БД
1. Убедитесь, что контейнер запущен: `docker ps`
2. Проверьте health check: `docker inspect autopro_db`
3. Проверьте переменные окружения в `.env`

### Ошибки миграций
1. Проверьте версию alembic: `alembic current`
2. Сбросьте миграции: `alembic downgrade base`
3. Примените заново: `alembic upgrade head`
