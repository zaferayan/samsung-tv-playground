// Client-direct: tarayıcı doğrudan api.smartthings.com'u çağırır (CORS açık).
// Token kullanıcının tarayıcısında (localStorage) tutulur — sunucu yok, statik çalışır.

const BASE = "https://api.smartthings.com/v1";
export const TOKEN_KEY = "st_token";

export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}
export function setToken(t: string) {
  try {
    localStorage.setItem(TOKEN_KEY, t);
  } catch {}
}

export async function st<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Token gerekli — üstteki alana SmartThings PAT gir.");
  const res = await fetch(`${BASE}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "error" in data
        ? JSON.stringify((data as { error: unknown }).error)
        : typeof data === "string"
          ? data
          : JSON.stringify(data)) || res.statusText;
    throw new Error(`${res.status} · ${msg}`);
  }
  return data as T;
}

export function stCommand(
  deviceId: string,
  capability: string,
  command: string,
  args: unknown[] = []
) {
  return st(`devices/${deviceId}/commands`, {
    method: "POST",
    body: JSON.stringify({
      commands: [{ component: "main", capability, command, arguments: args }],
    }),
  });
}

export type Device = {
  deviceId: string;
  label?: string;
  name?: string;
  deviceTypeName?: string;
  components?: { id: string; capabilities: { id: string }[] }[];
};

export function isTv(d: Device): boolean {
  const caps = (d.components || []).flatMap((c) => (c.capabilities || []).map((x) => x.id));
  return /tv/i.test((d.deviceTypeName || "") + (d.name || "")) || caps.includes("samsungvd.remoteControl");
}
