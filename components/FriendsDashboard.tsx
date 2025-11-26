import React, { useState } from 'react';
import { User, UserStatus, FriendStatus } from '../types';
import { MessageSquare, MoreVertical, Search, Check, X, Loader2 } from 'lucide-react';

interface FriendsDashboardProps {
  users: Record<string, User>;
  currentUser: User;
  onAddFriend: (username: string) => Promise<void>;
  onStartDM: (userId: string) => void;
  onAcceptFriend: (userId: string) => void;
  onDeclineFriend: (userId: string) => void;
}

type Tab = 'ONLINE' | 'ALL' | 'PENDING' | 'BLOCKED' | 'ADD';

export const FriendsDashboard: React.FC<FriendsDashboardProps> = ({ 
  users, 
  currentUser, 
  onAddFriend, 
  onStartDM,
  onAcceptFriend,
  onDeclineFriend
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('ONLINE');
  const [addFriendInput, setAddFriendInput] = useState('');
  const [addFriendSuccess, setAddFriendSuccess] = useState('');
  const [addFriendError, setAddFriendError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Convert Users Record to Array and filter out self/bots
  const allUsers = (Object.values(users) as User[]).filter(u => u.id !== currentUser.id && !u.isBot);

  const getFilteredUsers = () => {
    switch (activeTab) {
      case 'ONLINE':
        return allUsers.filter(u => 
          u.friendStatus === FriendStatus.FRIEND && 
          u.status !== UserStatus.OFFLINE
        );
      case 'ALL':
        return allUsers.filter(u => u.friendStatus === FriendStatus.FRIEND);
      case 'PENDING':
        return allUsers.filter(u => 
          u.friendStatus === FriendStatus.PENDING_INCOMING || 
          u.friendStatus === FriendStatus.PENDING_OUTGOING
        );
      case 'BLOCKED':
        return allUsers.filter(u => u.friendStatus === FriendStatus.BLOCKED);
      default:
        return [];
    }
  };

  const handleAddFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFriendSuccess('');
    setAddFriendError('');
    setIsAdding(true);

    if (!addFriendInput.trim()) {
        setIsAdding(false);
        return;
    }

    try {
        await onAddFriend(addFriendInput);
        setAddFriendSuccess(`Запрос дружбы отправлен пользователю ${addFriendInput}`);
        setAddFriendInput('');
    } catch (err: any) {
        setAddFriendError(err.message || 'Ошибка отправки запроса');
    } finally {
        setIsAdding(false);
    }
  };

  return (
    <div className="flex-1 bg-discord-dark flex flex-col min-w-0">
      {/* Header */}
      <div className="h-12 border-b border-discord-dark flex items-center px-4 shrink-0 shadow-sm bg-discord-dark">
        <div className="flex items-center text-discord-muted mr-4">
          <div className="font-bold text-white flex items-center mr-2">
            <span className="mr-2">👋</span> Друзья
          </div>
          <div className="h-6 w-[1px] bg-discord-light mx-2"></div>
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveTab('ONLINE')} 
            className={`px-2 hover:bg-discord-lighter rounded hover:text-white transition-colors ${activeTab === 'ONLINE' ? 'text-white font-medium bg-discord-lighter' : 'text-discord-muted'}`}
          >
            В сети
          </button>
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`px-2 hover:bg-discord-lighter rounded hover:text-white transition-colors ${activeTab === 'ALL' ? 'text-white font-medium bg-discord-lighter' : 'text-discord-muted'}`}
          >
            Все
          </button>
          <button 
            onClick={() => setActiveTab('PENDING')}
            className={`px-2 hover:bg-discord-lighter rounded hover:text-white transition-colors ${activeTab === 'PENDING' ? 'text-white font-medium bg-discord-lighter' : 'text-discord-muted'}`}
          >
            Ожидание
          </button>
          <button 
            onClick={() => setActiveTab('BLOCKED')}
            className={`px-2 hover:bg-discord-lighter rounded hover:text-white transition-colors ${activeTab === 'BLOCKED' ? 'text-white font-medium bg-discord-lighter' : 'text-discord-muted'}`}
          >
            Заблокированные
          </button>
          <button 
            onClick={() => setActiveTab('ADD')}
            className={`px-2 rounded text-white transition-colors ${activeTab === 'ADD' ? 'bg-transparent text-discord-green' : 'bg-discord-green'}`}
          >
            <span className={activeTab === 'ADD' ? 'text-discord-green' : 'text-white'}>Добавить в друзья</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'ADD' ? (
            <div>
              <h2 className="text-white font-bold text-base mb-2 uppercase">Добавить в друзья</h2>
              <p className="text-discord-muted text-sm mb-4">Вы можете добавить друга, используя его имя пользователя.</p>
              
              <form onSubmit={handleAddFriendSubmit} className={`bg-discord-light border p-3 rounded-lg flex items-center ${addFriendSuccess ? 'border-discord-green' : addFriendError ? 'border-discord-red' : 'border-black'}`}>
                <input 
                  type="text" 
                  placeholder="Имя пользователя"
                  className="flex-1 bg-transparent outline-none text-white"
                  value={addFriendInput}
                  onChange={(e) => setAddFriendInput(e.target.value)}
                  disabled={isAdding}
                />
                <button 
                  type="submit"
                  disabled={!addFriendInput || isAdding}
                  className="bg-discord-accent disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center"
                >
                  {isAdding && <Loader2 className="animate-spin mr-2" size={16} />}
                  Отправить запрос дружбы
                </button>
              </form>
              {addFriendSuccess && <div className="text-discord-green text-sm mt-2">{addFriendSuccess}</div>}
              {addFriendError && <div className="text-discord-red text-sm mt-2">{addFriendError}</div>}
            </div>
          ) : (
            <div>
              <div className="text-xs font-bold text-discord-muted uppercase mb-4">
                  {activeTab === 'ONLINE' ? `В сети — ${getFilteredUsers().length}` : 
                  activeTab === 'ALL' ? `Все друзья — ${getFilteredUsers().length}` : 
                  activeTab === 'PENDING' ? `Ожидание — ${getFilteredUsers().length}` :
                  `Заблокировано — ${getFilteredUsers().length}`}
              </div>

              <div className="space-y-2">
                  {getFilteredUsers().length === 0 && (
                      <div className="flex flex-col items-center justify-center mt-20 text-discord-muted">
                          <div className="w-64 h-40 bg-[url('https://discord.com/assets/b6a839d09af183a31c62.svg')] bg-no-repeat bg-contain opacity-50 mb-6"></div>
                          <p>Здесь пока пусто. {activeTab === 'ONLINE' ? 'Никого нет в сети.' : 'Начните с добавления друзей!'}</p>
                      </div>
                  )}

                  {getFilteredUsers().map(user => (
                    <div key={user.id} className="group flex items-center justify-between p-2.5 rounded hover:bg-discord-light border-t border-discord-light hover:border-transparent cursor-pointer">
                        <div className="flex items-center">
                          <div className="relative mr-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden">
                                  {user.avatar && <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />}
                              </div>
                              <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#313338] group-hover:border-discord-light rounded-full
                                  ${user.status === UserStatus.ONLINE ? 'bg-discord-green' : ''}
                                  ${user.status === UserStatus.IDLE ? 'bg-yellow-500' : ''}
                                  ${user.status === UserStatus.DND ? 'bg-discord-red' : ''}
                                  ${user.status === UserStatus.OFFLINE ? 'bg-discord-muted' : ''}
                              `} />
                          </div>
                          <div>
                              <div className="flex items-center">
                                  <span className="text-white font-bold text-sm mr-1">{user.username}</span>
                                  <span className="text-discord-muted text-xs hidden group-hover:block">#{user.discriminator}</span>
                              </div>
                              <div className="text-xs text-discord-muted">
                                  {user.friendStatus === FriendStatus.PENDING_INCOMING ? 'Входящий запрос дружбы' : 
                                  user.friendStatus === FriendStatus.PENDING_OUTGOING ? 'Исходящий запрос дружбы' :
                                  user.status === UserStatus.ONLINE ? 'В сети' : 'Не в сети'}
                              </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {user.friendStatus === FriendStatus.FRIEND && (
                              <button 
                                  onClick={(e) => { e.stopPropagation(); onStartDM(user.id); }}
                                  className="w-8 h-8 rounded-full bg-[#1E1F22] flex items-center justify-center text-discord-muted hover:text-white hover:bg-discord-lighter"
                                  title="Сообщение"
                              >
                                  <MessageSquare size={18} />
                              </button>
                          )}
                          {user.friendStatus === FriendStatus.PENDING_INCOMING && (
                              <>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onAcceptFriend(user.id); }}
                                    className="w-8 h-8 rounded-full bg-[#1E1F22] flex items-center justify-center text-discord-green hover:text-white hover:bg-discord-green" 
                                    title="Принять"
                                  >
                                      <Check size={18} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onDeclineFriend(user.id); }}
                                    className="w-8 h-8 rounded-full bg-[#1E1F22] flex items-center justify-center text-discord-red hover:text-white hover:bg-discord-red" 
                                    title="Отклонить"
                                  >
                                      <X size={18} />
                                  </button>
                              </>
                          )}
                          <button className="w-8 h-8 rounded-full bg-[#1E1F22] flex items-center justify-center text-discord-muted hover:text-white hover:bg-discord-lighter">
                              <MoreVertical size={18} />
                          </button>
                        </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Empty State as requested */}
        <div className="w-80 bg-discord-light border-l border-discord-dark hidden lg:block p-4">
            <h3 className="font-bold text-white text-xl mb-4">Сейчас активны</h3>
             <div className="text-center mt-10 opacity-0">
               {/* Content removed as requested by user to look cleaner */}
            </div>
        </div>
      </div>
    </div>
  );
};