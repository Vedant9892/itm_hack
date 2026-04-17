import streamlit as st
import httpx
import json
from datetime import datetime, timedelta, timezone

API_URL = "http://localhost:8000/api/stress/calculate"

st.set_page_config(page_title="Stress Management", layout="centered")

st.title("Wearable Device: Stress Calculator")
st.markdown("This acts as the Python frontend layer for calculating user stress based on wearable tech.")

# Generate sample context for "past 3 hours"
now_utc = datetime.now(timezone.utc)
recent_time = now_utc - timedelta(hours=1)
old_time = now_utc - timedelta(hours=4)

default_input_json = {
    "user_id": "test_user_stream_01",
    "readings": [
        {
            "heart_rate": 60,
            "resting_heart_rate": 58,
            "steps": 1000,
            "sleep_duration": 480,
            "activity_level": "low",
            "timestamp": old_time.isoformat() # This should get ignored by the 3-hour filter
        },
        {
            "heart_rate": 92,
            "resting_heart_rate": 60,
            "steps": 3400,
            "sleep_duration": 480,
            "activity_level": "moderate",
            "timestamp": recent_time.isoformat() # This should be included
        }
    ]
}

# The state dictionary acts as our React State mechanism
if "stress_data" not in st.session_state:
    st.session_state.stress_data = None
if "error_msg" not in st.session_state:
    st.session_state.error_msg = None

def handle_calculate_stress(input_data):
    """ 'onClick' Handler functionally equivalent to React onClick. """
    st.session_state.error_msg = None
    st.session_state.stress_data = None
    
    try:
        parsed_json = json.loads(input_data)
        
        # Make request to our FastAPI Backend
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(API_URL, json=parsed_json)
            
            if resp.status_code == 200:
                data = resp.json()
                if data["status"] == "success":
                    st.session_state.stress_data = data["data"]
                else:
                    st.session_state.error_msg = data.get("message", "Unknown backend error")
            else:
                st.session_state.error_msg = f"HTTP {resp.status_code}: {resp.text}"
                
    except json.JSONDecodeError:
        st.session_state.error_msg = "Invalid JSON structure. Please check layout."
    except httpx.RequestError as e:
        st.session_state.error_msg = f"Failed to connect to backend: {str(e)}"
    except Exception as e:
        st.session_state.error_msg = str(e)


# UI Layout
st.subheader("Data Input Simulator (Google Fit)")

input_area = st.text_area(
    "Incoming JSON Metrics Array", 
    value=json.dumps(default_input_json, indent=2), 
    height=300
)

# Render Button with Spinners visually
if st.button("Calculate Stress (Proxy to n8n)", type="primary"):
    with st.spinner("Processing Health Metrics & Asking n8n..."):
        handle_calculate_stress(input_area)

if st.session_state.error_msg:
    st.error(st.session_state.error_msg)

if st.session_state.stress_data:
    stress = st.session_state.stress_data
    
    st.success("Successfully calculated stress score!")
    col1, col2 = st.columns(2)
    with col1:
        st.metric(label="Stress Score", value=stress["stress_score"])
    with col2:
        st.metric(label="Detected Level", value=str(stress["stress_level"]).upper())
        
    st.info(f"💡 Recommendation: {stress['recommendation']}")
