# Muse Project Overview (Current State)

This file reflects the current implementation (Django backend + React frontend) so a new collaborator/LLM can pick up from here.

## High-Level Status
- **Backend**: Django 4.2 + DRF + SimpleJWT. Endpoints implemented for auth, couples, event selection, calendar, media upload, moodboard CRUD, budget, and honeymoon. Auto-generated API docs via drf-spectacular (Swagger/Redoc).
- **Frontend**: React (Vite/TS). Signup/onboarding wired to the backend auth and event-selection APIs; other pages still mostly static and need wiring to live data.
- **Database**: SQLite for dev (configurable to Postgres). Schema covers users, couples/members/invites, events/types, media/moodboards, budget, honeymoon. Comments/activity/tasks not yet implemented.
- **Invites**: Signup creates a couple, adds the signer as owner, creates/invites partner; partner user is auto-provisioned with a temp password and emailed.

## Backend Details
- Tech: Django, DRF, SimpleJWT, drf-spectacular, corsheaders, django-environ.
- Auth: Email/password; access/refresh JWT, refresh cookie (HTTP-only, SameSite Lax). Logout clears refresh cookie.
- Invite flow: Signup body requires `email`, `password` (min 8), `role` (`bride|groom`), `partner_email`. Creates couple + active member for signer, invite + (if needed) user for partner with random password; invite email sent (console backend by default).
- Core endpoints (auth required unless noted):
  - `POST /api/auth/signup/`, `/api/auth/login/`, `/api/auth/refresh/`, `/api/auth/logout/`
  - `GET /api/events/types?onboardingOnly=true`
  - `POST /api/events/selection/` (creates/updates events & moodboards; engagement is milestone-only and ignored for onboarding)
  - `GET /api/events/` (active events for couple)
  - `GET /api/calendar/` (event start/end)
  - `POST /api/media/upload/` (multipart)
  - `GET/POST /api/moodboard/<event_id>/`, `DELETE /api/moodboard/items/<item_id>/`
  - `GET/POST /api/events/<event_id>/budget/`, `POST /api/budget/categories/<category_id>/items/`
  - `GET/POST /api/events/<event_id>/honeymoon/`, `POST /api/honeymoon/<plan_id>/items/`
  - Health: `GET /api/health/`
- API docs: Swagger UI `/api/docs/swagger/`, Redoc `/api/docs/redoc/`, schema `/api/schema/`.
- CORS/CSRF: Defaults include localhost/127.0.0.1 on ports 5173/3000; configurable via `.env`.
- Email: Defaults to console backend; SMTP via `.env` (`EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`).
- Dev helper: `python manage.py seed_dev_couple --email user@example.com --event-key wedding_night` (if you need an active membership).
- E2E script: `backend/scripts/e2e_flow.py` exercises signup/login/selection/calendar/upload/moodboard/budget/honeymoon (assumes budget category id=1).
- Tests: Django APITest for auth, events selection/types, calendar, moodboard, budget, honeymoon (passing).

## Data Model (Django models)
- `accounts_user`: email (unique), password, full_name, role (`bride|groom|other`), avatar_url.
- `planner_couple`, `planner_couplemember`: couple workspace; member roles (`bride|groom|viewer|editor`), status (`invited|active|left`), is_owner.
- `planner_coupleinvite`: invite per couple/email; signup auto-creates partner user with temp password.
- `planner_eventtype`: catalog (engagement, malka, henna_night, bride_prep, wedding_night, honeymoon, etc.).
- `planner_event`: per couple/type; title, description, start/end, is_active; unique (couple, event_type); engagement used only as milestone.
- `planner_mediafile`: uploads (storage_key/url/mime/size, uploaded_by).
- `planner_moodboard`, `planner_moodboarditem`, `planner_moodboardreaction`.
- `planner_eventbudget`, `planner_budgetcategory`, `planner_eventbudgetcategory`, `planner_budgetlineitem`.
- `planner_honeymoonplan`, `planner_honeymoonitem`.
- Not implemented yet: comments, activity log, tasks, notifications.

## Frontend Status
- Stack: Vite + React + TS. Global styles, romantic/rose palette, Playfair-style headings.
- Auth/Onboarding: Signup/login wired to backend; onboarding loads event types from API and posts selection.
- Other pages (dashboard/calendar/budget/moodboard/etc.) still mostly static — need wiring to backend endpoints.
- Config: Set `VITE_API_URL` (e.g., `http://127.0.0.1:4000/api`); restart `npm run dev` after changes.

## Running Locally
Backend:
```
cd ~/repos/muse/backend
poetry install
poetry run python manage.py migrate
poetry run python manage.py runserver 0.0.0.0:4000
# optional: seed membership
poetry run python manage.py seed_dev_couple --email youruser@example.com --event-key wedding_night
```
Frontend:
```
cd ~/repos/muse
npm install
npm run dev   # ensure VITE_API_URL is set in .env
```

## Next Steps / Gaps
- Frontend: Wire dashboard/calendar/event pages, budgets, honeymoon, media/moodboards to the live API; add invite acceptance flow UI; show server validation errors consistently.
- Backend: Add comments, activity log, tasks, notifications; implement invite acceptance (vs. auto-activate); add S3 storage option; add seeds for event_types/budget_categories; add CI/Docker.
- Auth: Consider email verification; improve invite email templates and acceptance link flow.
- Data: Move to Postgres for shared environments; keep SQLite for local quickstart.
