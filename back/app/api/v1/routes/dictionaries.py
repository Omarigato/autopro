from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import Dictionary, DictionaryTranslation
from app.core.responses import create_response

router = APIRouter()

@router.get("/marka")
def get_markas(request: Request, db: Session = Depends(get_db)):
    """
    Получение списка марок машин на языке пользователя.
    """
    lang = request.state.lang
    markas = db.query(Dictionary).filter(Dictionary.type == "MARKA", Dictionary.is_active == True).all()
    
    result = []
    for m in markas:
        # Find translation
        trans = next((t for t in m.translations if t.lang == lang), None)
        name = trans.name if trans else m.name
        result.append({"id": m.id, "name": name, "code": m.code})
        
    return create_response(data=result, lang=lang)

@router.get("/model/{marka_id}")
def get_models(marka_id: int, request: Request, db: Session = Depends(get_db)):
    """
    Получение списка моделей для конкретной марки.
    """
    lang = request.state.lang
    models = db.query(Dictionary).filter(
        Dictionary.type == "MODEL", 
        Dictionary.parent_id == marka_id,
        Dictionary.is_active == True
    ).all()
    
    result = []
    for m in models:
        trans = next((t for t in m.translations if t.lang == lang), None)
        name = trans.name if trans else m.name
        result.append({"id": m.id, "name": name, "code": m.code})
        
    return create_response(data=result, lang=lang)
