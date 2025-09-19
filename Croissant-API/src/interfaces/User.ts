import { Game } from "./Game";
import { InventoryItem } from "./Inventory";
import { Item } from "./Item";

export interface PublicUser {
  user_id: string;
  username: string;
  verified: boolean;
  isStudio: boolean;
  admin?: boolean;
  badges: ('staff' | 'moderator' | 'community_manager' | 'early_user' | 'bug_hunter' | 'contributor' | 'partner')[];
  beta_user: boolean;
  created_at?: string;
  updated_at?: string;
  disabled?: boolean; // <-- Ajout ici
}

export interface User extends PublicUser {
  email: string;
  password?: string;
  discord_id?: string;
  google_id?: string;
  steam_id?: string;
  steam_username?: string;
  steam_avatar_url?: string;
  forgot_password_token?: string;
  balance: number;
  free_balance: number;
  disabled?: boolean;
  webauthn_challenge: string;
  webauthn_credentials?: string;
  authenticator_secret?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicUserAsAdmin extends PublicUser {
  disabled?: boolean;
}

export interface UserExtensions {
  inventory?: InventoryItem[];
  ownedItems?: Item[];
  createdGames?: Game[];
}

export interface Oauth2User {
  username: string;
  user_id: string;
  email: string;
  balance: number;
  verified: boolean;
  steam_username?: string;
  steam_avatar_url?: string;
  steam_id?: string;
  discord_id?: string;
  google_id?: string;
}

export interface Friend {
  user_1: string;
  user_2: string;
  datetime?: string;
  status: 'pending' | 'approved';
}
