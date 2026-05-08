import sys
import asyncio
from app.db.session import Base, engine, SessionLocal
from app import models
from app.core.security import get_password_hash
from app.services.dictionary_service import dictionary_service
from app.models import AppSetting, Dictionary, User

from app.core.config import settings

def init_db(recreate: bool = False) -> None:
    if recreate:
        if settings.ENVIRONMENT == "production":
            raise ValueError("Dropping tables is strictly forbidden in production!")
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
                email="admin@autopro.kz",
                password_hash=get_password_hash("adminautopro2026@@!"),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()

        # 2. Настройки приложения
        if not db.query(AppSetting).filter(AppSetting.key == "subscriptions_enabled").first():
            db.add(AppSetting(key="subscriptions_enabled", value="true"))
            db.commit()

        # 3. Тестовые тарифы
        plans_data = [
            {"code": "TEST_100", "name": "Тариф 100 ₸", "price_kzt": 100, "period_days": 30, "free_days": 0, "is_active": True},
            {"code": "TEST_150", "name": "Тариф 150 ₸", "price_kzt": 150, "period_days": 30, "free_days": 0, "is_active": True},
            {"code": "TEST_200", "name": "Тариф 200 ₸", "price_kzt": 200, "period_days": 30, "free_days": 0, "is_active": True},
        ]
        for p_data in plans_data:
            existing_plan = db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.code == p_data["code"]).first()
            if existing_plan:
                existing_plan.price_kzt = p_data["price_kzt"]
                existing_plan.name = p_data["name"]
                existing_plan.period_days = p_data["period_days"]
                existing_plan.free_days = p_data["free_days"]
                existing_plan.is_active = p_data["is_active"]
            else:
                new_plan = models.SubscriptionPlan(**p_data)
                db.add(new_plan)
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

