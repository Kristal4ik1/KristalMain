
import React, { useState, useEffect } from 'react';
import { User, UserStatus } from '../types';
import { X, MessageSquare, MoreHorizontal, UserPlus, Disc, Loader2, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { UserBadges } from './UserBadges';

interface UserProfileModalProps {
  user: User;
  currentUser: User;
  onClose: () => void;
  onMessage: (userId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, currentUser, onClose, onMessage }) => {
  const [activeTab, setActiveTab] = useState<'ACTIVITY' | 'FRIENDS' | 'SERVERS'>('ACTIVITY');
  const [note, setNote] = useState('');
  const [initialNote, setInitialNote] = useState('');
  const [mutualServers, setMutualServers] = useState<any[]>([]);
  const [mutualFriends, setMutualFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock colors for banner if not provided
  const bannerColor = user.bannerColor || '#000000'; 

  useEffect(() => {
    const fetchData = async () => {
        if (!currentUser.token) return;
        setIsLoading(true);
        try {
            // Load Note
            const noteData = await api.getUserNote(currentUser.id, user.id, currentUser.token);
            setNote(noteData);
            setInitialNote(noteData);

            // Load Mutuals
            if (user.id !== currentUser.id) {
                const [servers, friends] = await Promise.all([
                    api.getMutualServers(currentUser.id, user.id, currentUser.token),
                    api.getMutualFriends(currentUser.id, user.id, currentUser.token)
                ]);
                setMutualServers(servers);
                setMutualFriends(friends);
            }
        } catch (e) {
            console.error("Error fetching profile data", e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [user.id, currentUser.id, currentUser.token]);

  const handleNoteBlur = async () => {
      if (note !== initialNote && currentUser.token) {
          try {
              await api.saveUserNote(currentUser.id, user.id, note, currentUser.token);
              setInitialNote(note);
          } catch (e) {
              console.error("Failed to save note", e);
          }
      }
  };

  const formatDate = (dateString?: string) => {
      if (!dateString) return 'Неизвестно';
      const date = new Date(dateString);
      // Validate date
      if (isNaN(date.getTime())) return 'Неизвестно';
      
      return date.toLocaleDateString('ru-RU', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
      });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-[600px] h-[400px] bg-[#111214] rounded-2xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - User Card */}
        <div className="w-[300px] bg-[#232428] flex flex-col relative shrink-0">
             {/* Banner */}
             <div className="h-[120px] w-full" style={{ backgroundColor: bannerColor }}></div>
             
             {/* Avatar */}
             <div className="absolute top-[76px] left-[20px]">
                 <div className="w-[90px] h-[90px] rounded-full border-[6px] border-[#232428] relative bg-[#232428]">
                     <div className="w-full h-full rounded-full overflow-hidden">
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                     </div>
                     <div className={`absolute bottom-1 right-1 w-6 h-6 border-[4px] border-[#232428] rounded-full
                         ${user.status === UserStatus.ONLINE ? 'bg-discord-green' : ''}
                         ${user.status === UserStatus.IDLE ? 'bg-yellow-500' : ''}
                         ${user.status === UserStatus.DND ? 'bg-discord-red' : ''}
                         ${user.status === UserStatus.OFFLINE ? 'bg-discord-muted' : ''}
                     `}></div>
                 </div>
             </div>
             
             {/* Badges */}
             {user.badges && user.badges.length > 0 && (
                <div className="absolute top-[130px] right-4">
                    <UserBadges badges={user.badges} />
                </div>
             )}

             {/* User Info */}
             <div className="mt-[50px] px-4 pb-4 overflow-y-auto custom-scrollbar flex-1">
                 <div className="rounded-lg p-2 mb-1">
                     <div className="font-bold text-white text-xl leading-tight">{user.username}</div>
                     <div className="text-discord-muted text-sm">#{user.discriminator}</div>
                 </div>

                 <div className="px-2 mb-4">
                     <div className="h-[1px] bg-[#3F4147] mb-3"></div>
                     
                     <div className="mb-4">
                         <div className="text-xs font-bold text-discord-muted uppercase mb-1">В числе участников с</div>
                         <div className="flex items-center text-sm text-[#D1D5DB]">
                             <Calendar size={14} className="mr-2 text-discord-muted" />
                             {formatDate(user.createdAt)}
                         </div>
                     </div>

                     <div className="mb-2">
                        <div className="text-xs font-bold text-discord-muted uppercase mb-1">Заметка</div>
                        <textarea 
                            className="w-full bg-transparent text-xs text-[#DBDEE1] resize-none outline-none border-none placeholder-[#949BA4] h-8 hover:h-16 focus:h-16 rounded p-1 transition-all duration-200 focus:bg-[#111214] hover:bg-[#111214]"
                            placeholder="Нажмите, чтобы добавить заметку"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            onBlur={handleNoteBlur}
                        />
                     </div>
                 </div>
             </div>
             
             {/* Actions */}
             <div className="p-4 pt-0 mb-2">
                 {user.id !== currentUser.id && (
                     <div className="flex gap-2">
                        <button 
                            onClick={() => { onMessage(user.id); onClose(); }}
                            className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white py-1.5 rounded-[4px] text-sm font-medium transition-colors"
                        >
                            Сообщение
                        </button>
                        <button className="bg-[#4E5058] hover:bg-[#6D6F78] text-white p-1.5 rounded-[4px] transition-colors">
                            <UserPlus size={20} />
                        </button>
                        <button className="bg-[#4E5058] hover:bg-[#6D6F78] text-white p-1.5 rounded-[4px] transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                     </div>
                 )}
             </div>
        </div>

        {/* Right Side - Tabs */}
        <div className="flex-1 bg-[#111214] flex flex-col min-w-0">
            <div className="flex items-center px-4 pt-4 border-b border-[#1E1F22] shrink-0">
                 <button 
                    onClick={() => setActiveTab('ACTIVITY')}
                    className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors mr-4 ${activeTab === 'ACTIVITY' ? 'border-white text-white' : 'border-transparent text-[#B5BAC1] hover:text-[#DBDEE1]'}`}
                 >
                    Активность
                 </button>
                 <button 
                    onClick={() => setActiveTab('FRIENDS')}
                    className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors mr-4 ${activeTab === 'FRIENDS' ? 'border-white text-white' : 'border-transparent text-[#B5BAC1] hover:text-[#DBDEE1]'}`}
                 >
                    {mutualFriends.length} общих друзей
                 </button>
                 <button 
                    onClick={() => setActiveTab('SERVERS')}
                    className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'SERVERS' ? 'border-white text-white' : 'border-transparent text-[#B5BAC1] hover:text-[#DBDEE1]'}`}
                 >
                    {mutualServers.length} общих серверов
                 </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-discord-muted">
                        <Loader2 className="animate-spin mr-2" /> Загрузка...
                    </div>
                ) : (
                    <>
                        {activeTab === 'ACTIVITY' && (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <div className="mb-2">
                                     <div className="w-16 h-16 bg-[#2B2D31] rounded-full flex items-center justify-center mx-auto mb-3">
                                         <Disc size={32} className="text-discord-muted" />
                                     </div>
                                </div>
                                <div className="text-white font-bold text-base mb-1">
                                    Когда нибудь Алексей этим займеться(не точно)
                                </div>
                            </div>
                        )}

                        {activeTab === 'FRIENDS' && (
                            <div className="space-y-2">
                                {mutualFriends.length === 0 ? (
                                     <div className="flex flex-col items-center justify-center h-full mt-10">
                                         <div className="text-discord-muted text-sm mb-1">Нет общих друзей</div>
                                         <div className="text-[#5865F2] text-xs cursor-pointer hover:underline" onClick={onClose}>Добавить в друзья</div>
                                     </div>
                                ) : (
                                    mutualFriends.map(friend => (
                                        <div key={friend.id} className="flex items-center p-2 rounded hover:bg-[#1E1F22] group cursor-pointer transition-colors">
                                            <div className="w-9 h-9 rounded-full mr-3 overflow-hidden">
                                                <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-white group-hover:underline">{friend.username}</div>
                                                <div className="text-xs text-[#B5BAC1]">#{friend.discriminator}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'SERVERS' && (
                             <div className="space-y-2">
                                 {mutualServers.length === 0 ? (
                                     <div className="flex flex-col items-center justify-center h-full mt-10">
                                        <div className="text-discord-muted text-sm">Нет общих серверов</div>
                                     </div>
                                 ) : (
                                    mutualServers.map(server => (
                                        <div key={server.id} className="flex items-center p-2 rounded hover:bg-[#1E1F22] group cursor-pointer transition-colors">
                                            <div className="w-9 h-9 rounded-[14px] mr-3 overflow-hidden bg-[#2B2D31] flex items-center justify-center text-white text-xs font-bold text-center">
                                                {server.icon ? <img src={server.icon} alt="" className="w-full h-full object-cover" /> : server.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-white">{server.name}</div>
                                            </div>
                                        </div>
                                    ))
                                 )}
                             </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
