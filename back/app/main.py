from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logger import setup_logging

setup_logging()

def create_app() -> FastAPI:
    """
    Фабрика FastAPI‑приложения.
    Swagger (OpenAPI) доступен по /docs, схема – по {API_V1_STR}/openapi.json.
    """

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def add_language_header(request: Request, call_next):
        """
        Простая реализация выбора языка.
        Язык берётся из:
        - query-параметра `lang`
        - либо заголовка `Accept-Language`
        и кладётся в `request.state.lang`.
        """
        lang = request.query_params.get("lang")
        if not lang:
            lang_header = request.headers.get("Accept-Language", "ru")
            lang = lang_header.split(",")[0].split("-")[0]
        request.state.lang = lang or "ru"
        response = await call_next(request)
        return response

    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_app()

