import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import {
  LayoutDashboard, Briefcase, BarChart3, Server, Gavel, ChevronLeft, ChevronRight,
  Activity, Clock, CheckCircle2, AlertTriangle, ScanLine, Plus, Trash2, X, RotateCcw, MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/medradius_logo.png.asset.json";
import { PmoProvider, usePmo, E, EditPencil } from "@/components/pmo/store";
import { TOWERS, STATUS_LABEL, sortProjects, type Project, type PStatus, type Tower } from "@/lib/pmo-data";
import { PRIORITY_META, getPriorityQuadrant, type PriorityQuadrant } from "@/lib/priority";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedRadius | PMO — Status dos Projetos de TI" },
      { name: "description", content: "Painel executivo do PMO MedRadius: projetos de TI em andamento, aguardando e entregues nas torres Governança e Infraestrutura, Negócios e Automação & BI." },
      { property: "og:title", content: "MedRadius | Painel Executivo PMO de TI" },
      { property: "og:description", content: "Status dos projetos de TI por torre, com gráficos interativos." },
    ],
  }),
  component: () => (
    <PmoProvider>
      <Index />
    </PmoProvider>
  ),
});

/* Psicologia das cores: azul = progresso/confiança, âmbar = atenção/espera, verde = entrega, vermelho = risco */
const ST: Record<PStatus, { color: string; text: string; chip: string; icon: typeof Activity }> = {
  andamento: { color: "var(--primary)", text: "text-primary", chip: "bg-primary/15 text-primary border-primary/30", icon: Activity },
  aguardando: { color: "var(--warning)", text: "text-warning", chip: "bg-warning/15 text-warning border-warning/30", icon: Clock },
  entregue: { color: "var(--success)", text: "text-success", chip: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  cancelado: { color: "var(--muted-foreground)", text: "text-muted-foreground", chip: "bg-muted text-muted-foreground border-border", icon: X },
};
const MAIN: PStatus[] = ["andamento", "aguardando", "entregue"];
const TOWER_ICON: Record<Tower, typeof Server> = { suporte: Server, negocios: Briefcase, automacao: BarChart3 };

function StatusChip({ s }: { s: PStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", ST[s].chip)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />{STATUS_LABEL[s]}
    </span>
  );
}
function CriticalChip() {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">
      <AlertTriangle className="h-3 w-3" />Crítico
    </span>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass metric-glow p-5", className)}>{children}</div>;
}

function KpiTile({
  label,
  value,
  tone,
  detail,
  icon: Icon,
  onClick,
  active,
}: {
  label: string;
  value: number | string;
  tone: string;
  detail?: string;
  icon: typeof Activity;
  onClick?: () => void;
  active?: boolean;
}) {
  const IconComp = Icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "glass relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50",
        active && "border-primary/60 ring-2 ring-primary/30",
      )}
      style={{ background: `linear-gradient(135deg, ${tone}22, rgba(255,255,255,0.02))` }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className={cn("mt-3 text-3xl font-black tracking-tight", active ? "text-primary" : "text-foreground")}>{value}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
          <IconComp className={cn("h-5 w-5", active ? "text-primary" : "text-foreground/80")} />
        </div>
      </div>
      {detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}
    </button>
  );
}

const field = "w-full rounded-md border border-input bg-background/80 px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary";

