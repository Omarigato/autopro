from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

class Dictionary(Base):
    __tablename__ = "dictionaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    code: Mapped[str] = mapped_column(String(100), index=True)
    type: Mapped[str] = mapped_column(String(50), index=True)  # MARKA, MODEL, CATEGORY, etc.
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"), nullable=True)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True) # Lucide icon name
    color: Mapped[str | None] = mapped_column(String(50), nullable=True) # Tailwind or Hex color
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    parent: Mapped["Dictionary | None"] = relationship("Dictionary", remote_side=[id])
    translations: Mapped[list["DictionaryTranslation"]] = relationship("DictionaryTranslation", back_populates="dictionary")


class DictionaryTranslation(Base):
    __tablename__ = "dictionary_translations"
    __table_args__ = (UniqueConstraint("dictionary_id", "lang", name="uq_dict_lang"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dictionary_id: Mapped[int] = mapped_column(ForeignKey("dictionaries.id"))
    lang: Mapped[str] = mapped_column(String(5))  # ru, en, kk и т.п.
    name: Mapped[str] = mapped_column(String(255))

    dictionary: Mapped[Dictionary] = relationship("Dictionary", back_populates="translations")
