import httpx
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from .models import HealthDataInput, TargetStressResponse, CalculationResponse
from cachetools import TTLCache, cached

logger = logging.getLogger(__name__)

N8N_WEBHOOK_URL = "http://localhost:5678/webhook/stress-calc"

# Cache recently calculated results for 1 minute based on user_id
stress_cache = TTLCache(maxsize=100, ttl=60)

class StressServiceError(Exception):
    pass

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(httpx.RequestError),
    reraise=True
)
async def post_to_n8n(payload: Dict[str, Any]) -> TargetStressResponse:
    """Send aggregated metrics to n8n for stress scoring using Tenacity for retries."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(N8N_WEBHOOK_URL, json=payload, timeout=10.0)
            response.raise_for_status()
            
            logger.info(f"Raw response from n8n: {response.text}") # LOG EXACT OUTPUT
            
            # Extract out the JSON output that matches TargetStressResponse
            response_data = response.json()
            
            # n8n might wrap things in lists or success objects
            if isinstance(response_data, list) and len(response_data) > 0:
                if 'json' in response_data[0]:
                    response_data = response_data[0]['json']
                else:
                    response_data = response_data[0]
                    
            if not isinstance(response_data, dict):
                 raise StressServiceError(f"Unexpected response format from n8n: {response.text}")
                 
            # Extract stress_score safely, handling cases where it's missing
            score = response_data.get('stress_score')
            level = response_data.get('stress_level', 'unknown')
            rec = response_data.get('recommendation', 'No recommendation provided by logic block.')
            
            if score is None:
                raise StressServiceError(f"n8n logic failed to return a stress_score. Full payload: {response.text}")
                
            return TargetStressResponse(
                stress_score=int(score),
                stress_level=str(level),
                recommendation=str(rec)
            )
        except Exception as e:
            logger.error(f"Failed calling n8n payload: {str(e)}")
            raise StressServiceError(f"Error communicating with n8n workflow: {str(e)}")

async def process_health_data(data: HealthDataInput) -> CalculationResponse:
    user_id = data.user_id
    
    # Check cache first
    if user_id in stress_cache:
        logger.info(f"Returning cached stress result for user {user_id}")
        return CalculationResponse(
            status="success",
            message="Returned from cache",
            data=stress_cache[user_id]
        )

    # 1. Past 3-Hour Time Filtering Logic
    # We capture the exact current UTC time
    now_utc = datetime.now(timezone.utc)
    # 3-hour cutoff line
    cutoff_time = now_utc - timedelta(hours=3)
    
    valid_readings = []
    for reading in data.readings:
        # Convert reading timestamp to UTC if it isn't
        reading_ts_utc = reading.timestamp.astimezone(timezone.utc)
        
        # Only retain if the reading is from the past 3 hours
        if reading_ts_utc >= cutoff_time:
            valid_readings.append(reading)
    
    if not valid_readings:
        return CalculationResponse(
            status="error",
            message="No health data found in the past 3 hours. Cannot calculate acute stress.",
            data=None
        )

    # 2. Normalize and Prepare Payload for n8n
    # Aggregation Strategy: Average HR, Total Steps
    avg_hr = sum(r.heart_rate for r in valid_readings) / len(valid_readings)
    avg_resting_hr = sum(r.resting_heart_rate for r in valid_readings) / len(valid_readings)
    avg_sleep_dur = sum(r.sleep_duration for r in valid_readings) / len(valid_readings)
    total_steps_in_window = valid_readings[-1].steps - valid_readings[0].steps if len(valid_readings) > 1 else valid_readings[0].steps
    recent_activity = valid_readings[-1].activity_level
            
    payload = {
        "user_id": user_id,
        "metrics_window_hours": 3,
        "records_processed": len(valid_readings),
        "avg_heart_rate": round(avg_hr, 1),
        "resting_heart_rate": round(avg_resting_hr, 1), # MATCH N8N SCRIPT
        "total_steps": total_steps_in_window,           # MATCH N8N SCRIPT
        "avg_sleep_duration": round(avg_sleep_dur, 1),  # MATCH N8N SCRIPT
        "activity_level": recent_activity.value,        # MATCH N8N SCRIPT
        "timestamp_utc": now_utc.isoformat()
    }

    # 3. Request n8n workflow
    try:
        n8n_result = await post_to_n8n(payload)
    except StressServiceError as e:
        return CalculationResponse(
            status="error",
            message=str(e),
            data=None
        )

    # Cache successful results
    stress_cache[user_id] = n8n_result
    
    return CalculationResponse(
        status="success",
        message="Calculated acute stress dynamically.",
        data=n8n_result
    )