function ProjectEditor({ initial, onClose }: { initial: Project; onClose: () => void }) {
  const { upsert, remove } = usePmo();
  const [p, setP] = useState(initial);
  return (
    <div className="space-y-2 rounded-xl border border-primary/40 bg-secondary/60 p-3">
      <input className={field} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="Nome do projeto" />
      <input className={field} value={p.detail} onChange={(e) => setP({ ...p, detail: e.target.value })} placeholder="Fase / detalhe / prazo" />
      <div className="grid grid-cols-2 gap-2">
        <input className={field} value={p.owner ?? ""} onChange={(e) => setP({ ...p, owner: e.target.value })} placeholder="Responsável" />
        <input className={field} type="number" step="0.01" value={p.score ?? ""} onChange={(e) => setP({ ...p, score: e.target.value === "" ? null : Number(e.target.value) })} placeholder="Score" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select className={field} value={p.status} onChange={(e) => setP({ ...p, status: e.target.value as PStatus })}>
          {(Object.keys(STATUS_LABEL) as PStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select className={field} value={p.tower} onChange={(e) => setP({ ...p, tower: e.target.value as Tower })}>
          {(Object.keys(TOWERS) as Tower[]).map((t) => <option key={t} value={t}>{TOWERS[t]}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.critical} onChange={(e) => setP({ ...p, critical: e.target.checked })} />Marcar como crítico</label>
      <div className="flex justify-between gap-2 pt-1">
        <button onClick={() => { remove(p.id); onClose(); }} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Excluir</button>
        <div className="flex gap-2">
          <button onClick={onClose} className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
          <button onClick={() => { upsert({ ...p, name: p.name.trim() || "Novo projeto" }); onClose(); }} className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Salvar</button>
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ p, showTower }: { p: Project; showTower?: boolean }) {
  const [edit, setEdit] = useState(false);
  if (edit) return <li><ProjectEditor initial={p} onClose={() => setEdit(false)} /></li>;
  return (
    <li className={cn("group rounded-xl border bg-secondary/40 px-3 py-2.5", p.critical ? "border-destructive/40" : "border-border", p.status === "cancelado" && "opacity-60")}>
      <div className="flex items-start justify-between gap-2">
        <p className={cn("font-semibold leading-snug", p.status === "cancelado" && "line-through")}>{p.name}</p>
        <EditPencil onClick={() => setEdit(true)} className="mt-1" />
      </div>
      <p className="text-xs text-muted-foreground">{p.detail}{p.owner ? ` · ${p.owner}` : ""}</p>
      {p.score != null && <p className="text-[11px] text-muted-foreground/80">Score {p.score.toFixed(2).replace(".", ",")}</p>}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {p.critical && <CriticalChip />}
        {showTower && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{TOWERS[p.tower]}</span>}
      </div>
    </li>
  );
}

function AddProject({ tower, status }: { tower: Tower; status: PStatus }) {
  const [open, setOpen] = useState(false);
  if (open) return <ProjectEditor initial={{ id: `u${Date.now()}`, name: "", detail: "", tower, status, critical: false }} onClose={() => setOpen(false)} />;
  return (
    <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
      <Plus className="h-3.5 w-3.5" />Adicionar projeto
    </button>
  );
}

function Board({ tower }: { tower: Tower }) {
  const { projects } = usePmo();
  const list = projects.filter((p) => p.tower === tower);
  const cancel = list.filter((p) => p.status === "cancelado");
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {MAIN.map((s) => {
        const items = sortProjects(list.filter((p) => p.status === s));
        const Icon = ST[s].icon;
        return (
          <Card key={s} className="flex flex-col">
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
              <h3 className={cn("flex items-center gap-2 font-bold", ST[s].text)}><Icon className="h-5 w-5" /><E id={`col-${tower}-${s}`}>{STATUS_LABEL[s]}</E></h3>
              <span className={cn("text-3xl font-extrabold", ST[s].text)}>{items.length}</span>
            </div>
            <ul className="flex-1 space-y-2">
              {items.map((p) => <ProjectRow key={p.id} p={p} />)}
              {s === "entregue" && cancel.map((p) => <ProjectRow key={p.id} p={p} />)}
            </ul>
            <div className="mt-3"><AddProject tower={tower} status={s} /></div>
          </Card>
        );
      })}
    </div>
  );
}

function SlideHeader({ n, id, title, sub }: { n: number; id: string; title: string; sub: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Lâmina {n} de 5</p>
      <h2 className="mt-1 text-3xl font-extrabold tracking-tight"><E id={`${id}-t`}>{title}</E></h2>
      <p className="text-muted-foreground"><E id={`${id}-s`}>{sub}</E></p>
    </div>
  );
}

type Filter = { status?: PStatus; tower?: Tower } | null;

function Slide1() {
  const { projects } = usePmo();
  const active = projects.filter((p) => p.status !== "cancelado");
  const [filter, setFilter] = useState<Filter>(null);
  const pie = MAIN.map((s) => ({ s, name: STATUS_LABEL[s], value: active.filter((p) => p.status === s).length }));
  const bars = (Object.keys(TOWERS) as Tower[]).map((t) => ({
    t, name: TOWERS[t],
    ...Object.fromEntries(MAIN.map((s) => [s, active.filter((p) => p.tower === t && p.status === s).length])),
  }));
  const critical = active.filter((p) => p.critical);
  const shown = filter
    ? sortProjects(active.filter((p) => (!filter.status || p.status === filter.status) && (!filter.tower || p.tower === filter.tower)))
    : [];
  const title = filter
    ? [filter.status && STATUS_LABEL[filter.status], filter.tower && TOWERS[filter.tower]].filter(Boolean).join(" · ")
    : "";

  return (
    <>
      <div className="executive-surface mb-6 rounded-[28px] p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary"><E id="s1-k">Atualização 05/11/2026 · PMO</E></p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl"><E id="s1-t">Status do Portfólio de TI</E></h1>
          </div>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base"><E id="s1-s">Transformação Digital | TI — visão consolidada das 3 torres</E></p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MAIN.map((s) => {
            const Icon = ST[s].icon;
            const v = pie.find((x) => x.s === s)?.value ?? 0;
            const detail = s === "andamento" ? "Acompanhamento da execução" : s === "aguardando" ? "Pendências e aprovações" : "Entregas concluídas";
            return (
              <KpiTile
                key={s}
                label={STATUS_LABEL[s]}
                value={v}
                tone={ST[s].color}
                detail={detail}
                icon={Icon}
                onClick={() => setFilter({ status: s })}
                active={Boolean(filter?.status === s && !filter.tower)}
              />
            );
          })}
          <div className="glass relative overflow-hidden rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-destructive/60 to-transparent" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Críticos</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-destructive">{critical.length}</p>
              </div>
              <div className="rounded-xl border border-destructive/20 bg-destructive/15 p-2.5">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{critical.map((c) => c.name.split(" ")[0]).join(" · ") || "Sem bloqueios ativos"}</p>
          </div>
        </div>
      </div>

      <div className="mt-2 grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold"><E id="s1-c1">Distribuição por status</E></h3>
            <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Live</span>
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><MousePointerClick className="h-3 w-3" />Clique numa fatia para listar os projetos</p>
          <div className="relative h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius="58%" outerRadius="88%" paddingAngle={3} stroke="none" onClick={(d: { s?: PStatus }) => d.s && setFilter({ status: d.s })} className="cursor-pointer">
                  {pie.map((d) => <Cell key={d.s} fill={ST[d.s].color} opacity={filter?.status && filter.status !== d.s ? 0.35 : 1} className="cursor-pointer outline-none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} itemStyle={{ color: "var(--foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold">{active.length}</span>
              <span className="text-xs text-muted-foreground">projetos ativos</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {pie.map((d) => <span key={d.s} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ST[d.s].color }} />{d.name}</span>)}
          </div>
        </Card>
        <Card className="xl:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold"><E id="s1-c2">Projetos por torre</E></h3>
            <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Portfolio</span>
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><MousePointerClick className="h-3 w-3" />Clique numa barra para ver os projetos daquela torre e status</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={bars} layout="vertical" margin={{ left: 10, right: 20, top: 10 }}>
                <XAxis type="number" allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis type="category" dataKey="name" width={150} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip cursor={{ fill: "var(--accent)", opacity: 0.4 }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} itemStyle={{ color: "var(--foreground)" }} labelStyle={{ color: "var(--foreground)" }} />
                {MAIN.map((s, i) => (
                  <Bar key={s} dataKey={s} name={STATUS_LABEL[s]} stackId="a" fill={ST[s].color} radius={i === MAIN.length - 1 ? [0, 8, 8, 0] : 0} className="cursor-pointer"
                    onClick={(d: { t?: Tower }) => d.t && setFilter({ status: s, tower: d.t })} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {filter && (
        <Card className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">{title} <span className="text-muted-foreground">({shown.length})</span></h3>
            <button onClick={() => setFilter(null)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" />Fechar</button>
          </div>
          <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((p) => <ProjectRow key={p.id} p={p} showTower={!filter.tower} />)}
            {shown.length === 0 && <li className="text-sm text-muted-foreground">Nenhum projeto nesta caixa.</li>}
          </ul>
        </Card>
      )}
    </>
  );
}

function TowerSummary({ tower }: { tower: Tower }) {
  const { projects } = usePmo();
  const list = projects.filter((p) => p.tower === tower && p.status !== "cancelado");
  const done = list.filter((p) => p.status === "entregue").length;
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
      {MAIN.map((s) => (
        <span key={s} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ST[s].color }} />{STATUS_LABEL[s]}: <b>{list.filter((p) => p.status === s).length}</b></span>
      ))}
      <div className="ml-auto flex min-w-48 items-center gap-2">
        <span className="text-muted-foreground">Entregue</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} /></div>
        <b>{pct}%</b>
      </div>
    </div>
  );
}

