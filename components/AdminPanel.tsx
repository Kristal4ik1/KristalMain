
import React, { useState } from 'react';
import { User, UserBadge } from '../types';
import { api } from '../services/api';
import { databaseService } from '../services/databaseService'; // Import DB service directly for admin overrides
import { Search, ShieldAlert, Award, Save, X, Check } from 'lucide-react';

interface AdminPanelProps {
    currentUser: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
    const [searchId, setSearchId] = useState('');
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [message, setMessage] = useState('');
    const [banReason, setBanReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        setMessage('');
        if (!searchId) return;
        setIsLoading(true);
        try {
            // We use databaseService directly to bypass API limitations for admins if needed,
            // or we assume api.getUserById exists (it usually fetches all and filters in this mock)
            const users = await api.getUsers();
            const user = users[searchId];
            
            if (user) {
                setFoundUser(user);
                setBanReason(user.globalBanReason || '');
            } else {
                setFoundUser(null);
                setMessage('Пользователь не найден');
            }
        } catch (e) {
            setMessage('Ошибка поиска');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBadge = (badge: UserBadge) => {
        if (!foundUser) return;
        const currentBadges = foundUser.badges || [];
        let newBadges;
        if (currentBadges.includes(badge)) {
            newBadges = currentBadges.filter(b => b !== badge);
        } else {
            newBadges = [...currentBadges, badge];
        }
        setFoundUser({ ...foundUser, badges: newBadges });
    };

    const handleSaveUser = async () => {
        if (!foundUser) return;
        setIsLoading(true);
        try {
            await api.updateUser(foundUser.id, { 
                badges: foundUser.badges,
                isGlobalBanned: foundUser.isGlobalBanned,
                globalBanReason: banReason
            }, currentUser.token || '');
            setMessage('Данные пользователя обновлены успешно');
        } catch (e) {
            setMessage('Ошибка сохранения');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleGlobalBan = () => {
        if (!foundUser) return;
        setFoundUser({ 
            ...foundUser, 
            isGlobalBanned: !foundUser.isGlobalBanned 
        });
    };

    const badgesList = Object.values(UserBadge);

    return (
        <div className="max-w-[700px] animate-in slide-in-from-bottom-2 duration-300 pb-20">
            <div className="mb-6 border-b border-discord-red/30 pb-4">
                <h2 className="text-xl font-bold text-discord-red mb-2 flex items-center">
                    <ShieldAlert className="mr-2" /> Панель Администратора (Владельца)
                </h2>
                <p className="text-discord-muted text-sm">
                    Строгая защита. Управление глобальными правами, значками и блокировками.
                </p>
            </div>

            {/* Search */}
            <div className="bg-[#1E1F22] p-4 rounded-lg mb-6">
                <label className="text-xs font-bold text-discord-muted uppercase mb-2 block">Поиск пользователя по ID</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="user-1"
                        className="flex-1 bg-[#111214] text-white p-2 rounded outline-none border border-[#2B2D31] focus:border-discord-accent"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="bg-discord-accent hover:bg-discord-accent/80 text-white px-4 rounded font-medium"
                    >
                        <Search size={18} />
                    </button>
                </div>
                {message && <div className={`text-sm mt-2 ${message.includes('успешно') ? 'text-discord-green' : 'text-discord-red'}`}>{message}</div>}
            </div>

            {foundUser && (
                <div className="space-y-6">
                    {/* User Info Header */}
                    <div className="flex items-center bg-[#2B2D31] p-4 rounded-lg">
                        <img src={foundUser.avatar} className="w-12 h-12 rounded-full mr-4" alt="" />
                        <div>
                            <div className="text-white font-bold">{foundUser.username}</div>
                            <div className="text-discord-muted text-xs">ID: {foundUser.id}</div>
                        </div>
                        {foundUser.isGlobalBanned && (
                            <div className="ml-auto bg-discord-red text-white text-xs font-bold px-2 py-1 rounded">ЗАБЛОКИРОВАН</div>
                        )}
                    </div>

                    {/* Global Ban Section */}
                    <div className="bg-discord-red/5 border border-discord-red/20 p-4 rounded-lg">
                        <h3 className="text-discord-red font-bold text-sm uppercase mb-4 flex items-center">
                            <ShieldAlert size={16} className="mr-2" /> Блокировка в системе
                        </h3>
                        
                        <div className="mb-4">
                            <label className="text-xs font-bold text-discord-muted uppercase mb-1 block">Причина блокировки</label>
                            <textarea 
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                className="w-full bg-[#111214] text-white p-2 rounded outline-none border border-[#2B2D31] h-20 resize-none text-sm"
                                placeholder="Нарушение условий использования..."
                            />
                        </div>
                        
                        <button 
                            onClick={toggleGlobalBan}
                            className={`w-full py-2 rounded font-medium transition-colors ${foundUser.isGlobalBanned ? 'bg-discord-green hover:bg-green-600 text-white' : 'bg-discord-red hover:bg-red-600 text-white'}`}
                        >
                            {foundUser.isGlobalBanned ? 'Разблокировать пользователя' : 'ЗАБЛОКИРОВАТЬ НАВСЕГДА'}
                        </button>
                    </div>

                    {/* Badges Section */}
                    <div className="bg-[#1E1F22] p-4 rounded-lg">
                        <h3 className="text-white font-bold text-sm uppercase mb-4 flex items-center">
                            <Award size={16} className="mr-2 text-yellow-500" /> Управление значками
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-2">
                            {badgesList.map(badge => (
                                <div 
                                    key={badge}
                                    onClick={() => handleToggleBadge(badge)}
                                    className={`flex items-center p-2 rounded cursor-pointer border transition-colors ${
                                        foundUser.badges?.includes(badge) 
                                            ? 'bg-discord-accent/10 border-discord-accent' 
                                            : 'bg-[#2B2D31] border-transparent hover:border-discord-muted'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${
                                        foundUser.badges?.includes(badge) ? 'bg-discord-accent border-discord-accent' : 'border-discord-muted'
                                    }`}>
                                        {foundUser.badges?.includes(badge) && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="text-xs text-discord-text font-medium truncate" title={badge}>
                                        {badge.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSaveUser}
                            className="bg-discord-green hover:bg-green-600 text-white px-8 py-2 rounded font-medium flex items-center"
                        >
                            <Save size={18} className="mr-2" /> Сохранить изменения
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
