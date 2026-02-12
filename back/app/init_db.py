import sys
import asyncio
from app.db.session import Base, engine, SessionLocal
from app.models import entities
from app.core.security import get_password_hash
from app.services.dictionary_service import dictionary_service

def init_db(recreate: bool = False) -> None:
    if recreate:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
    
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Администратор
        admin = db.query(entities.User).filter(entities.User.role == "admin").first()
        if not admin:
            print("Creating admin...")
            admin = entities.User(
                first_name="Admin", last_name="System",
                name="Admin System", login="admin", phone_number="777",
                password_hash=get_password_hash("admin123"),
                role="admin", is_active=True
            )
            db.add(admin)
            db.commit()

        # 2. Синхронизация (defaults)
        print("Syncing defaults...")
        asyncio.run(dictionary_service.sync_defaults(db))
        
        # 3. Синхронизация (cars)
        # if "--sync-cars" in sys.argv:
        print("Syncing marks/models (this may take 1-2 mins)...")
        asyncio.run(dictionary_service.sync_from_json(db))
            
    finally:
        db.close()
    print("Done.")

if __name__ == "__main__":
    recreate_flag = "--recreate" in sys.argv
    init_db(recreate_flag)

