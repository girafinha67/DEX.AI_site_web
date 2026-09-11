export const BR_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export const NICHE_SUGGESTIONS = [
  "Barbearias",
  "Academias",
  "Restaurantes",
  "Pet Shops",
  "Clínicas odontológicas",
  "Imobiliárias",
  "Salões de beleza",
  "Oficinas mecânicas",
];

export const OPPORTUNITY_LABEL: Record<string, string> = {
  alta: "🔥 Alta",
  media: "🟡 Média",
  baixa: "Baixa",
};

export type PlanId = "free" | "pro" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  monthly: number;
  yearly: number;
  tagline: string;
  limits: {
    searchesPerDay: number;
    savedLeads: number;
    messagesPerDay: number;
    templates: number;
    users: number;
    lists: number;
  };
  features: { label: string; included: boolean }[];
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    tagline: "Para testar o processo e fechar o primeiro site.",
    limits: {
      searchesPerDay: 5,
      savedLeads: 100,
      messagesPerDay: 15,
      templates: 3,
      users: 1,
      lists: 2,
    },
    features: [
      { label: "Exportar leads", included: false },
      { label: "WhatsApp Cloud API", included: false },
      { label: "Equipe", included: false },
      { label: "Acesso via API", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 97,
    yearly: 931,
    tagline: "Para quem prospecta todos os dias.",
    limits: {
      searchesPerDay: 40,
      savedLeads: 3000,
      messagesPerDay: 150,
      templates: 25,
      users: 2,
      lists: 20,
    },
    features: [
      { label: "Exportar leads", included: true },
      { label: "WhatsApp Cloud API", included: true },
      { label: "Equipe", included: false },
      { label: "Acesso via API", included: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    monthly: 247,
    yearly: 2371,
    tagline: "Para agências com time comercial.",
    limits: {
      searchesPerDay: 200,
      savedLeads: 25000,
      messagesPerDay: 600,
      templates: 200,
      users: 10,
      lists: 200,
    },
    features: [
      { label: "Exportar leads", included: true },
      { label: "WhatsApp Cloud API", included: true },
      { label: "Equipe", included: true },
      { label: "Acesso via API", included: true },
    ],
  },
];

export function planById(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]!;
}

export const TEMPLATE_VARIABLES = [
  { token: "{{empresa}}", description: "Nome do estabelecimento" },
  { token: "{{nicho}}", description: "Nicho / categoria" },
  { token: "{{cidade}}", description: "Cidade" },
  { token: "{{estado}}", description: "Estado" },
  { token: "{{telefone}}", description: "Telefone" },
  { token: "{{nota}}", description: "Nota do Google" },
  { token: "{{avaliacoes}}", description: "Quantidade de avaliações" },
];

export type LeadLike = {
  name: string;
  niche?: string | null;
  category?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
};

export function renderTemplate(body: string, lead: LeadLike) {
  return body
    .replaceAll("{{empresa}}", lead.name ?? "")
    .replaceAll("{{nicho}}", lead.niche || lead.category || "")
    .replaceAll("{{cidade}}", lead.city ?? "")
    .replaceAll("{{estado}}", lead.state ?? "")
    .replaceAll("{{telefone}}", lead.phone ?? "")
    .replaceAll("{{nota}}", lead.rating != null ? String(lead.rating).replace(".", ",") : "—")
    .replaceAll("{{avaliacoes}}", String(lead.reviews_count ?? 0));
}

export function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export const DAILY_TIPS = [
  "Empresas sem site e com nota acima de 4,5 são as melhores portas: elas já têm reputação, só falta presença digital.",
  "Ligue antes de mandar mensagem quando o lead tiver mais de 300 avaliações — o dono costuma atender.",
  "Fale do bairro na primeira frase. Prova de que você pesquisou de verdade.",
  "Mande o link de um site que você já fez no mesmo nicho. Prova social vale mais que preço.",
  "Prospectar 10 leads por dia com mensagem personalizada bate 100 disparos genéricos.",
];
