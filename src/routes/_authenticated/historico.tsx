import { createFileRoute, Link } from "@tanstack/react-router";
import { History, Phone, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContactHistory } from "@/hooks/useProsviaData";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de Contatos — DEX.AI" },
      { name: "description", content: "Todos os contatos enviados, empresa por empresa." },
      { property: "og:title", content: "Histórico de Contatos — DEX.AI" },
      { property: "og:description", content: "Registro completo das mensagens enviadas." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { data: history = [] } = useContactHistory();
  const [query, setQuery] = useState("");

  const visible = history.filter((h) =>
    h.company_name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Histórico de Contatos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {history.length} contatos registrados
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por empresa"
          className="pl-9"
        />
      </div>

      {history.length === 0 ? (
        <div className="card-surface flex flex-col items-center px-6 py-12 text-center">
          <History className="size-8 text-muted-foreground" />
          <h2 className="mt-3 text-sm font-semibold">Nenhum contato ainda</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Assim que você enviar a primeira mensagem, ela aparece aqui com data e conteúdo.
          </p>
          <Button asChild className="glow-sm mt-4" size="sm">
            <Link to="/enviar-mensagens">Enviar mensagens</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((h) => (
            <article key={h.id} className="card-surface p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="text-sm font-semibold">{h.company_name}</h3>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="size-3.5" /> {h.phone}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(h.sent_at).toLocaleString("pt-BR")}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{h.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
