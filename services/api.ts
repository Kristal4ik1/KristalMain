
import { User, Server, ChannelType, Channel } from '../types';
import { databaseService } from './databaseService';
import { config } from '../config';
import { authService } from './authService';

const getAuthHeader = (token: string) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
});

const mockBackend = {
    getUsers: async () => {
        return databaseService.getUsers();
    },
    getRelationships: (userId: string) => databaseService.getRelationships(userId),
    getServers: () => databaseService.getServers(),
    createServer: (name: string, ownerId: string, icon?: string) => databaseService.createServer(name, ownerId, icon),
    updateServer: (serverId: string, data: Partial<Server>) => databaseService.updateServer(serverId, data),
    joinServer: (inviteCode: string, userId: string) => databaseService.joinServer(inviteCode, userId),
    leaveServer: (serverId: string, userId: string) => databaseService.leaveServer(serverId, userId),
    createChannel: (serverId: string, name: string, type: ChannelType, categoryId?: string) => databaseService.createChannel(serverId, name, type, categoryId),
    updateChannel: (serverId: string, channelId: string, data: Partial<Channel>) => databaseService.updateChannel(serverId, channelId, data),
    deleteChannel: (serverId: string, channelId: string) => databaseService.deleteChannel(serverId, channelId),
    updateUser: (userId: string, data: Partial<User>) => databaseService.updateUserStatus(userId, data),
    
    // Notes & Mutuals
    getUserNote: (id: string, targetId: string) => databaseService.getUserNote(id, targetId),
    saveUserNote: (id: string, targetId: string, note: string) => databaseService.saveUserNote(id, targetId, note),
    getMutualServers: (id: string, targetId: string) => databaseService.getMutualServers(id, targetId),
    getMutualFriends: (id: string, targetId: string) => databaseService.getMutualFriends(id, targetId),

    // Friend Actions
    sendFriendRequest: async (fromUserId: string, toUsername: string) => {
        const target = await databaseService.getUserByUsername(toUsername);
        if (!target) throw new Error("Пользователь не найден");
        if (target.id === fromUserId) throw new Error("Нельзя добавить себя");
        
        await databaseService.createRelationship(fromUserId, target.id, 'PENDING', fromUserId);
        return target;
    },
    acceptFriendRequest: (userId: string, targetUserId: string) => databaseService.updateRelationship(userId, targetUserId, 'FRIEND'),
    rejectFriendRequest: (userId: string, targetUserId: string) => databaseService.deleteRelationship(userId, targetUserId),
    
    // Messages
    getMessages: (channelId: string) => databaseService.getMessages(channelId),
    createMessage: (channelId: string, authorId: string, content: string, attachments?: string[]) => databaseService.createMessage(channelId, authorId, content, attachments)
};

