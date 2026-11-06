export type Tower = "suporte" | "negocios" | "automacao";
export type PStatus = "andamento" | "aguardando" | "entregue" | "cancelado";

export interface Project {
  id: string;
  name: string;
  detail: string;
  tower: Tower;
  status: PStatus;
  critical: boolean;
  owner?: string;
  score?: number | null;
}

export const TOWERS: Record<Tower, string> = {
  suporte: "Governança e Infraestrutura",
  negocios: "Negócios de TI",
  automacao: "Automação & BI",
};

/** Ordem de prioridade do PMO: em andamento → aguardando → entregue → cancelado */
export const STATUS_ORDER: PStatus[] = ["andamento", "aguardando", "entregue", "cancelado"];

export const STATUS_LABEL: Record<PStatus, string> = {
  andamento: "Em andamento",
  aguardando: "Aguardando",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function sortProjects(list: Project[]): Project[] {
  return [...list].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      Number(b.critical) - Number(a.critical) ||
      (b.score ?? 0) - (a.score ?? 0),
  );
}

/** Fonte: planilha Visão Geral (PMO). Status original da planilha fica em `detail`. */
export const DEFAULT_PROJECTS: Project[] = [
  {
    "id": "x1",
    "name": "Atualização das versões do Smart",
    "detail": "Status não informado",
    "owner": "Iuri rolin",
    "score": 12.5,
    "tower": "negocios",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x2",
    "name": "Reformulação de preço médio",
    "detail": "Em andamento",
    "owner": "Iuri rolin",
    "score": 7.09,
    "tower": "negocios",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x3",
    "name": "Uber Assistencial - Camareira",
    "detail": "Parcialmente entregue",
    "owner": "Johnatan nobre",
    "score": 6.25,
    "tower": "negocios",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x4",
    "name": "TEF - Transferência Eletrônica de Fundos",
    "detail": "Em homologação",
    "owner": "Johnatan nobre",
    "score": 6.25,
    "tower": "negocios",
    "status": "andamento",
    "critical": true
  },
  {
    "id": "x5",
    "name": "Reimplantação Internação",
    "detail": "Em andamento",
    "owner": "Iuri rolin",
    "score": 8.86,
    "tower": "negocios",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x6",
    "name": "Certificado Digital",
    "detail": "Em andamento",
    "owner": "Iuri rolin",
    "score": 5.31,
    "tower": "negocios",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x7",
    "name": "Plataforma Tuotempo",
    "detail": "Em andamento",
    "owner": "Johnatan nobre",
    "score": 5.0,
    "tower": "negocios",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x8",
    "name": "AnesTech - Ficha anestésica digital",
    "detail": "Em andamento",
    "owner": "Johnatan nobre",
    "score": 5.19,
    "tower": "negocios",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x9",
    "name": "Atendimento Inteligente",
    "detail": "Concluido",
    "owner": "Johnatan nobre",
    "score": 5.36,
    "tower": "negocios",
    "status": "entregue",
    "critical": false
  },
  {
    "id": "x10",
    "name": "RFP Central telefonica",
    "detail": "Em andamento",
    "owner": "",
    "score": 4.0,
    "tower": "negocios",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x11",
    "name": "RFP sistema de BPM",
    "detail": "Em andamento",
    "owner": "",
    "score": 4.0,
    "tower": "negocios",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x12",
    "name": "Integração Smart X GTPlan",
    "detail": "Aguardando",
    "owner": "",
    "score": 6.25,
    "tower": "negocios",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x13",
    "name": "Controle de Acesso - Smart",
    "detail": "Aguardando",
    "owner": "Iuri rolin",
    "score": 6.25,
    "tower": "negocios",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x14",
    "name": "Centro de Infusão",
    "detail": "Aguardando",
    "owner": "Iuri rolin",
    "score": 6.25,
    "tower": "negocios",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x15",
    "name": "Diagnósticos",
    "detail": "Aguardando",
    "owner": "",
    "score": 6.25,
    "tower": "negocios",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x16",
    "name": "Consultórios",
    "detail": "Aguardando",
    "owner": "",
    "score": 6.25,
    "tower": "negocios",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x17",
    "name": "Reestruturação de Suprimentos",
    "detail": "Aguardando",
    "owner": "Iuri rolin",
    "score": 4.0,
    "tower": "negocios",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x18",
    "name": "BI - Eventos Assistenciais",
    "detail": "Em Homologação",
    "owner": "Thiago carnauba",
    "score": 12.5,
    "tower": "automacao",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x19",
    "name": "BI - Produtividade Médica",
    "detail": "Em Homologação",
    "owner": "Rayk",
    "score": 12.5,
    "tower": "automacao",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x20",
    "name": "BI - Painel Epidemológico",
    "detail": "Em Homologação",
    "owner": "Thiago carnauba",
    "score": 10.0,
    "tower": "automacao",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x21",
    "name": "BI - Auditoria de Faturamento e Custos",
    "detail": "Em Homologação",
    "owner": "Thiago carnauba",
    "score": 8.33,
    "tower": "automacao",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x22",
    "name": "SAT — Sistema de Avaliação do Atendimento",
    "detail": "Aguardando equipamento",
    "owner": "Rayk",
    "score": 7.5,
    "tower": "automacao",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x23",
    "name": "BI - Taxa de Ocupação",
    "detail": "Concluido",
    "owner": "Thiago carnauba",
    "score": 6.67,
    "tower": "automacao",
    "status": "entregue",
    "critical": false
  },
  {
    "id": "x24",
    "name": "Reestruturação de relatórios",
    "detail": "Aguardando",
    "owner": "Thiago carnauba",
    "score": 4.5,
    "tower": "automacao",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x25",
    "name": "BI - Medicamentos ONCOH",
    "detail": "Em Homologação",
    "owner": "Thiago carnauba",
    "score": 4.0,
    "tower": "automacao",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x26",
    "name": "Sistema NEP",
    "detail": "Em andamento",
    "owner": "Rayk",
    "score": 4.0,
    "tower": "automacao",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x27",
    "name": "BI - Gestão de Filas",
    "detail": "Concluido",
    "owner": "Rayk e Thiago",
    "score": 4.0,
    "tower": "automacao",
    "status": "entregue",
    "critical": false
  },
  {
    "id": "x28",
    "name": "Gestão de Agendamento",
    "detail": "Em andamento",
    "owner": "Rayk",
    "score": 3.92,
    "tower": "automacao",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x29",
    "name": "Dashboard Call Center",
    "detail": "Em andamento",
    "owner": "Thiago carnauba",
    "score": 2.72,
    "tower": "automacao",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x30",
    "name": "Pacientes Duplicados",
    "detail": "Aguardando",
    "owner": "Thiago carnauba",
    "score": 6.84,
    "tower": "automacao",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x31",
    "name": "Migração para o Novo Portal Unimed",
    "detail": "Aguardando",
    "owner": "Thiago carnauba",
    "score": 5.66,
    "tower": "automacao",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x32",
    "name": "Autorização CASSI",
    "detail": "Aguardando",
    "owner": "Thiago carnauba",
    "score": 3.82,
    "tower": "automacao",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x33",
    "name": "Autorização AMIL",
    "detail": "Aguardando",
    "owner": "Thiago carnauba",
    "score": 3.28,
    "tower": "automacao",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x34",
    "name": "Agendas Canceladas",
    "detail": "Aguardando",
    "owner": "Thiago carnauba",
    "score": 2.86,
    "tower": "automacao",
    "status": "aguardando",
    "critical": false
  },
  {
    "id": "x35",
    "name": "Implantaçao SPARK",
    "detail": "Em andamento",
    "owner": "Julio andrada",
    "score": 3.33,
    "tower": "suporte",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x36",
    "name": "PACs e Korus",
    "detail": "Em andamento",
    "owner": "Julio andrada",
    "score": 11.3,
    "tower": "suporte",
    "status": "andamento",
    "critical": true
  },
  {
    "id": "x37",
    "name": "Migração BD do SMART",
    "detail": "Em andamento",
    "owner": "Diego",
    "score": null,
    "tower": "suporte",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x38",
    "name": "Monitoramento Infra. Rede",
    "detail": "Em andamento",
    "owner": "Diego/João",
    "score": 8.44,
    "tower": "suporte",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x39",
    "name": "Diagnostico de Assessment",
    "detail": "Em andamento",
    "owner": "",
    "score": 6.21,
    "tower": "suporte",
    "status": "andamento",
    "critical": false
  },
  {
    "id": "x40",
    "name": "Wi-fi Corporativa",
    "detail": "Concluido",
    "owner": "Diego/Jorge",
    "score": null,
    "tower": "suporte",
    "status": "entregue",
    "critical": false
  },
  {
    "id": "x41",
    "name": "Migração E-mail",
    "detail": "Concluido",
    "owner": "Diego/João",
    "score": null,
    "tower": "suporte",
    "status": "entregue",
    "critical": false
  }
];
