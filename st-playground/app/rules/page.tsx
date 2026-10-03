"use client";
import { useEffect, useState } from "react";
import { st } from "@/lib/st";
import { Json, Card, Button, Err } from "@/components/Json";

type Location = { locationId: string; name?: string };
type Rule = { id: string; name?: string };

export default function RulesPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loc, setLoc] = useState("");
  const [rules, setRules] = useState<Rule[]>([]);
  const [raw, setRaw] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    st<{ items: Location[] }>("locations")
      .then((d) => {
        setLocations(d.items || []);
        if (d.items?.length) setLoc(d.items[0].locationId);
      })
      .catch((e) => setErr(e.message));
  }, []);

  async function loadRules(locationId: string) {
    setErr(null);
    try {
      const d = await st<{ items: Rule[] }>(`rules?locationId=${locationId}`);
      setRules(d.items || []);
      setRaw(d);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  useEffect(() => {
    if (loc) loadRules(loc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc]);

  async function del(id: string) {
    if (!confirm("Kural silinsin mi?")) return;
    try {
      await st(`rules/${id}?locationId=${loc}`, { method: "DELETE" });
      loadRules(loc);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">Kurallar</h1>
      <p className="text-sm text-white/50">
        GET <code className="text-white/70">/v1/rules?locationId=</code> · DELETE{" "}
        <code className="text-white/70">/rules/&#123;id&#125;</code>
      </p>
      <Card>
        <select
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-sm"
        >
          {locations.map((l) => (
            <option key={l.locationId} value={l.locationId}>
              {l.name} ({l.locationId.slice(0, 8)}…)
            </option>
          ))}
        </select>
      </Card>
      <Err msg={err} />
      <div className="space-y-2">
        {rules.map((r) => (
          <Card key={r.id}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">{r.name || "(isimsiz)"}</div>
                <div className="font-mono text-[11px] text-white/30">{r.id}</div>
              </div>
              <Button variant="danger" onClick={() => del(r.id)}>
                Sil
              </Button>
            </div>
          </Card>
        ))}
        {rules.length === 0 && !err && <p className="text-white/50">Bu konumda kural yok.</p>}
      </div>
      {raw ? <Json data={raw} /> : null}
    </div>
  );
}
