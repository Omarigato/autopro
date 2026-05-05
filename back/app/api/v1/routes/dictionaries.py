from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.db.session import get_db
from app.models import Dictionary, DictionaryTranslation
from app.core.responses import create_response

router = APIRouter()

def _get_localized_items(query, lang, limit=None, offset=None):
    """
    Helper to execute query and format items with localization.
    """
    if limit:
        query = query.limit(limit).offset(offset)
        
    items = query.all()
    
    result = []
    for item in items:
        # Find translation for requested language
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
    return result

@router.get("")
def list_dictionaries(
    type: str = None, 
    parent_id: int = None, 
    q: str = None,
    limit: int = 100,
    offset: int = 0,
    request: Request = None, 
    db: Session = Depends(get_db)
):
    """
    Универсальный эндпоинт для получения справочников с поддержкой поиска, пагинации и сортировки.
    """
    lang = getattr(request.state, "lang", "kk")
    
    # Eager load translations to avoid N+1
    query = db.query(Dictionary).options(joinedload(Dictionary.translations)).filter(Dictionary.is_active == True)
    
    if type:
        query = query.filter(Dictionary.type == type)
    if parent_id:
        query = query.filter(Dictionary.parent_id == parent_id)
        
    if q:
        search_term = f"%{q.lower()}%"
        # Search in default name or ANY translation
        query = query.join(Dictionary.translations, isouter=True).filter(
            or_(
                Dictionary.name.ilike(search_term),
                DictionaryTranslation.name.ilike(search_term)
            )
        ).distinct()
    
    # Сортировка по DisplayOrder (по умолчанию 0) и по названию
    query = query.order_by(Dictionary.display_order.desc(), Dictionary.name.asc())
    
    result = _get_localized_items(query, lang, limit, offset)
    return create_response(data=result, lang=lang)

@router.get("/marka")
def get_markas(
    request: Request, 
    q: str = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Получение списка марок машин с поддержкой поиска и пагинации.
    """
    lang = request.state.lang
    query = db.query(Dictionary).options(joinedload(Dictionary.translations)).filter(
        Dictionary.type == "MARKA", 
        Dictionary.is_active == True
    )
    
    if q:
        search_term = f"%{q.lower()}%"
        query = query.join(Dictionary.translations, isouter=True).filter(
            or_(
                Dictionary.name.ilike(search_term),
                DictionaryTranslation.name.ilike(search_term)
            )
        ).distinct()
        
    query = query.order_by(Dictionary.display_order.desc(), Dictionary.name.asc())
    
    result = _get_localized_items(query, lang, limit, offset)
    return create_response(data=result, lang=lang)

@router.get("/model/{marka_id}")
def get_models(
    marka_id: int, 
    request: Request, 
    q: str = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Получение списка моделей для конкретной марки с поддержкой поиска и пагинации.
    """
    lang = request.state.lang
    query = db.query(Dictionary).options(joinedload(Dictionary.translations)).filter(
        Dictionary.type == "MODEL", 
        Dictionary.parent_id == marka_id,
        Dictionary.is_active == True
    )
    
    if q:
        search_term = f"%{q.lower()}%"
        query = query.join(Dictionary.translations, isouter=True).filter(
            or_(
                Dictionary.name.ilike(search_term),
                DictionaryTranslation.name.ilike(search_term)
            )
        ).distinct()

    query = query.order_by(Dictionary.display_order.desc(), Dictionary.name.asc())
    
    result = _get_localized_items(query, lang, limit, offset)
    return create_response(data=result, lang=lang)

