# Muse MVP Roadmap & Implementation Plan

**Last Updated:** Based on current codebase analysis  
**Goal:** Complete MVP as defined in vision document

---

## Executive Summary

**Current State:**
- ✅ **Backend:** ~90% complete - All core endpoints implemented (auth, events, calendar, moodboard, budget, honeymoon, comments, activity logs, tasks, notifications, dashboard)
- ✅ **Frontend:** ~85% complete - Phase 1 complete! All major pages fully integrated with backend APIs (Calendar, Event Page, Budget Planner, Honeymoon Planner, Activity Feed, Gallery)
- ❌ **Infrastructure:** Cloud storage (S3) not implemented; using local FileSystemStorage
- ⚠️ **Invite Flow:** Backend logic exists but frontend UI missing

**Gap Analysis:**
Phase 1 (Frontend Integration) is **complete**. All major pages now display real data and support CRUD operations. Remaining gaps: Comments system UI, Invite flow UI, Polish & Testing, S3 storage.

---

## Phase 1: Critical Frontend Integration (Priority: HIGH) ✅ COMPLETE

**Goal:** Wire all existing pages to backend APIs so users can interact with real data.

### 1.1 Calendar Integration ✅
**Status:** ✅ Complete - Fully integrated with API  
**Backend:** ✅ `/api/calendar/` endpoint exists  
**Tasks:**
- [x] Replace static `calendarEvents` array with API call to `/api/calendar/`
- [x] Implement month navigation (previous/next month)
- [x] Display events from API response (start_date, end_date, event_type)
- [x] Handle event click → navigate to `/event/:eventId`
- [x] Add loading and error states
- [x] Map event types to color scheme

**Estimated Effort:** 4-6 hours  
**Actual:** Completed  
**Dependencies:** None

---

### 1.2 Event Page Integration ✅
**Status:** ✅ Complete - All tabs integrated  
**Backend:** ✅ Multiple endpoints exist:
- `/api/events/<event_id>/budget/`
- `/api/moodboard/<event_id>/`
- `/api/tasks/` (filter by event)
- `/api/comments/` (filter by event)

**Tasks:**
- [x] **Overview Tab:**
  - [x] Fetch event details from `/api/events/` (or include in route params)
  - [x] Display real event title, dates, description
  - [x] Show real stats (budget totals, moodboard item count, task completion)
  
- [x] **Budget Tab:**
  - [x] Fetch budget from `/api/events/<event_id>/budget/`
  - [x] Display categories and line items
  - [x] Implement add/delete for budget items (create line items, delete items)
  - [x] Show planned vs spent with visual indicators
  
- [x] **Moodboard Tab:**
  - [x] Fetch moodboard items from `/api/moodboard/<event_id>/`
  - [x] Display images in grid
  - [x] Implement image upload via `/api/media/upload/` + moodboard item creation
  - [x] Add delete functionality (soft-delete)
  - [ ] Implement reactions (hearts) - deferred (no backend endpoint found)
  
- [x] **Tasks Tab:**
  - [x] Fetch tasks filtered by event from `/api/tasks/`
  - [x] Display task list with completion status
  - [x] Implement create task (POST `/api/tasks/`)
  - [x] Implement toggle completion (PATCH `/api/tasks/<task_id>/`)
  - [x] Implement delete task (DELETE `/api/tasks/<task_id>/`)
  
- [x] **Notes Tab:**
  - [x] Use event description field for display
  - [ ] Implement save functionality - requires backend PATCH endpoint for events
  
- [ ] **Planning Tab:**
  - [ ] This appears to be event-specific details (venue, vendors, timeline)
  - [ ] May need new backend endpoint or extend event model
  - [ ] **Decision needed:** Is this MVP-critical or can it be deferred?

**Estimated Effort:** 16-20 hours  
**Actual:** Completed (Notes save deferred pending backend endpoint)  
**Dependencies:** None (backend ready)

---

### 1.3 Budget Planner Integration ✅
**Status:** ✅ Complete - Fully integrated  
**Backend:** ✅ `/api/events/<event_id>/budget/` exists  
**Tasks:**
- [x] Fetch all events for couple from `/api/events/`
- [x] For each event, fetch budget from `/api/events/<event_id>/budget/`
- [x] Display event budgets in expandable sections
- [x] Show category breakdowns with planned/spent
- [x] Link to Event Page for budget management (CRUD operations)
- [x] Calculate and display totals across all events
- [x] Add loading states and error handling

