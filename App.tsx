
import React, { useState, useEffect } from 'react';
import { MOCK_SERVERS, INITIAL_MESSAGES } from './constants';
import { ServerList } from './components/ServerList';
import { ChannelList } from './components/ChannelList';
import { DMList } from './components/DMList';
import { ChatArea } from './components/ChatArea';
import { UserList } from './components/UserList';
import { FriendsDashboard } from './components/FriendsDashboard';
import { ModerationModal } from './components/ModerationModal';
import { CreateServerModal } from './components/CreateServerModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { ServerSettingsModal } from './components/ServerSettingsModal';
import { InviteModal } from './components/InviteModal';
import { CreateChannelModal } from './components/CreateChannelModal';
import { ChannelSettingsModal } from './components/ChannelSettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { UserContextMenu } from './components/UserContextMenu';
import { BanScreen } from './components/BanScreen';
import { Message, User, Server, FriendStatus, Channel, ChannelType } from './types';
import { databaseService } from './services/databaseService';
import { authService } from './services/authService';
import { api } from './services/api';
import { voiceService } from './services/voiceService';

const App: React.FC = () => {
  // Auth State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // View State (Landing -> Auth -> App)
  const [appState, setAppState] = useState<'LANDING' | 'AUTH' | 'APP'>('LANDING');

  // Navigation State
  const [viewMode, setViewMode] = useState<'SERVER' | 'HOME'>('SERVER');
  const [activeServerId, setActiveServerId] = useState<string>('home');
  
  // Server View State
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  
  // Home View State
  const [activeHomeChannelId, setActiveHomeChannelId] = useState<string>('friends'); 
  const [dmChannels, setDmChannels] = useState<Channel[]>([]);

  // Data State
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [servers, setServers] = useState<Server[]>([]); 
  const [showUserList, setShowUserList] = useState(true);
  
  // Modal State
  const [activeModerationUser, setActiveModerationUser] = useState<User | null>(null);
  const [activeProfileUser, setActiveProfileUser] = useState<User | null>(null);
  const [showCreateServerModal, setShowCreateServerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showServerSettingsModal, setShowServerSettingsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [createChannelState, setCreateChannelState] = useState<{
      isOpen: boolean;
      serverId: string;
      categoryId?: string;
  }>({ isOpen: false, serverId: '' });
  
  const [editChannel, setEditChannel] = useState<Channel | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
      isOpen: boolean;
      x: number;
      y: number;
      user: User | null;
  }>({ isOpen: false, x: 0, y: 0, user: null });

  useEffect(() => {
    const initApp = async () => {
      await databaseService.init();
      const [loadedUsers, loadedServers] = await Promise.all([
          api.getUsers(),
          api.getServers()
      ]);
      setUsers(loadedUsers);
      setServers(loadedServers);
      if (loadedServers.length > 0 && activeServerId !== 'home') {
          setActiveServerId('home');
          setViewMode('HOME');
      } else {
          setActiveServerId('home');
          setViewMode('HOME');
      }
    };
    initApp();
  }, []);

  useEffect(() => {
     if (!currentUserId) return;
     const syncFriends = async () => {
         try {
            const relationships = await api.getUserRelationships(currentUserId);
            // Also refresh current user data (for bans/badges updates)
            const freshUsers = await api.getUsers();
            
            setUsers(prev => {
                const next = { ...prev, ...freshUsers };
                // Reset friend statuses to recalculate
                Object.keys(next).forEach(key => {
                    if (key !== currentUserId) next[key].friendStatus = FriendStatus.NONE;
                });
                relationships.forEach(rel => {
                    const otherId = rel.userId1 === currentUserId ? rel.userId2 : rel.userId1;
                    if (next[otherId]) {
                        if (rel.status === 'FRIEND') next[otherId].friendStatus = FriendStatus.FRIEND;
                        else if (rel.status === 'PENDING') {
                            next[otherId].friendStatus = rel.initiatorId === currentUserId 
                                ? FriendStatus.PENDING_OUTGOING 
                                : FriendStatus.PENDING_INCOMING;
                        }
                    }
                });
                return next;
            });
         } catch (e) {
             console.error("Sync error", e);
         }
     };
     syncFriends();
     const interval = setInterval(syncFriends, 5000); 
     return () => clearInterval(interval);
  }, [currentUserId]);

  useEffect(() => {
      if (currentUserId) {
          voiceService.init(currentUserId);
      }
  }, [currentUserId]);

  const currentUser = currentUserId ? users[currentUserId] : null;
  const userServers = currentUser 
      ? servers.filter(s => s.members.includes(currentUser.id))
      : [];
  const activeServer = servers.find(s => s.id === activeServerId);
  const activeChannel = viewMode === 'SERVER' 
      ? (activeServer ? (activeServer.channels.find(c => c.id === activeChannelId) || activeServer.channels.find(c => c.type === ChannelType.TEXT) || activeServer.channels[0]) : undefined)
      : dmChannels.find(c => c.id === activeHomeChannelId);
  const currentChannelId = viewMode === 'SERVER' ? activeChannelId : activeHomeChannelId;
  const channelMessages = messages.filter(m => m.channelId === currentChannelId);

  const handleLogin = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { user, token } = await api.login(email, password);
      setCurrentUserId(user.id);
      setAuthToken(token);
      setViewMode('HOME'); 
      setActiveServerId('home');
      setAppState('APP');
    } catch (e) {
      alert("Ошибка входа: " + e.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, username: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { user, token } = await api.register(email, username, password);
      setUsers(prev => ({ ...prev, [user.id]: user }));
      setCurrentUserId(user.id);
      setAuthToken(token);
      setViewMode('HOME');
      setActiveServerId('home');
      setAppState('APP');
    } catch (e) {
      alert("Ошибка регистрации: " + e.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
      setCurrentUserId(null);
      setAuthToken(null);
      setShowSettingsModal(false);
      setAppState('LANDING');
      // Reset voice
      voiceService.leaveChannel();
  };

  const handleUpdateProfile = async (userId: string, data: Partial<User>) => {
      try {
          const updatedUser = await api.updateUser(userId, data, authToken || '');
          setUsers(prev => ({ ...prev, [userId]: updatedUser }));
      } catch (error) {
          console.error("Failed to update profile", error);
      }
  };

  const handleCreateServer = async (name: string, icon?: string) => {
      if (!currentUserId) return;
      try {
          const newServer = await api.createServer(name, authToken || '', currentUserId, icon);
          setServers(prev => [...prev, newServer]);
          setShowCreateServerModal(false);
          setActiveServerId(newServer.id);
          setViewMode('SERVER');
          if (newServer.channels.length > 0) setActiveChannelId(newServer.channels[0].id);
      } catch (error) { console.error(error); }
  };
  
  const handleUpdateServer = async (serverId: string, data: Partial<Server>) => {
      try {
          const updatedServer = await api.updateServer(serverId, data, authToken || '');
          setServers(prev => prev.map(s => s.id === serverId ? updatedServer : s));
      } catch (error) { console.error(error); }
  };

  const handleJoinServer = async (inviteCode: string) => {
      if (!currentUserId) return;
      try {
          const joinedServer = await api.joinServer(inviteCode, authToken || '', currentUserId);
          const exists = servers.find(s => s.id === joinedServer.id);
          if (!exists) setServers(prev => [...prev, joinedServer]);
          else setServers(prev => prev.map(s => s.id === joinedServer.id ? joinedServer : s));
          setShowCreateServerModal(false);
          setActiveServerId(joinedServer.id);
          setViewMode('SERVER');
          if (joinedServer.channels.length > 0) setActiveChannelId(joinedServer.channels[0].id);
      } catch (error) { throw error; }
  };

  const handleLeaveServer = async (serverId: string) => {
      if (!currentUserId || !confirm("Вы уверены, что хотите покинуть этот сервер?")) return;
      try {
          await api.leaveServer(serverId, authToken || '', currentUserId);
          setServers(prev => prev.map(s => {
              if (s.id === serverId) return { ...s, members: s.members.filter(m => m !== currentUserId) };
              return s;
          }));
          setActiveServerId('home');
          setViewMode('HOME');
      } catch (error) { console.error(error); }
  };

  const openCreateChannelModal = (serverId: string, categoryId?: string) => {
      setCreateChannelState({ isOpen: true, serverId, categoryId });
  };

  const handleCreateChannel = async (name: string, type: ChannelType) => {
      const { serverId, categoryId } = createChannelState;
      if (!serverId) return;
      try {
          const newChannel = await api.createChannel(serverId, name, type, authToken || '', categoryId);
          setServers(prev => prev.map(s => {
              if (s.id === serverId) return { ...s, channels: [...s.channels, newChannel] };
              return s;
          }));
          setCreateChannelState({ isOpen: false, serverId: '' });
      } catch (e) { console.error(e); }
  };

  const handleUpdateChannel = async (channelId: string, data: Partial<Channel>) => {
      if (!activeServer) return;
      try {
          const updatedChannel = await api.updateChannel(activeServer.id, channelId, data, authToken || '');
          setServers(prev => prev.map(s => {
              if (s.id === activeServer.id) return { ...s, channels: s.channels.map(c => c.id === channelId ? updatedChannel : c) };
              return s;
          }));
      } catch (e) { console.error(e); }
  };

  const handleDeleteChannel = async (channelId: string) => {
      if (!activeServer) return;
      try {
          await api.deleteChannel(activeServer.id, channelId, authToken || '');
          setServers(prev => prev.map(s => {
              if (s.id === activeServer.id) return { ...s, channels: s.channels.filter(c => c.id !== channelId) };
              return s;
          }));
          if (activeChannelId === channelId) {
              const remaining = activeServer.channels.filter(c => c.id !== channelId);
              setActiveChannelId(remaining[0]?.id || '');
          }
      } catch (e) { console.error(e); }
  };

  const handleServerClick = (id: string) => {
    if (id === 'home') {
        setViewMode('HOME');
        setActiveServerId('home');
        setActiveHomeChannelId('friends');
    } else {
        setViewMode('SERVER');
        setActiveServerId(id);
        const server = servers.find(s => s.id === id);
        if (server && server.channels.length > 0) {
            const firstText = server.channels.find(c => c.type === ChannelType.TEXT);
            if (firstText) setActiveChannelId(firstText.id);
            else setActiveChannelId(server.channels[0].id);
        }
    }
  };

  const handleChannelClick = (channelId: string, type: ChannelType) => {
      if (type === ChannelType.VOICE) {
          voiceService.joinChannel(channelId);
      } else {
          setActiveChannelId(channelId);
      }
  };

  const handleChatAreaMessage = (content: string, attachments?: string[]) => {
     if (!currentUser) return;
     api.createMessage(viewMode === 'SERVER' ? activeChannelId : activeHomeChannelId, currentUser.id, content, authToken || '', attachments)
        .then(msg => setMessages(prev => [...prev, msg]));
  };
  
  useEffect(() => {
      if (currentChannelId && currentChannelId !== 'friends' && (!activeChannel || activeChannel.type === ChannelType.TEXT || activeChannel.type === ChannelType.DM)) {
          api.getMessages(currentChannelId).then(msgs => {
              setMessages(prev => {
                   const others = prev.filter(m => m.channelId !== currentChannelId);
                   return [...others, ...msgs];
              });
          });
      }
  }, [currentChannelId, activeChannel]);

  const handleAddFriend = async (username: string) => {
      if (!currentUserId) return;
      const targetUser = await api.sendFriendRequest(currentUserId, username, authToken || '');
      setUsers(prev => ({
          ...prev,
          [targetUser.id]: { ...prev[targetUser.id] || targetUser, friendStatus: FriendStatus.PENDING_OUTGOING }
      }));
  };

  const handleAcceptFriend = async (targetUserId: string) => {
     if (!currentUserId) return;
     await api.acceptFriendRequest(currentUserId, targetUserId, authToken || '');
     setUsers(prev => ({
         ...prev,
         [targetUserId]: { ...prev[targetUserId], friendStatus: FriendStatus.FRIEND }
     }));
  };

  const handleDeclineFriend = async (targetUserId: string) => {
      if (!currentUserId) return;
      await api.rejectFriendRequest(currentUserId, targetUserId, authToken || '');
      setUsers(prev => ({
          ...prev,
          [targetUserId]: { ...prev[targetUserId], friendStatus: FriendStatus.NONE }
      }));
  };

  const handleStartDM = (targetUserId: string) => {
      const existingDM = dmChannels.find(c => c.recipientId === targetUserId);
      if (existingDM) {
          setActiveHomeChannelId(existingDM.id);
      } else {
          const newDM: Channel = {
              id: `dm-${Date.now()}`,
              name: users[targetUserId].username,
              type: ChannelType.DM,
              recipientId: targetUserId
          };
          setDmChannels(prev => [...prev, newDM]);
          setActiveHomeChannelId(newDM.id);
      }
      setViewMode('HOME');
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const handleTimeoutUser = async (userId: string, durationMinutes: number = 5) => {
    const until = new Date(Date.now() + durationMinutes * 60000).toISOString();
    setUsers(prev => ({ ...prev, [userId]: { ...prev[userId], timeoutUntil: until } }));
    await api.updateUser(userId, { timeoutUntil: until }, authToken || '');
  };

  const handleBanUser = async (userId: string) => {
    setUsers(prev => ({ ...prev, [userId]: { ...prev[userId], isBanned: true } }));
    await api.updateUser(userId, { isBanned: true }, authToken || '');
  };

  const handleOpenProfile = (user: User) => {
      setActiveProfileUser(user);
  };
  
  const handleUpdateStatus = (status: any) => {
      if (!currentUser) return;
      handleUpdateProfile(currentUser.id, { status });
  };
  
  const handleToggleRole = async (userId: string, roleId: string) => {
      if (!activeServer) return;
      await databaseService.toggleUserRole(activeServer.id, userId, roleId);
      // Refresh servers to get updated roles
      const updatedServers = await api.getServers();
      setServers(updatedServers);
  };

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent, user: User) => {
      e.preventDefault();
      setContextMenu({
          isOpen: true,
          x: e.pageX,
          y: e.pageY,
          user
      });
  };

  const handleCopyId = (id: string) => {
      navigator.clipboard.writeText(id);
      // Optional: show toast
  };

  // ROUTING LOGIC
  if (appState === 'LANDING') {
      return <LandingPage onOpenAuth={() => setAppState('AUTH')} />;
  }

  if (appState === 'AUTH') {
      return (
        <AuthScreen 
            onLogin={handleLogin}
            onRegister={handleRegister}
            onBack={() => setAppState('LANDING')}
            isLoading={isAuthLoading}
        />
      );
  }

  // App State ('APP') requires currentUser
  if (!currentUser) {
      // Fallback to landing if no user but state is APP (shouldn't happen)
      setAppState('LANDING');
      return null; 
  }

  // GLOBAL BAN CHECK
  if (currentUser.isGlobalBanned) {
      return <BanScreen reason={currentUser.globalBanReason} onLogout={handleLogout} />;
  }

  return (
    <div className="flex w-full h-screen bg-discord-dark text-discord-text overflow-hidden font-sans">
      <ServerList 
        servers={userServers} 
        activeServerId={viewMode === 'HOME' ? 'home' : activeServerId} 
        onServerClick={handleServerClick}
        onAddServerClick={() => setShowCreateServerModal(true)}
      />
      
      {viewMode === 'SERVER' && activeServer ? (
        <>
            <ChannelList 
                server={activeServer} 
                activeChannelId={activeChannelId} 
                onChannelClick={handleChannelClick}
                currentUser={currentUser}
                onOpenSettings={() => setShowSettingsModal(true)}
                onOpenServerSettings={() => setShowServerSettingsModal(true)}
                onLeaveServer={handleLeaveServer}
                onCreateChannel={openCreateChannelModal}
                onEditChannel={setEditChannel}
                onInvite={() => setShowInviteModal(true)}
                users={users}
                onUpdateStatus={handleUpdateStatus}
                onOpenProfile={handleOpenProfile}
            />
            <div className="flex flex-1 min-w-0">
                <ChatArea 
                    channel={activeChannel!} 
                    messages={channelMessages}
                    users={users}
                    currentUser={currentUser}
                    onSendMessage={handleChatAreaMessage}
                    showUserList={showUserList}
                    onToggleUserList={() => setShowUserList(!showUserList)}
                    onDeleteMessage={handleDeleteMessage}
                    onOpenModeration={setActiveModerationUser}
                    onOpenProfile={handleOpenProfile}
                    onContextMenu={handleContextMenu}
                />
                {showUserList && activeChannel?.type === ChannelType.TEXT && (
                    <UserList 
                        server={activeServer} 
                        users={users} 
                        currentUser={currentUser}
                        onOpenModeration={setActiveModerationUser}
                        onOpenProfile={handleOpenProfile}
                        onContextMenu={handleContextMenu}
                    />
                )}
            </div>
        </>
      ) : viewMode === 'SERVER' && !activeServer ? (
          <div className="flex flex-1 items-center justify-center bg-discord-light">
              <div className="text-center">
                  <h2 className="text-xl font-bold mb-2 text-white">Нет серверов</h2>
                  <p className="text-discord-muted mb-6">Вы пока не состоите ни в одном сервере.</p>
                  <button onClick={() => setShowCreateServerModal(true)} className="bg-discord-green text-white px-4 py-2 rounded font-medium hover:bg-emerald-600 transition">
                      Создать сервер
                  </button>
              </div>
          </div>
      ) : (
        <>
            <DMList 
                currentUser={currentUser}
                users={users}
                activeChannelId={activeHomeChannelId}
                onChannelClick={setActiveHomeChannelId}
                onFriendsClick={() => setActiveHomeChannelId('friends')}
                dmChannels={dmChannels}
                onOpenSettings={() => setShowSettingsModal(true)}
                onUpdateStatus={handleUpdateStatus}
            />
            
            {activeHomeChannelId === 'friends' ? (
                <FriendsDashboard 
                    users={users}
                    currentUser={currentUser}
                    onAddFriend={handleAddFriend}
                    onStartDM={handleStartDM}
                    onAcceptFriend={handleAcceptFriend}
                    onDeclineFriend={handleDeclineFriend}
                />
            ) : (
                <div className="flex flex-1 min-w-0">
                    {activeChannel ? (
                        <ChatArea 
                            channel={activeChannel}
                            messages={channelMessages}
                            users={users}
                            currentUser={currentUser}
                            onSendMessage={handleChatAreaMessage}
                            showUserList={false} 
                            onToggleUserList={() => {}}
                            onDeleteMessage={handleDeleteMessage}
                            onOpenModeration={setActiveModerationUser}
                            onOpenProfile={handleOpenProfile}
                            onContextMenu={handleContextMenu}
                        />
                    ) : (
                         <div className="flex-1 bg-discord-dark flex items-center justify-center text-discord-muted">
                            Выберите или начните диалог
                         </div>
                    )}
                </div>
            )}
        </>
      )}

      {/* Global User Context Menu */}
      {contextMenu.isOpen && contextMenu.user && (
          <UserContextMenu 
            user={contextMenu.user}
            currentUser={currentUser}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
            onOpenProfile={handleOpenProfile}
            onMessage={(userId) => {
                handleStartDM(userId);
                setContextMenu({ ...contextMenu, isOpen: false });
            }}
            onAddFriend={(username) => {
                handleAddFriend(username);
                setContextMenu({ ...contextMenu, isOpen: false });
            }}
            onRemoveFriend={(userId) => {
                handleDeclineFriend(userId);
                setContextMenu({ ...contextMenu, isOpen: false });
            }}
            onTimeout={(userId) => {
                 setActiveModerationUser(users[userId]);
                 setContextMenu({ ...contextMenu, isOpen: false });
            }}
            onBan={(userId) => {
                 setActiveModerationUser(users[userId]);
                 setContextMenu({ ...contextMenu, isOpen: false });
            }}
            onCopyId={handleCopyId}
            server={viewMode === 'SERVER' ? activeServer : undefined}
            onToggleRole={handleToggleRole}
          />
      )}

      {activeProfileUser && (
          <UserProfileModal 
             user={activeProfileUser}
             currentUser={currentUser}
             onClose={() => setActiveProfileUser(null)}
             onMessage={(userId) => {
                 handleStartDM(userId);
                 setActiveProfileUser(null);
             }}
          />
      )}

      {activeModerationUser && (
        <ModerationModal 
          user={activeModerationUser}
          onClose={() => setActiveModerationUser(null)}
          onTimeout={handleTimeoutUser}
          onBan={handleBanUser}
        />
      )}

      {showCreateServerModal && (
          <CreateServerModal 
            onClose={() => setShowCreateServerModal(false)}
            onCreate={handleCreateServer}
            onJoin={handleJoinServer}
          />
      )}

      {createChannelState.isOpen && (
          <CreateChannelModal 
            onClose={() => setCreateChannelState({ isOpen: false, serverId: '' })}
            onCreate={handleCreateChannel}
          />
      )}
      
      {editChannel && (
          <ChannelSettingsModal 
              channel={editChannel}
              onClose={() => setEditChannel(null)}
              onSave={handleUpdateChannel}
              onDelete={handleDeleteChannel}
          />
      )}

      {showSettingsModal && currentUser && (
        <UserSettingsModal 
          user={currentUser}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleUpdateProfile}
          onLogout={handleLogout}
        />
      )}
      
      {showServerSettingsModal && activeServer && (
          <ServerSettingsModal 
            server={activeServer}
            onClose={() => setShowServerSettingsModal(false)}
            onSave={handleUpdateServer}
          />
      )}

      {showInviteModal && activeServer && (
        <InviteModal 
          server={activeServer}
          friends={(Object.values(users) as User[]).filter(u => u.friendStatus === FriendStatus.FRIEND)}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};

export default App;
