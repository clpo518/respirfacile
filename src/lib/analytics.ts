import { supabase } from "@/integrations/supabase/client";

type EventCategory = "interaction" | "navigation" | "funnel" | "error";

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
  }
  return sessionId;
}

// Fire-and-forget: never blocks UI
export function trackEvent(
  eventName: string,
  category: EventCategory = "interaction",
  data?: Record<string, unknown>
) {
  try {
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase
        .from("analytics_events" as any)
        .insert({
          user_id: user?.id ?? null,
          event_name: eventName,
          event_category: category,
          event_data: data ?? {},
          page_path: window.location.pathname,
          session_id: getSessionId(),
        } as any)
        .then(() => {});
    });
  } catch {
    // Silent fail — analytics should never break the app
  }
}

// Shorthand helpers
export const trackClick = (buttonName: string, data?: Record<string, unknown>) =>
  trackEvent(`click:${buttonName}`, "interaction", data);

export const trackPageView = (path: string) =>
  trackEvent("page_view", "navigation", { path });

export const trackFunnel = (step: string, data?: Record<string, unknown>) =>
  trackEvent(`funnel:${step}`, "funnel", data);
