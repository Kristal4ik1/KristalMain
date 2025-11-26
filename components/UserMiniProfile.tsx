
import React, { useEffect, useRef, useState } from 'react';
import { User, UserStatus } from '../types';
import { Edit2, Copy, Users, ChevronRight } from 'lucide-react';
import { UserBadges } from './UserBadges';

interface UserMiniProfileProps {
  user: User;
  onClose: () => void;
  onOpenSettings: () => void;
  onUpdateStatus?: (status: UserStatus) => void;
  positionClass?: string;
}

export const UserMiniProfile: React.FC<UserMiniProfileProps> = ({ user, onClose, onOpenSettings, onUpdateStatus, positionClass = "bottom-[60px] left-2" }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const bannerColor = user.bannerColor || '#000000';
  const statusColor = {
      [UserStatus.ONLINE]: 'bg-discord-green',
      [UserStatus.IDLE]: 'bg-yellow-500',
      [UserStatus.DND]: 'bg-discord-red',
      [UserStatus.OFFLINE]: 'bg-discord-muted'
  };

  const statusLabels = {
      [UserStatus.ONLINE]: 'В сети',
      [UserStatus.IDLE]: 'Не активен',
      [UserStatus.DND]: 'Не беспокоить',
      [UserStatus.OFFLINE]: 'Невидимка'
  };

  const copyId = () => {
      navigator.clipboard.writeText(user.id);
  };

  const handleStatusClick = (status: UserStatus) => {
      if (onUpdateStatus) onUpdateStatus(status);
      setShowStatusMenu(false);
  };

  return (
    <div 
        ref={modalRef} 
        className={`absolute ${positionClass} w-[270px] bg-[#111214] rounded-lg shadow-2xl z-50 animate-in slide-in-from-bottom-2 duration-200 border border-[#1E1F22]`}
        onClick={(e) => e.stopPropagation()}
    >
        {/* Banner - rounded top explicitly because parent is not overflow-hidden anymore */}
        <div className="h-[60px] rounded-t-lg" style={{ backgroundColor: bannerColor }}></div>
        
        {/* Avatar */}
        <div className="px-3 pb-3 relative">
             <div className="w-[72px] h-[72px] rounded-full border-[6px] border-[#111214] -mt-9 mb-2 relative bg-[#111214]">
                 <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                 <div className={`absolute bottom-0 right-0 w-5 h-5 border-[4px] border-[#111214] rounded-full ${statusColor[user.status]}`}></div>
             </div>
             
             <div className="font-bold text-white text-base leading-tight mb-0.5 truncate">{user.username}</div>
             <div className="text-discord-muted text-xs mb-3">#{user.discriminator}</div>

             {/* Badges */}
             {user.badges && user.badges.length > 0 && (
                <div className="absolute top-16 right-3 bg-[#111214] rounded p-1 border border-[#1E1F22]">
                    <UserBadges badges={user.badges} className="border-0 p-0 gap-1 bg-transparent" />
                </div>
             )}

             {/* Divider */}
             <div className="h-[1px] bg-[#2E3035] mb-2 mt-1"></div>

             {/* Menu Items */}
             <div className="space-y-0.5">
                 <div 
                    onClick={onOpenSettings}
                    className="flex items-center p-1.5 hover:bg-[#5865F2] hover:text-white rounded cursor-pointer group transition-colors"
                 >
                     <Edit2 size={16} className="text-discord-muted group-hover:text-white mr-2 shrink-0" />
                     <span className="text-sm font-medium text-discord-muted group-hover:text-white truncate">Редактировать профиль</span>
                 </div>

                 {/* Status Selector */}
                 <div 
                    className="relative"
                    onMouseEnter={() => setShowStatusMenu(true)}
                    onMouseLeave={() => setShowStatusMenu(false)}
                 >
                     <div className="flex items-center justify-between p-1.5 hover:bg-[#5865F2] hover:text-white rounded cursor-pointer group transition-colors">
                         <div className="flex items-center min-w-0">
                             <div className={`w-3 h-3 rounded-full ${statusColor[user.status]} border-2 border-[#111214] mr-2 shrink-0`}></div>
                             <span className="text-sm font-medium text-discord-muted group-hover:text-white truncate">
                                 {statusLabels[user.status]}
                             </span>
                         </div>
                         <ChevronRight size={14} className="text-discord-muted group-hover:text-white shrink-0" />
                     </div>

                     {/* Status Submenu - Positioned to the right */}
                     {showStatusMenu && (
                         <div className="absolute left-[calc(100%-4px)] top-0 w-[160px] bg-[#111214] rounded p-1 shadow-xl border border-[#1E1F22] z-[60]">
                             {Object.values(UserStatus).map((status) => (
                                 <div 
                                    key={status}
                                    onClick={(e) => { e.stopPropagation(); handleStatusClick(status); }}
                                    className="flex items-center p-1.5 rounded hover:bg-[#5865F2] hover:text-white cursor-pointer group transition-colors"
                                 >
                                     <div className={`w-2.5 h-2.5 rounded-full mr-2 ${statusColor[status]} shrink-0`}></div>
                                     <span className="text-sm font-medium text-discord-muted group-hover:text-white truncate">
                                         {statusLabels[status]}
                                     </span>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>

                 <div className="flex items-center justify-between p-1.5 hover:bg-[#5865F2] hover:text-white rounded cursor-pointer group transition-colors">
                     <div className="flex items-center min-w-0 overflow-hidden">
                         <Users size={16} className="text-discord-muted group-hover:text-white mr-2 shrink-0" />
                         <span className="text-sm font-medium text-discord-muted group-hover:text-white truncate">
                             Перекл. аккаунты <span className="text-[10px] opacity-70 ml-1">(потом)</span>
                         </span>
                     </div>
                 </div>
                 
                 <div className="h-[1px] bg-[#2E3035] my-1"></div>

                 <div 
                    onClick={copyId}
                    className="flex items-center p-1.5 hover:bg-[#5865F2] hover:text-white rounded cursor-pointer group transition-colors"
                 >
                     <Copy size={16} className="text-discord-muted group-hover:text-white mr-2 shrink-0" />
                     <span className="text-sm font-medium text-discord-muted group-hover:text-white truncate">Копировать ID</span>
                 </div>
             </div>
        </div>
    </div>
  );
};
