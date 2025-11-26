
import { ChannelType, Server, User, UserStatus, Message } from './types';

// NOTE: Passwords are no longer stored here. 
// Mock users will be initialized in the databaseService with a default hashed password.

export const MOCK_USERS: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    username: 'Voyager',
    email: 'admin@kristal.chat',
    discriminator: '0001',
    status: UserStatus.ONLINE,
    avatar: 'https://picsum.photos/id/64/200/200',
    isAdmin: true
  },
  'user-2': {
    id: 'user-2',
    username: 'NeonRider',
    email: 'neon@kristal.chat',
    discriminator: '8821',
    status: UserStatus.DND,
    avatar: 'https://picsum.photos/id/129/200/200'
  },
  'user-3': {
    id: 'user-3',
    username: 'CodeMaster',
    email: 'code@kristal.chat',
    discriminator: '1337',
    status: UserStatus.IDLE,
    avatar: 'https://picsum.photos/id/237/200/200'
  },
  'bot-1': {
    id: 'bot-1',
    username: 'KristalBot',
    discriminator: 'BOT',
    status: UserStatus.ONLINE,
    isBot: true,
    avatar: 'https://picsum.photos/id/201/200/200'
  }
};

// Default servers cleared as requested
export const MOCK_SERVERS: Server[] = [];

export const INITIAL_MESSAGES: Message[] = [];
