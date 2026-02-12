import json
import os
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.models.entities import Dictionary, DictionaryTranslation, SubscriptionPlan, PaymentAccount
from app.core.logger import logger

class DictionaryService:
    @staticmethod
    def upsert_item(db: Session, code: str, name: str, type: str, parent_id: int = None, translations: dict = None, icon: str = None, color: str = None):
        item = db.query(Dictionary).filter(
            Dictionary.code == str(code), 
            Dictionary.type == type,
            Dictionary.parent_id == parent_id
        ).first()
        
        if not item:
            item = Dictionary(code=str(code), name=name, type=type, parent_id=parent_id, icon=icon, color=color)
            db.add(item)
            db.flush()
        else:
            item.name = name
            if icon: item.icon = icon
            if color: item.color = color

        if translations:
            for lang, t_name in translations.items():
                trans = db.query(DictionaryTranslation).filter(
                    DictionaryTranslation.dictionary_id == item.id,
                    DictionaryTranslation.lang == lang
                ).first()
                if not trans:
                    db.add(DictionaryTranslation(dictionary_id=item.id, lang=lang, name=t_name))
                else:
                    trans.name = t_name
        return item

    async def sync_from_json(self, db: Session):
        """Оптимизированная синхронизация марок и моделей из cars.json"""
        path = os.path.join(os.path.dirname(__file__), "..", "core", "cars.json")
        if not os.path.exists(path):
            logger.error(f"Файл {path} не найден")
            return False

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # 1. Загружаем все существующие коды марок и моделей одним запросом для кеша
        existing_items = db.query(Dictionary.code, Dictionary.id, Dictionary.type).filter(
            Dictionary.type.in_(["MARKA", "MODEL"])
        ).all()
        
        # Кеш: {(type, code): id}
        cache = {(item.type, item.code): item.id for item in existing_items}
        
        logger.info(f"Начало быстрой синхронизации ({len(data)} марок)...")
        
        for mark_data in data:
            mark_code = str(mark_data["id"])
            mark_id = cache.get(("MARKA", mark_code))
            
            if not mark_id:
                mark = Dictionary(
                    code=mark_code, 
                    name=mark_data["name"], 
                    type="MARKA"
                )
                # Добавляем переводы через связь
                mark.translations = [
                    DictionaryTranslation(lang="ru", name=mark_data.get("cyrillic_name", mark_data["name"])),
                    DictionaryTranslation(lang="en", name=mark_data["name"])
                ]
                db.add(mark)
                db.flush()
                mark_id = mark.id
                cache[("MARKA", mark_code)] = mark_id

            # Обработка моделей
            for model_data in mark_data.get("models", []):
                model_code = str(model_data["id"])
                if ("MODEL", model_code) not in cache:
                    model = Dictionary(
                        code=model_code,
                        name=model_data["name"],
                        type="MODEL",
                        parent_id=mark_id
                    )
                    # Добавляем переводы через связь (id проставится автоматом при commit)
                    model.translations = [
                        DictionaryTranslation(lang="ru", name=model_data.get("cyrillic_name", model_data["name"])),
                        DictionaryTranslation(lang="en", name=model_data["name"])
                    ]
                    db.add(model)
                    cache[("MODEL", model_code)] = True

        db.commit()
        logger.info("Синхронизация завершена успешно.")
        return True

    async def sync_defaults(self, db: Session):
        """Синхронизация из defaults.json"""
        path = os.path.join(os.path.dirname(__file__), "..", "core", "defaults.json")
        if not os.path.exists(path): return False
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for cat in data.get("categories", []):
            self.upsert_item(
                db, cat["code"], cat["names"]["en"], "CATEGORY", 
                translations=cat["names"], 
                icon=cat.get("icon"), 
                color=cat.get("color")
            )
        for city in data.get("cities", []):
            self.upsert_item(db, city["code"], city["names"]["en"], "CITY", translations=city["names"])
        
        for trans in data.get("transmissions", []):
            self.upsert_item(db, trans["code"], trans["names"]["en"], "TRANSMISSION", translations=trans["names"])
            
        for fuel in data.get("fuel_types", []):
            self.upsert_item(db, fuel["code"], fuel["names"]["en"], "FUEL", translations=fuel["names"])
            
        for color in data.get("colors", []):
            self.upsert_item(db, color["code"], color["names"]["en"], "COLOR", translations=color["names"])
            
        for body in data.get("car_types", []):
            self.upsert_item(db, body["code"], body["names"]["en"], "BODY", translations=body["names"])

        # Планы и платежи
        for plan in data.get("subscription_plans", []):
            if not db.query(SubscriptionPlan).filter(SubscriptionPlan.code == plan["code"]).first():
                db.add(SubscriptionPlan(**plan))
        for acc in data.get("payment_accounts", []):
            if not db.query(PaymentAccount).filter(PaymentAccount.provider == acc["provider"]).first():
                db.add(PaymentAccount(**acc))
        
        db.commit()
        return True

dictionary_service = DictionaryService()
