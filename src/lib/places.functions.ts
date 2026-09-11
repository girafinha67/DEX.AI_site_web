import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const searchSchema = z.object({
  niche: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(2),
  neighborhood: z.string().trim().max(80).optional().nullable(),
});

export type LeadCandidate = {
  place_id: string;
  name: string;
  niche: string;
  category: string;
  city: string;
  state: string;
  neighborhood: string | null;
  phone: string;
  rating: number | null;
  reviews_count: number;
  website: string | null;
  address: string | null;
  maps_url: string | null;
  opportunity: "alta" | "media" | "baixa";
  opportunity_score: number;
};

export type SearchResult = {
  results: LeadCandidate[];
  search_id: string | null;
  total_found: number;
  without_phone: number;
};

const DAILY_SEARCH_LIMIT = 40;
const BURST_WINDOW_SECONDS = 20;

function scoreLead(input: {
  website: string | null;
  rating: number | null;
  reviews: number;
}): { opportunity: LeadCandidate["opportunity"]; score: number } {
  let score = 15;
  if (!input.website) score += 45;
  if ((input.rating ?? 0) >= 4) score += 12;
  if (input.reviews >= 100) score += 18;
  else if (input.reviews >= 30) score += 10;
  else if (input.reviews >= 5) score += 4;
  score = Math.min(100, score);
  const opportunity = score >= 60 ? "alta" : score >= 40 ? "media" : "baixa";
  return { opportunity, score };
}

type PlacesApiPlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  googleMapsUri?: string;
  primaryTypeDisplayName?: { text?: string };
};

export const searchBusinesses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => searchSchema.parse(data))
  .handler(async ({ data, context }): Promise<SearchResult> => {
    const apiKey = process.env["GOOGLE_PLACES_API_KEY"];
    if (!apiKey) {
      throw new Error(
        "A chave da API do Google Places ainda não foi configurada. Adicione GOOGLE_PLACES_API_KEY em Configurações do Projeto → Secrets.",
      );
    }

    const supabase = context.supabase;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: dailyCount } = await supabase
      .from("searches")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);

    if ((dailyCount ?? 0) >= DAILY_SEARCH_LIMIT) {
      throw new Error(
        `Você atingiu o limite de ${DAILY_SEARCH_LIMIT} pesquisas nas últimas 24 horas. Tente novamente mais tarde.`,
      );
    }

    const burstSince = new Date(Date.now() - BURST_WINDOW_SECONDS * 1000).toISOString();
    const { count: burstCount } = await supabase
      .from("searches")
      .select("id", { count: "exact", head: true })
      .gte("created_at", burstSince);

    if ((burstCount ?? 0) >= 3) {
      throw new Error("Muitas pesquisas em sequência. Aguarde alguns segundos e tente de novo.");
    }

    const state = data.state.toUpperCase();
    const textQuery = [
      data.niche,
      data.neighborhood ? `em ${data.neighborhood}` : "em",
      `${data.city} - ${state}`,
    ]
      .filter(Boolean)
      .join(" ");

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.nationalPhoneNumber",
          "places.internationalPhoneNumber",
          "places.rating",
          "places.userRatingCount",
          "places.websiteUri",
          "places.googleMapsUri",
          "places.primaryTypeDisplayName",
        ].join(","),
      },
      body: JSON.stringify({
        textQuery,
        languageCode: "pt-BR",
        regionCode: "BR",
        pageSize: 20,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Google Places error", response.status, detail);
      throw new Error("Não foi possível consultar o Google agora. Tente novamente em instantes.");
    }

    const payload = (await response.json()) as { places?: PlacesApiPlace[] };
    const places = payload.places ?? [];

    const results: LeadCandidate[] = [];
    let withoutPhone = 0;

    for (const place of places) {
      const phone = place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? null;
      if (!phone || !place.id) {
        withoutPhone += 1;
        continue;
      }
      const website = place.websiteUri ?? null;
      const reviews = place.userRatingCount ?? 0;
      const rating = typeof place.rating === "number" ? place.rating : null;
      const { opportunity, score } = scoreLead({ website, rating, reviews });

      results.push({
        place_id: place.id,
        name: place.displayName?.text ?? "Sem nome",
        niche: data.niche,
        category: place.primaryTypeDisplayName?.text ?? data.niche,
        city: data.city,
        state,
        neighborhood: data.neighborhood?.trim() || null,
        phone,
        rating,
        reviews_count: reviews,
        website,
        address: place.formattedAddress ?? null,
        maps_url: place.googleMapsUri ?? null,
        opportunity,
        opportunity_score: score,
      });
    }

    results.sort((a, b) => b.opportunity_score - a.opportunity_score);

    const { data: inserted } = await supabase
      .from("searches")
      .insert({
        user_id: context.userId,
        niche: data.niche,
        city: data.city,
        state,
        neighborhood: data.neighborhood?.trim() || null,
        results_count: results.length,
      })
      .select("id")
      .single();

    return {
      results,
      search_id: inserted?.id ?? null,
      total_found: places.length,
      without_phone: withoutPhone,
    };
  });
