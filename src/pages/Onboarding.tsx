import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, User, Music, Moon, Plane, Image } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiEventType, fetchEventTypes, submitEventSelection } from "../lib/api";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  malka: Sparkles,
  henna_night: Music,
  bride_prep: User,
  wedding_night: Moon,
  honeymoon: Plane,
};

export function Onboarding() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [events, setEvents] = useState<ApiEventType[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [moodboardEnabled, setMoodboardEnabled] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      navigate("/signup");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const data = await fetchEventTypes(accessToken, true);
        if (cancelled) return;
        setEvents(data);
        const defaultSelected = new Set<string>();
        const defaults: Record<string, boolean> = {};
        data.forEach((evt, idx) => {
          const enabled = evt.default_moodboard_enabled ?? true;
          defaults[evt.key] = enabled;
          if (evt.key === "wedding_night" || (!defaultSelected.size && idx === 0)) {
            defaultSelected.add(evt.key);
          }
        });
        setSelectedEvents(defaultSelected);
        setMoodboardEnabled(defaults);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load events");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, navigate]);

  const toggleEvent = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const toggleMoodboard = (eventId: string) => {
    setMoodboardEnabled((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handleContinue = async () => {
    if (!accessToken) {
      navigate("/signup");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const selections = Array.from(selectedEvents).map((key) => ({
        eventTypeKey: key,
        enableMoodboard: moodboardEnabled[key],
      }));
      await submitEventSelection(accessToken, selections);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save selections");
    } finally {
      setSaving(false);
    }
  };

  const resolvedEvents = useMemo(() => events, [events]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-peach-50 py-16 flex items-center justify-center">
      <div className="max-w-[1600px] mx-auto px-8 w-full flex flex-col gap-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-rose-300" fill="currentColor" />
            <h2 className="text-3xl sm:text-4xl" style={{ fontFamily: "Playfair Display, serif" }}>
              Muse
            </h2>
          </div>
          <h1 className="text-[clamp(2.5rem,4vw,3.5rem)]" style={{ fontFamily: "Playfair Display, serif" }}>
            Select Your Events
          </h1>
          <p className="text-grey-600 text-lg">Choose the events you're planning for your celebration</p>
          {loading && <p className="text-sm text-grey-500">Loading event types...</p>}
          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>

        {/* Event Grid */}
        <div
          className="grid gap-6 w-full justify-center"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", justifyItems: "center" }}
        >
          {resolvedEvents.map((event) => {
            const Icon = iconMap[event.key] ?? Heart;
            const isSelected = selectedEvents.has(event.key);

            return (
              <button
                key={event.id ?? event.key}
                onClick={() => toggleEvent(event.key)}
                className={`relative bg-white rounded-[24px] p-8 border-2 transition-all hover:shadow-medium h-[260px] w-full max-w-[420px] text-left ${
                  isSelected ? "border-rose-400 shadow-soft" : "border-grey-100 hover:border-grey-200"
                }`}
              >
                {/* Selection indicator */}
                <div
                  className={`absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? "border-rose-400 bg-rose-50" : "border-grey-300 bg-grey-100"
                  }`}
                >
                  {isSelected && <div className="w-4 h-4 bg-rose-300 rounded-full" />}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                    isSelected ? "bg-gradient-to-br from-rose-100 to-peach-100" : "bg-grey-50"
                  }`}
                >
                  <Icon className={`w-8 h-8 ${isSelected ? "text-rose-300" : "text-grey-400"}`} />
                </div>

                {/* Name */}
                <h3
                  className={`text-[1.65rem] font-semibold ${isSelected ? "text-grey-800" : "text-grey-600"}`}
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {event.name_en}
                </h3>

                {/* Mood board toggle */}
                <div className="mt-4 flex items-center justify-start text-sm text-grey-500">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    <span>Mood board</span>
                  </div>
                </div>
                <div className="absolute right-4 bottom-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSelected) return;
                      toggleMoodboard(event.key);
                    }}
                    disabled={!isSelected}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      !isSelected
                        ? "border-grey-300 bg-grey-100 opacity-60 cursor-not-allowed"
                        : moodboardEnabled[event.key]
                        ? "border-rose-400 bg-rose-200"
                        : "border-grey-300 bg-white"
                    }`}
                    aria-pressed={moodboardEnabled[event.key]}
                    aria-label={`Toggle mood board for ${event.name_en}`}
                  >
                    {isSelected && moodboardEnabled[event.key] && <span className="w-4 h-4 rounded-full bg-rose-400" />}
                  </button>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleContinue}
            disabled={selectedEvents.size === 0 || loading}
            className="px-20 py-4 bg-rose-300 text-white rounded-full hover:bg-rose-400 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
          >
            {saving ? "Saving..." : "Continue to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