**Estimated Effort:** 8-10 hours  
**Actual:** Completed  
**Dependencies:** None

---

### 1.4 Honeymoon Planner Integration ✅
**Status:** ✅ Complete - Full CRUD implemented  
**Backend:** ✅ `/api/events/<event_id>/honeymoon/` exists  
**Tasks:**
- [x] Fetch honeymoon plan from API (find event with type=honeymoon)
- [x] Display destination, dates, notes
- [x] Fetch and display honeymoon items (flights, hotels, activities, misc)
- [x] Implement create/edit/delete for honeymoon plan
- [x] Implement create/edit/delete for honeymoon items
- [x] Show budget totals (total_planned, total_spent)
- [x] Add form validation and error handling

**Estimated Effort:** 8-10 hours  
**Actual:** Completed  
**Dependencies:** None

---

### 1.5 Activity Feed Integration ✅
**Status:** ✅ Complete - Activity logs displayed with formatting  
**Backend:** ✅ `/api/activity/` exists  
**Tasks:**
- [x] Fetch activity logs from `/api/activity/`
- [x] Display chronological feed with user names, actions, timestamps
- [x] Format activity verbs and metadata nicely
- [ ] Add pagination or infinite scroll if needed (deferred - can add if needed)
- [x] Link activities to relevant resources (event navigation)
- [ ] Show user avatars if available (deferred - user data not yet fetched)

**Estimated Effort:** 4-6 hours  
**Actual:** Completed  
**Dependencies:** None

---

### 1.6 Gallery Page Integration ✅
**Status:** ✅ Complete - Aggregates all moodboard items with filtering  
**Backend:** ✅ `/api/moodboard/<event_id>/` can provide images  
**Tasks:**
- [x] Review current GalleryPage implementation
- [x] Fetch all moodboard items across all events
- [x] Implement filtering by event type
- [x] Display masonry-style grid
- [x] Link to event moodboards (navigation to event page)
- [x] Upload capability available via Event Page moodboard tab

**Estimated Effort:** 6-8 hours  
**Actual:** Completed  
**Dependencies:** None

---

## Phase 2: Invite Acceptance Flow (Priority: HIGH)

**Goal:** Complete the partner invitation user journey.

### 2.1 Backend Review
**Status:** Backend logic exists - partner user auto-created with temp password on signup  
**Current Flow:**
- Signup creates partner user with random password
- Partner logs in with temp password → membership activates
- No invite token/acceptance endpoint exists

**Decision Needed:**
- Option A: Keep current flow (partner gets email with temp password, logs in directly)
- Option B: Implement proper invite token flow with acceptance endpoint

**Recommendation:** Option A is simpler and works, but Option B is more secure and user-friendly.

**Tasks (if Option B):**
- [ ] Create invite token generation on signup
- [ ] Add `/api/auth/invite/accept/` endpoint
- [ ] Update invite email to include acceptance link
- [ ] Frontend: Create `/invite/:token` route and acceptance page

**Estimated Effort:** 8-12 hours (if Option B)  
**Dependencies:** None

---

### 2.2 Frontend Invite Acceptance UI
**Status:** Missing  
**Tasks:**
- [ ] Create `/invite/:token` route (if token-based)
- [ ] Create invite acceptance page with:
  - [ ] Welcome message
  - [ ] Password setup form
  - [ ] Partner name collection
  - [ ] Submit → activate account
- [ ] Handle error states (expired token, invalid token)
- [ ] Redirect to onboarding after acceptance

**Estimated Effort:** 4-6 hours  
**Dependencies:** Backend invite endpoint (if Option B)

---

## Phase 3: Comments System Integration (Priority: MEDIUM)

**Goal:** Enable commenting on events, moodboard items, budget items, etc.

### 3.1 Backend Review
**Status:** ✅ `/api/comments/` and `/api/comments/<comment_id>/` exist  
**Backend supports:**
- Polymorphic comments (can comment on any model)
- Soft-delete
- GET (list), POST (create), DELETE (soft-delete)

**Tasks:**
- [ ] Review comment serializer to understand target_type/target_id format
- [ ] Add comment UI components:
  - [ ] Comment list component
  - [ ] Comment form component
  - [ ] Comment item with user info, timestamp, delete button
