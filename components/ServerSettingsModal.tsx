
import React, { useState, useRef } from 'react';
import { Server, Role } from '../types';
import { X, Shield, Plus, MoreHorizontal, ArrowLeft, Search, Trash2, Check, Edit2, Users } from 'lucide-react';

interface ServerSettingsModalProps {
  server: Server;
  onClose: () => void;
  onSave: (serverId: string, data: Partial<Server>) => Promise<void>;
}

type ModalView = 'SETTINGS' | 'ROLE_EDITOR';
type SettingsTab = 'OVERVIEW' | 'ROLES' | 'EMOJIS' | 'MEMBERS';
type RoleTab = 'DISPLAY' | 'PERMISSIONS' | 'LINKS' | 'MEMBERS';

const PERMISSION_GROUPS = [
  {
    name: 'Основные права сервера',
    permissions: [
      { id: 'view_channels', name: 'Просматривать каналы', desc: 'Позволяет участникам просматривать каналы (кроме приватных) по умолчанию.' },
      { id: 'manage_channels', name: 'Управлять каналами', desc: 'Позволяет участникам создавать, редактировать и удалять каналы.', warning: true },
      { id: 'manage_roles', name: 'Управлять ролями', desc: 'Позволяет создавать новые роли и редактировать те, что ниже их самой высокой роли.' },
      { id: 'manage_emojis', name: 'Управлять выражениями', desc: 'Позволяет редактировать и удалять пользовательские эмодзи, стикеры и звуки.' },
      { id: 'view_audit_log', name: 'Просматривать журнал аудита', desc: 'Позволяет просматривать историю изменений этого сервера.' },
      { id: 'manage_webhooks', name: 'Управлять вебхуками (webhooks)', desc: 'Позволяет создавать и удалять вебхуки.' },
      { id: 'manage_server', name: 'Управлять сервером', desc: 'Даёт право переименовывать сервер, менять регион и т.д.' },
    ]
  },
  {
    name: 'Права участников',
    permissions: [
      { id: 'create_invite', name: 'Создание приглашения', desc: 'Позволяет приглашать новых участников.' },
      { id: 'change_nickname', name: 'Изменить никнейм', desc: 'Позволяет менять собственный никнейм.' },
      { id: 'manage_nicknames', name: 'Управлять никнеймами', desc: 'Позволяет менять никнеймы других участников.' },
      { id: 'kick_members', name: 'Выгонять участников', desc: 'Позволяет выгонять участников с сервера.' },
      { id: 'ban_members', name: 'Банить участников', desc: 'Позволяет навсегда банить участников.' },
      { id: 'timeout_members', name: 'Отправить участников подумать о своём поведении', desc: 'Тайм-аут: запрет на отправку сообщений и голосовой чат.' },
    ]
  },
  {
    name: 'Права текстового канала',
    permissions: [
      { id: 'send_messages', name: 'Отправка сообщений и создание публикаций', desc: 'Разрешить участникам отправлять сообщения в текстовых каналах.' },
      { id: 'send_messages_in_threads', name: 'Отправлять сообщения в ветках и публикациях', desc: 'Разрешить отправлять сообщения в ветках.' },
      { id: 'create_public_threads', name: 'Создать публичные ветки', desc: 'Разрешить создавать ветки, которые могут видеть все.' },
      { id: 'create_private_threads', name: 'Создание приватных веток', desc: 'Разрешить создавать ветки с доступом только по приглашению.' },
      { id: 'embed_links', name: 'Встраивать ссылки', desc: 'Позволяет отображать контент ссылок.' },
      { id: 'attach_files', name: 'Прикреплять файлы', desc: 'Позволяет загружать файлы и медиаконтент.' },
      { id: 'add_reactions', name: 'Добавлять реакции', desc: 'Позволяет добавлять новые реакции-эмодзи.' },
      { id: 'mention_everyone', name: 'Упоминание @everyone, @here и всех ролей', desc: 'Позволяет использовать @everyone и @here.' },
      { id: 'manage_messages', name: 'Управлять сообщениями', desc: 'Позволяет удалять и закреплять сообщения других участников.' },
      { id: 'read_message_history', name: 'Читать историю сообщений', desc: 'Позволяет читать ранее опубликованные сообщения.' },
    ]
  },
  {
    name: 'Права голосового канала',
    permissions: [
      { id: 'connect', name: 'Подключаться', desc: 'Позволяет присоединяться к голосовым каналам.' },
      { id: 'speak', name: 'Говорить', desc: 'Позволяет общаться на голосовых каналах.' },
      { id: 'stream', name: 'Видео', desc: 'Позволяет делиться видео или стримить экран.' },
      { id: 'use_vad', name: 'Использовать активацию по голосу', desc: 'Если отключено, нужно использовать Push-to-Talk.' },
      { id: 'priority_speaker', name: 'Приоритетный режим', desc: 'Громкость других понижается, когда этот участник говорит.' },
      { id: 'mute_members', name: 'Отключать участникам микрофон', desc: 'Позволяет отключать микрофон других.' },
      { id: 'deafen_members', name: 'Отключать участникам звук', desc: 'Позволяет отключать звук других.' },
      { id: 'move_members', name: 'Перемещать участников', desc: 'Позволяет перемещать участников между каналами.' },
    ]
  },
  {
      name: 'Расширенные права',
      permissions: [
          { id: 'administrator', name: 'Администратор', desc: 'Участники с этим правом имеют все права и обходят особые ограничения.', warning: true }
      ]
  }
];

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({ server, onClose, onSave }) => {
  // View State
  const [view, setView] = useState<ModalView>('SETTINGS');
  const [activeTab, setActiveTab] = useState<SettingsTab>('OVERVIEW');
  const [roleTab, setRoleTab] = useState<RoleTab>('PERMISSIONS');
  
  // Data State
  const [name, setName] = useState(server.name);
  const [icon, setIcon] = useState(server.icon || '');
  const [bannerColor, setBannerColor] = useState(server.bannerColor || '#000000');
  const [description, setDescription] = useState(server.description || '');
  const [features, setFeatures] = useState<string[]>(server.features || []);
  const [roles, setRoles] = useState<Role[]>(server.roles || []);
  
  // Editor State
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionsSearch, setPermissionsSearch] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // Check Changes
  const hasChanges = 
    name !== server.name || 
    icon !== (server.icon || '') || 
    bannerColor !== (server.bannerColor || '#000000') || 
    description !== (server.description || '') ||
    JSON.stringify(features) !== JSON.stringify(server.features || []) ||
    JSON.stringify(roles) !== JSON.stringify(server.roles || []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(server.id, {
        name, icon, bannerColor, description, features, roles
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setName(server.name);
    setIcon(server.icon || '');
    setBannerColor(server.bannerColor || '#000000');
    setDescription(server.description || '');
    setFeatures(server.features || []);
    setRoles(server.roles || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setIcon(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Role Management
  const handleCreateRole = () => {
      const newRole: Role = {
          id: `role-${Date.now()}`,
          name: 'новая роль',
          color: '#99AAB5',
          permissions: []
      };
      setRoles([...roles, newRole]);
      setSelectedRoleId(newRole.id);
      setView('ROLE_EDITOR');
  };

  const handleUpdateRole = (roleId: string, updates: Partial<Role>) => {
      setRoles(roles.map(r => r.id === roleId ? { ...r, ...updates } : r));
  };

  const handleDeleteRole = (roleId: string) => {
      if (confirm('Вы уверены, что хотите удалить эту роль?')) {
          setRoles(roles.filter(r => r.id !== roleId));
          if (selectedRoleId === roleId) {
              setView('SETTINGS');
              setSelectedRoleId(null);
          }
      }
  };

  const togglePermission = (roleId: string, permId: string) => {
      const role = roles.find(r => r.id === roleId);
      if (!role) return;
      
      const newPerms = role.permissions.includes(permId)
         ? role.permissions.filter(p => p !== permId)
         : [...role.permissions, permId];
      
      handleUpdateRole(roleId, { permissions: newPerms });
  };

  const clearPermissions = (roleId: string) => {
      handleUpdateRole(roleId, { permissions: [] });
  };

  // --- Render Components ---

  const renderSidebar = () => {
      if (view === 'ROLE_EDITOR' && selectedRole) {
          return (
            <div className="w-[30%] bg-[#2B2D31] flex flex-col items-end pt-16 pr-4 border-r border-[#1E1F22]">
                <div className="w-56">
                    <button 
                        onClick={() => { setView('SETTINGS'); setSelectedRoleId(null); }}
                        className="flex items-center text-discord-muted hover:text-white mb-4 text-xs font-bold uppercase transition-colors"
                    >
                        <ArrowLeft size={12} className="mr-1" /> Назад
                    </button>
                    
                    <div className="flex items-center justify-between mb-2">
                         <div className="text-discord-muted text-xs font-bold uppercase truncate">{selectedRole.name.toUpperCase()}</div>
                    </div>

                    <div 
                        className={`px-2 py-1.5 rounded cursor-pointer font-medium text-sm mb-1 ${roleTab === 'DISPLAY' ? 'bg-[#404249] text-white' : 'text-discord-muted hover:bg-[#35373C] hover:text-discord-text'}`}
                        onClick={() => setRoleTab('DISPLAY')}
                    >
                        Элементы отображения
                    </div>
                    <div 
                        className={`px-2 py-1.5 rounded cursor-pointer font-medium text-sm mb-1 flex justify-between items-center ${roleTab === 'PERMISSIONS' ? 'bg-[#404249] text-white' : 'text-discord-muted hover:bg-[#35373C] hover:text-discord-text'}`}
                        onClick={() => setRoleTab('PERMISSIONS')}
                    >
                        Права доступа
                    </div>
                    <div 
                        className={`px-2 py-1.5 rounded cursor-pointer font-medium text-sm mb-1 ${roleTab === 'MEMBERS' ? 'bg-[#404249] text-white' : 'text-discord-muted hover:bg-[#35373C] hover:text-discord-text'}`}
                        onClick={() => setRoleTab('MEMBERS')}
                    >
                        Управлять участниками
                    </div>
                    
                    <div className="h-[1px] bg-discord-light my-2"></div>

                    {/* Quick Role Switcher Sidebar */}
                    <div className="mt-4">
                        <div className="text-xs font-bold text-discord-muted uppercase mb-2 px-2">Все роли</div>
                        <div className="space-y-0.5 overflow-y-auto max-h-[400px] custom-scrollbar pr-1">
                            {roles.map(r => (
                                <div 
                                    key={r.id}
                                    onClick={() => setSelectedRoleId(r.id)}
                                    className={`px-2 py-1.5 rounded cursor-pointer font-medium text-sm flex items-center justify-between group
                                        ${selectedRoleId === r.id ? 'bg-[#404249] text-white' : 'text-discord-muted hover:bg-[#35373C] hover:text-discord-text'}
                                    `}
                                >
                                    <div className="flex items-center truncate">
                                        <div className="w-2 h-2 rounded-full mr-2 shrink-0" style={{ backgroundColor: r.color }}></div>
                                        <span className="truncate">{r.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          );
      }

      return (
        <div className="w-[30%] bg-[#2B2D31] flex flex-col items-end pt-16 pr-6">
            <div className="w-48">
                <div className="font-bold text-discord-muted text-xs uppercase px-2 mb-4">{server.name}</div>
                <div 
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`px-2 py-1.5 rounded cursor-pointer font-medium text-sm mb-1 ${activeTab === 'OVERVIEW' ? 'bg-[#404249] text-white' : 'text-discord-muted hover:bg-[#35373C] hover:text-discord-text'}`}
                >
                    Профиль сервера
                </div>
                <div className="text-discord-muted hover:bg-[#3F4147] hover:text-discord-text px-2 py-1.5 rounded cursor-pointer font-medium text-sm">Тег сервера</div>
                
                <div className="h-[1px] bg-discord-light my-2"></div>
                
                <div 
                    onClick={() => setActiveTab('ROLES')}
                    className={`px-2 py-1.5 rounded cursor-pointer font-medium text-sm mb-1 flex justify-between items-center ${activeTab === 'ROLES' ? 'bg-[#404249] text-white' : 'text-discord-muted hover:bg-[#35373C] hover:text-discord-text'}`}
                >
                    Роли
                </div>
                <div className="text-discord-muted hover:bg-[#3F4147] hover:text-discord-text px-2 py-1.5 rounded cursor-pointer font-medium text-sm">Эмодзи</div>
                
                <div className="h-[1px] bg-discord-light my-2"></div>
                
                <div className="text-discord-muted hover:bg-[#3F4147] hover:text-discord-text px-2 py-1.5 rounded cursor-pointer font-medium text-sm flex justify-between">
                    Участники
                </div>
            </div>
        </div>
      );
  };

  const renderContent = () => {
      // --- ROLE EDITOR ---
      if (view === 'ROLE_EDITOR' && selectedRole) {
          if (roleTab === 'PERMISSIONS') {
              return (
                  <div className="max-w-[740px] pb-20">
                      <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-bold text-white">Редактировать роль — {selectedRole.name.toUpperCase()}</h2>
                          <div className="flex space-x-2">
                             <MoreHorizontal className="text-discord-muted cursor-pointer" />
                          </div>
                      </div>

                      <div className="bg-[#2B2D31] border border-yellow-600/50 rounded p-3 mb-6 flex items-start">
                          <Shield className="text-yellow-500 mr-3 mt-0.5" size={20} />
                          <div className="text-sm">
                              <span className="text-white font-medium">Эта роль управляется интеграцией: {selectedRole.name}.</span> <span className="text-discord-muted">Она не может быть применена к участникам вручную. Чтобы удалить роль, удалите данную интеграцию.</span>
                          </div>
                      </div>

                      <div className="flex items-center mb-6 border-b border-[#1E1F22]">
                          <div className="px-4 py-2 text-sm font-medium border-b-2 cursor-pointer border-transparent text-discord-muted hover:text-discord-text" onClick={() => setRoleTab('DISPLAY')}>Элементы отображения</div>
                          <div className="px-4 py-2 text-sm font-medium border-b-2 cursor-pointer border-discord-accent text-white" onClick={() => setRoleTab('PERMISSIONS')}>Права доступа</div>
                          <div className="px-4 py-2 text-sm font-medium border-b-2 cursor-pointer border-transparent text-discord-muted hover:text-discord-text" onClick={() => setRoleTab('MEMBERS')}>Управлять участниками</div>
                      </div>

                      <div className="relative mb-6">
                          <input 
                             type="text" 
                             placeholder="Поиск по правам"
                             value={permissionsSearch}
                             onChange={(e) => setPermissionsSearch(e.target.value)}
                             className="w-full bg-[#1E1F22] text-white p-2 pl-9 rounded border-none outline-none text-sm"
                          />
                          <Search size={16} className="absolute left-2.5 top-2.5 text-discord-muted" />
                      </div>

                      <div className="space-y-8">
                          {PERMISSION_GROUPS.map(group => {
                              const filteredPerms = group.permissions.filter(p => p.name.toLowerCase().includes(permissionsSearch.toLowerCase()));
                              if (filteredPerms.length === 0) return null;

                              return (
                                  <div key={group.name}>
                                      <div className="flex justify-between items-center mb-4">
                                          <h3 className="text-xs font-bold text-discord-muted uppercase">{group.name}</h3>
                                          {group.name.includes('Основные') && (
                                              <button 
                                                onClick={() => clearPermissions(selectedRole.id)}
                                                className="text-xs text-discord-accent hover:underline font-medium"
                                              >
                                                  Сбросить права
                                              </button>
                                          )}
                                      </div>
                                      <div className="space-y-4">
                                          {filteredPerms.map(perm => (
                                              <div key={perm.id} className="flex justify-between items-start border-b border-[#3F4147] pb-4 last:border-0">
                                                  <div className="pr-4">
                                                      <div className="text-white font-medium mb-1 flex items-center">
                                                          {perm.name}
                                                          {perm.warning && <Shield size={14} className="text-yellow-500 ml-2" />}
                                                      </div>
                                                      <div className="text-discord-muted text-xs">{perm.desc}</div>
                                                      {perm.warning && (
                                                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 mt-2 flex items-center text-xs text-yellow-200">
                                                              <Shield size={12} className="mr-2" />
                                                              Это разрешение скоро перестанет предоставлять возможность обходить медленный режим.
                                                          </div>
                                                      )}
                                                  </div>
                                                  
                                                  <div 
                                                      onClick={() => togglePermission(selectedRole.id, perm.id)}
                                                      className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${selectedRole.permissions.includes(perm.id) ? 'bg-discord-green' : 'bg-[#4E5058]'}`}
                                                  >
                                                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${selectedRole.permissions.includes(perm.id) ? 'left-5' : 'left-1'}`}>
                                                          {selectedRole.permissions.includes(perm.id) ? (
                                                              <Check size={10} className="text-discord-green absolute top-0.5 left-0.5" />
                                                          ) : (
                                                              <X size={10} className="text-[#4E5058] absolute top-0.5 left-0.5" />
                                                          )}
                                                      </div>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              );
          }
          
          if (roleTab === 'DISPLAY') {
              return (
                  <div className="max-w-[600px]">
                      <h2 className="text-xl font-bold text-white mb-6">Редактировать роль — {selectedRole.name.toUpperCase()}</h2>
                      <div className="space-y-6">
                           <div>
                                <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Название роли <span className="text-red-500">*</span></label>
                                <input 
                                    type="text"
                                    value={selectedRole.name}
                                    onChange={(e) => handleUpdateRole(selectedRole.id, { name: e.target.value })}
                                    className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none outline-none focus:ring-1 focus:ring-discord-accent"
                                />
                           </div>
                           <div>
                                <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Цвет роли</label>
                                <div className="grid grid-cols-6 gap-2 w-fit bg-[#1E1F22] p-2 rounded">
                                     <div 
                                        onClick={() => handleUpdateRole(selectedRole.id, { color: '#99AAB5' })}
                                        className="w-12 h-10 rounded cursor-pointer border border-[#3F4147] bg-[#99AAB5] flex items-center justify-center hover:scale-105 transition-transform"
                                     ></div>
                                     {['#F43F5E', '#EF4444', '#F97316', '#EAB308', '#8B5CF6', '#3B82F6', '#14B8A6', '#22C55E'].map(c => (
                                         <div 
                                            key={c}
                                            onClick={() => handleUpdateRole(selectedRole.id, { color: c })}
                                            className="w-12 h-10 rounded cursor-pointer hover:scale-105 transition-transform"
                                            style={{ backgroundColor: c }}
                                         >
                                            {selectedRole.color === c && <Check size={20} className="text-white mx-auto mt-2" />}
                                         </div>
                                     ))}
                                </div>
                           </div>
                      </div>
                  </div>
              );
          }
          
          return <div className="text-discord-muted mt-10">Этот раздел еще не реализован.</div>;
      }

      // --- SETTINGS: ROLES ---
      if (activeTab === 'ROLES') {
          return (
              <div className="max-w-[740px]">
                   <div className="mb-6">
                       <h2 className="text-xl font-bold text-white mb-1">Роли</h2>
                       <p className="text-discord-muted text-sm">Используйте роли для создания групп с участниками сервера и настройки их прав.</p>
                   </div>

                   {/* Default Permissions Card */}
                   <div 
                        onClick={() => {
                            const everyone = roles.find(r => r.name === '@everyone');
                            if(everyone) { setSelectedRoleId(everyone.id); setView('ROLE_EDITOR'); }
                        }}
                        className="bg-[#2B2D31] hover:bg-[#35373C] p-4 rounded-lg flex items-center justify-between cursor-pointer mb-6 group border border-[#1E1F22]"
                   >
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#3F4147] flex items-center justify-center mr-4">
                                <Users size={20} className="text-discord-muted group-hover:text-white" />
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm">Права по умолчанию</div>
                                <div className="text-discord-muted text-xs">@everyone • распространяется на всех участников сервера</div>
                            </div>
                        </div>
                        <ArrowLeft size={16} className="rotate-180 text-discord-muted" />
                   </div>

                   {/* Search & Create */}
                   <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                placeholder="Поиск роли"
                                className="w-full bg-[#1E1F22] text-white p-2 pl-9 rounded border-none outline-none text-sm"
                            />
                            <Search size={16} className="absolute left-2.5 top-2.5 text-discord-muted" />
                        </div>
                        <button 
                            onClick={handleCreateRole}
                            className="bg-discord-accent hover:bg-[#4752C4] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                        >
                            Создание роли
                        </button>
                   </div>

                   <p className="text-xs text-discord-muted mb-4">Для участников используется цвет их высшей роли. Перетащите роли, чтобы упорядочить их.</p>

                   {/* Roles List */}
                   <div className="space-y-0.5">
                        <div className="flex justify-between text-xs font-bold text-discord-muted uppercase px-2 mb-2">
                            <span>Роли — {roles.length}</span>
                            <span>Участники</span>
                        </div>
                        {roles.map(role => (
                            <div key={role.id} className="group flex items-center justify-between px-2 py-3 bg-[#2B2D31] hover:bg-[#35373C] rounded mb-1 border border-[#1E1F22]">
                                <div className="flex items-center">
                                    <Shield size={16} className="text-discord-muted mr-3 cursor-grab" />
                                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: role.color }}></div>
                                    <span className="text-white font-medium text-sm">{role.name}</span>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    <span className="text-discord-muted text-sm mr-10 flex items-center">
                                        0 <Users size={14} className="ml-1" />
                                    </span>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => { setSelectedRoleId(role.id); setView('ROLE_EDITOR'); }}
                                            className="p-1.5 bg-[#1E1F22] hover:bg-[#404249] rounded"
                                        >
                                            <Edit2 size={16} className="text-white" />
                                        </button>
                                        {role.name !== '@everyone' && (
                                            <button 
                                                onClick={() => handleDeleteRole(role.id)}
                                                className="p-1.5 bg-[#1E1F22] hover:bg-[#404249] rounded"
                                            >
                                                <Trash2 size={16} className="text-discord-muted hover:text-red-500" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                   </div>
              </div>
          );
      }

      // --- SETTINGS: OVERVIEW ---
      return (
        <div className="max-w-[700px] relative pb-20">
            <h2 className="text-xl font-bold text-white mb-2">Профиль сервера</h2>
            <p className="text-discord-muted text-sm mb-6">
                Настройте отображение вашего сервера в ссылках-приглашениях, а также сообщениях «Путешествия по серверам» и канала с объявлениями, если эти функции активны.
            </p>
            
            <div className="flex space-x-8">
                <div className="flex-1 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Имя</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none outline-none focus:ring-1 focus:ring-discord-accent"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div>
                             <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Значок</label>
                             <div className="text-xs text-discord-muted mb-2 max-w-[200px]">Значок не меньше 512x512</div>
                             <div className="flex space-x-2">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-discord-accent hover:bg-[#4752C4] text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                                >
                                    Изменить значок
                                </button>
                                <button onClick={() => setIcon('')} className="text-white hover:underline text-sm font-medium px-2">Удалить</button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                             </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Баннер</label>
                        <div className="grid grid-cols-5 gap-2 w-fit">
                            {['#000000', '#F43F5E', '#EF4444', '#F97316', '#EAB308', '#8B5CF6', '#3B82F6', '#14B8A6', '#22C55E', '#374151'].map(color => (
                                <div 
                                    key={color}
                                    onClick={() => setBannerColor(color)}
                                    className={`w-14 h-10 rounded cursor-pointer border-2 ${bannerColor === color ? 'border-white' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                ></div>
                            ))}
                        </div>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Особенности</label>
                         <div className="space-y-2">
                            {features.map((feat, i) => (
                                <input 
                                    key={i}
                                    value={feat}
                                    onChange={(e) => {
                                        const newFeats = [...features];
                                        newFeats[i] = e.target.value;
                                        setFeatures(newFeats);
                                    }}
                                    className="w-full bg-[#1E1F22] text-white p-2 rounded border-none outline-none text-sm"
                                    placeholder="Особенность"
                                />
                            ))}
                            {features.length < 5 && (
                                <button 
                                    onClick={() => setFeatures([...features, ''])}
                                    className="text-discord-accent hover:underline text-sm"
                                >
                                    + Добавить особенность
                                </button>
                            )}
                         </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Описание</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none outline-none focus:ring-1 focus:ring-discord-accent h-24 resize-none text-sm"
                            placeholder="- test1"
                        />
                    </div>
                </div>
                <div className="w-[300px] shrink-0">
                    <div className="sticky top-0">
                        <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Предпросмотр</label>
                        <div className="bg-[#1E1F22] rounded-lg overflow-hidden shadow-lg border border-[#1E1F22]">
                            <div className="h-28 w-full transition-colors" style={{ backgroundColor: bannerColor }}></div>
                            <div className="px-4 pb-4">
                                <div className="w-20 h-20 rounded-2xl border-[6px] border-[#1E1F22] -mt-10 mb-2 relative bg-[#313338] overflow-hidden">
                                     {icon ? <img src={icon} alt="Icon" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-discord-text font-bold text-2xl">{name.substring(0, 2).toUpperCase()}</div>}
                                </div>
                                <div className="flex items-center text-white font-bold mb-1"><Shield size={14} className="mr-1 text-discord-muted" /><span className="truncate">{name}</span></div>
                                <div className="text-xs text-[#949BA4] line-clamp-4">{description || "- test1"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="fixed inset-0 bg-discord-dark z-50 flex animate-in fade-in duration-200">
      {renderSidebar()}
      <div className="flex-1 bg-[#313338] pt-16 pl-10 pr-10 overflow-y-auto">
         {renderContent()}

         <button 
            onClick={onClose}
            className="absolute right-10 top-16 text-discord-muted hover:text-white border-2 border-discord-muted hover:border-white rounded-full p-1 transition-colors z-50"
         >
            <X size={18} />
            <div className="text-xs font-bold text-center mt-1">ESC</div>
         </button>

         {hasChanges && (
            <div className="fixed bottom-0 left-0 right-0 bg-[#111214] p-3 flex justify-end items-center px-10 border-t border-[#1E1F22] z-50 animate-in slide-in-from-bottom-2">
                 <div className="mr-auto text-white text-sm font-medium">Есть несохраненные изменения</div>
                 <button onClick={handleReset} className="text-white hover:underline mr-6 font-medium text-sm">Сброс</button>
                 <button onClick={handleSave} disabled={isLoading} className="bg-discord-green hover:bg-emerald-600 text-white px-6 py-2 rounded font-medium text-sm transition-colors disabled:opacity-50">
                    {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                 </button>
            </div>
         )}
      </div>
    </div>
  );
};
