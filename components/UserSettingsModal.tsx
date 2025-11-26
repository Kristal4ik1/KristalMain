
import React, { useState, useRef } from 'react';
import { User, UserStatus } from '../types';
import { X, LogOut, ShieldCheck, Edit2, Camera, Upload, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { generateSalt, hashPassword } from '../utils/crypto';
import { config } from '../config';
import { AdminPanel } from './AdminPanel';

interface UserSettingsModalProps {
  user: User;
  onClose: () => void;
  onSave: (userId: string, data: Partial<User>) => Promise<void>;
  onLogout: () => void;
}

type SettingsTab = 'MY_ACCOUNT' | 'PROFILE' | 'PRIVACY' | 'APPEARANCE' | 'VOICE' | 'ADMIN_PANEL';

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ user, onClose, onSave, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('MY_ACCOUNT');
  
  // Editing State
  const [editedUser, setEditedUser] = useState<User>({ ...user });
  const [newPassword, setNewPassword] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check if user is developer
  const isDeveloper = config.DEVELOPER_IDS.includes(user.id);

  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Check if any changes made
  const hasChanges = 
    JSON.stringify(editedUser) !== JSON.stringify(user) || 
    newPassword.length > 0;

  const handleSaveWrapper = async () => {
      setIsLoading(true);
      try {
          const updates: any = { ...editedUser };
          
          // If password changed, hash it
          if (newPassword) {
              const salt = generateSalt();
              const hash = await hashPassword(newPassword, salt);
              updates.passwordHash = hash;
              updates.salt = salt;
          }
          
          await onSave(user.id, updates);
          onClose();
      } catch (e) {
          console.error(e);
          alert('Failed to save settings');
      } finally {
          setIsLoading(false);
      }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditedUser(prev => ({ ...prev, avatar: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const statusColors = {
      [UserStatus.ONLINE]: 'bg-discord-green',
      [UserStatus.IDLE]: 'bg-yellow-500',
      [UserStatus.DND]: 'bg-discord-red',
      [UserStatus.OFFLINE]: 'bg-discord-muted'
  };

  const sidebarGroups = [
    {
      title: 'Настройки пользователя',
      items: [
        { id: 'MY_ACCOUNT', label: 'Моя учётная запись' },
        { id: 'PROFILE', label: 'Профиль' },
        { id: 'PRIVACY', label: 'Конфиденциальность' },
        { id: 'FAMILY', label: 'Семейный центр' },
        { id: 'APPS', label: 'Авторизованные приложения' },
        { id: 'DEVICES', label: 'Устройства' },
        { id: 'CONNECTIONS', label: 'Интеграции' },
        { id: 'CLIPS', label: 'Видеонарезки' },
      ]
    },
    {
      title: 'Настройки выставления счетов',
      items: [
        { id: 'NITRO', label: 'Nitro' },
        { id: 'BOOST', label: 'Буст сервера' },
        { id: 'SUBS', label: 'Подписки' },
        { id: 'GIFTS', label: 'Склад подарков' },
        { id: 'BILLING', label: 'Выставление счетов' },
      ]
    },
    {
      title: 'Настройки приложения',
      items: [
        { id: 'APPEARANCE', label: 'Внешний вид' },
        { id: 'ACCESSIBILITY', label: 'Специальные возможности' },
        { id: 'VOICE', label: 'Голос и видео' },
        { id: 'CHAT', label: 'Чат' },
        { id: 'NOTIFICATIONS', label: 'Уведомления' },
        { id: 'KEYBINDS', label: 'Горячие клавиши' },
        { id: 'LANGUAGE', label: 'Язык' },
        { id: 'WINDOWS', label: 'Настройки Windows' },
        { id: 'STREAMER', label: 'Режим стримера' },
        { id: 'ADVANCED', label: 'Расширенные' },
      ]
    },
    {
      title: 'Настройки активности',
      items: [
        { id: 'ACTIVITY_PRIVACY', label: 'Конфиденциальность активности' },
        { id: 'GAMES', label: 'Зарегистрированные игры' },
        { id: 'OVERLAY', label: 'Игровой оверлей' },
      ]
    }
  ];

  // Add Admin Group if developer
  if (isDeveloper) {
      sidebarGroups.push({
          title: 'Администрирование',
          items: [
              { id: 'ADMIN_PANEL', label: 'Панель администратора' }
          ]
      });
  }

  const renderMyAccount = () => (
    <div className="max-w-[660px] animate-in slide-in-from-bottom-2 duration-300 pb-10">
      <h2 className="text-xl font-bold text-white mb-6">Моя учётная запись</h2>

      {/* Profile Card */}
      <div className="bg-[#1E1F22] rounded-lg overflow-hidden mb-8 shadow-sm relative">
        {/* Banner */}
        <div 
            className="h-[100px] group relative" 
            style={{ backgroundColor: editedUser.bannerColor || '#000000' }}
        >
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="bg-black/50 p-1 rounded cursor-pointer text-white text-xs">Изменить цвет</div>
                 <div className="flex gap-1 mt-1 bg-[#111214] p-1 rounded">
                     {['#000000', '#7289da', '#f43f5e', '#22c55e', '#eab308'].map(c => (
                         <div 
                            key={c} 
                            onClick={() => setEditedUser(prev => ({ ...prev, bannerColor: c }))}
                            className="w-4 h-4 rounded-full cursor-pointer border border-white/20 hover:scale-110" 
                            style={{ backgroundColor: c }}
                         />
                     ))}
                 </div>
             </div>
        </div>
        
        <div className="px-4 pb-4">
          {/* Avatar & Header */}
          <div className="flex justify-between items-end -mt-10 mb-4 relative z-10">
             <div className="relative group cursor-pointer">
                <input 
                   type="file" 
                   ref={avatarInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleAvatarChange} 
                />
                <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-[80px] h-[80px] rounded-full border-[6px] border-[#1E1F22] overflow-hidden bg-[#1E1F22] relative"
                >
                    <img src={editedUser.avatar || `https://ui-avatars.com/api/?name=${editedUser.username}`} alt="avatar" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                    </div>
                </div>
                
                {/* Status Selector */}
                <div className="absolute bottom-1 right-1 group/status">
                    <div className={`w-6 h-6 rounded-full border-[4px] border-[#1E1F22] ${statusColors[editedUser.status]}`}></div>
                    
                    <div className="absolute top-8 left-0 w-32 bg-[#111214] rounded-lg p-2 shadow-xl hidden group-hover/status:block z-50 border border-[#2B2D31]">
                        {Object.values(UserStatus).map((status) => (
                            <div 
                                key={status}
                                onClick={() => setEditedUser(prev => ({ ...prev, status }))}
                                className={`flex items-center p-1.5 rounded hover:bg-[#35373C] cursor-pointer text-xs font-medium text-discord-muted hover:text-white ${editedUser.status === status ? 'bg-[#35373C] text-white' : 'text-discord-muted'}`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full mr-2 ${statusColors[status]}`}></div>
                                {status === UserStatus.ONLINE && 'В сети'}
                                {status === UserStatus.IDLE && 'Не активен'}
                                {status === UserStatus.DND && 'Не беспокоить'}
                                {status === UserStatus.OFFLINE && 'Невидимка'}
                            </div>
                        ))}
                    </div>
                </div>
             </div>
             
             <button 
                onClick={() => setActiveTab('PROFILE')}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-1.5 rounded-[3px] text-sm font-medium transition-colors mb-2"
             >
                 Редактировать профиль пользователя
             </button>
          </div>

          {/* User Name & Badges */}
          <div className="bg-[#111214] rounded-lg p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xl font-bold text-white mr-2">{editedUser.username}</span>
                <span className="text-discord-muted text-xl font-medium">#{editedUser.discriminator}</span>
              </div>
          </div>

          {/* Info Card */}
          <div className="bg-[#2B2D31] rounded-lg p-4 space-y-5">
             {/* Display Name */}
             <div className="flex justify-between items-center">
                 <div className="flex-1 mr-4">
                     <div className="text-xs font-bold text-[#B5BAC1] uppercase mb-1">Отображаемое имя</div>
                     <input 
                         type="text"
                         value={editedUser.username}
                         onChange={(e) => setEditedUser(prev => ({ ...prev, username: e.target.value }))}
                         className="w-full bg-transparent text-white text-base font-medium outline-none focus:border-b border-[#5865F2]"
                     />
                 </div>
                 <button className="bg-[#4E5058] hover:bg-[#6D6F78] text-white px-4 py-1.5 rounded-[3px] text-sm font-medium transition-colors">
                     Изменить
                 </button>
             </div>

             {/* Email */}
             <div className="flex justify-between items-center">
                 <div className="flex-1 mr-4">
                     <div className="text-xs font-bold text-[#B5BAC1] uppercase mb-1">Электронная почта</div>
                     {isEditingEmail ? (
                         <input 
                             type="email" 
                             value={editedUser.email || ''} 
                             onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                             className="w-full bg-[#1E1F22] text-white p-1 rounded outline-none border border-[#111214] focus:border-[#5865F2]"
                             autoFocus
                             onBlur={() => setIsEditingEmail(false)}
                         />
                     ) : (
                         <div className="text-white text-base font-medium flex items-center">
                             {editedUser.email || 'Нет почты'} 
                             <span className="text-[#00A8FC] text-sm ml-2 cursor-pointer hover:underline" onClick={() => setIsEditingEmail(true)}>Показать</span>
                         </div>
                     )}
                 </div>
                 <button 
                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                    className="bg-[#4E5058] hover:bg-[#6D6F78] text-white px-4 py-1.5 rounded-[3px] text-sm font-medium transition-colors"
                 >
                     {isEditingEmail ? 'Готово' : 'Изменить'}
                 </button>
             </div>

             {/* Phone (Mock) */}
             <div className="flex justify-between items-center">
                 <div>
                     <div className="text-xs font-bold text-[#B5BAC1] uppercase mb-1">Номер телефона</div>
                     <div className="text-white text-base font-medium flex items-center">
                         *******8439
                         <span className="text-[#00A8FC] text-sm ml-2 cursor-pointer hover:underline">Показать</span>
                     </div>
                 </div>
                 <button className="bg-[#4E5058] hover:bg-[#6D6F78] text-white px-4 py-1.5 rounded-[3px] text-sm font-medium transition-colors">
                     Изменить
                 </button>
             </div>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-[#3F4147] mb-8"></div>

      <h2 className="text-xl font-bold text-white mb-4">Пароль и аутентификация</h2>
      
      <div className="mb-6">
          {!isChangingPassword ? (
             <button 
                onClick={() => setIsChangingPassword(true)}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-[3px] text-sm font-medium transition-colors mb-6"
             >
                Изменить пароль
             </button>
          ) : (
             <div className="bg-[#2B2D31] p-4 rounded mb-6 max-w-sm">
                 <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-bold text-[#B5BAC1] uppercase">Новый пароль</label>
                     <span className="text-red-400 text-xs cursor-pointer hover:underline" onClick={() => { setIsChangingPassword(false); setNewPassword(''); }}>Отмена</span>
                 </div>
                 <div className="relative">
                     <input 
                        type={showPassword ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#1E1F22] text-white p-2 rounded outline-none border border-black focus:border-[#5865F2]"
                        placeholder="••••••••"
                     />
                     <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2.5 text-discord-muted hover:text-white"
                     >
                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                 </div>
             </div>
          )}

          <div className="bg-[#1E1F22] border border-[#2B2D31] rounded-lg p-4">
              <div className="text-xs font-bold text-[#B5BAC1] uppercase mb-3">Двухфакторная аутентификация</div>
              <div className="flex items-start">
                  <div className="flex-1">
                      <div className="text-white font-medium text-sm mb-1">Двухфакторная аутентификация включена</div>
                      <div className="text-[#B5BAC1] text-xs">Отличная работа! Ваш аккаунт защищен.</div>
                  </div>
                  <ShieldCheck className="text-discord-green ml-4 shrink-0" size={32} />
              </div>
          </div>
      </div>
    </div>
  );

  const renderProfileEditor = () => (
      <div className="max-w-[660px] animate-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-bold text-white mb-6">Профиль пользователя</h2>
          <div className="grid grid-cols-2 gap-8">
              <div>
                  <div className="mb-6">
                      <label className="block text-xs font-bold text-[#B5BAC1] uppercase mb-2">Отображаемое имя</label>
                      <input 
                         type="text" 
                         value={editedUser.username}
                         onChange={(e) => setEditedUser(prev => ({ ...prev, username: e.target.value }))}
                         className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none outline-none focus:ring-1 focus:ring-[#5865F2]"
                      />
                  </div>
                  <div className="h-[1px] bg-[#3F4147] my-6"></div>

                   <div className="mb-6">
                      <label className="block text-xs font-bold text-[#B5BAC1] uppercase mb-2">Пользовательский статус</label>
                      <input 
                         type="text" 
                         value={editedUser.customStatus || ''}
                         onChange={(e) => setEditedUser(prev => ({ ...prev, customStatus: e.target.value }))}
                         className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none outline-none focus:ring-1 focus:ring-[#5865F2]"
                         placeholder="Чем вы занимаетесь?"
                      />
                  </div>
                  
                  <div className="mb-6">
                      <label className="block text-xs font-bold text-[#B5BAC1] uppercase mb-2">Цвет баннера</label>
                      <div className="flex gap-2">
                        {['#000000', '#7289da', '#f43f5e', '#22c55e', '#eab308', '#a855f7'].map(c => (
                            <div 
                                key={c}
                                onClick={() => setEditedUser(prev => ({ ...prev, bannerColor: c }))}
                                className={`w-8 h-8 rounded cursor-pointer border-2 ${editedUser.bannerColor === c ? 'border-white' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                      </div>
                  </div>

                  <div className="mb-6">
                      <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Обо мне</label>
                      <textarea 
                          className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none outline-none h-32 resize-none"
                          placeholder="Расскажите о себе..."
                      ></textarea>
                  </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-[#B5BAC1] uppercase mb-2">Предпросмотр</label>
                  <div className="w-[300px] bg-[#232428] rounded-lg overflow-hidden shadow-lg relative pointer-events-none select-none">
                       <div className="h-[100px]" style={{ backgroundColor: editedUser.bannerColor || '#000000' }}></div>
                       <div className="px-4 pb-4">
                           <div className="w-[80px] h-[80px] rounded-full border-[6px] border-[#232428] -mt-10 mb-3 bg-[#232428] relative">
                                <img src={editedUser.avatar || ''} className="w-full h-full rounded-full object-cover" alt="" />
                                <div className={`absolute bottom-0 right-0 w-6 h-6 border-[4px] border-[#232428] rounded-full ${statusColors[editedUser.status]}`}></div>
                           </div>
                           <div className="font-bold text-white text-lg mb-1">{editedUser.username}</div>
                           {editedUser.customStatus && <div className="text-white text-sm mb-2">{editedUser.customStatus}</div>}
                           <div className="text-[#B5BAC1] text-sm pb-4">Нажмите, чтобы добавить заметку</div>
                       </div>
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-discord-dark z-50 flex animate-in fade-in duration-200 font-sans">
      
      {/* Sidebar */}
      <div className="w-[35%] min-w-[280px] max-w-[360px] bg-[#2B2D31] flex justify-end">
        <div className="w-[218px] py-[60px] pr-[6px] custom-scrollbar overflow-y-auto h-full">
            {sidebarGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="mb-2">
                    {group.title && (
                        <div className="px-[10px] pb-1.5 pt-1.5 text-xs font-bold text-[#949BA4] uppercase truncate select-none">
                            {group.title}
                        </div>
                    )}
                    {group.items.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => setActiveTab(item.id as SettingsTab)}
                            className={`px-[10px] py-[6px] rounded-[4px] cursor-pointer mb-[2px] text-[15px] font-medium transition-colors truncate select-none
                                ${activeTab === item.id 
                                    ? 'bg-[#404249] text-white' 
                                    : 'text-[#B5BAC1] hover:bg-[#35373C] hover:text-[#DBDEE1] active:text-white'
                                }
                            `}
                        >
                            {item.label}
                        </div>
                    ))}
                    {groupIdx !== sidebarGroups.length - 1 && <div className="h-[1px] bg-[#3F4147] mx-[10px] my-2"></div>}
                </div>
            ))}
            
            <div className="h-[1px] bg-[#3F4147] mx-[10px] my-2"></div>
            
            <div 
                onClick={() => setShowLogoutConfirm(true)}
                className="px-[10px] py-[6px] rounded-[4px] cursor-pointer mb-[2px] text-[15px] font-medium transition-colors text-discord-red hover:bg-[#35373C] flex items-center justify-between group"
            >
                Выйти
                <LogOut size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#313338] py-[60px] pl-10 pr-[60px] relative overflow-y-auto">
         <div className="max-w-[740px]">
            {activeTab === 'MY_ACCOUNT' && renderMyAccount()}
            {activeTab === 'PROFILE' && renderProfileEditor()}
            {activeTab === 'ADMIN_PANEL' && <AdminPanel currentUser={user} />}
            {activeTab !== 'MY_ACCOUNT' && activeTab !== 'PROFILE' && activeTab !== 'ADMIN_PANEL' && (
                <div className="text-[#B5BAC1]">
                    <h2 className="text-xl font-bold text-white mb-4">Этот раздел находится в разработке</h2>
                    <p>Функциональность этого раздела будет добавлена в ближайших обновлениях.</p>
                </div>
            )}
         </div>

         {/* Close Button */}
         <div className="fixed right-[calc(50%-440px+60px)] top-[60px] xl:right-[calc(50%-550px)] 2xl:right-[150px] flex flex-col items-center group cursor-pointer z-[100]" onClick={onClose}>
             <div className="w-9 h-9 rounded-full border-2 border-[#949BA4] flex items-center justify-center text-[#949BA4] group-hover:bg-[#4E5058] group-hover:border-[#DBDEE1] group-hover:text-[#DBDEE1] transition-all">
                 <X size={18} strokeWidth={3} />
             </div>
             <div className="text-[13px] font-bold text-[#949BA4] mt-1 group-hover:text-[#DBDEE1] transition-colors">ESC</div>
         </div>

         {/* Save Changes Bar */}
         {hasChanges && (
            <div className="fixed bottom-0 left-0 right-0 bg-[#111214] p-3 flex justify-end items-center px-10 border-t border-[#1E1F22] z-50 animate-in slide-in-from-bottom-2">
                 <div className="mr-auto text-white text-sm font-medium">Есть несохраненные изменения</div>
                 <button 
                    onClick={() => {
                        setEditedUser({ ...user });
                        setNewPassword('');
                        setIsChangingPassword(false);
                    }} 
                    className="text-white hover:underline mr-6 font-medium text-sm"
                 >
                    Сброс
                 </button>
                 <button 
                    onClick={handleSaveWrapper} 
                    disabled={isLoading} 
                    className="bg-discord-green hover:bg-emerald-600 text-white px-6 py-2 rounded font-medium text-sm transition-colors disabled:opacity-50"
                 >
                    {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                 </button>
            </div>
         )}
      </div>

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center animate-in fade-in duration-200">
              <div className="bg-[#313338] p-6 rounded-lg shadow-2xl max-w-sm w-full border border-[#1E1F22]">
                  <h3 className="text-xl font-bold text-white mb-2">Выйти из учетной записи?</h3>
                  <p className="text-discord-muted text-sm mb-6">
                      Вы уверены, что хотите выйти? Вам придется войти в систему снова, чтобы получить доступ к Kristal.
                  </p>
                  <div className="flex justify-end gap-3">
                      <button 
                          onClick={() => setShowLogoutConfirm(false)}
                          className="text-white hover:underline text-sm font-medium px-4 py-2"
                      >
                          Отмена
                      </button>
                      <button 
                          onClick={() => {
                              setShowLogoutConfirm(false);
                              onLogout();
                          }}
                          className="bg-discord-red hover:bg-red-600 text-white px-6 py-2 rounded font-medium transition-colors"
                      >
                          Выйти
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