function TowerSlide({ n, tower, sub, children }: { n: number; tower: Tower; sub: string; children?: ReactNode }) {
  return (
    <>
      <SlideHeader n={n} id={`s${n}`} title={`Torre ${TOWERS[tower]}`} sub={sub} />
      <TowerSummary tower={tower} />
      {children}
      <Board tower={tower} />
    </>
  );
}

function PacsHero() {
  const { texts } = usePmo();
  const pct = Math.max(0, Math.min(100, Number(texts["pacs-pct"] ?? 87) || 0));
  return (
    <Card className="mb-4 bg-hero">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/20 p-2.5 text-primary"><ScanLine className="h-6 w-6" /></div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Destaque</p>
            <h3 className="text-xl font-bold"><E id="pacs-t">PACS Carestream → Pixeon</E></h3>
          </div>
        </div>
        <div className="flex gap-2"><CriticalChip /><StatusChip s="andamento" /></div>
      </div>
      <div className="mt-4 grid items-center gap-4 md:grid-cols-[auto_1fr]">
        <div className="flex items-end gap-1">
          <span className="text-5xl font-extrabold text-primary"><E id="pacs-pct">87</E></span><span className="pb-1 text-2xl font-bold text-primary">%</span>
        </div>
        <div>
          <div className="h-3 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} /></div>
          <p className="mt-2 text-sm text-muted-foreground"><E id="pacs-d" multiline>10/32 tarefas · integrações SMART/KORUS estabilizadas · aguardando aprovação da Coordenação Médica para Go-Live em Nov/26</E></p>
        </div>
      </div>
    </Card>
  );
}

