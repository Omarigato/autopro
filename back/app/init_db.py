from app.db.session import Base, engine, SessionLocal
from app.models import entities  # noqa: F401
from app.core.security import get_password_hash


def init_db() -> None:
    """
    Простая инициализация БД: создаёт все таблицы по моделям.
    Создаёт дефолтного админа, если его нет.
    """
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        admin = db.query(entities.User).filter(entities.User.role == "admin").first()
        if not admin:
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
        else:
            print("Admin user already exists.")
    finally:
        db.close()
        
    print("Database initialized.")


if __name__ == "__main__":
    init_db()

