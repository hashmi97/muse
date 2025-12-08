# Muse Project Overview (Current State)

This file reflects the current implementation (Django backend + React frontend) so a new collaborator/LLM can pick up from here.

## High-Level Status
- **Backend**: Django 4.2 + DRF + SimpleJWT. Endpoints implemented for auth, couples, event selection, calendar, media upload, moodboard CRUD, budget, honeymoon, comments, activity logs, tasks, notifications, and dashboard summary. Auto-generated API docs via drf-spectacular (Swagger/Redoc).
- **Frontend**: React (Vite/TS). Signup/onboarding wired to the backend auth and event-selection APIs; other pages still mostly static and need wiring to live data.
- **Database**: PostgreSQL via Docker Compose (development and production parity). Schema covers users, couples/members/invites, events/types, media/moodboards, budget, honeymoon, comments, activity logs, tasks, notifications. Soft-delete implemented for comments, budget items, events, honeymoon items, and moodboard items.
- **Invites**: Signup creates a couple, adds the signer as owner, creates/invites partner; partner user is auto-provisioned with a temp password and emailed. Partner account activates on first login; users can change passwords.

## Backend Details
- Tech: Django, DRF, SimpleJWT, drf-spectacular, corsheaders, django-environ.
- Auth: Email/password; access/refresh JWT, refresh cookie (HTTP-only, SameSite Lax). Logout clears refresh cookie.
- Invite flow: Signup body requires `email`, `password` (min 8), `role` (`bride|groom`), `partner_email`. Creates couple + active member for signer, invite + (if needed) user for partner with random password; invite email sent (console backend by default).
- Core endpoints (auth required unless noted):
  - `POST /api/auth/signup/`, `/api/auth/login/`, `/api/auth/refresh/`, `/api/auth/logout/`, `/api/auth/password/change/`
  - `GET /api/events/types?onboardingOnly=true`
  - `POST /api/events/selection/` (creates/updates events & moodboards; engagement is milestone-only and ignored for onboarding)
  - `GET /api/events/` (active events for couple)
  - `GET /api/calendar/` (event start/end)
  - `POST /api/media/upload/` (multipart)
  - `GET/POST /api/moodboard/<event_id>/`, `DELETE /api/moodboard/items/<item_id>/` (soft-delete)
  - `GET/POST /api/events/<event_id>/budget/`, `POST /api/budget/categories/<category_id>/items/`, `DELETE /api/budget/items/<item_id>/` (soft-delete)
  - `GET/POST /api/events/<event_id>/honeymoon/`, `POST /api/honeymoon/<plan_id>/items/`, `DELETE /api/honeymoon/items/<item_id>/` (soft-delete)
  - `GET/POST /api/comments/`, `DELETE /api/comments/<comment_id>/` (soft-delete)
  - `GET/POST /api/activity/`
  - `GET/POST /api/tasks/`, `PATCH /api/tasks/<task_id>/`, `DELETE /api/tasks/<task_id>/`
  - `GET/POST /api/notifications/` (POST marks as read)
  - `GET /api/dashboard/summary/` (aggregated dashboard data)
  - Health: `GET /api/health/`
- API docs: Swagger UI `/api/docs/swagger/`, Redoc `/api/docs/redoc/`, schema `/api/schema/`.
- CORS/CSRF: Defaults include localhost/127.0.0.1 on ports 5173/3000; configurable via `.env`.
- Email: Defaults to console backend; SMTP via `.env` (`EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`).
- Dev helpers:
  - `python manage.py seed_dev_couple --email user@example.com --event-key wedding_night` (if you need an active membership)
  - `python manage.py seed_event_types` (seed event types catalog)
  - `python manage.py seed_budget_categories` (seed budget categories)
- E2E script: `backend/scripts/e2e_flow.py` exercises signup/login/selection/calendar/upload/moodboard/budget/honeymoon (assumes budget category id=1).
- Tests: Django APITest for auth, events selection/types, calendar, moodboard, budget, honeymoon, comments, activity logs, tasks, notifications, dashboard summary, and cross-couple access validation (all passing).

## Data Model (Django models)
- `accounts_user`: email (unique), password, full_name, role (`bride|groom|other`), avatar_url.
- `planner_couple`, `planner_couplemember`: couple workspace; member roles (`bride|groom|viewer|editor`), status (`invited|active|left`), is_owner.
- `planner_coupleinvite`: invite per couple/email; signup auto-creates partner user with temp password.
- `planner_eventtype`: catalog (engagement, malka, henna_night, bride_prep, wedding_night, honeymoon, etc.).
- `planner_event`: per couple/type; title, description, start/end, is_active, is_deleted; unique (couple, event_type); engagement used only as milestone.
- `planner_mediafile`: uploads (storage_key/url/mime/size, uploaded_by).
- `planner_moodboard`, `planner_moodboarditem` (is_deleted, updated_at), `planner_moodboardreaction`.
- `planner_eventbudget`, `planner_budgetcategory`, `planner_eventbudgetcategory`, `planner_budgetlineitem` (is_deleted).
- `planner_honeymoonplan`, `planner_honeymoonitem` (is_deleted, updated_at).
- `planner_comment`: polymorphic comments (GenericForeignKey), is_deleted for soft-delete.
- `planner_activitylog`: polymorphic activity logs (GenericForeignKey) with verb and metadata.
- `planner_task`: tasks with status, due_date, assigned_to, created_by, completed_at.
- `planner_notification`: polymorphic notifications (GenericForeignKey) with is_read flag.

## Frontend Status
- Stack: Vite + React + TS. Global styles, romantic/rose palette, Playfair-style headings.
- Auth/Onboarding: Signup/login wired to backend; onboarding loads event types from API and posts selection.
- Other pages (dashboard/calendar/budget/moodboard/etc.) still mostly static — need wiring to backend endpoints.
- Config: Set `VITE_API_URL` (e.g., `http://127.0.0.1:4000/api`); restart `npm run dev` after changes.

## Running Locally
Backend (Docker Compose):
```
cd ~/repos/muse
docker compose up -d  # starts PostgreSQL and Django backend
# Backend runs on http://localhost:4000
# Run migrations and seeders:
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_event_types
docker compose exec backend python manage.py seed_budget_categories
# optional: seed membership
docker compose exec backend python manage.py seed_dev_couple --email youruser@example.com --event-key wedding_night
```

Backend (Local - requires PostgreSQL):
```
cd ~/repos/muse/backend
poetry install
# Set DATABASE_URL in .env (e.g., postgresql://user:pass@localhost:5432/muse)
poetry run python manage.py migrate
poetry run python manage.py seed_event_types
poetry run python manage.py seed_budget_categories
poetry run python manage.py runserver 0.0.0.0:4000
```

Frontend:
```
cd ~/repos/muse
npm install
npm run dev   # ensure VITE_API_URL is set in .env (e.g., http://localhost:4000/api)
```

## Next Steps / Gaps
- Frontend: Wire dashboard/calendar/event pages, budgets, honeymoon, media/moodboards, comments, tasks, notifications to the live API; add invite acceptance flow UI; show server validation errors consistently.
- Backend: Add S3 storage option for media files; enhance collaboration features (rich text comments, task dependencies, notification preferences); add CI/CD pipeline.
- Auth: Consider email verification; improve invite email templates and acceptance link flow.
- Data: All models now use soft-delete where appropriate; PostgreSQL is the default via Docker Compose.
