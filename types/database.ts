export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      avatars: {
        Row: {
          id: string;
          owner_id: string;
          character: string;
          face: string;
          hair: string;
          outfit: string;
          accessory: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          character: string;
          face: string;
          hair: string;
          outfit: string;
          accessory: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          character?: string;
          face?: string;
          hair?: string;
          outfit?: string;
          accessory?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          user_id: string;
          partner_id: string;
          status: "pending" | "accepted" | "declined";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          partner_id: string;
          status: "pending" | "accepted" | "declined";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          partner_id?: string;
          status?: "pending" | "accepted" | "declined";
          created_at?: string;
          updated_at?: string;
        };
      };
      love_codes: {
        Row: {
          id: string;
          code: string;
          owner_id: string;
          used_by: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          owner_id: string;
          used_by?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          owner_id?: string;
          used_by?: string | null;
          expires_at?: string;
          created_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          type: string;
          animation_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          type: string;
          animation_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          type?: string;
          animation_id?: string;
          created_at?: string;
        };
      };
      gifts: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          gift_type: string;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          gift_type: string;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          gift_type?: string;
          message?: string | null;
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          connection_id: string;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          connection_id: string;
          theme: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          connection_id?: string;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
