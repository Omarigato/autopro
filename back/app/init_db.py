import sys
import asyncio
from app.db.session import Base, engine, SessionLocal
from app import models
from app.core.security import get_password_hash
from app.services.dictionary_service import dictionary_service
from app.models import AppSetting, Dictionary, User

def init_db(recreate: bool = False) -> None:
    if recreate:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
    
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Администратор
        admin = db.query(models.User).filter(models.User.role == "admin").first()
        if not admin:
            print("Creating admin...")
            admin = models.User(
                name="Admin System",
                phone_number="+7 (777) 777-77-77",
                email="admin@autorentgo.kz",
                password_hash=get_password_hash("adminautorentgo2026@@!"),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()

        # 2. Настройки приложения
        if not db.query(AppSetting).filter(AppSetting.key == "subscriptions_enabled").first():
            db.add(AppSetting(key="subscriptions_enabled", value="true"))
            db.commit()

        # 3. Синхронизация (defaults)
        print("Syncing defaults...")
        asyncio.run(dictionary_service.sync_defaults(db))
        
        # 4. Синхронизация (cars)
        if "--sync-cars" in sys.argv:
            print("Syncing marks/models (this may take 1-2 mins)...")
            asyncio.run(dictionary_service.sync_from_json(db))
            
    finally:
        db.close()
    print("Done.")

if __name__ == "__main__":
    recreate_flag = "--recreate" in sys.argv
    init_db(recreate_flag)

