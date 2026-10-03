"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { st, Device, isTv } from "@/lib/st";
import { Card, Err } from "@/components/Json";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [health, setHealth] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    st<{ items: Device[] }>("devices")
      .then((d) => setDevices(d.items || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function checkHealth(id: string) {
    try {
      const h = await st<{ state?: string }>(`devices/${id}/health`);
      setHealth((p) => ({ ...p, [id]: h.state || "?" }));
    } catch (e) {
      setHealth((p) => ({ ...p, [id]: (e as Error).message }));
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">Cihazlar</h1>
      <p className="text-sm text-white/50">
        GET <code className="text-white/70">/v1/devices</code> · her cihazın sağlığı{" "}
        <code className="text-white/70">/devices/&#123;id&#125;/health</code>
      </p>
      <Err msg={err} />
      {loading && <p className="text-white/50">yükleniyor…</p>}
      <div className="space-y-2">
        {devices.map((d) => (
          <Card key={d.deviceId}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {d.label || d.name}
                  {isTv(d) && (
                    <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-xs text-sky-300">TV</span>
                  )}
                </div>
                <div className="text-xs text-white/40">{d.deviceTypeName}</div>
                <div className="mt-1 font-mono text-[11px] text-white/30">{d.deviceId}</div>
              </div>
              <div className="flex items-center gap-2">
                {health[d.deviceId] && (
                  <span
                    className={`text-xs ${
                      health[d.deviceId] === "ONLINE" ? "text-green-400" : "text-white/50"
                    }`}
                  >
                    {health[d.deviceId]}
                  </span>
                )}
                <button
                  onClick={() => checkHealth(d.deviceId)}
                  className="rounded-md bg-white/10 px-2.5 py-1 text-xs hover:bg-white/15"
                >
                  health
                </button>
                <Link
                  href={`/status?device=${d.deviceId}`}
                  className="rounded-md bg-white/10 px-2.5 py-1 text-xs hover:bg-white/15"
                >
                  status →
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
