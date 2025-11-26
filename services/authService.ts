
import { User, UserStatus } from '../types';
import { databaseService } from './databaseService';
import { generateSalt, hashPassword, verifyPassword } from '../utils/crypto';

// Simulate JWT generation
const generateToken = () => Math.random().toString(36).substr(2) + Date.now().toString(36);

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User, token: string }> => {
    const user = await databaseService.getUserByEmail(email);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isBot) {
         throw new Error('Bots cannot login via UI');
    }

    if (!user.salt || !user.passwordHash) {
       // Should not happen in production, but for legacy support
       throw new Error('Security data corrupt. Contact admin.');
    }

    const isValid = await verifyPassword(password, user.salt, user.passwordHash);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken();
    
    // In a real app, we would store the token in the DB or Redis. 
    // Here we just return it to client.
    return { user, token };
  },

  register: async (email: string, username: string, password: string): Promise<{ user: User, token: string }> => {
    const existing = await databaseService.getUserByEmail(email);
    if (existing) {
      throw new Error('Email already in use');
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const token = generateToken();

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      salt,
      passwordHash,
      discriminator: Math.floor(1000 + Math.random() * 9000).toString(),
      status: UserStatus.ONLINE,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      isAdmin: false
    };

    await databaseService.saveUser(newUser);

    return { user: newUser, token };
  }
};
