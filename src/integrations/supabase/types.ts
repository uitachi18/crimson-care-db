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
      blood_inventory: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          collection_date: string
          created_at: string | null
          expiry_date: string
          id: string
          quantity_ml: number
          status: string
          updated_at: string | null
        }
        Insert: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          collection_date: string
          created_at?: string | null
          expiry_date: string
          id?: string
          quantity_ml: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"]
          collection_date?: string
          created_at?: string | null
          expiry_date?: string
          id?: string
          quantity_ml?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blood_requests: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at: string | null
          hospital_name: string
          id: string
          notes: string | null
          quantity_ml: number
          requested_by: string | null
          requester_name: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string | null
          urgency: string
        }
        Insert: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at?: string | null
          hospital_name: string
          id?: string
          notes?: string | null
          quantity_ml: number
          requested_by?: string | null
          requester_name: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string | null
          urgency?: string
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"]
          created_at?: string | null
          hospital_name?: string
          id?: string
          notes?: string | null
          quantity_ml?: number
          requested_by?: string | null
          requester_name?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string | null
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at: string | null
          date_of_birth: string
          eligibility: Database["public"]["Enums"]["donor_eligibility"]
          email: string | null
          full_name: string
          id: string
          last_donation_date: string | null
          medical_notes: string | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at?: string | null
          date_of_birth: string
          eligibility?: Database["public"]["Enums"]["donor_eligibility"]
          email?: string | null
          full_name: string
          id?: string
          last_donation_date?: string | null
          medical_notes?: string | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          blood_type?: Database["public"]["Enums"]["blood_type"]
          created_at?: string | null
          date_of_birth?: string
          eligibility?: Database["public"]["Enums"]["donor_eligibility"]
          email?: string | null
          full_name?: string
          id?: string
          last_donation_date?: string | null
          medical_notes?: string | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
      blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      donor_eligibility:
        | "eligible"
        | "temporarily_ineligible"
        | "permanently_ineligible"
      request_status: "pending" | "approved" | "fulfilled" | "rejected"
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
      app_role: ["admin", "staff"],
      blood_type: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      donor_eligibility: [
        "eligible",
        "temporarily_ineligible",
        "permanently_ineligible",
      ],
      request_status: ["pending", "approved", "fulfilled", "rejected"],
    },
  },
} as const
