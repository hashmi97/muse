
⸻

Muse – Full-Stack Project Brief (For You to Implement)

You are helping me build Muse, a full-stack web application.

Muse is a wedding planning platform for a couple (two users sharing one workspace). It should support:
	•	Shared planning (both partners see and edit the same workspace)
	•	Event planning (Malka, Henna Night, Bride Preparation, Wedding Night, Honeymoon; Engagement exists only as a calendar milestone)
	•	Mood boards per event + a global inspiration gallery
	•	A shared calendar of events and dates
	•	Combined, event-based budgeting
	•	Honeymoon planning
	•	Comments and an activity feed

You should think like a senior full-stack engineer + architect and:
	•	Implement the backend, frontend, and integration between them
	•	Take the existing frontend codebase as the starting point
	•	Use the existing database schema as a baseline and evolve it where needed
	•	Guide me eventually on deployment (Docker, environment variables, dev/prod setup)
	•	Target hosting: open-source friendly and AWS-ready (backend on ECS/Fargate or Fly.io, DB on RDS/Neon, storage on S3)

⸻

1. Current State (What Exists Today)

The project currently has:
	•	A frontend only implementation (no real backend calls yet)
	•	Tech stack (frontend):
	•	Vite + React + TypeScript
	•	Tailwind CSS (via generated file src/styles/tailwind.generated.css + src/styles/globals.css)
	•	Entry: src/main.tsx → src/App.tsx
	•	Pages under src/pages
	•	UI features currently present (static data only):
	•	Landing page with centered hero text and CTA to sign up
	•	Onboarding event selection page:
	•	Event cards in a responsive grid (~360–420px width each)
	•	Current visible events in the UI: Malka, Henna Night, Bride Preparation, Wedding Night, Honeymoon
	•	Note: Engagement remains in the domain/data but is used only as a calendar milestone (not shown in onboarding, gallery, budgets, or mood boards).
	•	Each card has:
	•	A selection state (selected/unselected)
	•	A mood board toggle that activates only when the card is selected (greyed out when not selected)
	•	Events have default mood board enabled/disabled states defined in the data model; UI should respect those defaults when selected
	•	Calendar view with event legend (includes Engagement as milestone-only; other flows exclude it)
	•	Gallery page with filters (Engagement excluded)
	•	Nav + general layout and sample static data

There is also a database schema draft in docs/db-schema.sql that defines the relational model (Postgres-style).

⸻

2. Target Architecture (What You Should Build)

I want this to become a proper full-stack app with:
	•	Frontend:
	•	Vite + React + TypeScript (keep current stack)
	•	Tailwind CSS for styling (reuse current palette and typography direction: soft rose/peach colors, Playfair or similar serif for headings)
	•	API calls to a real backend (no more hardcoded static data for core flows)
	•	Backend:
	•	Node.js + TypeScript
	•	Use a clean framework such as Express or a light structure (you choose, but keep it simple and idiomatic)
	•	PostgreSQL as the main database
	•	Use an ORM or query builder (Prisma preferred, but you can suggest another and then stick to it consistently)
	•	REST API (JSON), with clear routes and DTOs
	•	Auth: email + password with JWT (HS256), access tokens ~15–60m, refresh tokens ~7–30d in HTTP-only, SameSite Lax cookies; bcrypt hashing (10–12 rounds)
	•	Database:
	•	Use the existing schema in docs/db-schema.sql as a baseline (see section 3)
	•	You may refine/extend it if needed (e.g., indexes, constraints, small naming fixes), but keep the overall structure
	•	Apply migrations (Prisma Migrate or equivalent) and seed some sample data for development
	•	Project Structure:
	•	Prefer a monorepo-style structure like:
	•	/frontend – Vite React app
	•	/backend – Node/TS app
	•	/docs – DB schema, architecture notes
	•	Or keep frontend and backend in separate folders inside this repo; but be consistent and document it.
	•	Media: S3-compatible storage (AWS S3). For local dev, allow disk stub. Env vars: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.

⸻

3. Data Model (Baseline Schema and How It’s Used)

The current schema (in docs/db-schema.sql) uses the following tables. Please use these as your starting point and refine only where needed.

Auth & Workspace:
	•	users: Login + profile (email, password_hash, full_name, role, optional avatar).
	•	couples: A shared workspace for one wedding (e.g., “Hisham & Jinan’s Wedding”).
	•	couple_members: Many-to-many link between users and couples, with roles (bride/groom/viewer/editor) and membership state.

