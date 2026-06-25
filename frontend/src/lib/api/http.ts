// orval mutator + 手写 hooks 复用：注入 baseURL 与 SM2-JWT 认证头，非 2xx 抛错。
const BASE = import.meta.env.VITE_API_BASE ?? "";

function authHeader(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function http<T>(c: {
  url: string; method: string;
  params?: Record<string, unknown>; data?: unknown; signal?: AbortSignal;
}): Promise<T> {
  const u = new URL(c.url, location.origin);
  if (c.params)
    for (const [k, v] of Object.entries(c.params))
      if (v != null) u.searchParams.set(k, String(v));
  const res = await fetch(BASE + u.pathname + u.search, {
    method: c.method,
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: c.data ? JSON.stringify(c.data) : undefined,
    signal: c.signal,
  });
  if (res.status === 401) localStorage.removeItem("token");
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}