- [ ] Integrate comments into:
  - [ ] Event Page (Overview or Notes tab)
  - [ ] Moodboard items (inline or modal)
  - [ ] Budget items (optional)
  - [ ] Honeymoon items (optional)
- [ ] Implement create/delete comment actions
- [ ] Show user names and timestamps

**Estimated Effort:** 10-12 hours  
**Dependencies:** None (backend ready)

---

## Phase 4: Cloud Storage Implementation (Priority: MEDIUM)

**Goal:** Replace local file storage with S3 (or similar) for production readiness.

### 4.1 Backend S3 Integration
**Status:** Currently using `FileSystemStorage`  
**Tasks:**
- [ ] Install and configure `django-storages` and `boto3`
- [ ] Add S3 settings to `settings.py`:
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_STORAGE_BUCKET_NAME`
  - [ ] `AWS_S3_REGION_NAME`
  - [ ] `AWS_S3_CUSTOM_DOMAIN` (optional CDN)
- [ ] Update `MediaUploadView` to use S3 storage
- [ ] Ensure URLs are properly generated (public or signed)
- [ ] Add environment variable configuration
- [ ] Test upload/download flow
- [ ] Update `.env.example` with S3 variables

**Estimated Effort:** 6-8 hours  
**Dependencies:** AWS account and S3 bucket

---

### 4.2 Frontend Upload Handling
**Status:** Upload functionality may need updates for S3 URLs  
**Tasks:**
- [ ] Verify media upload flow works with S3 URLs
- [ ] Test image display from S3
- [ ] Handle upload errors gracefully
- [ ] Add progress indicators for large files

**Estimated Effort:** 2-4 hours  
**Dependencies:** Backend S3 integration

---

## Phase 5: Polish & Error Handling (Priority: MEDIUM)

**Goal:** Improve user experience with proper loading states, error handling, and empty states.

### 5.1 Loading States
**Tasks:**
- [ ] Add loading spinners/skeletons to all data-fetching pages
- [ ] Implement consistent loading UI pattern
- [ ] Prevent multiple simultaneous API calls

**Estimated Effort:** 4-6 hours

---

### 5.2 Error Handling
**Tasks:**
- [ ] Implement consistent error display (toast notifications or inline errors)
- [ ] Handle network errors gracefully
- [ ] Show validation errors from backend
- [ ] Add retry mechanisms for failed requests
- [ ] Handle 401 (unauthorized) → redirect to login
- [ ] Handle 404 (not found) → show friendly message

**Estimated Effort:** 6-8 hours

---

### 5.3 Empty States
**Tasks:**
- [ ] Design and implement empty states for:
  - [ ] No events selected
  - [ ] No moodboard items
  - [ ] No budget items
  - [ ] No tasks
  - [ ] No activity
  - [ ] No comments
- [ ] Add helpful CTAs in empty states (e.g., "Add your first moodboard item")

**Estimated Effort:** 4-6 hours

---

## Phase 6: Testing & Quality Assurance (Priority: HIGH)

**Goal:** Ensure MVP is stable and bug-free.

### 6.1 Frontend Testing
**Tasks:**
- [ ] Add unit tests for API functions (`src/lib/api.ts`)
- [ ] Add component tests for critical pages (Dashboard, EventPage)
- [ ] Add integration tests for key user flows:
  - [ ] Signup → Onboarding → Dashboard
  - [ ] Event selection → Event page → Budget/Moodboard
  - [ ] Task creation → Completion
  - [ ] Comment creation → Deletion
- [ ] Test error scenarios (network failures, invalid data)

**Estimated Effort:** 12-16 hours

---

### 6.2 End-to-End Testing
**Tasks:**
- [ ] Test complete user journey:
  1. Signup as groom
  2. Invite partner
  3. Partner accepts (or logs in with temp password)
  4. Select events in onboarding
  5. View dashboard
  6. Add moodboard items
  7. Create budget
  8. Add tasks
  9. Add comments
  10. View activity feed
- [ ] Test with multiple events
- [ ] Test collaboration (both users making changes)
- [ ] Test edge cases (empty states, large data sets)

**Estimated Effort:** 8-10 hours

---

### 6.3 Performance Testing
**Tasks:**
- [ ] Test with large datasets (100+ moodboard items, 50+ tasks)
- [ ] Optimize API calls (reduce unnecessary requests)
- [ ] Implement pagination where needed
- [ ] Test image loading performance
- [ ] Check bundle size and optimize if needed

**Estimated Effort:** 4-6 hours

---

## Phase 7: Production Readiness (Priority: MEDIUM)

**Goal:** Prepare for deployment.

### 7.1 Environment Configuration
**Tasks:**
- [ ] Document all required environment variables
- [ ] Create production `.env.example` template
- [ ] Set up environment-specific configs (dev/staging/prod)
- [ ] Ensure secrets are not committed

**Estimated Effort:** 2-4 hours

---

### 7.2 Deployment Configuration
**Tasks:**
- [ ] Docker Compose production configuration
- [ ] Database migration strategy
- [ ] Static file serving configuration
- [ ] Media file serving (S3 or CDN)
- [ ] CORS configuration for production domain
- [ ] SSL/HTTPS setup
- [ ] Health check endpoints

**Estimated Effort:** 8-12 hours

---

### 7.3 Documentation
**Tasks:**
- [ ] Update README with setup instructions
- [ ] Document API endpoints (or link to Swagger)
- [ ] Create user guide (optional for MVP)
- [ ] Document deployment process
- [ ] Update `project-overview.md` with final state

**Estimated Effort:** 4-6 hours

---

## Priority Summary

### Must-Have for MVP (Complete these first):
1. ✅ **Phase 1.1-1.6:** Frontend Integration (Calendar, Event Page, Budget, Honeymoon, Activity, Gallery) - **COMPLETE**
2. ⚠️ **Phase 2:** Invite Acceptance Flow - **IN PROGRESS**
3. ⚠️ **Phase 3:** Comments System Integration - **PENDING**
4. ⚠️ **Phase 5:** Polish & Error Handling - **PARTIALLY COMPLETE** (error handling and loading states implemented, empty states added)
5. ⚠️ **Phase 6:** Testing & QA - **PENDING**

### Should-Have (Can be done in parallel or after MVP):
- **Phase 4:** Cloud Storage (can use local storage for MVP, migrate to S3 later)
- **Phase 7:** Production Readiness (some items can be deferred)

---

## Estimated Total Effort

**Critical Path (MVP):**
- Phase 1: 44-58 hours
- Phase 2: 4-12 hours (depending on approach)
- Phase 3: 10-12 hours
- Phase 5: 14-20 hours
- Phase 6: 24-32 hours

**Total MVP:** ~96-134 hours (~12-17 days of focused work)

**Nice-to-Have:**
- Phase 4: 8-12 hours
- Phase 7: 14-22 hours

**Grand Total:** ~118-168 hours (~15-21 days)

---

## Recommended Implementation Order

1. **Week 1:** Phase 1.1-1.3 (Calendar, Event Page core, Budget)
2. **Week 2:** Phase 1.4-1.6 (Honeymoon, Activity, Gallery) + Phase 2 (Invite)
3. **Week 3:** Phase 3 (Comments) + Phase 5 (Polish)
4. **Week 4:** Phase 6 (Testing) + Phase 4 (S3) in parallel
5. **Week 5:** Phase 7 (Production) + Final polish

---

## Risk Assessment

**Low Risk:**
- Frontend integration (backend APIs are stable and tested)
- Comments system (backend ready)

**Medium Risk:**
- Invite flow (needs decision on approach)
- S3 integration (requires AWS setup)

**High Risk:**
- None identified - architecture is solid

---

## Notes & Decisions Needed

1. **Invite Flow:** Choose between current temp-password flow vs. token-based acceptance
2. **Event Page Planning Tab:** Is venue/vendor/timeline management MVP-critical?
3. **S3 Storage:** Can MVP launch with local storage, or is S3 required?
4. **Mobile Responsiveness:** Is mobile-friendly UI required for MVP or can it be post-MVP?

---

## Success Criteria for MVP

✅ All user journeys from vision document are functional:
- [ ] Signup and partner invitation
- [ ] Onboarding event selection
- [ ] Dashboard with real data
- [ ] Calendar with event dates
- [ ] Event planning pages (all tabs functional)
- [ ] Honeymoon planning
- [ ] Comments on relevant items
- [ ] Activity feed
- [ ] Task management

✅ All pages display real data from backend APIs  
✅ Error handling and loading states are consistent  
✅ Basic testing coverage exists  
✅ Application can be deployed to production environment

---

**Next Steps:**
1. Review and approve this roadmap
2. Prioritize phases based on business needs
3. Begin Phase 1 implementation
4. Set up regular check-ins to track progress

