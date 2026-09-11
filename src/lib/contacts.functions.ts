import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TIMEZONE = "America/Sao_Paulo";
const BURST_LIMIT = 12;
const BURST_WINDOW_SECONDS = 60;

const contactSchema = z.object({
  leadId: z.string().uuid(),
  templateId: z.string().uuid().nullable().optional(),
  content: z.string().trim().min(1).max(2000),
  channel: z.string().trim().max(30).optional(),
});

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits.slice(2) : digits;
}

function minutesNowInTz() {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const [h, m] = parts.split(":").map((v) => Number(v));
  return (h ?? 0) * 60 + (m ?? 0);
}

function toMinutes(value: string) {
  const [h, m] = value.slice(0, 5).split(":").map((v) => Number(v));
  return (h ?? 0) * 60 + (m ?? 0);
}

export type SendCheck = { allowed: boolean; reason: string | null; remainingToday: number };

type Ctx = { supabase: any; userId: string };

async function evaluate(context: Ctx, leadId: string): Promise<SendCheck & { lead?: any }> {
  const { supabase, userId } = context;

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", userId)
    .maybeSingle();
  if (leadError) throw new Error(leadError.message);
  if (!lead) return { allowed: false, reason: "Lead não encontrado na sua base.", remainingToday: 0 };

  const { data: rules } = await supabase.from("send_rules").select("*").eq("user_id", userId).maybeSingle();
  const dailyLimit = rules?.daily_limit ?? 30;
  const minIntervalDays = rules?.min_interval_days ?? 7;
  const allowedFrom = rules?.allowed_from ?? "09:00";
  const allowedTo = rules?.allowed_to ?? "18:00";

  // (a) telefone bloqueado
  const { data: blocked } = await supabase.from("blocked_numbers").select("phone").eq("user_id", userId);
  const leadDigits = normalizePhone(lead.phone ?? "");
  if ((blocked ?? []).some((b: { phone: string }) => normalizePhone(b.phone) === leadDigits)) {
    return {
      allowed: false,
      reason: "Este telefone está na sua lista de quem não quer receber contato.",
      remainingToday: 0,
      lead,
    };
  }

  // (b) limite diário nas últimas 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: sentCount } = await supabase
    .from("contact_history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("sent_at", since);
  const sent = sentCount ?? 0;
  const remainingToday = Math.max(0, dailyLimit - sent);
  if (sent >= dailyLimit) {
    return {
      allowed: false,
      reason: `Limite diário de ${dailyLimit} mensagens atingido. Tente novamente mais tarde.`,
      remainingToday: 0,
      lead,
    };
  }

  // (c) janela de horário permitida
  const now = minutesNowInTz();
  const fromM = toMinutes(allowedFrom);
  const toM = toMinutes(allowedTo);
  const inWindow = fromM <= toM ? now >= fromM && now <= toM : now >= fromM || now <= toM;
  if (!inWindow) {
    return {
      allowed: false,
      reason: `Fora do horário permitido (${allowedFrom.slice(0, 5)} às ${allowedTo.slice(0, 5)}).`,
      remainingToday,
      lead,
    };
  }

  // (d) intervalo mínimo desde o último contato com este lead
  const { data: lastContact } = await supabase
    .from("contact_history")
    .select("sent_at")
    .eq("user_id", userId)
    .eq("lead_id", leadId)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const lastAt = lastContact?.sent_at ?? lead.contacted_at;
  if (lastAt && minIntervalDays > 0) {
    const days = (Date.now() - new Date(lastAt).getTime()) / 86_400_000;
    if (days < minIntervalDays) {
      const wait = Math.ceil(minIntervalDays - days);
      return {
        allowed: false,
        reason: `Você já contatou esta empresa. Aguarde ${wait} dia(s) para um novo contato.`,
        remainingToday,
        lead,
      };
    }
  }

  // proteção contra rajadas
  const burstSince = new Date(Date.now() - BURST_WINDOW_SECONDS * 1000).toISOString();
  const { count: burstCount } = await supabase
    .from("contact_history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("sent_at", burstSince);
  if ((burstCount ?? 0) >= BURST_LIMIT) {
    return {
      allowed: false,
      reason: "Muitos envios em poucos segundos. Aguarde um instante.",
      remainingToday,
      lead,
    };
  }

  return { allowed: true, reason: null, remainingToday, lead };
}

export const checkSendEligibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ leadId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<SendCheck> => {
    const result = await evaluate(context as Ctx, data.leadId);
    return { allowed: result.allowed, reason: result.reason, remainingToday: result.remainingToday };
  });

export const registerContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;
    const check = await evaluate(ctx, data.leadId);
    if (!check.allowed) throw new Error(check.reason ?? "Envio bloqueado pelas regras de envio.");

    const lead = check.lead;
    const { data: row, error } = await ctx.supabase
      .from("contact_history")
      .insert({
        user_id: ctx.userId,
        lead_id: lead.id,
        template_id: data.templateId ?? null,
        company_name: lead.name,
        phone: lead.phone,
        channel: data.channel ?? "whatsapp",
        content: data.content,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await ctx.supabase
      .from("leads")
      .update({ contacted: true, contacted_at: new Date().toISOString() })
      .eq("id", lead.id)
      .eq("user_id", ctx.userId);

    return { contact: row, remainingToday: Math.max(0, check.remainingToday - 1) };
  });
