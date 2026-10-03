"use client";
import { useState } from "react";
import { Json, Card, Button } from "@/components/Json";

const PRESETS: { label: string; method: string; path: string; body?: string }[] = [
  { label: "Cihazlar", method: "GET", path: "devices" },
  { label: "Konumlar", method: "GET", path: "locations" },
  { label: "Sahneler", method: "GET", path: "scenes" },
  {
    label: "TV: güç aç",
    method: "POST",
    path: "devices/4567d7b7-0092-e6d8-df40-cc63eb0afe07/commands",
    body: JSON.stringify(
      { commands: [{ component: "main", capability: "switch", command: "on", arguments: [] }] },
      null,
      2
    ),
  },
];

export default function ConsolePage() {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("devices");
  const [body, setBody] = useState("");
  const [resp, setResp] = useState<unknown>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    setResp(null);
    try {
      const res = await fetch(`/api/st/${path.replace(/^\//, "")}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "GET" || method === "HEAD" ? undefined : body || undefined,
      });
      setStatus(res.status);
      const text = await res.text();
      try {
        setResp(text ? JSON.parse(text) : null);
      } catch {
        setResp(text);
      }
    } catch (e) {
      setStatus(null);
      setResp({ error: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">Console</h1>
      <p className="text-sm text-white/50">
        Herhangi bir SmartThings endpoint&apos;ini dene. Yol <code className="text-white/70">/v1/</code> sonrası
        kısımdır (ör. <code className="text-white/70">devices</code>).
      </p>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setMethod(p.method);
              setPath(p.path);
              setBody(p.body || "");
            }}
            className="rounded-md bg-white/10 px-2.5 py-1 text-xs hover:bg-white/15"
          >
            {p.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm"
          >
            {["GET", "POST", "PUT", "DELETE"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <div className="flex flex-1 items-center rounded-md border border-white/10 bg-black/30 px-2 text-sm">
            <span className="text-white/30">/v1/</span>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="flex-1 bg-transparent px-1 py-1.5 outline-none"
              spellCheck={false}
            />
          </div>
          <Button variant="primary" onClick={send} disabled={loading}>
            {loading ? "…" : "Gönder"}
          </Button>
        </div>
        {method !== "GET" && (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"commands":[...]}'
            spellCheck={false}
            className="mt-2 h-40 w-full rounded-md border border-white/10 bg-black/30 p-3 font-mono text-xs outline-none"
          />
        )}
      </Card>

      {status !== null && (
        <div className={`text-sm ${status < 300 ? "text-green-400" : "text-red-400"}`}>
          HTTP {status}
        </div>
      )}
      {resp !== null && <Json data={resp} />}
    </div>
  );
}
