from datetime import datetime
from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    update_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, onupdate=datetime.utcnow)
    delete_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
