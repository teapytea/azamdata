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
      conversations: {
        Row: {
          condition: string | null
          created_at: string
          id: string
          session_id: string
          store_id: string | null
          store_name: string | null
          store_slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          condition?: string | null
          created_at?: string
          id?: string
          session_id: string
          store_id?: string | null
          store_name?: string | null
          store_slug?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          condition?: string | null
          created_at?: string
          id?: string
          session_id?: string
          store_id?: string | null
          store_name?: string | null
          store_slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      experiment_sessions: {
        Row: {
          assigned_at: string
          condition: string
          conversation_id: string
          explanation_type: string
          familiarity: string | null
          id: string
          llm_model: string | null
          prompt_name: string | null
          prompt_version: string | null
          session_id: string
          store_id: string | null
          store_name: string | null
          store_slug: string | null
        }
        Insert: {
          assigned_at?: string
          condition: string
          conversation_id: string
          explanation_type: string
          familiarity?: string | null
          id?: string
          llm_model?: string | null
          prompt_name?: string | null
          prompt_version?: string | null
          session_id: string
          store_id?: string | null
          store_name?: string | null
          store_slug?: string | null
        }
        Update: {
          assigned_at?: string
          condition?: string
          conversation_id?: string
          explanation_type?: string
          familiarity?: string | null
          id?: string
          llm_model?: string | null
          prompt_name?: string | null
          prompt_version?: string | null
          session_id?: string
          store_id?: string | null
          store_name?: string | null
          store_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          answers: Json
          conversation_id: string
          created_at: string
          explanation_type: string | null
          id: string
          model_version: string | null
          session_id: string
          store_id: string | null
          store_name: string | null
          store_slug: string | null
        }
        Insert: {
          answers: Json
          conversation_id: string
          created_at?: string
          explanation_type?: string | null
          id?: string
          model_version?: string | null
          session_id: string
          store_id?: string | null
          store_name?: string | null
          store_slug?: string | null
        }
        Update: {
          answers?: Json
          conversation_id?: string
          created_at?: string
          explanation_type?: string | null
          id?: string
          model_version?: string | null
          session_id?: string
          store_id?: string | null
          store_name?: string | null
          store_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          main_accords: string | null
          meaning: string | null
          olfactory_family: string | null
          product_id: string
          product_name: string
          revolutionize: string | null
          visual_note: string | null
          visual_note_alt: string | null
        }
        Insert: {
          main_accords?: string | null
          meaning?: string | null
          olfactory_family?: string | null
          product_id: string
          product_name: string
          revolutionize?: string | null
          visual_note?: string | null
          visual_note_alt?: string | null
        }
        Update: {
          main_accords?: string | null
          meaning?: string | null
          olfactory_family?: string | null
          product_id?: string
          product_name?: string
          revolutionize?: string | null
          visual_note?: string | null
          visual_note_alt?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          availability_snapshot: Json
          batch_index: number
          candidate_products_before_store_filter: Json
          conversation_id: string
          created_at: string
          explanation_type: string | null
          explanation_payload: Json | null
          filtered_out_unavailable_products: Json
          id: string
          kg_paths: Json
          llm_model: string | null
          model_version: string | null
          products: Json
          prompt_name: string | null
          prompt_version: string | null
          recommendation_engine: string | null
          recommendations: Json | null
          store_id: string | null
          store_name: string | null
          store_slug: string | null
          summary: string | null
        }
        Insert: {
          availability_snapshot?: Json
          batch_index?: number
          candidate_products_before_store_filter?: Json
          conversation_id: string
          created_at?: string
          explanation_type?: string | null
          explanation_payload?: Json | null
          filtered_out_unavailable_products?: Json
          id?: string
          kg_paths?: Json
          llm_model?: string | null
          model_version?: string | null
          products: Json
          prompt_name?: string | null
          prompt_version?: string | null
          recommendation_engine?: string | null
          recommendations?: Json | null
          store_id?: string | null
          store_name?: string | null
          store_slug?: string | null
          summary?: string | null
        }
        Update: {
          availability_snapshot?: Json
          batch_index?: number
          candidate_products_before_store_filter?: Json
          conversation_id?: string
          created_at?: string
          explanation_type?: string | null
          explanation_payload?: Json | null
          filtered_out_unavailable_products?: Json
          id?: string
          kg_paths?: Json
          llm_model?: string | null
          model_version?: string | null
          products?: Json
          prompt_name?: string | null
          prompt_version?: string | null
          recommendation_engine?: string | null
          recommendations?: Json | null
          store_id?: string | null
          store_name?: string | null
          store_slug?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      store_product_availability: {
        Row: {
          availability_status: string
          created_at: string
          last_updated_at: string
          metadata: Json
          product_id: string
          source: string
          stock_qty: number | null
          store_id: string
          updated_at: string
        }
        Insert: {
          availability_status?: string
          created_at?: string
          last_updated_at?: string
          metadata?: Json
          product_id: string
          source?: string
          stock_qty?: number | null
          store_id: string
          updated_at?: string
        }
        Update: {
          availability_status?: string
          created_at?: string
          last_updated_at?: string
          metadata?: Json
          product_id?: string
          source?: string
          stock_qty?: number | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_product_availability_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "store_product_availability_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          metadata: Json
          store_name: string
          store_slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          metadata?: Json
          store_name: string
          store_slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          store_name?: string
          store_slug?: string
          updated_at?: string
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
