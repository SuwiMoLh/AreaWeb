export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number | null
          size: number | null
          province: string | null
          district: string | null
          subdistrict: string | null
          latitude: number | null
          longitude: number | null
          images: string[] | null
          type: string | null
          document_type: string | null
          has_water: boolean | null
          has_electricity: boolean | null
          road_access: string | null
          zoning: string | null
          user_id: string
          created_at: string
          updated_at: string | null
          image_url: string | null
          property_type: string | null
          size_unit: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price?: number | null
          size?: number | null
          province?: string | null
          district?: string | null
          subdistrict?: string | null
          latitude?: number | null
          longitude?: number | null
          images?: string[] | null
          type?: string | null
          document_type?: string | null
          has_water?: boolean | null
          has_electricity?: boolean | null
          road_access?: string | null
          zoning?: string | null
          user_id: string
          created_at?: string
          updated_at?: string | null
          image_url?: string | null
          property_type?: string | null
          size_unit?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number | null
          size?: number | null
          province?: string | null
          district?: string | null
          subdistrict?: string | null
          latitude?: number | null
          longitude?: number | null
          images?: string[] | null
          type?: string | null
          document_type?: string | null
          has_water?: boolean | null
          has_electricity?: boolean | null
          road_access?: string | null
          zoning?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string | null
          image_url?: string | null
          property_type?: string | null
          size_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string | null
          updated_at: string | null
          full_name: string | null
          email: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
          full_name?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
          full_name?: string | null
          email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          listing_id: string | null
          created_at: string
          updated_at: string
          last_message: string | null
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          listing_id?: string | null
          created_at?: string
          updated_at?: string
          last_message?: string | null
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          listing_id?: string | null
          created_at?: string
          updated_at?: string
          last_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
