import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pencil, Check } from "lucide-react";
import { DEFAULT_PROJECTS, type Project } from "@/lib/pmo-data";
import { cn } from "@/lib/utils";

const KEY = "medradius-pmo-v2";

interface Store {
  projects: Project[];
  texts: Record<string, string>;
  setText: (id: string, v: string) => void;
  upsert: (p: Project) => void;
  remove: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function PmoProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw) as { projects?: Project[]; texts?: Record<string, string> };
        if (d.projects) setProjects(d.projects);
        if (d.texts) setTexts(d.texts);
      }
    } catch { /* ignore */ }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (loaded.current) localStorage.setItem(KEY, JSON.stringify({ projects, texts }));
  }, [projects, texts]);

  const store: Store = {
    projects,
    texts,
    setText: (id, v) => setTexts((t) => ({ ...t, [id]: v })),
    upsert: (p) => setProjects((l) => (l.some((x) => x.id === p.id) ? l.map((x) => (x.id === p.id ? p : x)) : [...l, p])),
    remove: (id) => setProjects((l) => l.filter((x) => x.id !== id)),
    reset: () => { setProjects(DEFAULT_PROJECTS); setTexts({}); },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function usePmo() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePmo outside provider");
  return c;
}

export function EditPencil({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label="Editar"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn("inline-flex shrink-0 rounded p-0.5 text-current opacity-25 transition-opacity hover:opacity-90 focus:opacity-90", className)}
    >
      <Pencil className="h-3 w-3" />
    </button>
  );
}

/** Texto editável: clique no lápis para editar; salva automaticamente. */
export function E({ id, children, className, multiline }: { id: string; children: string; className?: string; multiline?: boolean }) {
  const { texts, setText } = usePmo();
  const value = texts[id] ?? children;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    const save = () => { setText(id, draft.trim() || children); setEditing(false); };
    const common = {
      autoFocus: true,
      value: draft,
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
      onBlur: save,
      className: "w-full min-w-[8rem] rounded-md border border-primary/50 bg-background/80 px-2 py-0.5 text-foreground outline-none",
    };
    return (
      <span className={cn("inline-flex w-full max-w-full items-center gap-1", className)}>
        {multiline ? (
          <textarea {...common} rows={2} onChange={(e) => setDraft(e.target.value)} />
        ) : (
          <input {...common} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }} />
        )}
        <Check className="h-4 w-4 text-success" />
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span>{value}</span>
      <EditPencil onClick={() => { setDraft(value); setEditing(true); }} className="self-center" />
    </span>
  );
}
