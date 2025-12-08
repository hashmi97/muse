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
