// Ham JSON gösterici + yeniden kullanılabilir küçük UI parçaları.

export function Json({ data }: { data: unknown }) {
  return (
    <pre className="max-h-[480px] overflow-auto rounded-lg border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-white/80">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      {title && <h2 className="mb-3 text-sm font-semibold text-white/90">{title}</h2>}
      {children}
    </section>
  );
}

export function Button({
  children,
  onClick,
  variant = "default",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
}) {
  const styles = {
    default: "bg-white/10 hover:bg-white/15 text-white",
    primary: "bg-sky-500 hover:bg-sky-400 text-white",
    danger: "bg-red-500/80 hover:bg-red-500 text-white",
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  );
}

export function Err({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {msg}
    </div>
  );
}
