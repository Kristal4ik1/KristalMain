
import { Server, User, Role } from '../types';

export const Permissions = {
  ADMINISTRATOR: 'administrator',
  KICK_MEMBERS: 'kick_members',
  BAN_MEMBERS: 'ban_members',
  MANAGE_CHANNELS: 'manage_channels',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_MESSAGES: 'manage_messages',
  TIMEOUT_MEMBERS: 'timeout_members',
  SEND_MESSAGES: 'send_messages',
  CONNECT: 'connect',
  MANAGE_NICKNAMES: 'manage_nicknames'
};

// Helper to get all permissions a user has
export const getUserPermissions = (user: User, server: Server): Set<string> => {
  if (user.id === server.ownerId) return new Set(['ADMINISTRATOR']); // Owner has all

  const userRoleIds = server.memberRoles[user.id] || [];
  const userRoles = server.roles.filter(r => userRoleIds.includes(r.id) || r.name === '@everyone');
  
  const permissions = new Set<string>();
  
  userRoles.forEach(role => {
    if (role.permissions.includes(Permissions.ADMINISTRATOR)) {
      permissions.add('ADMINISTRATOR');
    }
    role.permissions.forEach(p => permissions.add(p));
  });

  // If admin, they have everything
  if (permissions.has(Permissions.ADMINISTRATOR)) {
      return new Set(['ADMINISTRATOR']); 
  }

  return permissions;
};

// Main check function
export const hasPermission = (user: User, server: Server, permission: string): boolean => {
  if (user.id === server.ownerId) return true;
  
  const perms = getUserPermissions(user, server);
  if (perms.has(Permissions.ADMINISTRATOR)) return true;
  
  return perms.has(permission);
};

// Hierarchy check: Can actor manage target? (e.g., ban, kick, manage role)
export const canManageUser = (actor: User, target: User, server: Server): boolean => {
  // 1. Special Case: Owner can manage themselves (e.g., give themselves roles)
  // Note: Self-harm (banning self) is prevented in the UI component via !isSelf check
  if (actor.id === server.ownerId && actor.id === target.id) return true;

  // 2. Self-management is generally disabled for others
  if (actor.id === target.id) return false;

  // 3. No one can manage the Owner (except owner themselves, handled above)
  if (target.id === server.ownerId) return false; 

  // 4. Owner can manage everyone else
  if (actor.id === server.ownerId) return true; 

  const actorRoleIds = server.memberRoles[actor.id] || [];
  const targetRoleIds = server.memberRoles[target.id] || [];

  // Helper to find highest position
  const getHighestRolePosition = (roleIds: string[]) => {
    let highest = -1;
    server.roles.forEach((role, index) => {
      if (roleIds.includes(role.id)) {
        if (index > highest) highest = index;
      }
    });
    return highest;
  };

  const actorHigh = getHighestRolePosition(actorRoleIds);
  const targetHigh = getHighestRolePosition(targetRoleIds);

  // Must be strictly higher to manage
  return actorHigh > targetHigh;
};
