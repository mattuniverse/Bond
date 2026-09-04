export type AvatarLayer = "character" | "face" | "hair" | "outfit" | "accessory";

export interface AvatarConfig {
  character: string;
  face: string;
  hair: string;
  outfit: string;
  accessory: string;
}

export type PresenceStatus = "online" | "offline";

export interface Profile {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Avatar {
  id: string;
  owner_id: string;
  config: AvatarConfig;
  created_at: string;
  updated_at: string;
}

export type ConnectionStatus = "pending" | "accepted" | "declined";

export interface Connection {
  id: string;
  user_id: string;
  partner_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

export interface LoveCode {
  id: string;
  code: string;
  owner_id: string;
  used_by: string | null;
  expires_at: string;
  created_at: string;
}

export type InteractionCategory =
  | "affection"
  | "wave"
  | "celebration"
  | "care"
  | "play";

export interface InteractionDef {
  id: string;
  name: string;
  category: InteractionCategory;
  icon: string;
  animationId: string;
  reaction: string;
  placeholder?: boolean;
}
