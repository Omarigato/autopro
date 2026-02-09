from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Car, Client
from app.schemas.clients import (
    ClientCreateRequest,
    ClientResponse,
    WhatsAppContactResponse,
)

router = APIRouter()


@router.post("/contact", response_model=WhatsAppContactResponse)
def create_client_and_whatsapp_link(
    payload: ClientCreateRequest, db: Session = Depends(get_db)
) -> WhatsAppContactResponse:
    car = db.query(Car).filter(Car.id == payload.car_id, Car.is_active.is_(True)).first()
    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Автомобиль не найден или не активен"
        )

    client = Client(
        name=payload.name,
        age=payload.age,
        phone_number=payload.phone_number,
    )
    db.add(client)
    db.commit()
    db.refresh(client)

    # Сборка ссылки WhatsApp
    owner_phone = car.author.phone_number if car.author else ""
    if not owner_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="У автомобиля не указан телефон владельца",
        )

    message = (
        f"Здравствуйте! Меня зовут {client.name}. "
        f"Меня интересует аренда автомобиля '{car.name}' (id={car.id})."
    )
    # Убираем '+' и пробелы в телефоне
    digits = "".join(ch for ch in owner_phone if ch.isdigit())
    whatsapp_url = (
        f"https://wa.me/{digits}?text=" + message.replace(" ", "%20")
    )

    return WhatsAppContactResponse(
        client=ClientResponse.model_validate(client),
        whatsapp_url=whatsapp_url,
    )

