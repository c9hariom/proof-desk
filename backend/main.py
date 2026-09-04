"""
Proof Desk — FastAPI application entry point.

Configures the app, registers middleware, mounts the review router, and
initialises the SQLite database on startup.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.review import router as review_router
from core.config import settings
from core.database import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger("proofdesk")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise the database and log the active configuration on startup."""
    init_db()

    logger.info("━" * 52)
    logger.info("  Proof Desk — starting up")
    logger.info("━" * 52)
    logger.info("  Model      : %s", settings.openai_model)
    logger.info("  Demo mode  : %s", settings.demo_mode)
    logger.info("  NewsAPI    : %s", "enabled" if settings.newsapi_api_key else "disabled")
    logger.info("━" * 52)

    yield

    logger.info("Proof Desk — shut down")


app = FastAPI(
    title="Proof Desk",
    description="Evidence, reasoning and publication-risk review for editorial documents.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review_router)


@app.get("/health", tags=["meta"])
def health() -> dict:
    """Liveness probe — returns 200 when the server is running."""
    return {"status": "ok", "demo_mode": settings.demo_mode}
