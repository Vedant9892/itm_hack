# Stress Calculator Architecture

## Overview
This feature calculates an individual's stress level by proxying Google Fit data metrics (Heart Rate, Steps, Sleep Duration) through a local Python backend Service and dispatching them to an n8n webhook for logical assessment.

## Components

1. **Frontend (Streamlit)**: 
   - A lightweight pure-Python graphical interface.
   - Triggers the pipeline via an `on_click` equivalent action.
   - Presents the analyzed "Stress Score", "Level", and "Recommendation".

2. **Backend (FastAPI)**:
   - Contains a robust JSON-validating API layer.
   - Holds core logic to handle Google Fit arrays of metric snapshots.

3. **Stress Service & n8n Linkage**:
   - Implements data curation & filtering.
   - Makes POST request to the mocked n8n webhook.

## Time-Filtering Logic: 'Past 3 Hours'
**Requirement**: Only pass data to n8n if it originates from the previous 3-hour window.

**Logic implementation**:
1. Record timestamp parsing: On ingress, loop over all arrays in the `readings` object. Convert ISO 8601 strings to UTC-aware Datetime objects.
2. Cutoff calculation: Evaluate `cutoff_time = datetime.now(timezone.utc) - timedelta(hours=3)`.
3. Filter Condition: Standard python filter: `[record for record in readings if record.timestamp >= cutoff_time]`
4. If the filtered array is empty after logic executes, raise an HTTP Exception alerting the frontend that no relevant recent data exists to form a stress score.

## Data Payloads

**Fully Incoming Data from Google Fit**
```json
{
  "user_id": "string",
  "readings": [
    {
      "heart_rate": 85,
      "resting_heart_rate": 62,
      "steps": 5400,
      "sleep_duration": 480,
      "activity_level": "low/moderate/high/intense",
      "timestamp": "2024-04-17T10:00:00+00:00"
    }
  ]
}
```

**n8n Webhook Output Response**
```json
{
  "stress_score": 45,
  "stress_level": "moderate",
  "recommendation": "Take a 5-minute deep breathing break."
}
```
