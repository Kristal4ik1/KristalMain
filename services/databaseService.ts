
import { User, Server, ChannelType, Channel, Category, FriendStatus } from '../types';
import { MOCK_USERS, MOCK_SERVERS } from '../constants';
import { generateSalt, hashPassword } from '../utils/crypto';

const DB_USERS_KEY = 'kristal_db_users_v1';
const DB_SERVERS_KEY = 'kristal_db_servers_v1';
const DB_RELATIONSHIPS_KEY = 'kristal_db_relationships_v1';
const DB_MESSAGES_KEY = 'kristal_db_messages_v1';
const DB_NOTES_KEY = 'kristal_db_user_notes_v1';

// Simulates a Database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Relationship {
    id: string;
    userId1: string;
    userId2: string;
    status: 'FRIEND' | 'PENDING' | 'BLOCKED';
    initiatorId: string;
}

export const databaseService = {
  // Initialize DB with mock users if empty, hashing their default passwords
  init: async () => {
    // Init Users
    const storedUsers = localStorage.getItem(DB_USERS_KEY);
    if (!storedUsers) {
      console.log('Initializing database seeding (Users)...');
      const seededUsers: Record<string, User> = {};
      
      // Seed mock users with a default password "password123"
      for (const [id, user] of Object.entries(MOCK_USERS)) {
        if (user.isBot) {
           seededUsers[id] = { ...user, createdAt: new Date(2023, 9, 20).toISOString() };
           continue;
        }
        
        const salt = generateSalt();
        const hash = await hashPassword('password123', salt);
        
        seededUsers[id] = {
          ...user,
          salt,
          passwordHash: hash,
          createdAt: new Date(2023, 10, 15).toISOString()
        };
      }
      localStorage.setItem(DB_USERS_KEY, JSON.stringify(seededUsers));
    }

    // Init Servers
    const storedServers = localStorage.getItem(DB_SERVERS_KEY);
    if (!storedServers) {
        console.log('Initializing database seeding (Servers)...');
        localStorage.setItem(DB_SERVERS_KEY, JSON.stringify([]));
    }

    // Init Relationships
    const storedRels = localStorage.getItem(DB_RELATIONSHIPS_KEY);
    if (!storedRels) {
        localStorage.setItem(DB_RELATIONSHIPS_KEY, JSON.stringify([]));
    }
    
    // Init Messages
    const storedMessages = localStorage.getItem(DB_MESSAGES_KEY);
    if (!storedMessages) {
        localStorage.setItem(DB_MESSAGES_KEY, JSON.stringify([]));
    }

    // Init Notes
    const storedNotes = localStorage.getItem(DB_NOTES_KEY);
    if (!storedNotes) {
        localStorage.setItem(DB_NOTES_KEY, JSON.stringify({}));
    }
  },

  getUsers: async (): Promise<Record<string, User>> => {
    await delay(300); 
    const stored = localStorage.getItem(DB_USERS_KEY);
    return stored ? JSON.parse(stored) : {};
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    await delay(400); 
    const users = await databaseService.getUsers();
    return Object.values(users).find(u => u.email?.toLowerCase() === email.toLowerCase()) || null;
  },
  
  getUserByUsername: async (username: string): Promise<User | null> => {
      await delay(300);
      const users = await databaseService.getUsers();
      return Object.values(users).find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  saveUser: async (user: User): Promise<void> => {
    await delay(300);
    const users = await databaseService.getUsers();
    users[user.id] = { ...user, createdAt: user.createdAt || new Date().toISOString() };
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
  },

  updateUserStatus: async (userId: string, data: Partial<User>): Promise<void> => {
     const users = await databaseService.getUsers();
     if (users[userId]) {
         users[userId] = { ...users[userId], ...data };
         localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
     }
  },

  // --- Notes ---
  
  getUserNote: async (ownerId: string, targetId: string): Promise<string> => {
      await delay(100);
      const notes = JSON.parse(localStorage.getItem(DB_NOTES_KEY) || '{}');
      const key = `${ownerId}_${targetId}`;
      return notes[key] || '';
  },

  saveUserNote: async (ownerId: string, targetId: string, note: string): Promise<void> => {
      await delay(100);
      const notes = JSON.parse(localStorage.getItem(DB_NOTES_KEY) || '{}');
      const key = `${ownerId}_${targetId}`;
      notes[key] = note;
      localStorage.setItem(DB_NOTES_KEY, JSON.stringify(notes));
  },

  // --- Mutuals ---
  getMutualServers: async (userId1: string, userId2: string): Promise<any[]> => {
      await delay(200);
      const servers = await databaseService.getServers();
      return servers.filter(s => s.members.includes(userId1) && s.members.includes(userId2))
        .map(s => ({ id: s.id, name: s.name, icon: s.icon }));
  },

  getMutualFriends: async (userId1: string, userId2: string): Promise<User[]> => {
      await delay(200);
      const rels = JSON.parse(localStorage.getItem(DB_RELATIONSHIPS_KEY) || '[]') as Relationship[];
      const getFriends = (uid: string) => {
          return rels
            .filter(r => (r.userId1 === uid || r.userId2 === uid) && r.status === 'FRIEND')
            .map(r => r.userId1 === uid ? r.userId2 : r.userId1);
      };
      const f1 = getFriends(userId1);
      const f2 = getFriends(userId2);
      const mutualIds = f1.filter(id => f2.includes(id));
      const users = await databaseService.getUsers();
      return mutualIds.map(id => users[id]).filter(Boolean);
  },

  // --- Relationships ---
  getRelationships: async (userId: string): Promise<Relationship[]> => {
      await delay(100);
      const all: Relationship[] = JSON.parse(localStorage.getItem(DB_RELATIONSHIPS_KEY) || '[]');
      return all.filter(r => r.userId1 === userId || r.userId2 === userId);
  },

  createRelationship: async (userId1: string, userId2: string, status: 'FRIEND' | 'PENDING', initiatorId: string): Promise<void> => {
      await delay(200);
      const all: Relationship[] = JSON.parse(localStorage.getItem(DB_RELATIONSHIPS_KEY) || '[]');
      const exists = all.find(r => 
        (r.userId1 === userId1 && r.userId2 === userId2) || 
        (r.userId1 === userId2 && r.userId1 === userId1)
      );
      if (exists) throw new Error('Relationship already exists');
      all.push({ id: `rel-${Date.now()}`, userId1, userId2, status, initiatorId });
      localStorage.setItem(DB_RELATIONSHIPS_KEY, JSON.stringify(all));
  },

  updateRelationship: async (userId1: string, userId2: string, status: 'FRIEND'): Promise<void> => {
      await delay(200);
      const all: Relationship[] = JSON.parse(localStorage.getItem(DB_RELATIONSHIPS_KEY) || '[]');
      const rel = all.find(r => 
        (r.userId1 === userId1 && r.userId2 === userId2) || 
        (r.userId1 === userId2 && r.userId2 === userId1)
      );
      if (rel) {
          rel.status = status;
          localStorage.setItem(DB_RELATIONSHIPS_KEY, JSON.stringify(all));
      }
  },

  deleteRelationship: async (userId1: string, userId2: string): Promise<void> => {
      await delay(200);
      let all: Relationship[] = JSON.parse(localStorage.getItem(DB_RELATIONSHIPS_KEY) || '[]');
      all = all.filter(r => 
        !((r.userId1 === userId1 && r.userId2 === userId2) || 
          (r.userId1 === userId2 && r.userId2 === userId1))
      );
      localStorage.setItem(DB_RELATIONSHIPS_KEY, JSON.stringify(all));
  },

  // --- Servers ---
  getServers: async (): Promise<Server[]> => {
      await delay(200);
      const stored = localStorage.getItem(DB_SERVERS_KEY);
      const servers: Server[] = stored ? JSON.parse(stored) : [];
      
      // Ensure memberRoles structure exists for compatibility
      return servers.map(s => ({
          ...s,
          memberRoles: s.memberRoles || { [s.ownerId]: ['admin'] } // fallback
      }));
  },

  createServer: async (name: string, ownerId: string, icon?: string): Promise<Server> => {
      await delay(500);
      const servers = await databaseService.getServers();
      
      const newServerId = `server-${Date.now()}`;
      const cat1Id = `cat-${Date.now()}-1`;
      const cat2Id = `cat-${Date.now()}-2`;
      const inviteCode = Math.random().toString(36).substring(2, 10);
      
      const newServer: Server = {
          id: newServerId,
          name: name,
          icon: icon, 
          ownerId: ownerId,
          inviteCode: inviteCode,
          members: [ownerId],
          memberRoles: { [ownerId]: ['admin'] },
          categories: [
              { id: cat1Id, name: 'Текстовые каналы' },
              { id: cat2Id, name: 'Голосовые каналы' }
          ],
          channels: [
              { id: `ch-${Date.now()}-1`, name: 'general', type: ChannelType.TEXT, categoryId: cat1Id, bitrate: 64, userLimit: 0 },
              { id: `ch-${Date.now()}-2`, name: 'Общий', type: ChannelType.VOICE, categoryId: cat2Id, bitrate: 64, userLimit: 0 }
          ],
          roles: [
              { id: `${newServerId}-everyone`, name: '@everyone', color: '#99AAB5', permissions: [] },
              { id: 'admin', name: 'Admin', color: '#EAB308', permissions: ['administrator'] }
          ],
          features: []
      };

      servers.push(newServer);
      localStorage.setItem(DB_SERVERS_KEY, JSON.stringify(servers));
      return newServer;
  },

  updateServer: async (serverId: string, data: Partial<Server>): Promise<Server> => {
      await delay(400);
      const servers = await databaseService.getServers();
      const index = servers.findIndex(s => s.id === serverId);
      
      if (index === -1) throw new Error("Server not found");
      
      servers[index] = { ...servers[index], ...data };
      localStorage.setItem(DB_SERVERS_KEY, JSON.stringify(servers));
      return servers[index];
  },

  joinServer: async (inviteCode: string, userId: string): Promise<Server> => {
      await delay(500);
      const servers = await databaseService.getServers();
      const cleanCode = inviteCode.split('/').pop() || inviteCode;
      const server = servers.find(s => s.inviteCode === cleanCode);
      
      if (!server) {
          throw new Error("Сервер не найден. Проверьте приглашение.");
      }
      
      if (server.members.includes(userId)) {
          return server;
      }
      
      server.members.push(userId);
      // Initialize empty roles
      if (!server.memberRoles) server.memberRoles = {};
      server.memberRoles[userId] = [];
      
      localStorage.setItem(DB_SERVERS_KEY, JSON.stringify(servers));
      return server;
  },

  leaveServer: async (serverId: string, userId: string): Promise<void> => {
      await delay(300);
      const servers = await databaseService.getServers();
      const serverIndex = servers.findIndex(s => s.id === serverId);
      
      if (serverIndex !== -1) {
          const server = servers[serverIndex];
          server.members = server.members.filter(m => m !== userId);
          if (server.memberRoles && server.memberRoles[userId]) {
              delete server.memberRoles[userId];
          }
          if (server.members.length === 0) {
              servers.splice(serverIndex, 1);
          }
          localStorage.setItem(DB_SERVERS_KEY, JSON.stringify(servers));
      }
  },

  // Role Management Stub
  toggleUserRole: async (serverId: string, userId: string, roleId: string): Promise<void> => {
      await delay(200);
      const servers = await databaseService.getServers();
      const server = servers.find(s => s.id === serverId);
      if (server) {
          const currentRoles = server.memberRoles[userId] || [];
          if (currentRoles.includes(roleId)) {
              server.memberRoles[userId] = currentRoles.filter(id => id !== roleId);
          } else {
              server.memberRoles[userId] = [...currentRoles, roleId];
          }
          localStorage.setItem(DB_SERVERS_KEY, JSON.stringify(servers));
      }
  },

  // Channels & Messages (Unchanged mostly)
  createChannel: async (serverId: string, name: string, type: ChannelType, categoryId?: string): Promise<Channel> => {
      await delay(300);
      const servers = await databaseService.getServers();
      const server = servers.find(s => s.id === serverId);
      if (!server) throw new Error("Server not found");
      const targetCatId = categoryId || server.categories[0]?.id; 
      const newChannel: Channel = {
          id: `ch-${Date.now()}`,
          name: name.toLowerCase().replace(/\s+/g, '-'),
          type,
          categoryId: targetCatId,
          bitrate: 64,
          userLimit: 0,
          videoQuality: 'AUTO'
      };
      server.channels.push(newChannel);
      localStorage.setItem(DB_SERVERS_KEY, JSON.stringify(servers));
      return newChannel;
  },
  updateChannel: async (serverId: string, channelId: string, data: Partial<Channel>): Promise<Channel> => {
    await delay(300);
    const servers = await databaseService.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) throw new Error("Server not found");
    const server = servers[serverIndex];
    const channelIndex = server.channels.findIndex(c => c.id === channelId);
    if (channelIndex === -1) throw new Error("Channel not found");
    server.channels[channelIndex] = { ...server.channels[channelIndex], ...data };
    localStorage.setItem(DB_SERVERS_KEY, JSON.stringify(servers));
    return server.channels[channelIndex];
  },
  deleteChannel: async (serverId: string, channelId: string): Promise<void> => {
    await delay(300);
    const servers = await databaseService.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) throw new Error("Server not found");
    const server = servers[serverIndex];
    server.channels = server.channels.filter(c => c.id !== channelId);
    localStorage.setItem(DB_SERVERS_KEY, JSON.stringify(servers));
  },
  getMessages: async (channelId: string): Promise<any[]> => {
      await delay(100);
      const all: any[] = JSON.parse(localStorage.getItem(DB_MESSAGES_KEY) || '[]');
      return all.filter(m => m.channelId === channelId);
  },
  createMessage: async (channelId: string, authorId: string, content: string, attachments?: string[]): Promise<any> => {
      await delay(100);
      const all: any[] = JSON.parse(localStorage.getItem(DB_MESSAGES_KEY) || '[]');
      const msg = {
          id: `msg-${Date.now()}`,
          channelId,
          authorId,
          content,
          timestamp: new Date().toISOString(),
          attachments: attachments || []
      };
      all.push(msg);
      localStorage.setItem(DB_MESSAGES_KEY, JSON.stringify(all));
      return msg;
  }
};
