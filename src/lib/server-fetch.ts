/** Backend base URL — used by Vercel frontend SSR and API rewrites. */
export function getBackendUrl() {
  const url =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

export function isFrontendDeploy() {
  return Boolean(process.env.BACKEND_URL);
}

export async function fetchBackend<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getBackendUrl()}${path}`, {
    ...init,
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Backend ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}
