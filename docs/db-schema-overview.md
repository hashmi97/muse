# Database Schema Overview (Django backend)

Current schema elements mapped to the user journey. This is meant as context for further review by another LLM.

## Auth & Accounts
- `accounts_user` (custom user): email (unique), password hash, full_name, role (`bride|groom|other`), avatar_url.
- JWT (SimpleJWT) for access/refresh; refresh cookie is set on login/signup.

## Couples & Invites
- `planner_couple`: one workspace per wedding; fields: name, wedding_date (optional), language_pref, theme.
- `planner_couplemember`: links user to couple; role (`bride|groom|viewer|editor`), status (`invited|active|left`), is_owner; unique (couple, user).
- `planner_coupleinvite`: pending/sent/accepted invite for an email on a couple; unique (couple, email).
- Signup flow: creates a couple, active member for the signer, and an invite for the partner email. If partner doesn’t exist, a user is auto-created with a random password; invite email sent.

## Event Types & Events
- `planner_eventtype`: catalog of event types; key is unique (e.g., `wedding_night`, `bride_prep`, `henna_night`, `honeymoon`, `engagement`).
- `planner_event`: instance per couple/type; fields: title override, description, start_date, end_date, is_active; unique (couple, event_type).
- Engagement is treated as milestone-only in onboarding (not selectable).

## Media & Mood Boards
- `planner_mediafile`: uploaded files; couple_id, storage_key, url, mime_type, size_bytes, uploaded_by.
- `planner_moodboard`: one per event; is_enabled.
- `planner_moodboarditem`: mood_board FK, media FK, caption, position, created_by.
- `planner_moodboardreaction`: one per (item, user, reaction_type).

## Budget
- `planner_eventbudget`: one per event; currency_code, total_planned, total_spent (denormalized placeholders).
- `planner_budgetcategory`: global list (e.g., venue, catering).
- `planner_eventbudgetcategory`: attaches a category to an event budget; planned_amount, spent_amount.
- `planner_budgetlineitem`: per event-budget-category; label, planned_amount, actual_amount, notes, paid_on, receipt_media FK (MediaFile), created_by.

## Honeymoon
- `planner_honeymoonplan`: one per event of type honeymoon; destination fields, dates, totals, notes.
- `planner_honeymoonitem`: linked to plan; type (`flight|hotel|activity|other`), label, dates, planned/actual amounts, provider, booking_ref, notes.

## Relationships & Lifecycle (user journey)
1) Signup: create User → Couple → CoupleMember (active, role from signup) → CoupleInvite for partner; optional auto-created partner user with temp password; invite email sent.
2) Login: JWT access/refresh issued; refresh in HTTP-only cookie.
3) Onboarding (event selection): fetch EventTypes (onboardingOnly excludes engagement); POST selections creates/updates Events and MoodBoards; non-selected events (except engagement) are deactivated.
4) Media upload: requires active couple membership; stores MediaFile.
5) Moodboard: one per event; items reference MediaFile; reactions per user.
6) Budget: per event; categories attached via EventBudgetCategory; line items under a category with optional receipt_media.
7) Honeymoon: specialized plan under honeymoon event; items for flights/hotels/activities/other.

## Not yet modeled (potential gaps to consider)
- Comments/activity log/notifications (not implemented yet, though schema sketch exists in docs).
- Task management and shared calendar details beyond event dates (current calendar view uses event start/end only).
- Email verification / invite acceptance flow (currently auto-activates partner member with temp password).
- S3 storage backend for media (currently FileSystemStorage).