Events & Types:
	•	event_types: Static lookup of possible event types:
	•	engagement (milestone-only), malka, bride_prep, henna_night, wedding_night, honeymoon, etc.
	•	Each has a default color and default mood board enabled flag.
	•	events: An instance of an event for a couple (e.g., “Our Henna Night”), with start_date, end_date, is_active, etc.
	•	These feed the calendar and event pages.

Media & Mood Boards:
	•	media_files: Metadata for uploaded media (images for mood boards, receipts, avatars).
	•	mood_boards: Single mood board per event, if enabled.
	•	mood_board_items: Items on a mood board, each linked to a media_files record, with caption, position, created_by.
	•	mood_board_reactions: Simple hearts/likes per user per mood board item.

Budget:
	•	event_budgets: One budget per event, with currency and cached total planned/spent values.
	•	budget_categories: Global budget categories (venue, catering, decor, photography, jewelry, gifts, misc, etc.).
	•	event_budget_categories: Which categories apply to which event, with planned and spent totals.
	•	budget_line_items: Detailed entries (label, planned_amount, actual_amount, receipt attachment, notes).

Honeymoon:
	•	honeymoon_plans: Extra structure for the honeymoon event (destination, dates, notes, totals).
	•	honeymoon_items: Flights, hotels, activities, etc., each with planned/actual amounts and metadata.

Tasks / Comments / Activity:
	•	tasks: General or event-linked tasks with status and optional assignee.
	•	comments: Polymorphic comments attached to events, mood board items, budget line items, honeymoon items, tasks, etc.
	•	activity_log: Activity feed items per couple (e.g., “user X added mood board item Y to event Z”).

Notifications (optional for now):
	•	notifications: Per-user notifications (comment replies, moodboard additions, etc.). This can remain a v2 feature but the table is already there.

There are sample queries in the schema doc for:
	•	Calendar events (per couple)
	•	Budget summary (planned vs spent)
	•	Global inspiration gallery (all mood board items across events)
	•	Recent activity for the dashboard

Use these queries as guidelines when designing API endpoints.

⸻

4. Product Behavior / Core UX Flows

The app should support at least these flows end-to-end:
	1.	Auth & Workspace
	•	Sign up (groom) → create couple workspace → invite bride via link/email.
	•	Bride accepts invite → they both share the same couple workspace.
	•	Basic login/log out.
	2.	Onboarding
	•	Choose which events are part of their wedding (Malka, Henna Night, Bride Preparation, Wedding Night, Honeymoon; Engagement is milestone-only and not selectable).
	•	For each selected event, allow enabling/disabling the Mood Board.
	•	Save these selections in the DB (events, mood_boards).
	3.	Dashboard
	•	Show upcoming events and dates.
	•	Show budget summary (total planned vs spent across all events).
	•	Show honeymoon status (if configured).
	•	Show recent mood board activity.
	•	Show recent activity log entries.
	4.	Calendar
	•	Monthly view of all events for a couple, based on events.start_date/end_date.
	•	Clicking an event opens event details.
	5.	Event Page Tabs
	•	Overview: title, description, date/time, quick stats.
	•	Budget: categories + line items (planned vs actual).
	•	Mood Board: grid of mood board items if enabled, otherwise a simple message to enable it.
	•	Notes: simple text notes or comments.
	6.	Budget
	•	For each event: manage budget categories and line items.
	•	For the couple overall: show aggregated totals.
	7.	Mood Boards & Inspiration Gallery
	•	Event mood board: upload images, edit captions, reorder, react (heart).
	•	Global inspiration gallery: show all mood board items from all events for this couple, with filters by event type.
	8.	Honeymoon Planner
	•	Set destination, dates, and notes.
	•	Add items (flights, hotels, activities, etc.) with planned/actual amounts and optional links/notes.
	9.	Collaboration Layer
	•	No need for full real-time websockets in MVP, but design the data model so that:
	•	The UI can poll or refresh to show updated activity feed, comments, and mood board changes.
	•	Activity log records key actions that appear on the dashboard.

⸻

