import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search, SearchX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { LeadCard } from "@/components/app/LeadCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeads, useSaveLead, useSearches } from "@/hooks/useProsviaData";
import { searchBusinesses, type SearchResult } from "@/lib/places.functions";
import { BR_STATES, NICHE_SUGGESTIONS } from "@/lib/prosvia";

export const Route = createFileRoute("/_authenticated/procurar-clientes")({
  validateSearch: (search: Record<string, unknown>) => ({
    niche: typeof search['niche'] === "string" ? search['niche'] : "",
    city: typeof search['city'] === "string" ? search['city'] : "",
    state: typeof search['state'] === "string" ? search['state'] : "SP",
    neighborhood: typeof search['neighborhood'] === "string" ? search['neighborhood'] : "",
    run: search['run'] === true || search['run'] === "true",
  }),
  head: () => ({
    meta: [
      { title: "Procurar Clientes — DEX.AI" },
      {
        name: "description",
        content: "Busque estabelecimentos reais por nicho, cidade e bairro com telefone.",
      },
      { property: "og:title", content: "Procurar Clientes — DEX.AI" },
      { property: "og:description", content: "Busca de empresas reais por nicho e região." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const params = Route.useSearch();
  const navigate = useNavigate();
  const [niche, setNiche] = useState(params.niche);
  const [city, setCity] = useState(params.city);
  const [state, setState] = useState(params.state || "SP");
  const [neighborhood, setNeighborhood] = useState(params.neighborhood);
  const [result, setResult] = useState<SearchResult | null>(null);

  const runSearch = useServerFn(searchBusinesses);
  const { data: savedLeads = [] } = useLeads();
  const { data: recent = [] } = useSearches(8);
  const saveLead = useSaveLead();
  const autoRan = useRef(false);

  const mutation = useMutation({
    mutationFn: (input: { niche: string; city: string; state: string; neighborhood?: string }) =>
      runSearch({
        data: {
          niche: input.niche,
          city: input.city,
          state: input.state,
          neighborhood: input.neighborhood || null,
        },
      }),
    onSuccess: (data) => {
      setResult(data);
      if (data.results.length === 0) {
        toast.info("Nenhuma empresa com telefone encontrada nessa busca.");
      } else {
        toast.success(`${data.results.length} empresas com telefone encontradas`);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    if (params.run && params.niche && params.city && !autoRan.current) {
      autoRan.current = true;
      mutation.mutate({
        niche: params.niche,
        city: params.city,
        state: params.state,
        neighborhood: params.neighborhood,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.run, params.niche, params.city]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!niche.trim() || !city.trim()) {
      toast.error("Informe o nicho e a cidade");
      return;
    }
    mutation.mutate({ niche: niche.trim(), city: city.trim(), state, neighborhood: neighborhood.trim() });
  }

  const savedPlaceIds = new Set(savedLeads.map((l) => l.place_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Procurar Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Só entram na lista estabelecimentos com telefone. Quem não tem site aparece no topo.
        </p>
      </div>

      <form onSubmit={submit} className="card-surface space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="niche">Nicho</Label>
            <Input
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Barbearias"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Campinas"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger>
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {BR_STATES.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="neighborhood">Bairro (opcional)</Label>
            <Input
              id="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Cambuí"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {NICHE_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setNiche(s)}
              className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>

        <Button type="submit" className="glow-sm w-full sm:w-auto" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          Buscar empresas
        </Button>
      </form>

      {result && result.results.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {result.results.length} empresas com telefone
              {result.without_phone > 0 && ` · ${result.without_phone} descartadas sem telefone`}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/meus-leads">Ver minha base</Link>
            </Button>
          </div>
          <div className="grid gap-3">
            {result.results.map((lead) => (
              <LeadCard
                key={lead.place_id}
                lead={lead}
                saved={savedPlaceIds.has(lead.place_id)}
                onSave={() => saveLead.mutate(lead)}
              />
            ))}
          </div>
        </div>
      )}

      {!result && !mutation.isPending && (
        <div className="card-surface flex flex-col items-center px-6 py-12 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <h2 className="mt-3 text-sm font-semibold">Nenhuma busca ainda</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Escolha um nicho e uma cidade acima para encontrar empresas reais que ainda não têm site.
          </p>
        </div>
      )}

      <div className="card-surface p-4">
        <h2 className="text-sm font-semibold">Pesquisas recentes</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Suas buscas aparecerão aqui.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {recent.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 py-2.5 text-left text-sm transition hover:text-primary"
                  onClick={() => {
                    setNiche(s.niche);
                    setCity(s.city);
                    setState(s.state);
                    setNeighborhood(s.neighborhood ?? "");
                    navigate({
                      to: "/procurar-clientes",
                      search: {
                        niche: s.niche,
                        city: s.city,
                        state: s.state,
                        neighborhood: s.neighborhood ?? "",
                        run: false,
                      },
                    });
                    mutation.mutate({
                      niche: s.niche,
                      city: s.city,
                      state: s.state,
                      neighborhood: s.neighborhood ?? "",
                    });
                  }}
                >
                  <Search className="size-4 text-muted-foreground" />
                  <span className="truncate">
                    {s.niche} · {s.city}/{s.state}
                    {s.neighborhood ? ` · ${s.neighborhood}` : ""}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {s.results_count} resultados
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
