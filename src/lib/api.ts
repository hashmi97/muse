const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api";

export type ApiUser = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  avatar_url?: string;
};

export type ApiEventType = {
  id: number;
  key: string;
  name_en: string;
  name_ar?: string | null;
  default_color_hex?: string | null;
  default_moodboard_enabled?: boolean;
};

type ApiResponse<T> = {
  data: T;
  error: string | null;
};

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: Record<string, unknown> | FormData;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body } = options;

  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: "include",
  });

  let payload: any = null;
  try {
    payload = await res.json();
  } catch (e) {
    // ignore JSON parse errors; will fall back to status text
  }

  const extractError = (): string => {
    if (!payload) return `Request failed with status ${res.status}`;
    if (payload.error) return payload.error;
    if (payload.detail) return payload.detail;
    // DRF validation dict: take first error list
    if (typeof payload === "object") {
      const firstKey = Object.keys(payload)[0];
      const val = payload[firstKey];
      if (Array.isArray(val) && val.length) return `${firstKey}: ${val[0]}`;
      if (typeof val === "string") return `${firstKey}: ${val}`;
    }
    return `Request failed with status ${res.status}`;
  };

  if (!res.ok || (payload && payload.error)) {
    throw new Error(extractError());
  }

  const data = (payload as ApiResponse<T>)?.data ?? payload?.data ?? payload;
  return data as T;
}

export async function signup(payload: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "bride" | "groom";
  partner_email: string;
  partner_first_name: string;
  partner_last_name: string;
}) {
  return request<{ user: ApiUser; access: string; refresh?: string }>("/auth/signup/", {
    method: "POST",
    body: payload,
  });
}

export async function login(payload: { email: string; password: string }) {
  return request<{ user: ApiUser; access: string; refresh?: string }>("/auth/login/", {
    method: "POST",
    body: payload,
  });
}

export async function logout(token: string | null) {
  try {
    await request<{ logged_out: boolean }>("/auth/logout/", {
      method: "POST",
      token,
    });
  } catch (err) {
    // Ignore logout failures
    console.warn("Logout failed", err);
  }
}

export async function fetchEventTypes(token: string | null, onboardingOnly = true) {
  const suffix = onboardingOnly ? "?onboardingOnly=true" : "";
  return request<ApiEventType[]>(`/events/types${suffix}`, { token });
}

export async function submitEventSelection(
  token: string | null,
  selections: { eventTypeKey: string; title?: string; enableMoodboard?: boolean }[]
) {
  return request("/events/selection/", {
    method: "POST",
    token,
    body: { selections },
  });
}

export type DashboardUpcomingEvent = {
  id: number;
  title: string;
  event_type: string;
  start_date: string | null;
  end_date: string | null;
};

export type DashboardBudget = {
  planned: string;
  spent: string;
};

export type DashboardHoneymoon = {
  id: number;
  event_id: number;
  destination_country: string;
  destination_city: string;
  start_date: string | null;
  end_date: string | null;
  total_planned: string;
  total_spent: string;
} | null;

export type DashboardMoodboardHighlight = {
  id: number;
  event_id: number;
  caption: string;
  media_url: string;
  created_at: string;
};

