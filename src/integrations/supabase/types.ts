export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          citizen_id: string | null
          created_at: string | null
          cryptographic_hash: string
          details: Json | null
          election_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          previous_hash: string | null
          user_agent: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          citizen_id?: string | null
          created_at?: string | null
          cryptographic_hash: string
          details?: Json | null
          election_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          previous_hash?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          citizen_id?: string | null
          created_at?: string | null
          cryptographic_hash?: string
          details?: Json | null
          election_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          previous_hash?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      ballots: {
        Row: {
          cast_at: string | null
          device_fingerprint: string | null
          election_id: string
          encrypted_vote: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          vote_hash: string
        }
        Insert: {
          cast_at?: string | null
          device_fingerprint?: string | null
          election_id: string
          encrypted_vote: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          vote_hash: string
        }
        Update: {
          cast_at?: string | null
          device_fingerprint?: string | null
          election_id?: string
          encrypted_vote?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          vote_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "ballots_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string | null
          description: string | null
          election_id: string
          id: string
          image_url: string | null
          name: string
          party: string | null
          vote_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          election_id: string
          id?: string
          image_url?: string | null
          name: string
          party?: string | null
          vote_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          election_id?: string
          id?: string
          image_url?: string | null
          name?: string
          party?: string | null
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      citizens: {
        Row: {
          created_at: string | null
          date_of_birth: string
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          national_id: string
          phone_number: string | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
          verification_document_url: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth: string
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          national_id: string
          phone_number?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          verification_document_url?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          national_id?: string
          phone_number?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          verification_document_url?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      election_candidates: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          location_id: string | null
          location_level: string | null
          name: string
          party: string
          position_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          image_url?: string | null
          location_id?: string | null
          location_level?: string | null
          name: string
          party: string
          position_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          location_id?: string | null
          location_level?: string | null
          name?: string
          party?: string
          position_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "election_candidates_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          encryption_key_hash: string | null
          end_date: string
          id: string
          start_date: string
          status: Database["public"]["Enums"]["election_status"] | null
          title: string
          total_votes: number | null
          updated_at: string | null
          voting_end: string
          voting_start: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          encryption_key_hash?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: Database["public"]["Enums"]["election_status"] | null
          title: string
          total_votes?: number | null
          updated_at?: string | null
          voting_end: string
          voting_start: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          encryption_key_hash?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["election_status"] | null
          title?: string
          total_votes?: number | null
          updated_at?: string | null
          voting_end?: string
          voting_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "elections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_tokens: {
        Row: {
          citizen_id: string
          created_at: string | null
          expires_at: string
          id: string
          token_hash: string
          token_type: string
          used_at: string | null
        }
        Insert: {
          citizen_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          token_hash: string
          token_type: string
          used_at?: string | null
        }
        Update: {
          citizen_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          token_hash?: string
          token_type?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_tokens_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          created_at: string | null
          id: string
          level: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id: string
          level: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          title?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          citizen_id: string
          created_at: string | null
          device_id: string
          device_name: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_mobile_id: boolean | null
          last_activity: string | null
          mfa_verified: boolean | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          citizen_id: string
          created_at?: string | null
          device_id: string
          device_name?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_mobile_id?: boolean | null
          last_activity?: string | null
          mfa_verified?: boolean | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          citizen_id?: string
          created_at?: string | null
          device_id?: string
          device_name?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_mobile_id?: boolean | null
          last_activity?: string | null
          mfa_verified?: boolean | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_tallies: {
        Row: {
          candidate_id: string | null
          id: string
          last_updated: string | null
          location_id: string
          vote_count: number | null
        }
        Insert: {
          candidate_id?: string | null
          id?: string
          last_updated?: string | null
          location_id: string
          vote_count?: number | null
        }
        Update: {
          candidate_id?: string | null
          id?: string
          last_updated?: string | null
          location_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vote_tallies_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "election_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      voter_ballots: {
        Row: {
          citizen_id: string
          current_ballot_id: string | null
          election_id: string
          id: string
          previous_ballot_ids: string[] | null
          voted_at: string | null
        }
        Insert: {
          citizen_id: string
          current_ballot_id?: string | null
          election_id: string
          id?: string
          previous_ballot_ids?: string[] | null
          voted_at?: string | null
        }
        Update: {
          citizen_id?: string
          current_ballot_id?: string | null
          election_id?: string
          id?: string
          previous_ballot_ids?: string[] | null
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voter_ballots_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voter_ballots_current_ballot_id_fkey"
            columns: ["current_ballot_id"]
            isOneToOne: false
            referencedRelation: "ballots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voter_ballots_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      voters: {
        Row: {
          created_at: string
          first_name: string
          has_voted: boolean
          id: string
          id_number: string
          last_name: string
          location_id: string | null
          phone_number: string | null
          updated_at: string
          voted_at: string | null
        }
        Insert: {
          created_at?: string
          first_name: string
          has_voted?: boolean
          id?: string
          id_number: string
          last_name: string
          location_id?: string | null
          phone_number?: string | null
          updated_at?: string
          voted_at?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string
          has_voted?: boolean
          id?: string
          id_number?: string
          last_name?: string
          location_id?: string | null
          phone_number?: string | null
          updated_at?: string
          voted_at?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          position_id: string
          voter_id: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          position_id: string
          voter_id?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          position_id?: string
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "voters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cast_or_update_vote: {
        Args: {
          p_citizen_id: string
          p_election_id: string
          p_encrypted_vote: string
          p_vote_hash: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_device_fingerprint?: string
        }
        Returns: string
      }
      create_audit_log: {
        Args: {
          p_action: Database["public"]["Enums"]["audit_action"]
          p_entity_type: string
          p_entity_id?: string
          p_citizen_id?: string
          p_election_id?: string
          p_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      generate_audit_hash: {
        Args: {
          action_text: string
          entity_data: string
          previous_hash?: string
        }
        Returns: string
      }
      get_current_citizen_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_election_authority: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_system_auditor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      audit_action:
        | "vote_cast"
        | "vote_changed"
        | "election_created"
        | "election_activated"
        | "election_closed"
        | "user_login"
        | "user_logout"
        | "admin_action"
      election_status: "draft" | "active" | "closed" | "finalized"
      user_role: "voter" | "election_authority" | "system_auditor"
      verification_status: "pending" | "verified" | "rejected"
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
      audit_action: [
        "vote_cast",
        "vote_changed",
        "election_created",
        "election_activated",
        "election_closed",
        "user_login",
        "user_logout",
        "admin_action",
      ],
      election_status: ["draft", "active", "closed", "finalized"],
      user_role: ["voter", "election_authority", "system_auditor"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
