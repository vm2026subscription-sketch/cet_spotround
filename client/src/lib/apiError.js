// Turns any axios/network failure into a message safe to show users.
// Never leaks "AxiosError", status codes or stack traces into the UI.
export function apiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err?.response) {
    // Server replied. Trust its message only when it's a human-readable string.
    const m = err.response.data?.message;
    if (typeof m === "string" && m.trim() && m.length < 300) return m;
    if (err.response.status >= 500)
      return "The server had a problem processing this. Please try again in a moment.";
    return fallback;
  }
  if (err?.request) {
    // No response at all — network / server asleep (free-tier cold start).
    return "Could not reach the server. Check your connection and try again — the first request can take up to a minute if the service was idle.";
  }
  return fallback;
}
