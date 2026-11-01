const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  let res;
  try {
    res = await fetch(BASE + path, { method, headers: { Accept: "application/json", "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  } catch { throw Object.assign(new Error("Can't reach the server. Check your connection and try again."), { errors: {} }); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") window.dispatchEvent(new Event("auth:expired"));
    throw Object.assign(new Error(data.message || "Something went wrong. Try again."), { status: res.status, errors: data.errors || {} });
  }
  return data;
}