5. What I Want You (Codex) To Do
	1.	Backend Implementation
	•	Choose a clean Node.js + TypeScript stack (Express or similar).
	•	Wire it to PostgreSQL using an ORM (Prisma preferred).
	•	Implement all core tables above (migrations or schema sync).
	•	Create REST endpoints for:
	•	Auth (signup, login, logout)
	•	Couple + membership management
	•	Event selection & updates
	•	Calendar reads
	•	Mood board CRUD
	•	Budget CRUD
	•	Honeymoon CRUD
	•	Comments & activity feed
	•	Use proper validation and error handling.
	2.	Frontend Integration
	•	Replace static data in the current React components with real API calls.
	•	Keep the existing look-and-feel (romantic, minimal, rose/peach palette).
	•	Make the onboarding, dashboard, calendar, budgets, and mood boards fully functional with live data from the backend.
	3.	Project Structure & Tooling
	•	Organize the repo into clear frontend and backend folders.
	•	Add scripts for:
	•	npm run dev (frontend dev)
	•	npm run dev:backend (backend dev)
	•	npm run dev:full (concurrent, if useful)
	•	Configure environment variables for DB connection, JWT secrets, etc.
	4.	Testing & Quality
	•	Keep or extend Vitest tests on the frontend.
	•	Add minimal backend tests (e.g., Jest or the testing library of your choice).
	•	Optional but good: linting (ESLint) and formatting (Prettier).
	5.	Deployment Guidance
	•	Propose a simple deployment strategy:
	•	Frontend: Vercel / Netlify.
	•	Backend: AWS ECS/Fargate (or Fly.io as interim), with Docker.
	•	Database: managed Postgres (e.g., AWS RDS, Neon).
	•	Storage: AWS S3.
	•	Explain:
	•	How to build and run the backend in production (including env vars).
	•	How to build and deploy the frontend.
	•	How to configure the frontend base URL for API calls.
	•	Provide Dockerfiles (frontend and backend) for local + production.
	6.	Documentation
	•	Update or generate a top-level README.md that explains:
	•	Project overview
	•	Tech stack
	•	How to run frontend and backend locally
	•	How to apply DB migrations and seed dev data
	•	How to run tests
	•	High-level deploy steps
	7.	Assumptions
	•	If anything is underspecified, choose a reasonable, modern default and explain your choice.
	•	Don’t over-engineer real-time; focus on clean CRUD + clean UX first.
	•	API shape
	•	Base URL: `/api`.
	•	Response envelope: `{ data, error }` (error null on success).
	•	Auth flow: email/password → `/api/auth/login` returns access + refresh; refresh endpoint to rotate tokens; logout revokes refresh. Access token in memory; refresh in HTTP-only cookie.
	•	Invites: generate invite token tied to couple_members (status=invited). Accepting sets status=active.
	•	Env vars (min): `DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `PORT`, `FRONTEND_URL`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.

⸻

Use all of the above as your authoritative spec.
Start by restating your understanding of the architecture and data model, then generate:
	1.	The backend project skeleton
	2.	The DB integration
	3.	The core API routes
	4.	The frontend wiring to those APIs
	5.	Deployment notes and scripts

⸻

6. Execution Plan (Recommended Next Steps)

If you are continuing the build, use this sequence to keep momentum and avoid rework:
	•	Backend skeleton: add /backend with Node+TS (Express or Fastify), env loading, response envelope { data, error }, and a health check.
	•	ORM and DB: add Prisma targeting Postgres; import/adapt docs/db-schema.sql into Prisma schema; run initial migration; seed sample couple and events (Malka, Henna Night, Bride Preparation, Wedding Night, Honeymoon; keep Engagement as calendar-milestone-only).
	•	Auth: implement signup/login/refresh/logout with JWT (HS256), bcrypt hashing, refresh in HTTP-only SameSite Lax cookie, access token in responses; add invite token flow to activate couple_members.
	•	Core routes: couples/events (selection and moodboard defaults), calendar read, moodboard CRUD, budget CRUD, honeymoon CRUD, comments, activity feed; exclude Engagement from onboarding/gallery/budgets.
	•	Storage: wire an S3 client with a local-disk adapter for dev; envs for S3 bucket/region/keys.
	•	Frontend integration: add a typed API client in src/lib/api (base /api, envelope handling); replace static data in onboarding and gallery with real endpoints; implement auth token handling with refresh cookie flow.
	•	Tooling/docs: add npm scripts (dev:backend, dev:full), extend README/AGENTS with run steps, env vars, and deploy notes (FE: Vercel/Netlify; BE: ECS/Fargate or Fly.io; DB: RDS/Neon; storage: S3).

Work in this order unless a blocker arises: backend skeleton → DB + migrations → auth → core routes → S3 stub → frontend wiring → docs/tooling.

Progress Update (Current Status)

Backend:
• Express + TypeScript app scaffolded with shared app factory (`src/app.ts`) and server bootstrap (`src/server.ts`).
• Auth implemented: signup/login/refresh/logout with bcrypt password hashing, JWT access/refresh, refresh cookie (HTTP-only, SameSite Lax), and envelope `{ data, error }` responses.
• Events/onboarding: event types endpoint (onboardingOnly excludes engagement), event selection upsert (creates/updates events and moodboard enabled flags, deactivates non-selected), events list for the couple. Engagement is still milestone-only (skipped in onboarding).
• Calendar: `GET /api/calendar` returns events for the authenticated couple.
• Moodboard: list/create/delete items (expects existing media_id; storage stub in place). Ownership checks enforced by couple membership.
• Middleware: JWT requireAuth middleware for protected routes; cookie parsing enabled.
• Prisma schema aligned with domain (users/couples/events/moodboards/budgets/honeymoon/tasks/comments/activity/notifications); comments use polymorphic `target_type/target_id` scalars. Event type seeds include engagement (milestone-only) and the 5 active onboarding events.
• Tests: Vitest + Supertest with DB reset/seed helpers; coverage for auth, events selection, calendar, and moodboard flows. Tests require a running Postgres test DB and wipe/seed it each run.
• Storage: placeholder S3/local stub pending real integration.

Frontend:
• Still using static data; no API wiring yet. UI updated to exclude engagement from onboarding/gallery/budgets, moodboard toggles, and calendar legend includes engagement as milestone-only.

Next Steps (Recommended)
• Replace static frontend calls with real API client (base `/api`, handle refresh cookie + access token).
• Add budget endpoints (list/update event budgets, categories, line items) and honeymoon CRUD; wire calendar/moodboard to uploads when storage is ready.
• Implement media upload (S3 client + local dev adapter) and add a media creation endpoint for moodboards.
• Extend tests for budgets/honeymoon/comments/activity; add seed helpers for media to simplify moodboard tests.
• Update README/AGENTS with backend run/test instructions and Postman/Vitest notes; add Dockerfiles for FE/BE if desired.
• Keep Engagement as calendar-only unless requirements change; ensure filters/onboarding continue to exclude it.

You can work incrementally, but keep everything consistent and production-minded.

⸻

Django + DRF Migration Plan (if we pivot to Python)
If we decide to replace the Node/Prisma backend with Django + Django REST Framework, follow this path to keep parity with the current feature set and data model.

High-level choice
• Framework: Django + Django REST Framework (DRF) for batteries-included admin, auth, and ORM; stick with Postgres. Use django-environ for settings and dj-database-url for DATABASE_URL parsing.
• ORM/migrations: Django ORM with standard migrations. Seed `event_types` via a data migration or a simple management command.

Step-by-step implementation
1) Project bootstrap
   • Create a new Django project under `backend_py/` (keep Node backend intact until the cutover). Example: `django-admin startproject muse_backend`.
   • Create a core app, e.g., `apps/core`, and additional apps for `accounts`, `events`, `moodboard`, `budget`, `honeymoon`, `comments_activity`.
   • Configure settings for Postgres via `DATABASE_URL`, add DRF, CORS headers, and JWT auth (djangorestframework-simplejwt or rest_framework_simplejwt).
2) Models (map from current Prisma schema)
   • users: email (unique), password (Django auth or custom user), full_name, role (choices: bride/groom/other), avatar (FK to media_files or URL).
   • couples, couple_members (role choices bride/groom/viewer/editor, status invited/active/left, is_owner).
   • event_types (key, name fields, default_color_hex, default_moodboard_enabled), seed with engagement + the 5 onboarding events.
   • events (FK couple, FK event_type, title, description, start/end, is_active, unique_together on couple + event_type).
   • media_files (FK couple, storage_key/url, mime_type, size_bytes, uploaded_by).
   • mood_boards (FK event, is_enabled), mood_board_items (FK mood_board, FK media_file, caption, position, created_by), mood_board_reactions (unique on item+user+type).
   • budgets: event_budgets, budget_categories, event_budget_categories, budget_line_items (with optional receipt media FK, created_by).
   • honeymoon_plans/items.
   • tasks; comments (target_type/target_id polymorphic via generic foreign key or explicit target fields); activity_log; notifications (optional).
3) Auth & permissions
   • Use SimpleJWT for access/refresh tokens; set refresh cookie HTTP-only SameSite Lax, access in response body. Add permission classes to enforce couple membership on event-scoped endpoints.
   • Add signup/login/logout/refresh endpoints; an invite acceptance endpoint that flips `couple_members.status` to active.
4) API endpoints (match current routes)
   • /auth/signup, /auth/login, /auth/refresh, /auth/logout.
   • /events/types?onboardingOnly=true (exclude engagement), /events (list for couple), /events/selection (upsert selected events + moodboard enabled defaults; skip engagement).
   • /calendar (list events for couple).
   • /moodboard/:eventId (list), /moodboard/:eventId/items (create), /moodboard/items/:id (delete).
   • Later: /budget/*, /honeymoon/*, /comments, /activity.
5) File uploads
   • Add a media upload endpoint: DRF view using django-storages + boto3 for S3; local storage backend for dev. Response should return media id and URL to use in moodboard items.
6) Admin & seeds
   • Register core models in Django admin for quick back-office edits.
   • Add a management command or data migration to seed event_types (and any defaults).
7) Testing
   • Use pytest or Django’s TestCase + DRF APIClient. Mirror existing happy-path coverage: auth, events selection, calendar, moodboard item create/delete, media upload stub. Use a test database with migrations applied per run.
8) Cutover
   • Keep the current Node backend running until feature parity is reached.
   • Once Django API matches the contract, point the frontend `/api` base to the new service and retire the Node API.

Environment variables (Django)
• DATABASE_URL
• SECRET_KEY
• DEBUG (False in prod)
• ALLOWED_HOSTS
• CORS_ALLOWED_ORIGINS / CSRF_TRUSTED_ORIGINS
• SIMPLEJWT settings (access/refresh lifetimes)
• FRONTEND_URL
• S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY (for uploads)

Suggested next steps (if adopting Django now)
• Scaffold `backend_py/` with Django + DRF + SimpleJWT, Postgres config, and CORS.
• Implement models for users/couples/event_types/events/moodboards/media first; add a media upload endpoint and event selection endpoints.
• Add minimal tests (signup/login, event types, selection, moodboard list/create/delete) to reach parity with current coverage.
• Wire the frontend to the new endpoints once stable; then decommission the Node backend.

Django backend (backend) quickstart — work in progress
• Location: backend (Poetry-managed; venv at backend/.venv or your poetry env).
• One-time setup:
  1) cd backend_py
  2) poetry env use .venv/bin/python   # ensure Poetry points to the created venv
  3) poetry install                    # if deps change
• Env file: backend_py/.env (example)
  SECRET_KEY=dev-secret-key
  DEBUG=true
  DATABASE_URL=sqlite:///db.sqlite3            # swap to postgres when ready
  ALLOWED_HOSTS=localhost,127.0.0.1
  CORS_ALLOWED_ORIGINS=http://localhost:5173
  CSRF_TRUSTED_ORIGINS=http://localhost:5173
• Run migrations: poetry run python manage.py migrate
• Run dev server: poetry run python manage.py runserver 0.0.0.0:4000
• Run tests: poetry run python manage.py test
• Current endpoints:
  - /api/health/ (no auth)
  - /api/auth/signup, /api/auth/login, /api/auth/refresh, /api/auth/logout
  - /api/ping/ (planner stub)
  - /api/media/upload/ (multipart, requires active couple membership + Bearer)
  - /api/moodboard/<event_id>/ (GET list/create items; Bearer)
  - /api/moodboard/items/<item_id>/ (DELETE; Bearer)
• Models in place: custom User (email login), Couple, CoupleMember, EventType, Event, MediaFile, MoodBoard, MoodBoardItem, MoodBoardReaction.
• Next to add in Django: event selection + types endpoints (exclude engagement), calendar read, moodboard CRUD wired to media upload, and budget/honeymoon/feeds.

Dev helper & test data (Django)
• Seed a dev couple/membership and default event for any user:
  python manage.py seed_dev_couple --email your_user@example.com [--event-key wedding_night]
  - Assumes the user already exists (signup first).
  - Creates/uses “Dev Couple”, makes the user active, seeds event type, and prints the event_id for moodboard tests.
• Moodboard test flow (after seeding):
  - Upload media (multipart key=file) to /api/media/upload/ with Bearer access token.
  - Create item: POST /api/moodboard/<event_id>/items/ with {"media_id": <id>, "caption": "..."}.
  - List: GET /api/moodboard/<event_id>/; Delete: DELETE /api/moodboard/items/<item_id>/.

Repo structure notes / optimizations
• Git on synced folders may block index.lock creation. Keeping the repo under ~/repos (or any non-synced path) avoids permission issues.
• Frontend still points to static data; plan a switch-over to the Django API once endpoints reach parity.
• Node backend has been removed; Django is the primary backend going forward.
