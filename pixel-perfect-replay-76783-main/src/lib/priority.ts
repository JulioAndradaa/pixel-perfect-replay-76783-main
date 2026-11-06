import type { Project } from "@/lib/pmo-data";

export type PriorityQuadrant = "priorizar" | "acelerar" | "acompanhar" | "reduzir";

export const PRIORITY_META: Record<PriorityQuadrant, { label: string; description: string; color: string; chip: string }> = {
  priorizar: {
    label: "Priorizar",
    description: "Alta urgência e maior score para foco executivo.",
    color: "text-destructive",
    chip: "border-destructive/40 bg-destructive/10",
  },
  acelerar: {
    label: "Acelerar",
    description: "Projetos relevantes com ação imediata.",
    color: "text-warning",
    chip: "border-warning/40 bg-warning/10",
  },
  acompanhar: {
    label: "Acompanhar",
    description: "Observação com potencial de ganho de impacto.",
    color: "text-primary",
    chip: "border-primary/40 bg-primary/10",
  },
  reduzir: {
    label: "Reduzir foco",
    description: "Baixo impacto atual ou concluidos.",
    color: "text-muted-foreground",
    chip: "border-border bg-secondary/30",
  },
};

export function getPriorityQuadrant(project: Project): PriorityQuadrant {
  const score = Number(project.score ?? 0);
  const urgentStates = ["andamento", "aguardando"] as const;
  const activeUrgency = urgentStates.includes(project.status as "andamento" | "aguardando") ? 2 : 0;
  const boost = project.critical ? 2 : 0;
  const total = score + activeUrgency + boost;

  if (total >= 10 || (project.critical && score >= 6 && project.status !== "entregue")) return "priorizar";
  if (total >= 7 || (score >= 6 && project.status === "andamento")) return "acelerar";
  if (total >= 4 || score >= 4) return "acompanhar";
  return "reduzir";
}
