"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  return (
    <nav className="sticky top-0 z-40 flex flex-wrap items-center gap-1 border-b border-white/10 bg-[#0b0f17] px-4 py-3">
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
    </nav>
  );
}
