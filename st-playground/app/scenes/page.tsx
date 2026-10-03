"use client";
import { useEffect, useState } from "react";
import { st } from "@/lib/st";
import { Card, Button, Err } from "@/components/Json";

type Scene = { sceneId: string; sceneName?: string };

export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    st<{ items: Scene[] }>("scenes")
      .then((d) => setScenes(d.items || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function run(id: string, name?: string) {
    setMsg("");
    try {
      await st(`scenes/${id}/execute`, { method: "POST" });
      setMsg(`✓ çalıştırıldı: ${name || id}`);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">Sahneler</h1>
      <p className="text-sm text-white/50">
        GET <code className="text-white/70">/v1/scenes</code> · POST{" "}
        <code className="text-white/70">/scenes/&#123;id&#125;/execute</code>
      </p>
      <Err msg={err} />
      {msg && <div className="text-sm text-green-400">{msg}</div>}
      {loading && <p className="text-white/50">yükleniyor…</p>}
      {!loading && scenes.length === 0 && !err && (
        <p className="text-white/50">Hiç sahne yok. SmartThings uygulamasından sahne oluşturabilirsin.</p>
      )}
      <div className="space-y-2">
        {scenes.map((s) => (
          <Card key={s.sceneId}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">{s.sceneName || "(isimsiz)"}</div>
                <div className="font-mono text-[11px] text-white/30">{s.sceneId}</div>
              </div>
              <Button variant="primary" onClick={() => run(s.sceneId, s.sceneName)}>
                Çalıştır
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
