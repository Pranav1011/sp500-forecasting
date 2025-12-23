from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import predictions, metrics, data

app = FastAPI(
    title="S&P 500 Forecasting API",
    description="API for S&P 500 multi-horizon price prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(data.router, prefix="/api/data", tags=["data"])

@app.get("/")
def root():
    return {"message": "S&P 500 Forecasting API", "docs": "/docs"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}
