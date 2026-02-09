from app.db.session import Base, engine


def init_db() -> None:
    """
    Простая инициализация БД: создаёт все таблицы по моделям.
    В реальном проекте рекомендуется использовать Alembic‑миграции.
    """

    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()

