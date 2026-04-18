# ITM Health Analytics and AI Fitness Platform

## Overview
This repository contains a full-stack health analytics, automated workout generation, and biomechanical recovery application. It integrates real-time biometric data, adaptive AI logic, and automated workflows to deliver a highly personalized wellness experience.

## Core Architecture and Features
The system is divided into multiple independent modules, communicating via RESTful APIs and external webhooks.

### 1. Smart Health Dashboard
* **Real-time Synchronization:** Built to render dynamic user data with responsive state management.
* **3D Anatomy Interaction:** A visual body map interface allowing users to isolate muscle soreness directly on a 3D model.

### 2. AI Adaptive Engine
* **Dynamic Generation:** Integrated with the Groq API (utilizing Llama 3 models) for ultra-fast, contextual response generation.
* **Personalized Workouts:** Generates and adapts specific workout routines based on user equipment, strength assessments, current physical readiness, and previous workout records.
* **Soreness & Recovery Protocols:** Formulates exact rehabilitation movements and dynamic stretches targeted at specific user-designated sore muscles, bypassing external automation directly to LLM for rapid processing.

### 3. Biometric & External Integrations
* **Google Fit API:** Authenticates and retrieves real-time activity metrics, step counts, and sleep analysis.
* **n8n Automated Workflows:** Handles complex chaining computations, including stress calculations, processing biometric variables through logical branches, and returning actionable physiological assessments to the user dashboard.

### 4. Database Strategy
* **MongoDB:** Serves as the primary document database for broad application state management.
* **Supabase (PostgreSQL):** Utilized for robust relational data linking, maintaining granular user profiles, historical exercise logging, and persistent feedback scoring.

---

## Repository Structure

```text
itm_hack/
├── backend/                  # Node.js API and Logic Engine
│   ├── src/
│   │   ├── googlefit/        # Biometric integration logic
│   │   ├── models/           # MongoDB Mongoose schemas
│   │   ├── routes/           # Express endpoints (e.g. sorenessRoutes)
│   │   └── services/         # Generative AI SDK implementations
│   ├── .env                  # Backend environment specifics
│   └── server.js             # Main server entry point
├── frontend/                 # Vite + React Interface
│   ├── src/
│   │   ├── assets/           # Static media and geometry logic
│   │   ├── components/       # Standalone UI components
│   │   ├── pages/            # Core views (e.g. Soreness, Dashboard)
│   │   ├── services/         # Data fetching and mutation controllers
│   │   ├── App.jsx           # Client-side router logic
│   │   └── main.jsx          # Virtual DOM execution
│   └── .env                  # Client-side routing references
├── n8n/                      # Automation Workflows
│   ├── daycal.json           # Daily activity scheduling variables
│   ├── soreness.json         # Orchestrator for recovery planning
│   └── watch.json            # Device ingestion pathways
├── devices/                  # Python API stack for simulated device I/O
├── extension/                # Chrome extension source codes
├── .env.example              # Central template demonstrating required vars
└── README.md                 # Primary system documentation
```

---

## Technical Prerequisites
Ensure the following are installed and configured natively or via containers before beginning:
* Node.js (v18+)
* MongoDB (running locally or accessible via URI)
* n8n instance (local environment or cloud-hosted)
* Supabase Account 
* Groq API Key
* Google Cloud Console Credentials (for OAuth and Google Fit permissions)

---

## Local Setup and Execution

### 1. Environment Configurations
Clone the `.env.example` file provided in the repository root into both the `/frontend` and `/backend` directories, renaming them to `.env`. Update the values with your actual system credentials.

### 2. Backend Initialization
The backend server orchestrates routing and database operations.

```bash
cd backend
npm install
npm run dev
```
*The backend typically exposes on `http://localhost:5000`.*

### 3. Frontend Initialization
The frontend is the primary presentation layer.

```bash
cd frontend
npm install
npm run dev
```
*The frontend typically exposes on `http://localhost:5173`.*

### 4. n8n Workflows
If you intend to utilize the stress calculator or historical soreness routing fallback:
1. Initialize your n8n instance.
2. Import the JSON definitions located within the `/n8n` directory.
3. Ensure webhook URLs align with the `N8N_STRESS_WEBHOOK` variable defined in your backend setup.

## Deployment Notes
Ensure that strict CORS policies are enacted in production logic, and OAuth redirect URIs exactly match your hosted domain. Validate that the external AI inference model (Groq) is reliably accessible over standard secured ports.
