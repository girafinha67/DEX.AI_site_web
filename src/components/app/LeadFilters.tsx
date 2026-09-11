import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lead } from "@/hooks/useProsviaData";
import { cn } from "@/lib/utils";

export type LeadFilterState = {
  noSite: boolean;
  hasSite: boolean;
  rating4: boolean;
  reviews100: boolean;
  high: boolean;
  medium: boolean;
  withPhone: boolean;
  notContacted: boolean;
  favorites: boolean;
  city: string;
  niche: string;
};

export const EMPTY_FILTERS: LeadFilterState = {
  noSite: false,
  hasSite: false,
  rating4: false,
  reviews100: false,
  high: false,
  medium: false,
  withPhone: false,
  notContacted: false,
  favorites: false,
  city: "all",
  niche: "all",
};

export function applyLeadFilters(leads: Lead[], f: LeadFilterState) {
  return leads.filter((lead) => {
    if (f.noSite && lead.website) return false;
    if (f.hasSite && !lead.website) return false;
    if (f.rating4 && (lead.rating ?? 0) <= 4) return false;
    if (f.reviews100 && lead.reviews_count < 100) return false;
    if (f.high && lead.opportunity !== "alta") return false;
    if (f.medium && lead.opportunity !== "media") return false;
    if (f.withPhone && !lead.phone) return false;
    if (f.notContacted && lead.contacted) return false;
    if (f.favorites && !lead.is_favorite) return false;
    if (f.city !== "all" && lead.city !== f.city) return false;
    if (f.niche !== "all" && (lead.niche || lead.category) !== f.niche) return false;
    return true;
  });
}

const TOGGLES: { key: keyof LeadFilterState; label: string }[] = [
  { key: "noSite", label: "Sem site" },
  { key: "hasSite", label: "Possui site" },
  { key: "rating4", label: "Nota acima de 4,0" },
  { key: "reviews100", label: "+100 avaliações" },
  { key: "high", label: "🔥 Alta" },
  { key: "medium", label: "🟡 Média" },
  { key: "withPhone", label: "Com telefone" },
  { key: "notContacted", label: "Não contatados" },
  { key: "favorites", label: "⭐ Favoritos" },
];

export function LeadFilterBar({
  leads,
  value,
  onChange,
  onClear,
}: {
  leads: Lead[];
  value: LeadFilterState;
  onChange: (next: LeadFilterState) => void;
  onClear?: () => void;
}) {
  const cities = Array.from(new Set(leads.map((l) => l.city).filter(Boolean))).sort();
  const niches = Array.from(
    new Set(leads.map((l) => l.niche || l.category).filter(Boolean)),
  ).sort();

  return (
    <div className="card-surface flex flex-wrap items-center gap-2 p-3">
      {TOGGLES.map((t) => {
        const active = Boolean(value[t.key]);
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange({ ...value, [t.key]: !active })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              active
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}

      <Select value={value.city} onValueChange={(city) => onChange({ ...value, city })}>
        <SelectTrigger className="h-8 w-[150px] rounded-full text-xs">
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as cidades</SelectItem>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.niche} onValueChange={(niche) => onChange({ ...value, niche })}>
        <SelectTrigger className="h-8 w-[160px] rounded-full text-xs">
          <SelectValue placeholder="Nicho" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os nichos</SelectItem>
          {niches.map((n) => (
            <SelectItem key={n} value={n}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {onClear && (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onClear}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
