"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, setToken } from "@/lib/st";

const LINKS = [
  { href: "/", label: "Kumanda" },
  { href: "/devices", label: "Devices" },
  { href: "/status", label: "Status" },
  { href: "/scenes", label: "Scenes" },
  { href: "/rules", label: "Rules" },
  { href: "/history", label: "History" },
  { href: "/console", label: "Console" },
];

export default function Nav() {
  const path = usePathname();
  const [tok, setTok] = useState("");
  const [has, setHas] = useState(false);

  useEffect(() => {
    const t = getToken();
    setTok(t);
    setHas(!!t);
  }, []);

  function save() {
    setToken(tok.trim());
    setHas(!!tok.trim());
    location.reload(); // tüm sayfalar yeni token'la yeniden yüklensin
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f17]">
      <div className="flex flex-wrap items-center gap-1 px-4 py-3">
        <span className="mr-3 font-semibold tracking-tight text-white">⚡ SmartThings</span>
        {LINKS.map((l) => {
          const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                active ? "bg-sky-500 text-white" : "text-white/70 hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${has ? "bg-green-400" : "bg-white/30"}`}
            title={has ? "token var" : "token yok"}
          />
          <input
            type="password"
            value={tok}
            onChange={(e) => setTok(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="SmartThings PAT…"
            spellCheck={false}
            className="w-40 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-white outline-none focus:border-sky-500"
          />
          <button
            onClick={save}
            className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/15"
          >
            Kaydet
          </button>
        </div>
      </div>
    </nav>
  );
}
