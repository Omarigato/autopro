from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import Dictionary, DictionaryTranslation
from app.core.responses import create_response

router = APIRouter()

@router.get("")
def list_dictionaries(
    type: str = None, 
    parent_id: int = None, 
    limit: int = None,
    offset: int = 0,
    request: Request = None, 
    db: Session = Depends(get_db)
):
    """
    Универсальный эндпоинт для получения справочников с поддержкой пагинации и сортировки.
    """
    lang = getattr(request.state, "lang", "ru")
    query = db.query(Dictionary).filter(Dictionary.is_active == True)
    
    if type:
        query = query.filter(Dictionary.type == type)
    if parent_id:
        query = query.filter(Dictionary.parent_id == parent_id)
    
    # Сортировка по DisplayOrder (по умолчанию 0) и по названию
    query = query.order_by(Dictionary.display_order.desc(), Dictionary.id.asc())
    
    if limit:
        query = query.limit(limit).offset(offset)
        
    items = query.all()
    
    result = []
    for item in items:
        # Find translation
        trans = next((t for t in item.translations if t.lang == lang), None)
        name = trans.name if trans else item.name
        result.append({
            "id": item.id, 
            "name": name, 
            "code": item.code,
            "icon": item.icon,
            "color": item.color,
            "parent_id": item.parent_id,
            "display_order": item.display_order
        })
        
    return create_response(data=result, lang=lang)

@router.get("/marka")
def get_markas(request: Request, db: Session = Depends(get_db)):
    """
    Получение списка марок машин на языке пользователя.
    """
    lang = request.state.lang
    markas = db.query(Dictionary).filter(
        Dictionary.type == "MARKA", 
        Dictionary.is_active == True
    ).order_by(Dictionary.display_order.desc(), Dictionary.id.asc()).all()
    
    result = []
    for m in markas:
        # Find translation
        trans = next((t for t in m.translations if t.lang == lang), None)
        name = trans.name if trans else m.name
        result.append({"id": m.id, "name": name, "code": m.code, "display_order": m.display_order})
        
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
    ).order_by(Dictionary.display_order.desc(), Dictionary.id.asc()).all()
    
    result = []
    for m in models:
        trans = next((t for t in m.translations if t.lang == lang), None)
        name = trans.name if trans else m.name
        result.append({"id": m.id, "name": name, "code": m.code})
        
    return create_response(data=result, lang=lang)
