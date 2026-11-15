import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import parcelas, microclima, simulaciones, sensores, agente, sectores, climate

app = FastAPI(
    title="SIMORA API",
    version="1.0.0",
    description="Agricultural land marketplace and NASA climate context API",
)
origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep the original SIMORA/AGROFLUX scientific modules in their existing locations.
for router in (
    parcelas.router,
    microclima.router,
    simulaciones.router,
    sensores.router,
    agente.router,
    sectores.router,
    climate.router,
):
    app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"name": "SIMORA API", "status": "ok", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}
