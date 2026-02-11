import pandas as pd
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.entities import Car, User, Client, Review, Dictionary
from io import BytesIO

class AdminService:
    @staticmethod
    async def export_to_excel(db: AsyncSession):
        """
        Экспорт основных таблиц в один Excel файл с несколькими листами.
        """
        # В SQLAlchemy 2.0+ для асинхронности нужно делать так
        res_cars = await db.execute(select(Car))
        cars = res_cars.scalars().all()
        
        res_users = await db.execute(select(User))
        users = res_users.scalars().all()

        # Превращаем в списки словарей для pandas
        cars_data = [
            {
                "ID": c.id, "Name": c.name, "License Plate": c.license_plate, 
                "Release Year": c.release_year, "Created": c.create_date
            } for c in cars
        ]
        users_data = [
            {
                "ID": u.id, "Name": u.name, "Email": u.email, 
                "Phone": u.phone_number, "Role": u.role
            } for u in users
        ]

        df_cars = pd.DataFrame(cars_data)
        df_users = pd.DataFrame(users_data)

        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_cars.to_excel(writer, sheet_name='Cars', index=False)
            df_users.to_excel(writer, sheet_name='Users', index=False)
        
        output.seek(0)
        filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        return output, filename

    @staticmethod
    async def import_from_excel(file_content: bytes, db: AsyncSession):
        """
        Импорт данных из Excel.
        """
        # Читаем Excel
        xls = pd.ExcelFile(BytesIO(file_content))
        
        if 'Cars' in xls.sheet_names:
            df_cars = pd.read_excel(xls, 'Cars')
            # Тут логика обновления или добавления записей
            # Например, цикл по строкам и db.add()
            pass
            
        await db.commit()
        return True

admin_service = AdminService()
