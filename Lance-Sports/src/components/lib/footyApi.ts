// src/lib/footyApi.ts
// Uses Vite env if present, otherwise your Render URL.
// IMPORTANT: do not include a trailing slash.
const BASE =
  (import.meta as any)?.env?.VITE_API_BASE?.replace(/\/+$/, "") ||
  "https://lancesports-3kmd.onrender.com";

export async function askFootyBot(message: string): Promise<string> {
  const resp = await fetch(`${BASE}/api/football-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!resp.ok) {
    // Bubble up a readable error for the UI
    const text = await resp.text().catch(() => "");
    throw new Error(`API ${resp.status} ${resp.statusText}: ${text}`.trim());
  }

  const data = await resp.json().catch(() => ({}));
  //console.log(data);
  return data?.reply ?? "Sorry, I couldn’t generate a reply.";
}
