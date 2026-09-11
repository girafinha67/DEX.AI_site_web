import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { registerContact } from "@/lib/contacts.functions";
import type { Database } from "@/integrations/supabase/types";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type Search = Database["public"]["Tables"]["searches"]["Row"];
export type List = Database["public"]["Tables"]["lists"]["Row"];
export type Template = Database["public"]["Tables"]["message_templates"]["Row"];
export type Contact = Database["public"]["Tables"]["contact_history"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SendRules = Database["public"]["Tables"]["send_rules"]["Row"];

function unwrap<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

function unwrapList<T>(res: { data: T[] | null; error: { message: string } | null }): T[] {
  if (res.error) throw new Error(res.error.message);
  return res.data ?? [];
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      return unwrap(await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle());
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      return unwrap(
        await supabase.from("profiles").update(patch).eq("id", auth.user.id).select("*").single(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Alterações salvas");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSendRules() {
  return useQuery({
    queryKey: ["send_rules"],
    queryFn: async () => unwrap(await supabase.from("send_rules").select("*").maybeSingle()),
  });
}

export function useUpdateSendRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<SendRules>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      return unwrap(
        await supabase
          .from("send_rules")
          .upsert({ user_id: auth.user.id, ...patch })
          .select("*")
          .single(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["send_rules"] });
      toast.success("Regras de envio atualizadas");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () =>
      unwrapList(await supabase.from("leads").select("*").order("created_at", { ascending: false })),
  });
}

export function useSaveLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lead: Omit<LeadInsert, "user_id">) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      return unwrap(
        await supabase
          .from("leads")
          .upsert({ ...lead, user_id: auth.user.id }, { onConflict: "user_id,place_id" })
          .select("*")
          .single(),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<Lead>) =>
      unwrap(await supabase.from("leads").update(patch).eq("id", id).select("*").single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead removido da sua base");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSearches(limit = 12) {
  return useQuery({
    queryKey: ["searches", limit],
    queryFn: async () =>
      unwrapList(
        await supabase
          .from("searches")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit),
      ),
  });
}

export function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: async () =>
      unwrapList(await supabase.from("lists").select("*").order("created_at", { ascending: false })),
  });
}

export function useListLeads() {
  return useQuery({
    queryKey: ["list_leads"],
    queryFn: async () => unwrapList(await supabase.from("list_leads").select("*")),
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description?: string | null; color?: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      return unwrap(
        await supabase
          .from("lists")
          .insert({ ...input, user_id: auth.user.id })
          .select("*")
          .single(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists"] });
      toast.success("Lista criada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lists").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists"] });
      qc.invalidateQueries({ queryKey: ["list_leads"] });
      toast.success("Lista excluída");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAddLeadsToList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, leadIds }: { listId: string; leadIds: string[] }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      const rows = leadIds.map((lead_id) => ({
        user_id: auth.user!.id,
        list_id: listId,
        lead_id,
      }));
      const { error } = await supabase.from("list_leads").upsert(rows, { onConflict: "list_id,lead_id" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list_leads"] });
      toast.success("Leads adicionados à lista");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () =>
      unwrapList(
        await supabase
          .from("message_templates")
          .select("*")
          .order("created_at", { ascending: false }),
      ),
  });
}

export function useSaveTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; title: string; body: string; tag?: string | null }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      if (input.id) {
        return unwrap(
          await supabase
            .from("message_templates")
            .update({ title: input.title, body: input.body, tag: input.tag ?? null })
            .eq("id", input.id)
            .select("*")
            .single(),
        );
      }
      return unwrap(
        await supabase
          .from("message_templates")
          .insert({
            title: input.title,
            body: input.body,
            tag: input.tag ?? null,
            user_id: auth.user.id,
          })
          .select("*")
          .single(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Modelo salvo");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("message_templates").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Modelo excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useContactHistory() {
  return useQuery({
    queryKey: ["contact_history"],
    queryFn: async () =>
      unwrapList(
        await supabase.from("contact_history").select("*").order("sent_at", { ascending: false }),
      ),
  });
}

export function useRegisterContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      lead: Lead;
      templateId: string | null;
      content: string;
      channel?: string;
    }) =>
      registerContact({
        data: {
          leadId: input.lead.id,
          templateId: input.templateId,
          content: input.content,
          ...(input.channel ? { channel: input.channel } : {}),
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact_history"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Contato registrado no histórico");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBlockedNumbers() {
  return useQuery({
    queryKey: ["blocked_numbers"],
    queryFn: async () =>
      unwrapList(
        await supabase.from("blocked_numbers").select("*").order("created_at", { ascending: false }),
      ),
  });
}

export function useBlockNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { phone: string; reason?: string | null }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      return unwrap(
        await supabase
          .from("blocked_numbers")
          .upsert(
            { user_id: auth.user.id, phone: input.phone, reason: input.reason ?? null },
            { onConflict: "user_id,phone" },
          )
          .select("*")
          .single(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocked_numbers"] });
      toast.success("Número adicionado à lista de bloqueio");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUnblockNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blocked_numbers").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blocked_numbers"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}
