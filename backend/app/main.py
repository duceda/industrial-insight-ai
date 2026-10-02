from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS, MODEL_PATH


def create_app() -> FastAPI:
    app = FastAPI(title="Industrial Insight AI - Backend", version="0.1.0")

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # include routers
    from .api.routers import router as api_router

    app.include_router(api_router)

    # lifespan: load model
    from .services.model_loader import load_model
    from .services.store import InMemoryStore

    # attempt to load model now so TestClient has it available; also keep startup hook
    try:
        obj = load_model(MODEL_PATH)
        app.state.model = obj["pipeline"]
        app.state.meta = obj["meta"]
        app.state.store = InMemoryStore()
    except Exception:
        # defer loading to startup event; ensure state keys exist
        app.state.model = None
        app.state.meta = None
        app.state.store = InMemoryStore()

    @app.on_event("startup")
    async def startup_event():
        if getattr(app.state, "model", None) is None:
            obj = load_model(MODEL_PATH)
            app.state.model = obj["pipeline"]
            app.state.meta = obj["meta"]

    return app


app = create_app()
