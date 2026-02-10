from typing import Any, Optional
from fastapi.responses import JSONResponse
from app.core.i18n import get_message

def create_response(
    data: Any = None,
    code: int = 200,
    message_key: Optional[str] = None,
    lang: str = "ru",
    message: Optional[str] = None
) -> JSONResponse:
    # If a specific message is provided, we use it. 
    # Otherwise, we use the message_key to get translations in all languages.
    if message_key:
        messages = {
            "ru": get_message(message_key, "ru"),
            "kk": get_message(message_key, "kk"),
            "en": get_message(message_key, "en"),
        }
    else:
        # Fallback if no key
        msg = message or get_message("success", lang)
        messages = {"ru": msg, "kk": msg, "en": msg}

    return JSONResponse(
        content={
            "data": data,
            "code": code,
            "message": messages
        },
        status_code=code if code in range(100, 600) else 200
    )