function SectorDecisions() {
  const { projects } = usePmo();

  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-3">
      {(Object.keys(TOWERS) as Tower[]).map((t) => {
        const Icon = TOWER_ICON[t];
        const list = projects
          .filter((p) => p.tower === t && p.status !== "cancelado")
          .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        const priority = list.filter((p) => getPriorityQuadrant(p) === "priorizar");
        const remaining = list.filter((p) => getPriorityQuadrant(p) !== "priorizar");

        if (!list.length) return null;

        return (
          <Card key={t}>
            <h3 className="mb-3 flex items-center gap-2 border-b border-border pb-3 text-lg font-bold">
              <Icon className="h-5 w-5 text-primary" /><E id={`dec-${t}`}>{TOWERS[t]}</E>
              <span className="ml-auto text-sm font-normal text-muted-foreground">{list.length} projetos</span>
            </h3>

            <div className="space-y-3">
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                <p className={cn("mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider", PRIORITY_META.priorizar.color)}>
                  <E id={`dec-${t}-priorizar`}>{PRIORITY_META.priorizar.label}</E><span>{priority.length}</span>
                </p>
                <p className="mb-2 text-[11px] text-muted-foreground">{PRIORITY_META.priorizar.description}</p>
                <ul className="space-y-1.5">
                  {priority.length ? priority.map((p) => (
                    <li key={p.id} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 w-10 shrink-0 rounded-md bg-background/60 px-1 text-center text-xs font-bold tabular-nums">{p.score != null ? p.score.toFixed(1).replace(".", ",") : "–"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{p.name}{p.critical && <AlertTriangle className="ml-1 inline h-3.5 w-3.5 text-destructive" />}</p>
                        <p className="text-xs text-muted-foreground">{p.detail}{p.owner ? ` · ${p.owner}` : ""}</p>
                      </div>
                    </li>
                  )) : <li className="text-xs text-muted-foreground">Nenhum projeto nesta prioridade.</li>}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <p className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-primary">
                  <span>Em andamento e aguardando</span><span>{remaining.length}</span>
                </p>
                <ul className="space-y-1.5">
                  {remaining.map((p) => (
                    <li key={p.id} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 w-10 shrink-0 rounded-md bg-background/60 px-1 text-center text-xs font-bold tabular-nums">{p.score != null ? p.score.toFixed(1).replace(".", ",") : "–"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{p.name}{p.critical && <AlertTriangle className="ml-1 inline h-3.5 w-3.5 text-destructive" />}</p>
                        <p className="text-xs text-muted-foreground">{p.detail}{p.owner ? ` · ${p.owner}` : ""}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Slide5() {
  const points = [
    { id: "d1", t: "TEF (Pixeon)", d: "Risco direto ao faturamento — destravar com o fornecedor.", tone: "destructive" },
    { id: "d2", t: "Validação Médica do PACS", d: "Aceite da Coordenação Médica libera o Go-Live.", tone: "destructive" },
    { id: "d3", t: "Aprovação dos BIs e Robôs", d: "Robôs e relatórios aguardando autorização da Diretoria.", tone: "warning" },
    { id: "d4", t: "Adesão Médica ao Certificado PA", d: "Engajamento do corpo clínico necessário.", tone: "warning" },
  ];
  const milestones = [
    { id: "m1", d: "Nov/26", t: "Aceite Médico PACS" },
    { id: "m2", d: "Nov/26", t: "Go-Live Spark & TEF" },
    { id: "m3", d: "1º Tri/27", t: "BD SMART" },
  ];
  return (
    <>
      <SlideHeader n={5} id="s5" title="Decisões Estratégicas & Governança PMO" sub="O que precisa da Diretoria agora" />
      <div className="grid gap-4 md:grid-cols-2">
        {points.map((p, i) => (
          <Card key={p.id} className={cn("border-l-4", p.tone === "destructive" ? "border-l-destructive" : "border-l-warning")}>
            <div className="flex items-start gap-3">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold", p.tone === "destructive" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning")}>{i + 1}</span>
              <div>
                <h3 className="text-lg font-bold"><E id={`${p.id}-t`}>{p.t}</E></h3>
                <p className="mt-1 text-sm text-muted-foreground"><E id={`${p.id}-d`} multiline>{p.d}</E></p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <h3 className="mb-6 font-bold"><E id="s5-tl">Timeline de Marcos</E></h3>
        <ol className="relative grid gap-6 sm:grid-cols-3">
          <div className="absolute left-0 right-0 top-3 hidden h-0.5 bg-primary/30 sm:block" />
          {milestones.map((m, i) => (
            <li key={m.id} className="relative">
              <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</div>
              <p className="mt-3 text-sm font-semibold text-primary"><E id={`${m.id}-d`}>{m.d}</E></p>
              <p className="font-bold"><E id={`${m.id}-t`}>{m.t}</E></p>
            </li>
          ))}
        </ol>
      </Card>
      <h3 className="mt-8 text-xl font-bold"><E id="s5-sec">Foco atual por setor — matriz de priorização</E></h3>
      <SectorDecisions />
    </>
  );
}

const slides = [
  { id: "nav1", label: "Visão Geral", icon: LayoutDashboard, C: Slide1 },
  { id: "nav2", label: "Negócios de TI", icon: TOWER_ICON.negocios, C: () => <TowerSlide n={2} tower="negocios" sub="Jornada do paciente & faturamento" /> },
  { id: "nav3", label: "Automação & BI", icon: TOWER_ICON.automacao, C: () => <TowerSlide n={3} tower="automacao" sub="Dados & inteligência" /> },
  { id: "nav4", label: "Governança e Infraestrutura", icon: TOWER_ICON.suporte, C: () => <TowerSlide n={4} tower="suporte" sub="Diagnóstico por imagem e infraestrutura"><PacsHero /></TowerSlide> },
  { id: "nav5", label: "Decisões & PMO", icon: Gavel, C: Slide5 },
];

function Index() {
  const { reset } = usePmo();
  const [i, setI] = useState(0);
  const go = (n: number) => setI((n + slides.length) % slides.length);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "ArrowRight") setI((v) => (v + 1) % slides.length);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + slides.length) % slides.length);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const S = slides[i]!.C;
  return (
    <div className="flex min-h-screen bg-page text-foreground">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 p-5 backdrop-blur-xl lg:flex">
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-3">
          <img src={logo.url} alt="MedRadius" className="w-40" />
        </div>
        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground"><E id="brand-sub">PMO · Diretoria Executiva</E></p>
        <nav className="space-y-1.5">
          {slides.map((s, n) => (
            <div key={s.id} role="button" tabIndex={0} onClick={() => go(n)} onKeyDown={(e) => e.key === "Enter" && go(n)}
              className={cn("flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                n === i ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary shadow-[0_10px_24px_-18px_rgba(99,102,241,0.9)] ring-1 ring-primary/30" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground")}>
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold", n === i ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground")}>{String(n + 1).padStart(2, "0")}</span>
              <s.icon className="h-4 w-4 shrink-0" /><E id={s.id}>{s.label}</E>
            </div>
          ))}
        </nav>
        <div className="mt-auto space-y-2 text-xs text-muted-foreground">
          <p className="rounded-xl border border-white/5 bg-white/5 p-2">Use ← → para navegar · clique no lápis para editar</p>
          <button onClick={() => { if (confirm("Restaurar todos os dados originais?")) reset(); }} className="inline-flex items-center gap-1 rounded-xl border border-white/5 bg-white/5 px-2 py-1.5 hover:text-foreground"><RotateCcw className="h-3 w-3" />Restaurar dados originais</button>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 overflow-x-auto border-b border-border bg-background/60 p-3 backdrop-blur-lg lg:hidden">
          <img src={logo.url} alt="MedRadius" className="h-6 shrink-0" />
          {slides.map((s, n) => (
            <button key={s.id} onClick={() => go(n)} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold", n === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>{s.label}</button>
          ))}
        </div>
        <div key={i} className="flex-1 p-6 animate-in fade-in slide-in-from-right-6 duration-500 md:p-8 xl:p-10">
          <S />
        </div>
        <div className="flex items-center justify-between border-t border-border bg-background/60 px-6 py-4 backdrop-blur-lg md:px-10">
          <button onClick={() => go(i - 1)} className="glass flex items-center gap-1 px-4 py-2 text-sm font-medium hover:text-primary"><ChevronLeft className="h-4 w-4" />Anterior</button>
          <div className="flex gap-2">
            {slides.map((s, n) => (
              <button key={s.id} aria-label={s.label} onClick={() => go(n)} className={cn("h-2 rounded-full transition-all", n === i ? "w-8 bg-primary" : "w-2 bg-muted-foreground/40")} />
            ))}
          </div>
          <button onClick={() => go(i + 1)} className="glass flex items-center gap-1 px-4 py-2 text-sm font-medium hover:text-primary">Próxima<ChevronRight className="h-4 w-4" /></button>
        </div>
      </main>
    </div>
  );
}
