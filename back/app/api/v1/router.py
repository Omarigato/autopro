from fastapi import APIRouter

from app.api.v1.routes import auth, cars, clients, reviews, subscriptions, images, admin, dictionaries, users


api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(cars.router, prefix="/cars", tags=["cars"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(dictionaries.router, prefix="/dictionaries", tags=["dictionaries"])
api_router.include_router(users.router, prefix="/users", tags=["users"])


