
import React, { useState } from 'react';
import { User, UserStatus, Channel } from '../types';
import { Users, Mic, Headphones, Settings, X, MicOff, PhoneOff } from 'lucide-react';
import { UserMiniProfile } from './UserMiniProfile';
import { voiceService } from '../services/voiceService';

interface DMListProps {
  currentUser: User;
  users: Record<string, User>;
  activeChannelId: string;
  onChannelClick: (id: string) => void;
  onFriendsClick: () => void;
  dmChannels: Channel[]; // List of DM 'channels'
  onOpenSettings: () => void;
  onUpdateStatus?: (status: any) => void;
}

export const DMList: React.FC<DMListProps> = ({ 
  currentUser, 
  users, 
  activeChannelId, 
  onChannelClick, 
  onFriendsClick, 
  dmChannels,
  onOpenSettings,
  onUpdateStatus
}) => {
  const [showMiniProfile, setShowMiniProfile] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Local simulated state if voice service isn't fully active here
  const [isDeafened, setIsDeafened] = useState(false);

  const isFriendsActive = activeChannelId === 'friends';

  const toggleMute = () => {
      voiceService.toggleMute();
      setIsMuted(!isMuted);
  }

  const toggleDeafen = () => {
      voiceService.toggleDeafen();
      setIsDeafened(!isDeafened);
  }

  return (
    <div className="w-60 bg-discord-light flex flex-col shrink-0">
      {/* Search Bar / Header */}
      <div className="h-12 border-b border-discord-dark flex items-center justify-center px-2 shrink-0 shadow-sm">
        <button className="w-full bg-[#1E1F22] text-left text-xs text-discord-muted py-1.5 px-2 rounded">
          Найти или начать беседу
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        
        {/* Friends Button */}
        <div 
          onClick={onFriendsClick}
          className={`flex items-center px-2 py-2 rounded cursor-pointer transition-colors mb-4
            ${isFriendsActive ? 'bg-discord-lighter text-white' : 'text-discord-muted hover:bg-discord-lighter hover:text-discord-text'}
          `}
        >
          <Users size={20} className="mr-3" />
          <span className="font-medium">Друзья</span>
        </div>

        <div className="flex items-center justify-between px-2 pt-2 pb-1 group cursor-pointer text-discord-muted hover:text-discord-text">
            <span className="text-xs font-bold uppercase">Личные сообщения</span>
            <span className="text-xs opacity-0 group-hover:opacity-100">+</span>
        </div>

        {dmChannels.map(channel => {
            // Find the OTHER user in this DM
            const recipientId = channel.recipientId;
            const recipient = recipientId ? users[recipientId] : null;
            
            if (!recipient) return null;

            return (
                <div 
                    key={channel.id}
                    onClick={() => onChannelClick(channel.id)}
                    className={`group flex items-center px-2 py-2 rounded cursor-pointer transition-colors relative
                        ${activeChannelId === channel.id ? 'bg-discord-lighter text-white' : 'text-discord-muted hover:bg-discord-lighter hover:text-discord-text'}
                    `}
                >
                    <div className="relative mr-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                             {recipient.avatar && <img src={recipient.avatar} alt={recipient.username} className="w-full h-full object-cover" />}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-discord-light rounded-full
                            ${recipient.status === UserStatus.ONLINE ? 'bg-discord-green' : ''}
                            ${recipient.status === UserStatus.IDLE ? 'bg-yellow-500' : ''}
                            ${recipient.status === UserStatus.DND ? 'bg-discord-red' : ''}
                            ${recipient.status === UserStatus.OFFLINE ? 'bg-discord-muted' : ''}
                        `} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <span className="truncate font-medium block">{recipient.username}</span>
                        {recipient.isBot && <span className="text-[9px] uppercase border border-discord-text px-1 rounded text-discord-text">BOT</span>}
                    </div>
                    <X size={14} className="opacity-0 group-hover:opacity-100 hover:text-white" />
                </div>
            )
        })}
      </div>

      {/* User Controls */}
      <div className="h-[52px] bg-[#232428] px-2 flex items-center shrink-0 relative">
        <div 
          onClick={() => setShowMiniProfile(!showMiniProfile)}
          className="group flex items-center mr-auto hover:bg-discord-lighter p-1 rounded cursor-pointer min-w-0"
        >
          <div className="relative mr-2">
            <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden">
                 {currentUser.avatar && <img src={currentUser.avatar} alt="avatar" />}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-discord-green border-2 border-[#232428] rounded-full"></div>
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-xs font-bold truncate">{currentUser.username}</div>
            <div className="text-discord-muted text-[10px] truncate">#{currentUser.discriminator}</div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={toggleMute}
            className={`w-8 h-8 flex items-center justify-center rounded hover:bg-discord-lighter relative ${isMuted ? 'text-discord-red' : 'text-white'}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button 
             onClick={toggleDeafen}
             className={`w-8 h-8 flex items-center justify-center rounded hover:bg-discord-lighter relative ${isDeafened ? 'text-discord-red' : 'text-white'}`}
          >
            {isDeafened ? <PhoneOff size={20} /> : <Headphones size={20} />}
          </button>
          <button 
            onClick={onOpenSettings}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-discord-lighter text-white"
          >
            <Settings size={20} />
          </button>
        </div>

        {showMiniProfile && (
            <UserMiniProfile 
                user={currentUser} 
                onClose={() => setShowMiniProfile(false)}
                onOpenSettings={onOpenSettings}
                onUpdateStatus={onUpdateStatus}
            />
        )}
      </div>
    </div>
  );
};