export type DashboardActivity = {
  id: number;
  verb: string;
  actor_id: number | null;
  target_type: string | null;
  target_id: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type DashboardSummary = {
  couple_name: string | null;
  upcoming_events: DashboardUpcomingEvent[];
  budget: DashboardBudget;
  honeymoon: DashboardHoneymoon;
  moodboard_highlights: DashboardMoodboardHighlight[];
  recent_activity: DashboardActivity[];
};

export async function fetchDashboardSummary(token: string | null) {
  return request<DashboardSummary>("/dashboard/summary/", { token });
}

export type CalendarEvent = {
  id: number;
  title: string;
  event_type: string;
  start_date: string | null;
  end_date: string | null;
};

export async function fetchCalendarEvents(token: string | null) {
  return request<CalendarEvent[]>("/calendar/", { token });
}

export type ApiEvent = {
  id: number;
  event_type: {
    id: number;
    key: string;
    name_en: string;
    name_ar?: string | null;
    default_color_hex?: string | null;
    default_moodboard_enabled?: boolean;
  };
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
};

export async function fetchAllEvents(token: string | null) {
  return request<ApiEvent[]>("/events/", { token });
}

export async function fetchEvent(token: string | null, eventId: number): Promise<ApiEvent | null> {
  const events = await fetchAllEvents(token);
  return events.find(e => e.id === eventId) || null;
}

export type BudgetCategory = {
  id: number;
  key: string;
  label: string;
  sort_order: number;
  is_default_for_omani: boolean;
};

export type BudgetLineItem = {
  id: number;
  event_budget_category: number;
  label: string;
  planned_amount: string;
  actual_amount: string;
  notes: string;
  paid_on: string | null;
  receipt_media: number | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type EventBudgetCategory = {
  id: number;
  event_budget: number;
  category: BudgetCategory;
  category_id?: number;
  planned_amount: string;
  spent_amount: string;
  line_items: BudgetLineItem[];
};

export type EventBudget = {
  id: number;
  event: number;
  currency_code: string;
  total_planned: string;
  total_spent: string;
  categories: EventBudgetCategory[];
};

export async function fetchEventBudget(token: string | null, eventId: number) {
  return request<EventBudget>(`/events/${eventId}/budget/`, { token });
}

export async function createBudgetCategory(token: string | null, eventId: number, categoryId: number) {
  return request<EventBudget>(`/events/${eventId}/budget/`, {
    method: "POST",
    token,
    body: { category_id: categoryId },
  });
}

export async function createBudgetLineItem(
  token: string | null,
  categoryId: number,
  data: {
    label: string;
    planned_amount?: string;
    actual_amount?: string;
    notes?: string;
    paid_on?: string;
  }
) {
  return request<BudgetLineItem>(`/budget/categories/${categoryId}/items/`, {
    method: "POST",
    token,
    body: data,
  });
}

export async function deleteBudgetItem(token: string | null, itemId: number) {
  return request<{ deleted: boolean }>(`/budget/items/${itemId}/`, {
    method: "DELETE",
    token,
  });
}

export type ApiTask = {
  id: number;
  couple: number;
  event: number | null;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  due_date: string | null;
  assigned_to: number | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export async function fetchTasks(token: string | null, eventId?: number) {
  const url = eventId ? `/tasks/?event_id=${eventId}` : "/tasks/";
  return request<ApiTask[]>(url, { token });
}

export async function createTask(
  token: string | null,
  data: {
    title: string;
    description?: string;
    status?: "todo" | "in_progress" | "done";
    due_date?: string;
    event_id?: number;
    assigned_to?: number;
  }
) {
  return request<ApiTask>("/tasks/", {
    method: "POST",
    token,
    body: data,
  });
}

export async function updateTask(
  token: string | null,
  taskId: number,
  data: {
    title?: string;
    description?: string;
    status?: "todo" | "in_progress" | "done";
    due_date?: string;
    assigned_to?: number;
  }
) {
  return request<ApiTask>(`/tasks/${taskId}/`, {
    method: "PATCH",
    token,
    body: data,
  });
}

export async function deleteTask(token: string | null, taskId: number) {
  return request<{ deleted: boolean }>(`/tasks/${taskId}/`, {
    method: "DELETE",
    token,
  });
}

export type MediaFile = {
  id: number;
  storage_key: string;
  url: string;
  mime_type: string;
  file_size: number;
  uploaded_by: number | null;
  created_at: string;
};

export type MoodBoardItem = {
  id: number;
  mood_board: number;
  media: MediaFile;
  media_id?: number;
  caption: string;
  position: number | null;
  created_by: number | null;
  created_at: string;
};

export type MoodBoard = {
  id: number;
  event: number;
  is_enabled: boolean;
  items: MoodBoardItem[];
};

export async function fetchMoodboard(token: string | null, eventId: number) {
  return request<MoodBoard>(`/moodboard/${eventId}/`, { token });
}

export async function uploadMedia(token: string | null, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<MediaFile>("/media/upload/", {
    method: "POST",
    token,
    body: formData,
  });
}

export async function createMoodboardItem(
  token: string | null,
  eventId: number,
  data: {
    media_id: number;
    caption?: string;
    position?: number;
  }
) {
  return request<MoodBoardItem>(`/moodboard/${eventId}/`, {
    method: "POST",
    token,
    body: data,
  });
}

export async function deleteMoodboardItem(token: string | null, itemId: number) {
  return request<{ deleted: boolean }>(`/moodboard/items/${itemId}/`, {
    method: "DELETE",
    token,
  });
}

export type HoneymoonItem = {
  id: number;
  honeymoon_plan: number;
  type: "flights" | "hotels" | "activities" | "misc";
  label: string;
  start_date: string | null;
  end_date: string | null;
  planned_amount: string;
  actual_amount: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type HoneymoonPlan = {
  id: number;
  event: number;
  destination_country: string;
  destination_city: string;
  start_date: string | null;
  end_date: string | null;
  notes: string;
  total_planned: string;
  total_spent: string;
  items: HoneymoonItem[];
};

export async function fetchHoneymoonPlan(token: string | null, eventId: number) {
  return request<HoneymoonPlan>(`/events/${eventId}/honeymoon/`, { token });
}

export async function createOrUpdateHoneymoonPlan(
  token: string | null,
  eventId: number,
  data: {
    destination_country?: string;
    destination_city?: string;
    start_date?: string;
    end_date?: string;
    notes?: string;
  }
) {
  return request<HoneymoonPlan>(`/events/${eventId}/honeymoon/`, {
    method: "POST",
    token,
    body: data,
  });
}

export async function createHoneymoonItem(
  token: string | null,
  planId: number,
  data: {
    type: "flights" | "hotels" | "activities" | "misc";
    label: string;
    start_date?: string;
    end_date?: string;
    planned_amount?: string;
    actual_amount?: string;
    notes?: string;
  }
) {
  return request<HoneymoonItem>(`/honeymoon/${planId}/items/`, {
    method: "POST",
    token,
    body: data,
  });
}

export async function deleteHoneymoonItem(token: string | null, itemId: number) {
  return request<{ deleted: boolean }>(`/honeymoon/items/${itemId}/`, {
    method: "DELETE",
    token,
  });
}

export type ActivityLog = {
  id: number;
  couple: number;
  actor: number | null;
  verb: string;
  metadata: Record<string, unknown>;
  target_type: string | null;
  target_id: number | null;
  created_at: string;
};

export async function fetchActivityLogs(token: string | null) {
  return request<ActivityLog[]>("/activity/", { token });
}
