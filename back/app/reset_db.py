from app.db.session import Base, engine, SessionLocal
from app.models import entities  # noqa: F401
from app.core.security import get_password_hash


def reset_db() -> None:
    """
    ВАЖНО: Это удалит ВСЕ данные и пересоздаст таблицы.
    Используется для синхронизации схемы БД на этапе разработки.
    """
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Creating default admin user...")
        admin = entities.User(
            name="Admin",
            login="admin",
            phone_number="777",
            password_hash=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Default admin created (login: admin, pass: admin123)")
    finally:
        db.close()
        
    print("Database reset successfully.")


if __name__ == "__main__":
    reset_db()
