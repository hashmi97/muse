## Backend (Django + DRF)

### Environment
- Defaults live in `backend/env.example` (used by docker-compose). Copy it to `backend/.env` if you want a private override and update `docker-compose.yml` to point at it.
- `DATABASE_URL` drives DB selection; defaults to SQLite if not set. The Docker setup below uses Postgres.

### Run with Docker + Postgres
```sh
docker compose up --build
```
- Services: `db` (Postgres 16) and `backend` (Django).
- Ports: backend on `4000`, Postgres on `5432`.
- On start, the backend runs migrations automatically.

### Run locally (non-Docker)
```sh
cd backend
poetry install
export DATABASE_URL=sqlite:///$(pwd)/db.sqlite3  # or your Postgres URL
poetry run python manage.py migrate
poetry run python manage.py runserver 0.0.0.0:4000
```

### Useful
- API docs: `/api/docs/swagger/` and `/api/docs/redoc/`
- Health check: `/api/health/`
