"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { st, Device } from "@/lib/st";
import { Json, Card, Button, Err } from "@/components/Json";

function StatusInner() {
  const sp = useSearchParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [device, setDevice] = useState<string>(sp.get("device") || "");
  const [status, setStatus] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    st<{ items: Device[] }>("devices").then((d) => {
      setDevices(d.items || []);
      if (!device && d.items?.length) setDevice(sp.get("device") || d.items[0].deviceId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    if (!device) return;
    setLoading(true);
    setErr(null);
    try {
      setStatus(await st(`devices/${device}/status`));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (device) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">Cihaz Durumu</h1>
      <p className="text-sm text-white/50">
        GET <code className="text-white/70">/v1/devices/&#123;id&#125;/status</code> — tüm component ve capability değerleri
      </p>
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={device}
            onChange={(e) => setDevice(e.target.value)}
            className="flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-sm"
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || d.name}
              </option>
            ))}
          </select>
          <Button onClick={load} variant="primary">
            Yenile
          </Button>
        </div>
      </Card>
      <Err msg={err} />
      {loading ? <p className="text-white/50">yükleniyor…</p> : status ? <Json data={status} /> : null}
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<p className="text-white/50">yükleniyor…</p>}>
      <StatusInner />
    </Suspense>
  );
}
