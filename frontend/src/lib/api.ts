export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

export async function postJSON<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export type TrickResponse = { result: 'treat'|'trick'; message: string; payload: Record<string, unknown> };
export function callTrick(name?: string, seed?: number) {
  return postJSON<TrickResponse>('/api/trick-or-treat', { name, seed });
}

export type StoryResponse = { title: string; story: string; mode: string };
export function callStory(params: { mode: 'horror'|'gag'|'kids'; hero_name: string; length: 'short'|'medium'; seed?: number }) {
  return postJSON<StoryResponse>('/api/story', params);
}
