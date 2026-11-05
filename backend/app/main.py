from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Vercel enruta /api/* a este servicio sin quitar el prefijo, así que todas las rutas viven bajo /api.
API_PREFIX = "/api"

app = FastAPI(
    title="FinScript Compiler API",
    docs_url=f"{API_PREFIX}/docs",
    openapi_url=f"{API_PREFIX}/openapi.json",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix=API_PREFIX)


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(router)
