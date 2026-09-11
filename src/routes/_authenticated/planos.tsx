import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProfile, useUpdateProfile } from "@/hooks/useProsviaData";
import { PLANS } from "@/lib/prosvia";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/planos")({
  head: () => ({
    meta: [
      { title: "Planos — DEX.AI" },
      { name: "description", content: "Compare limites de pesquisas, leads e mensagens por plano." },
      { property: "og:title", content: "Planos — DEX.AI" },
      { property: "og:description", content: "Escolha o plano ideal para sua prospecção." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlansPage,
});

const LIMIT_ROWS: { key: keyof (typeof PLANS)[number]["limits"]; label: string }[] = [
  { key: "searchesPerDay", label: "Pesquisas por dia" },
  { key: "savedLeads", label: "Leads salvos" },
  { key: "messagesPerDay", label: "Mensagens por dia" },
  { key: "templates", label: "Modelos de mensagem" },
  { key: "users", label: "Usuários" },
  { key: "lists", label: "Listas" },
];

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function PlansPage() {
  const [yearly, setYearly] = useState(false);
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Planos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pague pelo volume de prospecção que você realmente faz.
        </p>
        <div className="mt-5 inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={cn(
              "rounded-full px-4 py-1.5 transition",
              !yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn(
              "rounded-full px-4 py-1.5 transition",
              yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            Anual · 20% off
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const current = (profile?.plan ?? "free") === plan.id;
          const highlight = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className={cn(
                "card-surface flex flex-col p-5",
                highlight && "glow border-primary/50",
              )}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{plan.name}</h2>
                {highlight && (
                  <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">
                    Mais popular
                  </Badge>
                )}
                {current && (
                  <Badge className="border-success/40 bg-success/15 text-success hover:bg-success/15">
                    Seu plano
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight">
                {money(yearly ? Math.round(plan.yearly / 12) : plan.monthly)}
                <span className="text-sm font-medium text-muted-foreground">/mês</span>
              </p>
              {yearly && plan.yearly > 0 && (
                <p className="text-xs text-muted-foreground">
                  {money(plan.yearly)} cobrados por ano
                </p>
              )}

              <ul className="mt-5 space-y-2 text-sm">
                {LIMIT_ROWS.map((row) => (
                  <li key={row.key} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold">
                      {plan.limits[row.key].toLocaleString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>

              <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2">
                    {f.included ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <X className="size-4 text-muted-foreground" />
                    )}
                    <span className={cn(!f.included && "text-muted-foreground")}>{f.label}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn("mt-6", highlight && "glow-sm")}
                variant={current ? "outline" : highlight ? "default" : "secondary"}
                disabled={current || updateProfile.isPending}
                onClick={() =>
                  updateProfile.mutate(
                    { plan: plan.id },
                    { onSuccess: () => toast.success(`Plano ${plan.name} ativado`) },
                  )
                }
              >
                {current ? "Plano atual" : `Escolher ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
