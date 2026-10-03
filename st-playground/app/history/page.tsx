"use client";
import { useEffect, useState } from "react";
import { st, Device } from "@/lib/st";
import { Json, Card, Button, Err } from "@/components/Json";

export default function HistoryPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [device, setDevice] = useState("");
  const [data, setData] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    st<{ items: Device[] }>("devices").then((d) => {
      setDevices(d.items || []);
      if (d.items?.length) setDevice(d.items[0].deviceId);
    });
  }, []);

  async function load() {
    if (!device) return;
    setLoading(true);
    setErr(null);
    try {
      setData(await st(`history/devices?deviceId=${device}&limit=20`));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">Geçmiş</h1>
      <p className="text-sm text-white/50">
        GET <code className="text-white/70">/v1/history/devices?deviceId=&amp;limit=20</code> — son olaylar/komutlar
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
          <Button variant="primary" onClick={load}>
            Getir
          </Button>
        </div>
      </Card>
      <Err msg={err} />
      {loading ? <p className="text-white/50">yükleniyor…</p> : data ? <Json data={data} /> : null}
    </div>
  );
}
