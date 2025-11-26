
import React, { useEffect, useState, useRef } from 'react';
import { Server, ChannelType, User, Channel } from '../types';
import { 
    Hash, Volume2, ChevronDown, Mic, Headphones, Settings, 
    MicOff, PhoneOff, Signal, X, UserPlus, FolderPlus, 
    PlusCircle, LogOut, ShieldAlert, Plus, Video, VideoOff, ScreenShare, Rocket, Megaphone, Activity
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { UserMiniProfile } from './UserMiniProfile';

interface ChannelListProps {
  server: Server;
  activeChannelId: string;
  onChannelClick: (id: string, type: ChannelType) => void;
  currentUser: User;
  onOpenSettings: () => void;
  onOpenServerSettings?: () => void;
  onLeaveServer: (serverId: string) => void;
  onCreateChannel: (serverId: string, categoryId?: string, type?: ChannelType) => void;
  onEditChannel: (channel: Channel) => void;
  onInvite: () => void;
  users: Record<string, User>; // Need users map to render avatars
  onUpdateStatus?: (status: any) => void;
  onOpenProfile: (user: User) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({ 
    server, 
    activeChannelId, 
    onChannelClick, 
    currentUser, 
    onOpenSettings,
    onOpenServerSettings,
    onLeaveServer,
    onCreateChannel,
    onEditChannel,
    onInvite,
    users,
    onUpdateStatus,
    onOpenProfile
}) => {
  const [voiceState, setVoiceState] = useState(voiceService['state']);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMiniProfile, setShowMiniProfile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check for permissions (Owner only for now as a robust proxy for "Manage Channels")
  const canManageChannels = server.ownerId === currentUser.id;

  useEffect(() => {
    const unsubscribe = voiceService.subscribe(setVoiceState);
    return () => { unsubscribe(); };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setIsMenuOpen(false);
          }
      };

      if (isMenuOpen) {
          document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, [isMenuOpen]);

  const handleInviteClick = () => {
      onInvite();
      setIsMenuOpen(false);
  };
  
  const handleServerSettingsClick = () => {
      if (onOpenServerSettings) onOpenServerSettings();
      setIsMenuOpen(false);
  };

  const currentVoiceChannel = server.channels.find(c => c.id === voiceState.activeChannelId);

  return (
    <div className="w-60 bg-discord-light flex flex-col shrink-0 relative">
      {/* Server Header */}
      <div 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`h-12 border-b border-discord-dark flex items-center justify-between px-4 cursor-pointer hover:bg-discord-lighter transition-colors shadow-sm ${isMenuOpen ? 'bg-discord-lighter' : ''}`}
      >
        <h1 className="font-bold text-white truncate">{server.name}</h1>
        {isMenuOpen ? <X size={16} /> : <ChevronDown size={16} />}
      </div>

      {/* Server Menu Dropdown */}
      {isMenuOpen && (
          <div ref={menuRef} className="absolute top-14 left-2.5 w-56 bg-[#111214] rounded-md shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div onClick={handleInviteClick} className="flex items-center justify-between px-2 py-2 rounded hover:bg-discord-accent text-[#B5BAC1] hover:text-white cursor-pointer group">
                  <span className="text-sm font-medium">Пригласить людей</span>
                  <UserPlus size={16} className="text-[#B5BAC1] group-hover:text-white" />
              </div>
              
              {canManageChannels && (
                  <div onClick={handleServerSettingsClick} className="flex items-center justify-between px-2 py-2 rounded hover:bg-discord-lighter text-[#B5BAC1] hover:text-white cursor-pointer group">
                      <span className="text-sm font-medium">Настройки сервера</span>
                      <Settings size={16} className="text-[#B5BAC1] group-hover:text-white" />
                  </div>
              )}
              
              <div className="h-[1px] bg-[#1F2023] my-1"></div>
              
              {canManageChannels && (
                  <>
                    <div onClick={() => { onCreateChannel(server.id); setIsMenuOpen(false); }} className="flex items-center justify-between px-2 py-2 rounded hover:bg-discord-lighter text-[#B5BAC1] hover:text-white cursor-pointer group">
                        <span className="text-sm font-medium">Создать канал</span>
                        <PlusCircle size={16} className="text-[#B5BAC1] group-hover:text-white" />
                    </div>
                    <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-discord-lighter text-[#B5BAC1] hover:text-white cursor-pointer group">
                        <span className="text-sm font-medium">Создать категорию</span>
                        <FolderPlus size={16} className="text-[#B5BAC1] group-hover:text-white" />
                    </div>
                     <div className="h-[1px] bg-[#1F2023] my-1"></div>
                  </>
              )}

               <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-discord-lighter text-[#B5BAC1] hover:text-white cursor-pointer group">
                  <span className="text-sm font-medium">Пожаловаться на рейд</span>
                  <ShieldAlert size={16} className="text-pink-500 group-hover:text-white" />
              </div>
              <div onClick={() => { onLeaveServer(server.id); setIsMenuOpen(false); }} className="flex items-center justify-between px-2 py-2 rounded hover:bg-discord-red text-discord-red hover:text-white cursor-pointer group">
                  <span className="text-sm font-medium">Покинуть сервер</span>
                  <LogOut size={16} className="text-discord-red group-hover:text-white" />
              </div>
          </div>
      )}

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
        {server.categories.map(category => {
          const categoryChannels = server.channels.filter(c => c.categoryId === category.id);
          
          return (
            <div key={category.id}>
              <div className="flex items-center justify-between px-1 mb-1 group">
                  <div className="flex items-center text-xs font-bold text-discord-muted uppercase hover:text-discord-text cursor-pointer">
                    <ChevronDown size={10} className="mr-0.5" />
                    {category.name}
                  </div>
                  {canManageChannels && (
                      <button 
                        onClick={() => onCreateChannel(server.id, category.id)}
                        className="text-discord-muted hover:text-discord-text"
                        title="Создать канал"
                      >
                          <Plus size={14} />
                      </button>
                  )}
              </div>
              
              <div className="space-y-0.5">
                {categoryChannels.map(channel => {
                  const isActive = activeChannelId === channel.id;
                  const isVoice = channel.type === ChannelType.VOICE;
                  // Check if this channel is the one we are actively talking in
                  const isVoiceConnected = isVoice && voiceState.activeChannelId === channel.id;
                  
                  // Get participants for this channel
                  const participants = voiceState.channelParticipants[channel.id] || [];

                  return (
                    <div key={channel.id} className="mb-0.5">
                        <div 
                          onClick={() => onChannelClick(channel.id, channel.type)}
                          className={`group flex items-center px-2 py-1 cursor-pointer transition-all duration-200 relative
                            ${isActive ? 'bg-discord-lighter text-white rounded-[8px]' : 'text-discord-muted hover:bg-discord-lighter hover:text-discord-text rounded-[4px] hover:rounded-[8px]'}
                          `}
                        >
                          {isVoice ? (
                            <Volume2 size={18} className="mr-1.5 text-discord-muted shrink-0" />
                          ) : (
                            <Hash size={18} className="mr-1.5 text-discord-muted shrink-0" />
                          )}
                          
                          <div className="flex-1 truncate">
                              <span className={`font-medium ${isVoiceConnected ? 'text-white' : ''}`}>{channel.name}</span>
                          </div>
                          
                          {canManageChannels && (
                              <div 
                                className="hidden group-hover:flex absolute right-1 top-1 bg-discord-lighter p-0.5 rounded shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditChannel(channel);
                                }}
                              >
                                 <Settings size={14} className="text-discord-muted hover:text-white" />
                              </div>
                          )}
                        </div>
                        
                        {/* Voice Participants List */}
                        {isVoice && participants.length > 0 && (
                            <div className="pl-6 pt-1 pb-1 space-y-1">
                                {participants.map(userId => {
                                    const user = users[userId];
                                    if (!user) return null;
                                    return (
                                        <div key={userId} className="flex items-center px-1 py-0.5 rounded hover:bg-discord-lighter/50 cursor-pointer">
                                            <div className="w-5 h-5 rounded-full overflow-hidden mr-2">
                                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-discord-muted text-sm truncate max-w-[120px]">{user.username}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Info Panel (if connected) */}
      {voiceState.isConnected && (
         <div className="bg-[#232428] border-b border-[#1E1F22] p-2">
             <div className="flex items-center justify-between mb-2">
                 <div className="flex flex-col overflow-hidden mr-2">
                     <div className="flex items-center text-discord-green text-xs font-bold hover:underline cursor-pointer truncate">
                         <Signal size={14} className="mr-1.5 shrink-0" />
                         <span className="truncate">Голосовая связь подключена</span>
                     </div>
                     <div className="text-discord-muted text-xs flex items-center mt-0.5 truncate">
                          <span className="text-white hover:underline cursor-pointer mr-1 truncate">
                              {currentVoiceChannel?.name || 'Unknown'}
                          </span>
                          <span className="shrink-0">/</span>
                          <span className="hover:underline cursor-pointer ml-1 truncate">
                              {server.name}
                          </span>
                     </div>
                 </div>
                 
                 <div className="flex items-center space-x-1 shrink-0">
                      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#35373C] text-white">
                          <Activity size={18} />
                      </button>
                      <button 
                        onClick={() => voiceService.leaveChannel()}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#35373C] text-white"
                        title="Отключиться"
                      >
                          <PhoneOff size={18} />
                      </button>
                 </div>
             </div>
             
             <div className="grid grid-cols-4 gap-2">
                 <button 
                    onClick={() => voiceService.toggleVideo()}
                    className={`flex items-center justify-center rounded-[8px] py-1.5 transition-colors
                        ${voiceState.isVideoEnabled ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#2B2D31] hover:bg-[#35373C] text-white'}
                    `}
                 >
                     {voiceState.isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                 </button>
                 
                 <button 
                    onClick={() => voiceService.toggleScreenShare()}
                    className={`flex items-center justify-center rounded-[8px] py-1.5 transition-colors
                        ${voiceState.isScreenSharingEnabled ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#2B2D31] hover:bg-[#35373C] text-white'}
                    `}
                 >
                     <ScreenShare size={18} />
                 </button>
                 
                 <button className="flex items-center justify-center bg-[#2B2D31] hover:bg-[#35373C] text-white rounded-[8px] py-1.5 transition-colors">
                     <Rocket size={18} />
                 </button>
                 
                 <button className="flex items-center justify-center bg-[#2B2D31] hover:bg-[#35373C] text-white rounded-[8px] py-1.5 transition-colors">
                     <Megaphone size={18} />
                 </button>
             </div>
         </div>
      )}

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
            onClick={() => voiceService.toggleMute()}
            className={`w-8 h-8 flex items-center justify-center rounded hover:bg-discord-lighter relative
                ${voiceState.isMuted ? 'text-discord-red' : 'text-white'}
            `}
          >
            {voiceState.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button 
            onClick={() => voiceService.toggleDeafen()}
            className={`w-8 h-8 flex items-center justify-center rounded hover:bg-discord-lighter relative
                ${voiceState.isDeafened ? 'text-discord-red' : 'text-white'}
            `}
          >
            {voiceState.isDeafened ? <PhoneOff size={20} /> : <Headphones size={20} />}
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
