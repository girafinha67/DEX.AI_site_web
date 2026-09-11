export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blocked_numbers: {
        Row: {
          created_at: string
          id: string
          phone: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          phone: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_history: {
        Row: {
          channel: string
          company_name: string
          content: string
          id: string
          lead_id: string | null
          phone: string
          sent_at: string
          status: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          channel?: string
          company_name: string
          content: string
          id?: string
          lead_id?: string | null
          phone: string
          sent_at?: string
          status?: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          company_name?: string
          content?: string
          id?: string
          lead_id?: string | null
          phone?: string
          sent_at?: string
          status?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          category: string
          city: string
          contacted: boolean
          contacted_at: string | null
          created_at: string
          id: string
          is_favorite: boolean
          maps_url: string | null
          name: string
          neighborhood: string | null
          niche: string
          notes: string | null
          opportunity: string
          opportunity_score: number
          phone: string
          place_id: string
          rating: number | null
          reviews_count: number
          state: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          city?: string
          contacted?: boolean
          contacted_at?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean
          maps_url?: string | null
          name: string
          neighborhood?: string | null
          niche?: string
          notes?: string | null
          opportunity?: string
          opportunity_score?: number
          phone: string
          place_id: string
          rating?: number | null
          reviews_count?: number
          state?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string
          contacted?: boolean
          contacted_at?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean
          maps_url?: string | null
          name?: string
          neighborhood?: string | null
          niche?: string
          notes?: string | null
          opportunity?: string
          opportunity_score?: number
          phone?: string
          place_id?: string
          rating?: number | null
          reviews_count?: number
          state?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      list_leads: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          list_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          list_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          list_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_leads_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          tag: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          tag?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          tag?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          notify_email: boolean
          notify_limits: boolean
          notify_product: boolean
          plan: string
          updated_at: string
          workspace_name: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          notify_email?: boolean
          notify_limits?: boolean
          notify_product?: boolean
          plan?: string
          updated_at?: string
          workspace_name?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notify_email?: boolean
          notify_limits?: boolean
          notify_product?: boolean
          plan?: string
          updated_at?: string
          workspace_name?: string
        }
        Relationships: []
      }
      searches: {
        Row: {
          city: string
          created_at: string
          id: string
          neighborhood: string | null
          niche: string
          results_count: number
          state: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          neighborhood?: string | null
          niche: string
          results_count?: number
          state: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          neighborhood?: string | null
          niche?: string
          results_count?: number
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      send_rules: {
        Row: {
          allowed_from: string
          allowed_to: string
          created_at: string
          daily_limit: number
          min_interval_days: number
          retention_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_from?: string
          allowed_to?: string
          created_at?: string
          daily_limit?: number
          min_interval_days?: number
          retention_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_from?: string
          allowed_to?: string
          created_at?: string
          daily_limit?: number
          min_interval_days?: number
          retention_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
