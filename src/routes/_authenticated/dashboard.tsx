import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  GlobeLock,
  Lightbulb,
  MessageSquare,
  PhoneOff,
  Search,
  Send,
  Users,
} from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useContactHistory, useLeads, useProfile, useSearches } from "@/hooks/useProsviaData";
import { DAILY_TIPS } from "@/lib/prosvia";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DEX.AI" },
      { name: "description", content: "Acompanhe leads encontrados, empresas sem site e contatos." },
      { property: "og:title", content: "Dashboard — DEX.AI" },
      { property: "og:description", content: "Seus números de prospecção em um só lugar." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = [
  "oklch(0.55 0.24 292)",
  "oklch(0.72 0.18 55)",
  "oklch(0.83 0.16 88)",
  "oklch(0.7 0.17 152)",
  "oklch(0.6 0.13 250)",
];

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tone?: "primary" | "alert" | "success" | "muted" | "warning";
}) {
  const tones: Record<string, string> = {
    primary: "text-primary bg-primary/15",
    alert: "text-alert bg-alert/15",
    success: "text-success bg-success/15",
    warning: "text-warning bg-warning/15",
    muted: "text-muted-foreground bg-muted",
  };
  return (
    <div className="card-surface p-4">
      <span className={`flex size-9 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="size-4" />
      </span>
      <p className="mt-3 text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: leads = [] } = useLeads();
  const { data: searches = [] } = useSearches(8);
  const { data: history = [] } = useContactHistory();

  const firstName = (profile?.full_name || user?.email?.split("@")[0] || "por aqui").split(" ")[0];
  const noSite = leads.filter((l) => !l.website).length;
  const contacted = leads.filter((l) => l.contacted).length;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const lineData = days.map((d) => ({
    day: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    leads: leads.filter((l) => new Date(l.created_at).toDateString() === d.toDateString()).length,
  }));

  const nicheMap = new Map<string, number>();
  leads.forEach((l) => {
    const key = l.niche || l.category || "Outros";
    nicheMap.set(key, (nicheMap.get(key) ?? 0) + 1);
  });
  const nicheData = Array.from(nicheMap, ([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const opp = {
    alta: leads.filter((l) => l.opportunity === "alta").length,
    media: leads.filter((l) => l.opportunity === "media").length,
    baixa: leads.filter((l) => l.opportunity === "baixa").length,
  };
  const oppData = [
    { name: "Alta", value: opp.alta },
    { name: "Média", value: opp.media },
    { name: "Baixa", value: opp.baixa },
  ];
  const highPct = leads.length ? Math.round((opp.alta / leads.length) * 100) : 0;
  const tip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Olá, {firstName}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Veja onde estão as próximas empresas sem site da sua região.
          </p>
        </div>
        <Button asChild className="glow-sm">
          <Link
            to="/procurar-clientes"
            search={{ niche: "", city: "", state: "SP", neighborhood: "", run: false }}
          >
            <Search className="size-4" /> Nova pesquisa
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard label="Leads encontrados" value={leads.length} icon={Users} />
        <MetricCard label="Sem site" value={noSite} icon={GlobeLock} tone="alert" />
        <MetricCard label="Leads contatados" value={contacted} icon={Send} tone="success" />
        <MetricCard
          label="Não contatados"
          value={leads.length - contacted}
          icon={PhoneOff}
          tone="muted"
        />
        <MetricCard
          label="Mensagens enviadas"
          value={history.length}
          icon={MessageSquare}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Leads encontrados nos últimos 7 dias</h2>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis
                  dataKey="day"
                  stroke="oklch(0.68 0.014 285)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke="oklch(0.68 0.014 285)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  allowDecimals={false}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.015 285)",
                    border: "1px solid oklch(0.29 0.016 285)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={3}
                  dot={{ r: 3, fill: CHART_COLORS[0] }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-4">
          <h2 className="text-sm font-semibold">Leads por nicho</h2>
          {nicheData.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">Salve leads para ver a divisão.</p>
          ) : (
            <>
              <div className="mt-2 h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={nicheData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {nicheData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5 text-xs">
                {nicheData.map((n, i) => (
                  <li key={n.name} className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="truncate">{n.name}</span>
                    <span className="ml-auto text-muted-foreground">{n.value}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-4">
          <h2 className="text-sm font-semibold">Oportunidades</h2>
          <div className="relative mt-2 h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={oppData.some((d) => d.value > 0) ? oppData : [{ name: "vazio", value: 1 }]}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {[CHART_COLORS[1], CHART_COLORS[2], "oklch(0.4 0.01 285)"].map((c, i) => (
                    <Cell key={i} fill={c} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold">{highPct}%</span>
              <span className="text-[11px] text-muted-foreground">alta oportunidade</span>
            </div>
          </div>
          <ul className="mt-2 space-y-1.5 text-xs">
            {[
              { label: "Alta", value: opp.alta, color: CHART_COLORS[1] },
              { label: "Média", value: opp.media, color: CHART_COLORS[2] },
              { label: "Baixa", value: opp.baixa, color: "oklch(0.4 0.01 285)" },
            ].map((row) => (
              <li key={row.label} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: row.color }} />
                {row.label}
                <span className="ml-auto text-muted-foreground">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-surface p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Pesquisas recentes</h2>
          {searches.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhuma pesquisa ainda. Comece pela tela Procurar Clientes.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {searches.map((s) => (
                <li key={s.id}>
                  <Link
                    to="/procurar-clientes"
                    search={{
                      niche: s.niche,
                      city: s.city,
                      state: s.state,
                      neighborhood: s.neighborhood ?? "",
                      run: true,
                    }}
                    className="flex items-center gap-3 py-2.5 text-sm transition hover:text-primary"
                  >
                    <Search className="size-4 text-muted-foreground" />
                    <span className="truncate">
                      {s.niche} · {s.city}/{s.state}
                      {s.neighborhood ? ` · ${s.neighborhood}` : ""}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {s.results_count} resultados
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="size-4 text-warning" /> Dica do dia
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{tip}</p>
        </div>
        <div className="card-surface p-4">
          <h2 className="text-sm font-semibold">Próximos passos</h2>
          <div className="mt-3 space-y-2">
            <Link
              to="/procurar-clientes"
              search={{ niche: "", city: "", state: "SP", neighborhood: "", run: false }}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm transition hover:border-primary/40 hover:text-primary"
            >
              Buscar empresas de um novo nicho
              <ArrowRight className="ml-auto size-4" />
            </Link>
            <Link
              to="/mensagens"
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm transition hover:border-primary/40 hover:text-primary"
            >
              Criar um modelo de mensagem
              <ArrowRight className="ml-auto size-4" />
            </Link>
            <Link
              to="/enviar-mensagens"
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm transition hover:border-primary/40 hover:text-primary"
            >
              Enviar mensagens para leads sem site
              <ArrowRight className="ml-auto size-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
