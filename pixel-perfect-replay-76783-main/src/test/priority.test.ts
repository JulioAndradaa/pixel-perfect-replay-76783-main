import { describe, expect, it } from "vitest";

import type { Project } from "@/lib/pmo-data";
import { getPriorityQuadrant } from "@/lib/priority";

describe("project prioritization", () => {
  it("prioritizes high-score active projects", () => {
    const project: Project = {
      id: "p1",
      name: "TEF",
      detail: "Em andamento",
      tower: "negocios",
      status: "andamento",
      critical: true,
      score: 9,
    };

    expect(getPriorityQuadrant(project)).toBe("priorizar");
  });

  it("keeps low-score delivered projects out of the priority lane", () => {
    const project: Project = {
      id: "p2",
      name: "Wi-fi Corporativa",
      detail: "Concluído",
      tower: "suporte",
      status: "entregue",
      critical: false,
      score: 2,
    };

    expect(getPriorityQuadrant(project)).toBe("reduzir");
  });
});
