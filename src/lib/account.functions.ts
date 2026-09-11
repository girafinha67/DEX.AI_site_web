import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const exportMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };

    const [profile, sendRules, leads, lists, listLeads, templates, history, searches, blocked] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("send_rules").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("leads").select("*").eq("user_id", userId),
        supabase.from("lists").select("*").eq("user_id", userId),
        supabase.from("list_leads").select("*").eq("user_id", userId),
        supabase.from("message_templates").select("*").eq("user_id", userId),
        supabase.from("contact_history").select("*").eq("user_id", userId),
        supabase.from("searches").select("*").eq("user_id", userId),
        supabase.from("blocked_numbers").select("*").eq("user_id", userId),
      ]);

    return {
      exported_at: new Date().toISOString(),
      profile: profile.data ?? null,
      send_rules: sendRules.data ?? null,
      leads: leads.data ?? [],
      lists: lists.data ?? [],
      list_leads: listLeads.data ?? [],
      message_templates: templates.data ?? [],
      contact_history: history.data ?? [],
      searches: searches.data ?? [],
      blocked_numbers: blocked.data ?? [],
    };
  });

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ confirm: z.literal("EXCLUIR") }).parse(data))
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };

    // Confirma que o token pertence mesmo a este usuário antes de qualquer operação privilegiada.
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user || userData.user.id !== userId) {
      throw new Error("Não foi possível confirmar sua identidade.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    for (const table of [
      "contact_history",
      "list_leads",
      "lists",
      "message_templates",
      "leads",
      "searches",
      "blocked_numbers",
      "send_rules",
    ] as const) {
      const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
      if (error) throw new Error(error.message);
    }
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw new Error(deleteError.message);

    return { deleted: true };
  });
