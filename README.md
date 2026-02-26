# Atlanta Coffee Shops

Discover coffee shops around Atlanta with an interactive map. Save favorites and share your thoughts.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)

## Project Structure

```
atlanta-coffee-blog/
├── backend/          # FastAPI API
├── frontend/         # Next.js app
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- pip or uv

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

### Environment

Copy `frontend/.env.local.example` to `frontend/.env.local` and adjust `NEXT_PUBLIC_API_URL` if needed (default: http://localhost:8000).

## Roadmap

- [ ] Interactive map (Mapbox or Leaflet)
- [ ] Shop data with descriptions and websites
- [ ] User auth (login/signup)
- [ ] Favorites
- [ ] Thoughts/reviews per shop
