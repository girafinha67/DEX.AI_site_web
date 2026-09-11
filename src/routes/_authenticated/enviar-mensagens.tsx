import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, MessageSquare, Send, SkipForward } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { LeadCard } from "@/components/app/LeadCard";
import {
  applyLeadFilters,
  EMPTY_FILTERS,
  LeadFilterBar,
  type LeadFilterState,
} from "@/components/app/LeadFilters";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLeads, useRegisterContact, useTemplates } from "@/hooks/useProsviaData";
import { checkSendEligibility } from "@/lib/contacts.functions";
import { renderTemplate, whatsappLink } from "@/lib/prosvia";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/enviar-mensagens")({
  head: () => ({
    meta: [
      { title: "Enviar Mensagens — DEX.AI" },
      {
        name: "description",
        content: "Envie mensagens uma empresa por vez, com confirmação manual em cada contato.",
      },
      { property: "og:title", content: "Enviar Mensagens — DEX.AI" },
      { property: "og:description", content: "Contato individual, sempre com sua confirmação." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SendPage,
});

function SendPage() {
  const { data: leads = [] } = useLeads();
  const { data: templates = [] } = useTemplates();
  const registerContact = useRegisterContact();

  const [step, setStep] = useState<1 | 2>(1);
  const [filters, setFilters] = useState<LeadFilterState>(EMPTY_FILTERS);
  const [queue, setQueue] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState<string[]>([]);

  const matching = useMemo(
    () => applyLeadFilters(leads, filters).filter((l) => !l.contacted),
    [leads, filters],
  );
  const excluded = leads.length - matching.length;

  const queueLeads = queue.map((id) => leads.find((l) => l.id === id)).filter(Boolean) as typeof leads;
  const current = queueLeads[index];
  const rendered = current ? renderTemplate(message, current) : "";

  function continueToStep2() {
    if (matching.length === 0) {
      toast.error("Nenhum lead corresponde aos filtros");
      return;
    }
    setQueue(matching.map((l) => l.id));
    setIndex(0);
    setDone([]);
    setStep(2);
  }

  function pickTemplate(id: string, body: string) {
    setTemplateId(id);
    setMessage(body);
  }

  const [checking, setChecking] = useState(false);

  async function sendCurrent() {
    if (!current) return;
    if (!rendered.trim()) {
      toast.error("Escreva ou escolha uma mensagem");
      return;
    }
    setChecking(true);
    try {
      const check = await checkSendEligibility({ data: { leadId: current.id } });
      if (!check.allowed) {
        toast.error(check.reason ?? "Envio bloqueado pelas regras de envio");
        return;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível validar o envio");
      return;
    } finally {
      setChecking(false);
    }
    window.open(whatsappLink(current.phone, rendered), "_blank", "noopener");
    registerContact.mutate(
      { lead: current, templateId, content: rendered },
      {
        onSuccess: () => {
          setDone((d) => [...d, current.id]);
          setIndex((i) => i + 1);
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Enviar Mensagens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          O envio é sempre um lead por vez, com a sua confirmação. Nunca em massa.
        </p>
      </div>

      <div className="card-surface flex items-center gap-3 p-3 text-sm">
        {[
          { n: 1, label: "Selecionar leads" },
          { n: 2, label: "Escolher mensagem" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            {i > 0 && <ArrowRight className="size-4 text-muted-foreground" />}
            <button
              type="button"
              onClick={() => s.n === 1 && setStep(1)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 font-medium transition",
                step === s.n
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-xs",
                  step === s.n ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {s.n}
              </span>
              {s.label}
            </button>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <LeadFilterBar
            leads={leads}
            value={filters}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_FILTERS)}
          />
          <div className="card-surface space-y-1 p-4 text-sm">
            <p className="font-semibold">{matching.length} leads correspondem aos filtros</p>
            <p className="text-muted-foreground">
              {excluded} fora dos critérios ou já contatados
            </p>
          </div>
          <div className="grid gap-3">
            {matching.slice(0, 20).map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
          <Button className="glow-sm" onClick={continueToStep2} disabled={matching.length === 0}>
            Continuar com {matching.length} leads <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="card-surface flex flex-col items-center px-6 py-10 text-center">
              <MessageSquare className="size-8 text-muted-foreground" />
              <h2 className="mt-3 text-sm font-semibold">Nenhum modelo disponível</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Crie um modelo ou escreva a mensagem manualmente abaixo.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/mensagens">Criar modelo</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pickTemplate(t.id, t.body)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    templateId === t.id
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}

          <div className="card-surface space-y-2 p-4">
            <p className="text-sm font-semibold">Mensagem</p>
            <Textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Olá, {{empresa}}! ..."
            />
          </div>

          {current ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Lead {index + 1} de {queueLeads.length} · {done.length} enviados
              </p>
              <LeadCard lead={current} />
              <div className="card-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pré-visualização
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{rendered || "—"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="glow-sm" onClick={sendCurrent} disabled={registerContact.isPending || checking}>
                    <Send className="size-4" /> Abrir WhatsApp e confirmar envio
                  </Button>
                  <Button variant="outline" onClick={() => setIndex((i) => i + 1)}>
                    <SkipForward className="size-4" /> Pular este lead
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-surface flex flex-col items-center px-6 py-10 text-center">
              <Check className="size-8 text-success" />
              <h2 className="mt-3 text-sm font-semibold">Fila concluída</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {done.length} contatos registrados no histórico.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setStep(1)}>
                Selecionar outros leads
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