export const api = {
    // Auth
    login: async (email: string, pass: string) => {
        if (config.USE_MOCK) return authService.login(email, pass);
        
        const response = await fetch(`${config.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    register: async (email: string, username: string, pass: string) => {
        // Strict security check
        if (pass.length < 8) throw new Error('Пароль слишком короткий (минимум 8 символов)');
        if (!/[A-Z]/.test(pass)) throw new Error("Пароль должен содержать хотя бы одну заглавную букву");
        if (!/[0-9]/.test(pass)) throw new Error("Пароль должен содержать хотя бы одну цифру");

        if (config.USE_MOCK) return authService.register(email, username, pass);
        
        const { generateSalt, hashPassword } = await import('../utils/crypto');
        const salt = generateSalt();
        const passwordHash = await hashPassword(pass, salt);
        const avatar = `https://ui-avatars.com/api/?name=${username}&background=random`;

        const response = await fetch(`${config.API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, passwordHash, salt, avatar })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Registration failed');
        }
        return response.json();
    },

    verifyEmail: async (email: string, code: string) => {
        if (config.USE_MOCK) {
            return { user: {}, token: 'mock-token' }; 
        }

        const response = await fetch(`${config.API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || 'Verification failed');
        }
        return response.json();
    },

    // Users
    getUsers: async (): Promise<Record<string, User>> => {
        if (config.USE_MOCK) return mockBackend.getUsers();
        
        const response = await fetch(`${config.API_URL}/users`);
        return response.json();
    },
    
    getUserRelationships: async (userId: string): Promise<any[]> => {
        if (config.USE_MOCK) return mockBackend.getRelationships(userId);
        const response = await fetch(`${config.API_URL}/users/${userId}/relationships`);
        return response.json();
    },

    updateUser: async (userId: string, data: Partial<User>, token: string): Promise<User> => {
        if (config.USE_MOCK) {
             await mockBackend.updateUser(userId, data);
             const users = await mockBackend.getUsers();
             return users[userId];
        }

        const response = await fetch(`${config.API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeader(token),
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    // Notes
    getUserNote: async (userId: string, targetId: string, token: string): Promise<string> => {
        if (config.USE_MOCK) return mockBackend.getUserNote(userId, targetId);
        const res = await fetch(`${config.API_URL}/users/${userId}/notes/${targetId}`, { headers: getAuthHeader(token) });
        const data = await res.json();
        return data.note;
    },

    saveUserNote: async (userId: string, targetId: string, note: string, token: string): Promise<void> => {
        if (config.USE_MOCK) return mockBackend.saveUserNote(userId, targetId, note);
        await fetch(`${config.API_URL}/users/${userId}/notes/${targetId}`, {
            method: 'POST',
            headers: getAuthHeader(token),
            body: JSON.stringify({ note })
        });
    },

    // Mutuals
    getMutualServers: async (userId: string, targetId: string, token: string): Promise<any[]> => {
        if (config.USE_MOCK) return mockBackend.getMutualServers(userId, targetId);
        const res = await fetch(`${config.API_URL}/users/${userId}/mutual-servers/${targetId}`, { headers: getAuthHeader(token) });
        return res.json();
    },

    getMutualFriends: async (userId: string, targetId: string, token: string): Promise<User[]> => {
        if (config.USE_MOCK) return mockBackend.getMutualFriends(userId, targetId);
        const res = await fetch(`${config.API_URL}/users/${userId}/mutual-friends/${targetId}`, { headers: getAuthHeader(token) });
        return res.json();
    },

    // Friends
    sendFriendRequest: async (fromUserId: string, toUsername: string, token: string) => {
        if (config.USE_MOCK) return mockBackend.sendFriendRequest(fromUserId, toUsername);

        const response = await fetch(`${config.API_URL}/friends/request`, {
            method: 'POST',
            headers: getAuthHeader(token),
            body: JSON.stringify({ fromUserId, toUsername })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send request');
        return data.targetUser;
    },

    acceptFriendRequest: async (userId: string, targetUserId: string, token: string) => {
        if (config.USE_MOCK) return mockBackend.acceptFriendRequest(userId, targetUserId);
        
        const response = await fetch(`${config.API_URL}/friends/accept`, {
            method: 'POST',
            headers: getAuthHeader(token),
            body: JSON.stringify({ userId, targetUserId })
        });
        if (!response.ok) throw new Error('Failed');
    },

    rejectFriendRequest: async (userId: string, targetUserId: string, token: string) => {
        if (config.USE_MOCK) return mockBackend.rejectFriendRequest(userId, targetUserId);
        
         const response = await fetch(`${config.API_URL}/friends/reject`, {
            method: 'POST',
            headers: getAuthHeader(token),
            body: JSON.stringify({ userId, targetUserId })
        });
        if (!response.ok) throw new Error('Failed');
    },

    // Servers
    getServers: async (): Promise<Server[]> => {
        if (config.USE_MOCK) return mockBackend.getServers();

        const response = await fetch(`${config.API_URL}/servers`);
        return response.json();
    },

    createServer: async (name: string, token: string, ownerId: string, icon?: string): Promise<Server> => {
        if (config.USE_MOCK) return mockBackend.createServer(name, ownerId, icon);

        const response = await fetch(`${config.API_URL}/servers`, {
            method: 'POST',
            headers: getAuthHeader(token),
            body: JSON.stringify({ name, ownerId, icon })
        });
        
        if (!response.ok) throw new Error('Failed to create server');
        return response.json();
    },

    updateServer: async (serverId: string, data: Partial<Server>, token: string): Promise<Server> => {
        if (config.USE_MOCK) return mockBackend.updateServer(serverId, data);

        const response = await fetch(`${config.API_URL}/servers/${serverId}`, {
            method: 'PUT',
            headers: getAuthHeader(token),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to update server');
        return response.json();
    },

    joinServer: async (inviteCode: string, token: string, userId: string): Promise<Server> => {
        if (config.USE_MOCK) return mockBackend.joinServer(inviteCode, userId);

        const response = await fetch(`${config.API_URL}/servers/join`, {
            method: 'POST',
            headers: getAuthHeader(token),
            body: JSON.stringify({ inviteCode, userId })
        });
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to join server');
        }
        return response.json();
    },

    leaveServer: async (serverId: string, token: string, userId: string): Promise<void> => {
        if (config.USE_MOCK) return mockBackend.leaveServer(serverId, userId);

        const response = await fetch(`${config.API_URL}/servers/${serverId}/leave`, {
            method: 'POST',
            headers: getAuthHeader(token),
            body: JSON.stringify({ userId })
        });
        if (!response.ok) throw new Error('Failed to leave server');
    },

    createChannel: async (serverId: string, name: string, type: ChannelType, token: string, categoryId?: string): Promise<any> => {
        if (config.USE_MOCK) return mockBackend.createChannel(serverId, name, type, categoryId);
        
        const response = await fetch(`${config.API_URL}/channels`, {
            method: 'POST',
            headers: getAuthHeader(token),
            body: JSON.stringify({ serverId, name, type, categoryId })
        });
        
        if (!response.ok) throw new Error('Failed');
        return response.json();
    },

    updateChannel: async (serverId: string, channelId: string, data: Partial<Channel>, token: string): Promise<Channel> => {
        if (config.USE_MOCK) return mockBackend.updateChannel(serverId, channelId, data);

        const response = await fetch(`${config.API_URL}/channels/${channelId}`, {
            method: 'PUT',
            headers: getAuthHeader(token),
            body: JSON.stringify({ serverId, ...data }) 
        });

        if (!response.ok) throw new Error('Failed to update channel');
        return response.json();
    },

    deleteChannel: async (serverId: string, channelId: string, token: string): Promise<void> => {
        if (config.USE_MOCK) return mockBackend.deleteChannel(serverId, channelId);

        const response = await fetch(`${config.API_URL}/channels/${channelId}`, {
            method: 'DELETE',
            headers: getAuthHeader(token),
            body: JSON.stringify({ serverId })
        });

        if (!response.ok) throw new Error('Failed to delete channel');
    },

    // Messages
    getMessages: async (channelId: string): Promise<any[]> => {
        if (config.USE_MOCK) return mockBackend.getMessages(channelId);
        
        const response = await fetch(`${config.API_URL}/channels/${channelId}/messages`);
        return response.json();
    },

    createMessage: async (channelId: string, authorId: string, content: string, token: string, attachments?: string[]): Promise<any> => {
         if (config.USE_MOCK) return mockBackend.createMessage(channelId, authorId, content, attachments);
         
         const response = await fetch(`${config.API_URL}/channels/${channelId}/messages`, {
            method: 'POST',
            headers: getAuthHeader(token),
            body: JSON.stringify({ authorId, content, attachments })
        });
        
        return response.json();
    }
};
