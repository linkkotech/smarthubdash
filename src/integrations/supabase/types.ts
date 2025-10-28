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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          admin_email: string
          admin_name: string
          admin_user_id: string | null
          client_type: string
          created_at: string
          document: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          admin_email: string
          admin_name: string
          admin_user_id?: string | null
          client_type: string
          created_at?: string
          document: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          admin_email?: string
          admin_name?: string
          admin_user_id?: string | null
          client_type?: string
          created_at?: string
          document?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          billing_day: number
          client_id: string
          contract_type: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          plan_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          billing_day: number
          client_id: string
          contract_type: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          plan_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          billing_day?: number
          client_id?: string
          contract_type?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          plan_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_contracts_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contracts_plan"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_profiles: {
        Row: {
          active_template_id: string
          client_id: string | null
          content: Json | null
          created_at: string
          id: string
          no_index: boolean | null
          password: string | null
          short_id: string
          slug: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          active_template_id: string
          client_id?: string | null
          content?: Json | null
          created_at?: string
          id?: string
          no_index?: boolean | null
          password?: string | null
          short_id?: string
          slug?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          active_template_id?: string
          client_id?: string | null
          content?: Json | null
          created_at?: string
          id?: string
          no_index?: boolean | null
          password?: string | null
          short_id?: string
          slug?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_digital_profiles_active_template"
            columns: ["active_template_id"]
            isOneToOne: false
            referencedRelation: "digital_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_templates: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: string
          type: Database["public"]["Enums"]["template_type"]
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          type: Database["public"]["Enums"]["template_type"]
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          type?: Database["public"]["Enums"]["template_type"]
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          max_users: number
          name: string
          operation_mode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_users: number
          name: string
          operation_mode: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_users?: number
          name?: string
          operation_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          client_id: string | null
          client_user_role: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          client_user_role?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          client_user_role?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      contracts_with_client: {
        Row: {
          billing_day: number | null
          client_document: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          contract_type: string | null
          created_at: string | null
          end_date: string | null
          id: string | null
          is_active: boolean | null
          plan_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_contracts_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contracts_plan"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_with_client: {
        Row: {
          client_document: string | null
          client_id: string | null
          client_name: string | null
          client_type: string | null
          client_user_role: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      users_with_roles: {
        Row: {
          client_id: string | null
          client_user_role: string | null
          email: string | null
          full_name: string | null
          is_admin: boolean | null
          is_super_admin: boolean | null
          system_roles: string[] | null
          user_created_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_user_role: {
        Args: { target_role: string; target_user_id: string }
        Returns: string
      }
      generate_short_id: { Args: never; Returns: string }
      get_client_members: {
        Args: { target_client_id: string }
        Returns: {
          client_user_role: string
          created_at: string
          email: string
          full_name: string
          id: string
        }[]
      }
      get_my_client_id: { Args: never; Returns: string }
      get_user_client_id: { Args: { _user_id: string }; Returns: string }
      get_user_roles: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          role: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      plans_with_feature: {
        Args: { feature_name: string }
        Returns: {
          features: Json
          id: string
          is_active: boolean
          max_users: number
          name: string
          operation_mode: string
        }[]
      }
      remove_user_role: {
        Args: { target_role: string; target_user_id: string }
        Returns: boolean
      }
      user_has_platform_role: {
        Args: { _roles: string[]; _user_id: string }
        Returns: boolean
      }
      user_has_role: {
        Args: { target_role: string; target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role_enum: "super_admin" | "admin" | "manager"
      app_role: "super_admin" | "admin" | "manager"
      billing_cycle_enum: "monthly" | "annual"
      operation_mode_enum: "commercial" | "support_network" | "hybrid"
      plan_status_enum: "active" | "inactive"
      template_type: "profile_template" | "content_block"
      term_type_enum: "fixed" | "recurring"
      user_status_enum: "pending_invitation" | "active" | "inactive"
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
    Enums: {
      admin_role_enum: ["super_admin", "admin", "manager"],
      app_role: ["super_admin", "admin", "manager"],
      billing_cycle_enum: ["monthly", "annual"],
      operation_mode_enum: ["commercial", "support_network", "hybrid"],
      plan_status_enum: ["active", "inactive"],
      template_type: ["profile_template", "content_block"],
      term_type_enum: ["fixed", "recurring"],
      user_status_enum: ["pending_invitation", "active", "inactive"],
    },
  },
} as const
