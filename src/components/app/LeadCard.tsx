import { Check, ExternalLink, Globe, GlobeLock, Phone, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type LeadCardData = {
  id?: string;
  name: string;
  category?: string | null;
  niche?: string | null;
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  phone: string;
  rating?: number | null;
  reviews_count?: number | null;
  website?: string | null;
  maps_url?: string | null;
  opportunity?: string | null;
  opportunity_score?: number | null;
  contacted?: boolean | null;
  is_favorite?: boolean | null;
};

export function OpportunityBadge({ level }: { level: string | null | undefined }) {
  if (level === "alta")
    return (
      <Badge className="border-alert/40 bg-alert/15 text-alert hover:bg-alert/15">🔥 Alta</Badge>
    );
  if (level === "media")
    return (
      <Badge className="border-warning/40 bg-warning/15 text-warning hover:bg-warning/15">
        🟡 Média
      </Badge>
    );
  return (
    <Badge className="border-border bg-muted text-muted-foreground hover:bg-muted">Baixa</Badge>
  );
}

export function LeadCard({
  lead,
  selected,
  onToggleSelect,
  onSave,
  saved,
  onDelete,
  onToggleFavorite,
  footer,
}: {
  lead: LeadCardData;
  selected?: boolean;
  onToggleSelect?: () => void;
  onSave?: () => void;
  saved?: boolean;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <article className="card-surface p-4 transition hover:border-primary/40">
      <div className="flex items-start gap-3">
        {onToggleSelect && (
          <Checkbox
            checked={!!selected}
            onCheckedChange={onToggleSelect}
            aria-label={`Selecionar ${lead.name}`}
            className="mt-1"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{lead.name}</h3>
            <OpportunityBadge level={lead.opportunity} />
            {lead.website ? (
              <Badge className="border-border bg-muted text-muted-foreground hover:bg-muted">
                <Globe className="mr-1 size-3" /> Possui site
              </Badge>
            ) : (
              <Badge className="border-alert/40 bg-alert/15 text-alert hover:bg-alert/15">
                <GlobeLock className="mr-1 size-3" /> Sem site
              </Badge>
            )}
            {lead.contacted && (
              <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">
                Contatado
              </Badge>
            )}
          </div>

          <p className="mt-1 truncate text-xs text-muted-foreground">
            {[lead.category || lead.niche, [lead.city, lead.state].filter(Boolean).join("/"), lead.neighborhood]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="size-3.5 text-primary" /> {lead.phone}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Star className="size-3.5 text-warning" />
              {lead.rating != null ? String(lead.rating).replace(".", ",") : "—"}
              <span>({lead.reviews_count ?? 0} avaliações)</span>
            </span>
            {lead.opportunity_score != null && (
              <span className="text-muted-foreground">Score {lead.opportunity_score}</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {lead.maps_url && (
              <Button asChild variant="outline" size="sm">
                <a href={lead.maps_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5" /> Google Maps
                </a>
              </Button>
            )}
            {onSave && (
              <Button
                size="sm"
                variant={saved ? "outline" : "default"}
                className={cn(
                  saved
                    ? "border-success/40 bg-success/15 text-success hover:bg-success/20"
                    : "glow-sm",
                )}
                onClick={onSave}
                disabled={saved}
              >
                {saved ? (
                  <>
                    <Check className="size-3.5" /> Salvo
                  </>
                ) : (
                  "Salvar lead"
                )}
              </Button>
            )}
            {onToggleFavorite && (
              <Button
                size="sm"
                variant="outline"
                onClick={onToggleFavorite}
                className={cn(lead.is_favorite && "border-warning/40 text-warning")}
              >
                <Star className="size-3.5" /> {lead.is_favorite ? "Favorito" : "Favoritar"}
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={onDelete}>
                <Trash2 className="size-3.5" />
              </Button>
            )}
            {footer}
          </div>
        </div>
      </div>
    </article>
  );
}
