
import React from 'react';
import { Server, User, UserStatus } from '../types';
import { Shield } from 'lucide-react';

interface UserListProps {
  server: Server;
  users: Record<string, User>;
  currentUser?: User;
  onOpenModeration?: (user: User) => void;
  onOpenProfile?: (user: User) => void;
  onContextMenu?: (e: React.MouseEvent, user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ server, users, currentUser, onOpenModeration, onOpenProfile, onContextMenu }) => {
  const memberUsers = server.members.map(id => users[id]).filter(Boolean).filter(u => !u.isBanned);

  const online = memberUsers.filter(u => u.status !== UserStatus.OFFLINE);
  const offline = memberUsers.filter(u => u.status === UserStatus.OFFLINE);

  const UserItem: React.FC<{ user: User }> = ({ user }) => (
    <div 
      className="flex items-center px-2 py-1.5 rounded hover:bg-discord-lighter cursor-pointer opacity-90 hover:opacity-100 group"
      onClick={() => onOpenProfile?.(user)}
      onContextMenu={(e) => {
          e.preventDefault();
          if (onContextMenu) {
              onContextMenu(e, user);
          } else {
              onOpenProfile?.(user);
          }
      }}
    >
      <div className="relative mr-3">
        <div className="w-8 h-8 rounded-full overflow-hidden">
             {user.avatar && <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />}
        </div>
        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-[3px] border-discord-light rounded-full
          ${user.status === UserStatus.ONLINE ? 'bg-discord-green' : ''}
          ${user.status === UserStatus.IDLE ? 'bg-yellow-500' : ''}
          ${user.status === UserStatus.DND ? 'bg-discord-red' : ''}
          ${user.status === UserStatus.OFFLINE ? 'bg-discord-muted' : ''}
        `} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center truncate">
              <span className={`font-medium text-sm truncate ${user.status === UserStatus.OFFLINE ? 'text-discord-muted' : 'text-discord-text'}`}>
                  {user.username}
              </span>
              {user.isBot && <span className="ml-1.5 bg-discord-accent text-[9px] text-white px-1.5 rounded-[3px] py-[0px]">BOT</span>}
              {user.isAdmin && <Shield size={12} className="text-discord-green ml-1 shrink-0" />}
            </div>
          </div>
          {/* Custom status or empty */}
          {user.status !== UserStatus.OFFLINE && user.customStatus && (
              <div className="text-xs text-discord-muted truncate w-full" title={user.customStatus}>
                  {user.customStatus}
              </div>
          )}
          {user.timeoutUntil && new Date(user.timeoutUntil) > new Date() && (
             <div className="text-[10px] text-discord-red font-bold uppercase">Timeout</div>
          )}
      </div>
    </div>
  );

  return (
    <div className="w-60 bg-discord-light flex flex-col shrink-0 overflow-y-auto p-3">
      <div className="text-xs font-bold text-discord-muted uppercase mb-2 px-2">В сети — {online.length}</div>
      <div className="space-y-0.5 mb-6">
        {online.map(user => <UserItem key={user.id} user={user} />)}
      </div>

      <div className="text-xs font-bold text-discord-muted uppercase mb-2 px-2">Не в сети — {offline.length}</div>
      <div className="space-y-0.5">
        {offline.map(user => <UserItem key={user.id} user={user} />)}
      </div>
    </div>
  );
};
