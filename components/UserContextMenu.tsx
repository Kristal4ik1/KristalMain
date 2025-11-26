
import React, { useEffect, useRef, useState } from 'react';
import { User, Server } from '../types';
import { ChevronRight, Clipboard, Check, ShieldAlert, Gavel, Clock, Shield } from 'lucide-react';
import { hasPermission, canManageUser, Permissions } from '../utils/permissions';

interface UserContextMenuProps {
  user: User;
  currentUser: User;
  position: { x: number; y: number };
  onClose: () => void;
  onOpenProfile: (user: User) => void;
  onMessage: (userId: string) => void;
  onAddFriend: (username: string) => void;
  onRemoveFriend: (userId: string) => void;
  onTimeout: (userId: string) => void;
  onBan: (userId: string) => void;
  onCopyId: (userId: string) => void;
  server?: Server;
  onToggleRole?: (userId: string, roleId: string) => void;
}

export const UserContextMenu: React.FC<UserContextMenuProps> = ({ 
  user, 
  currentUser, 
  position, 
  onClose,
  onOpenProfile,
  onMessage,
  onAddFriend,
  onRemoveFriend,
  onTimeout,
  onBan,
  onCopyId,
  server,
  onToggleRole
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showRolesSubmenu, setShowRolesSubmenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) {
            menuRef.current.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
        if (rect.right > window.innerWidth) {
            menuRef.current.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const Item: React.FC<{ 
    label: string; 
    icon?: React.ReactNode; 
    danger?: boolean; 
    submenu?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    color?: string;
  }> = ({ label, icon, danger, submenu, onClick, disabled, onMouseEnter, onMouseLeave, color }) => (
    <div 
      onClick={(e) => {
          if (disabled) return;
          e.stopPropagation();
          onClick?.();
          if (!submenu) onClose();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center justify-between px-2 py-1.5 rounded-[2px] cursor-pointer text-xs font-medium transition-colors group relative
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${!disabled && danger 
            ? 'text-discord-red hover:bg-discord-red hover:text-white' 
            : !disabled ? 'text-[#B5BAC1] hover:bg-[#5865F2] hover:text-white' : ''
        }
      `}
      style={color ? { color: color } : {}}
    >
      <div className="flex items-center truncate max-w-[150px]">
        {label}
      </div>
      <div className="flex items-center shrink-0">
          {icon && <span className="ml-2 opacity-60 group-hover:opacity-100">{icon}</span>}
          {submenu && <ChevronRight size={12} className="ml-2" />}
      </div>
    </div>
  );

  const Separator = () => <div className="h-[1px] bg-[#1E1F22] my-1 mx-2"></div>;

  // -- Permission Checks --
  const isServerContext = !!server;
  const isSelf = user.id === currentUser.id;
  
  // Role Management: Must have permission, can manage target, and NOT self (usually)
  const canManageRoles = isServerContext && 
                         hasPermission(currentUser, server, Permissions.MANAGE_ROLES) && 
                         canManageUser(currentUser, user, server);
  
  // Moderation: Must have permission, can manage target, and NOT self
  const canBan = isServerContext && !isSelf &&
                 hasPermission(currentUser, server, Permissions.BAN_MEMBERS) && 
                 canManageUser(currentUser, user, server);
                 
  const canKick = isServerContext && !isSelf &&
                  hasPermission(currentUser, server, Permissions.KICK_MEMBERS) && 
                  canManageUser(currentUser, user, server);
                  
  const canTimeout = isServerContext && !isSelf &&
                     hasPermission(currentUser, server, Permissions.TIMEOUT_MEMBERS) && 
                     canManageUser(currentUser, user, server);
                     
  const canManageNicknames = isServerContext && 
                             hasPermission(currentUser, server, Permissions.MANAGE_NICKNAMES) && 
                             canManageUser(currentUser, user, server);

  // Logic for determining available roles to assign
  const userRoleIds = isServerContext ? (server.memberRoles[user.id] || []) : [];
  const manageableRoles = server?.roles.filter(r => r.name !== '@everyone') || [];

  return (
    <div 
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
      className="fixed z-[100] w-[220px] bg-[#111214] rounded shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100 border border-[#1E1F22]"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* General Actions */}
      <Item label="Профиль" onClick={() => onOpenProfile(user)} />
      <Item label="Написать сообщение" onClick={() => onMessage(user.id)} />
      <Item label="Позвонить" onClick={() => onMessage(user.id)} />
      <Item label="Добавить заметку" />
      
      <Separator />

      {/* Server Specific Non-Mod Actions */}
      {isServerContext && (
          <>
            <Item label="Изменить никнейм" disabled={!canManageNicknames && !isSelf} />
            <Separator />
          </>
      )}
      
      {/* Friends */}
      {!isSelf && (
          <>
            {user.friendStatus === 'FRIEND' ? (
                <Item label="Удалить из друзей" onClick={() => onRemoveFriend(user.id)} />
            ) : (
                <Item label="Добавить в друзья" onClick={() => onAddFriend(user.username)} />
            )}
            <Separator />
          </>
      )}
      
      {/* Roles Section - STRICTLY SEPARATED */}
      {isServerContext && canManageRoles && (
          <>
            <div 
                className="relative"
                onMouseEnter={() => setShowRolesSubmenu(true)}
                onMouseLeave={() => setShowRolesSubmenu(false)}
            >
                 <Item 
                    label="Роли" 
                    submenu 
                    icon={<Shield size={12} />}
                 />
                 
                 {/* Roles Submenu - FIXED positioning and layout */}
                 {showRolesSubmenu && (
                     <div className="absolute left-full top-0 ml-1 w-[220px] bg-[#111214] rounded p-1.5 shadow-xl border border-[#1E1F22] z-[110] max-h-[350px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                         <div className="px-2 py-1.5 text-[10px] font-bold text-discord-muted uppercase tracking-wide bg-[#1E1F22] sticky top-0 z-10">Назначить роль</div>
                         {manageableRoles.length === 0 && <div className="text-discord-muted text-xs p-2 text-center italic">Нет доступных ролей</div>}
                         {manageableRoles.map(role => (
                             <div 
                                key={role.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleRole?.(user.id, role.id);
                                }}
                                className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-[#5865F2] hover:text-white group transition-colors"
                             >
                                 <div className="flex items-center min-w-0">
                                     <div className="w-3 h-3 rounded-full mr-2 shrink-0 border border-white/10" style={{ backgroundColor: role.color }}></div>
                                     <span className="text-xs font-medium text-[#B5BAC1] group-hover:text-white truncate" style={{ maxWidth: '140px' }}>{role.name}</span>
                                 </div>
                                 {userRoleIds.includes(role.id) && <Check size={14} className="text-white shrink-0 ml-2" />}
                             </div>
                         ))}
                     </div>
                 )}
            </div>
            <Separator />
          </>
      )}

      {/* Punishments Section - STRICTLY SEPARATED & SELF-PROTECTED */}
      {isServerContext && (canTimeout || canKick || canBan) && (
          <>
            {canTimeout && <Item label="Тайм-аут" icon={<Clock size={12} />} danger onClick={() => onTimeout(user.id)} />}
            {canKick && <Item label="Выгнать" icon={<Gavel size={12} />} danger onClick={() => onBan(user.id)} />}
            {canBan && <Item label="Забанить" icon={<ShieldAlert size={12} />} danger onClick={() => onBan(user.id)} />}
            <Separator />
          </>
      )}
      
      <Item label="Копировать ID" icon={<Clipboard size={12} />} onClick={() => onCopyId(user.id)} />
    </div>
  );
};
