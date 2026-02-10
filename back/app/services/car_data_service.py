import httpx
from sqlalchemy.orm import Session
from app.models.entities import Dictionary, DictionaryTranslation

def upsert_dictionary_item(
    db: Session,
    code: str,
    name: str,
    type: str,
    parent_id: int = None,
    translations: dict = None
):
    item = db.query(Dictionary).filter(
        Dictionary.code == str(code), 
        Dictionary.type == type,
        Dictionary.parent_id == parent_id
    ).first()
    
    if item:
        item.name = name
    else:
        item = Dictionary(
            code=str(code),
            name=name,
            type=type,
            parent_id=parent_id
        )
        db.add(item)
    
    db.flush()
    
    if translations:
        for lang, t_name in translations.items():
            trans = db.query(DictionaryTranslation).filter(
                DictionaryTranslation.dictionary_id == item.id,
                DictionaryTranslation.lang == lang
            ).first()
            
            if trans:
                trans.name = t_name
            else:
                trans = DictionaryTranslation(
                    dictionary_id=item.id,
                    lang=lang,
                    name=t_name
                )
                db.add(trans)
    
    return item

async def sync_all_makes(db: Session):
    """
    Sync all car makes from NHTSA VPIC API
    """
    url = "https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        
    makes = data.get("Results", [])
    for m in makes[:300]: # Limit to top 300 for speed initially
        upsert_dictionary_item(
            db, 
            m["Make_ID"], 
            m["Make_Name"], 
            "MARKA",
            translations={"ru": m["Make_Name"], "kk": m["Make_Name"], "en": m["Make_Name"]}
        )
    db.commit()
    return len(makes)

async def sync_models_for_make(db: Session, make_name: str, make_id: int):
    """
    Sync models for a specific make
    """
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/{make_name}?format=json"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        
    models = data.get("Results", [])
    for m in models:
        upsert_dictionary_item(
            db, 
            m["Model_ID"], 
            m["Model_Name"], 
            "MODEL",
            parent_id=make_id,
            translations={"ru": m["Model_Name"], "kk": m["Model_Name"], "en": m["Model_Name"]}
        )
    db.commit()
    return len(models)
