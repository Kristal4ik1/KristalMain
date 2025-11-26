
export enum ChannelType {
  TEXT = 'TEXT',
  VOICE = 'VOICE',
  DM = 'DM'
}

export enum UserStatus {
  ONLINE = 'ONLINE',
  IDLE = 'IDLE',
  DND = 'DND',
  OFFLINE = 'OFFLINE'
}

export enum FriendStatus {
  NONE = 'NONE',
  FRIEND = 'FRIEND',
  PENDING_INCOMING = 'PENDING_INCOMING',
  PENDING_OUTGOING = 'PENDING_OUTGOING',
  BLOCKED = 'BLOCKED'
}

export enum UserBadge {
  NITRO = 'NITRO',
  BOOSTER = 'BOOSTER',
  HYPESQUAD_BRAVERY = 'HYPESQUAD_BRAVERY',
  HYPESQUAD_BRILLIANCE = 'HYPESQUAD_BRILLIANCE',
  HYPESQUAD_BALANCE = 'HYPESQUAD_BALANCE',
  BUG_HUNTER_SILVER = 'BUG_HUNTER_SILVER',
  BUG_HUNTER_GOLD = 'BUG_HUNTER_GOLD',
  ACTIVE_DEVELOPER = 'ACTIVE_DEVELOPER',
  QUESTS = 'QUESTS',
  STAFF = 'STAFF',
  EARLY_SUPPORTER = 'EARLY_SUPPORTER',
  PARTNER = 'PARTNER',
  HYPESQUAD_EVENTS = 'HYPESQUAD_EVENTS',
  MODERATOR_ALUMNI = 'MODERATOR_ALUMNI',
  LEGACY_USERNAME = 'LEGACY_USERNAME',
  CLOWN = 'CLOWN',
  VERIFIED_BOT_DEVELOPER = 'VERIFIED_BOT_DEVELOPER'
}

export interface User {
  id: string;
  username: string;
  email?: string;
  // Security fields
  passwordHash?: string; // Stored securely
  salt?: string;         // Unique salt per user
  token?: string;        // Session token
  
  avatar?: string;
  bannerColor?: string;
  discriminator: string;
  status: UserStatus;
  customStatus?: string; 
  isBot?: boolean;
  isAdmin?: boolean; // Server admin mock
  
  // Global Ban System
  isGlobalBanned?: boolean;
  globalBanReason?: string;
  
  // Moderation
  isBanned?: boolean; // Server ban
  timeoutUntil?: string;
  
  friendStatus?: FriendStatus; 
  createdAt?: string; 
  
  // Badges
  badges?: UserBadge[];
}

export interface Message {
  id: string;
  content: string;
  authorId: string;
  channelId: string;
  timestamp: string;
  attachments?: string[];
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  categoryId?: string;
  // For DMs
  recipientId?: string;
  
  // Settings
  topic?: string;
  slowMode?: number; // in seconds
  ageRestricted?: boolean;
  bitrate?: number; // kbps (8-96)
  userLimit?: number; // 0-99 (0 = infinite)
  videoQuality?: 'AUTO' | '720p';
  region?: string;
}

export interface Category {
  id: string;
  name: string;
  }

export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: string[];
  position?: number; // Higher number = higher in hierarchy
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  bannerColor?: string;
  ownerId: string; // ID of the user who owns the server
  inviteCode?: string; // Unique invite code
  channels: Channel[];
  categories: Category[];
  members: string[];
  memberRoles: Record<string, string[]>; // Map userId -> array of roleIds
  roles: Role[];
  features: string[];
}
