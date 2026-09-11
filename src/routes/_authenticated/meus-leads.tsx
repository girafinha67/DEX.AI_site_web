import { createFileRoute, Link } from "@tanstack/react-router";
import { Send, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { LeadCard } from "@/components/app/LeadCard";
import {
  applyLeadFilters,
  EMPTY_FILTERS,
  LeadFilterBar,
  type LeadFilterState,
} from "@/components/app/LeadFilters";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAddLeadsToList,
  useDeleteLead,
  useLeads,
  useLists,
  useUpdateLead,
} from "@/hooks/useProsviaData";

export const Route = createFileRoute("/_authenticated/meus-leads")({
  head: () => ({
    meta: [
      { title: "Meus Leads — DEX.AI" },
      { name: "description", content: "Sua base comercial de empresas com telefone e sem site." },
      { property: "og:title", content: "Meus Leads — DEX.AI" },
      { property: "og:description", content: "Filtre e organize sua base comercial." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyLeads,
});

function MyLeads() {
  const { data: leads = [] } = useLeads();
  const { data: lists = [] } = useLists();
  const [filters, setFilters] = useState<LeadFilterState>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<string[]>([]);
  const [onlySelected, setOnlySelected] = useState(false);
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const addToList = useAddLeadsToList();

  let visible = applyLeadFilters(leads, filters);
  if (onlySelected) visible = visible.filter((l) => selected.includes(l.id));

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Meus Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {leads.length} empresas na sua base comercial
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={onlySelected ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlySelected((v) => !v)}
          >
            Selecionado ({selected.length})
          </Button>
          {selected.length > 0 && lists.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Adicionar à lista
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Escolha a lista</DropdownMenuLabel>
                {lists.map((list) => (
                  <DropdownMenuItem
                    key={list.id}
                    onClick={() => addToList.mutate({ listId: list.id, leadIds: selected })}
                  >
                    {list.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button asChild className="glow-sm" size="sm">
            <Link to="/enviar-mensagens">
              <Send className="size-4" /> Enviar mensagens
            </Link>
          </Button>
        </div>
      </div>

      <LeadFilterBar leads={leads} value={filters} onChange={setFilters} />

      <p className="text-sm text-muted-foreground">
        Exibindo {visible.length} de {leads.length} leads
      </p>

      {leads.length === 0 ? (
        <div className="card-surface flex flex-col items-center px-6 py-12 text-center">
          <Users className="size-8 text-muted-foreground" />
          <h2 className="mt-3 text-sm font-semibold">Sua base está vazia</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Faça uma busca e salve as empresas que valem a pena abordar.
          </p>
          <Button asChild className="glow-sm mt-4" size="sm">
            <Link
              to="/procurar-clientes"
              search={{ niche: "", city: "", state: "SP", neighborhood: "", run: false }}
            >
              Procurar clientes
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              selected={selected.includes(lead.id)}
              onToggleSelect={() => toggle(lead.id)}
              onToggleFavorite={() =>
                updateLead.mutate({ id: lead.id, is_favorite: !lead.is_favorite })
              }
              onDelete={() => deleteLead.mutate(lead.id)}
              footer={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-muted-foreground">
                      Selecionado
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => toggle(lead.id)}>
                      {selected.includes(lead.id) ? "Remover da seleção" : "Adicionar à seleção"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        updateLead.mutate({ id: lead.id, contacted: !lead.contacted })
                      }
                    >
                      {lead.contacted ? "Marcar como não contatado" : "Marcar como contatado"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard?.writeText(lead.phone);
                        toast.success("Telefone copiado");
                      }}
                    >
                      Copiar telefone
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
