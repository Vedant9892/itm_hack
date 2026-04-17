from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import HealthDataInput, CalculationResponse
from .stress_service import process_health_data

app = FastAPI(
    title="Device Stress Calculator API",
    description="Processes health metrics for dynamic stress calculation",
    version="1.0.0"
)

# Fix CORS for local testing with Streamlit if hosted on different ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/stress/calculate", response_model=CalculationResponse)
async def calculate_stress(payload: HealthDataInput):
    """
    Accept Google Fit generic payload and calculates stress.
    Automatically filters to include data only from the Past 3 Hours.
    """
    try:
        response = await process_health_data(payload)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
