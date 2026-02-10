const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...init } = options;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
  return data as T;
}

export type User = { id: string; email: string; createdAt?: string; updatedAt?: string };
export type Prompt = { id: string; keyword: string; body: string; createdAt?: string; updatedAt?: string };

export const authApi = {
  signUp: (email: string, password: string) =>
    api<{ token: string; user: User }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: null,
    }),
  signIn: (email: string, password: string) =>
    api<{ token: string; user: User }>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: null,
    }),
};

export const usersApi = {
  me: () => api<User>("/api/users/me"),
  setOpenAiKey: (key: string | null) =>
    api<{ ok: boolean }>("/api/users/me/openai-key", {
      method: "PUT",
      body: JSON.stringify({ key }),
    }),
};

export const promptsApi = {
  list: () => api<Prompt[]>("/api/prompts"),
  create: (keyword: string, body: string) =>
    api<Prompt>("/api/prompts", {
      method: "POST",
      body: JSON.stringify({ keyword, body }),
    }),
  update: (id: string, data: { keyword?: string; body?: string }) =>
    api<Prompt>(`/api/prompts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    api<void>(`/api/prompts/${id}`, { method: "DELETE" }),
};
