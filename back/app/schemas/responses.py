from typing import Any, Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")

class UnifiedResponse(BaseModel, Generic[T]):
    data: Optional[T] = None
    code: int = 200
    message: str = "Success"
