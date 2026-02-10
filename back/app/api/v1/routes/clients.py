from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import Car, Client
from app.schemas.clients import ClientCreateRequest
from app.core.responses import create_response

router = APIRouter()

@router.post("/contact")
def create_client_and_whatsapp_link(
    payload: ClientCreateRequest, 
    request: Request,
    db: Session = Depends(get_db)
):
    car = db.query(Car).filter(Car.id == payload.car_id, Car.is_active.is_(True)).first()
    if not car:
        return create_response(
            code=404,
            message_key="car_not_found",
            lang=request.state.lang
        )

    client = Client(
        name=payload.name,
        age=payload.age,
        phone_number=payload.phone_number,
    )
    db.add(client)
    db.commit()
    db.refresh(client)

    # WhatsApp link building
    owner_phone = car.author.phone_number if car.author else ""
    if not owner_phone:
        return create_response(code=400, message="Owner phone not found", lang=request.state.lang)

    message = (
        f"Здравствуйте! Меня зовут {client.name}. "
        f"Меня интересует аренда автомобиля '{car.name}' (id={car.id})."
    )
    digits = "".join(ch for ch in owner_phone if ch.isdigit())
    whatsapp_url = f"https://wa.me/{digits}?text=" + message.replace(" ", "%20")

    return create_response(
        data={"whatsapp_url": whatsapp_url},
        message_key="client_application_sent",
        lang=request.state.lang
    )

