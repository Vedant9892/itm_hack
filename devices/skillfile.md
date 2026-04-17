# Skillfile: Python-Centric Medical Data Handling

## Stack Rules
- **Backend API**: `FastAPI` (Do not use MERN stack components like Express).
- **Frontend App**: `Streamlit` (Do not use React + Vite).
- **Network Calls**: `httpx` instead of `requests` for asynchronous behavior.
- **Data Validation**: `Pydantic` v2 Models strictly typed.
- **Failover / Resiliency**: `Tenacity` retry wrappers on external requests to n8n webhook.
- **Caching**: `cachetools` TTLCache for deduplication.

## Coding Patterns
- Separate API routes (`main.py`) from business/service logic (`stress_service.py`).
- Maintain a `models.py` file to cleanly identify all schema properties.
- Ensure all Datetime parsing is Timezone-aware (UTC typically).

*Note: This skill file will be refined incrementally.*
