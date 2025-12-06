# Probability Distribution Visualization System

This system is currently under development.
An interactive web application for visualizing probability distributions and machine learning models. Adjust parameters in real time and observe how the distribution changes.

## Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (Styling)
- **Recharts** (Chart rendering)
- **KaTeX** (Mathematical formula rendering)
- **Axios** (API communication)

### Backend

- **FastAPI** (High-performance Python web framework)
- **Pydantic** (Data validation with type safety)
- **NumPy** (Numerical computation)
- **SciPy** (Statistical functions)
- **Uvicorn** (ASGI server)
- **uv** (Fast Python package manager)

## Project Structure

```
.
├── backend/                    # Backend (Python + FastAPI)
│   ├── main.py                # FastAPI application
│   ├── config.py              # Configuration management
│   ├── requirements.txt       # Python dependencies
│   ├── models/
│   │   └── distributions.py   # Distribution models and logic
│   ├── api/
│   │   └── routes.py          # API endpoints
│   └── utils/
│       └── logger.py          # Logging configuration
│
└── frontend/                   # Frontend (TypeScript + Next.js)
    ├── app/
    │   ├── layout.tsx         # Root layout
    │   ├── page.tsx           # Main page (distribution list)
    │   ├── [dist]/page.tsx    # Distribution detail page
    │   └── globals.css        # Global styles
    ├── components/
    │   ├── ParameterSlider.tsx
    │   ├── DistributionChart.tsx
    │   ├── FormulaDisplay.tsx
    │   ├── StatisticsDisplay.tsx
    │   └── LoadingSpinner.tsx
    ├── lib/
    │   └── api.ts             # API client utilities
    ├── types/
    │   └── distribution.ts    # TypeScript type definitions
    └── package.json           # Node.js dependencies
```

## Getting Started

### Prerequisites

**Option A: Using Docker (Recommended)**

- Docker Desktop or Docker Engine
- Docker Compose

**Option B: Local Development**

- Python 3.9 or higher
- **uv** (Fast Python package manager)
  - Install: `curl -LsSf https://astral.sh/uv/install.sh | sh`
  - Or: `pip install uv`
- Node.js 18 or higher
- npm or yarn

### Method 1: Docker (Recommended)

Start both backend and frontend with a single command:

```bash
docker-compose up
```

Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

For more details, see [DOCKER.md](DOCKER.md).

### Method 2: Integrated Script (Local)

Start both services in a single shell:

```bash
./start_all.sh
```

Logs are saved in the `logs/` directory.

### Method 3: Manual Setup (Local)

#### Backend Setup

```bash
cd backend

# Create virtual environment
uv venv

# Install dependencies
uv pip install -r requirements.txt

# Start server
uv run python main.py
```

Backend API will be available at http://localhost:8000

- API Documentation: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

# Calculate distribution
curl -X POST http://localhost:8000/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"distribution_type": "uniform", "parameters": {"a": 0, "b": 1}}'
```
