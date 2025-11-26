import React, { useState } from 'react';
import { User } from '../types';
import { Shield, Clock, Ban, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface ModerationModalProps {
  user: User;
  onClose: () => void;
  onTimeout: (userId: string, durationMinutes: number) => void;
  onBan: (userId: string) => void;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({ user, onClose, onTimeout, onBan }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeout' | 'ban'>('overview');
  const [timeoutDuration, setTimeoutDuration] = useState<number>(5);

  const handleTimeout = () => {
    onTimeout(user.id, timeoutDuration);
    onClose();
  };

  const handleBan = () => {
    onBan(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#313338] w-[440px] rounded shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-[#1E1F22]">
        
        {/* Header */}
        <div className="h-4 bg-discord-accent"></div>
        <div className="p-4 pb-0 flex justify-between items-start">
          <div className="flex items-center">
             <div className="w-16 h-16 rounded-full border-4 border-[#313338] -mt-8 overflow-hidden bg-[#313338]">
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
             </div>
             <div className="ml-3">
                <h2 className="text-xl font-bold text-white">{user.username}</h2>
                <p className="text-xs text-discord-muted">#{user.discriminator}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-discord-muted hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 mt-6 border-b border-[#1E1F22]">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-discord-text text-white' : 'border-transparent text-discord-muted hover:text-discord-text'}`}
          >
            Обзор
          </button>
          <button 
            onClick={() => setActiveTab('timeout')}
            className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'timeout' ? 'border-yellow-500 text-white' : 'border-transparent text-discord-muted hover:text-discord-text'}`}
          >
            Тайм-аут
          </button>
          <button 
            onClick={() => setActiveTab('ban')}
            className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'ban' ? 'border-discord-red text-white' : 'border-transparent text-discord-muted hover:text-discord-text'}`}
          >
            Бан
          </button>
        </div>

        {/* Content */}
        <div className="p-4 min-h-[200px]">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-[#2B2D31] p-3 rounded flex items-center">
                 <Shield className="text-discord-green mr-3" size={20} />
                 <div>
                    <div className="text-xs font-bold text-discord-muted uppercase">Статус модерации</div>
                    <div className="text-sm text-white">{user.isBanned ? 'Забанен' : user.timeoutUntil ? 'В тайм-ауте' : 'Чист'}</div>
                 </div>
              </div>
              <div className="bg-[#2B2D31] p-3 rounded flex items-center">
                 <Clock className="text-discord-accent mr-3" size={20} />
                 <div>
                    <div className="text-xs font-bold text-discord-muted uppercase">Дата регистрации</div>
                    <div className="text-sm text-white">20 Октября 2023</div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'timeout' && (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-sm text-yellow-200 flex items-start">
                <AlertTriangle size={16} className="mr-2 mt-0.5 shrink-0" />
                Пользователь не сможет отправлять сообщения и реагировать на них в течение выбранного времени.
              </div>
              
              <div>
                <label className="text-xs font-bold text-discord-muted uppercase mb-2 block">Длительность</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10, 60, 1440].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setTimeoutDuration(mins)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors
                        ${timeoutDuration === mins ? 'bg-discord-accent text-white' : 'bg-[#1E1F22] text-discord-muted hover:bg-[#404249]'}
                      `}
                    >
                      {mins >= 60 ? `${mins / 60} ч.` : `${mins} мин.`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleTimeout}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                >
                  Выдать тайм-аут
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ban' && (
            <div className="space-y-4">
               <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-sm text-red-200 flex items-start">
                <Ban size={16} className="mr-2 mt-0.5 shrink-0" />
                Это действие удалит пользователя с сервера и запретит ему вход.
              </div>

              <div>
                 <label className="text-xs font-bold text-discord-muted uppercase mb-2 block">Причина</label>
                 <textarea 
                    className="w-full bg-[#1E1F22] text-discord-text rounded p-2 text-sm outline-none focus:ring-1 focus:ring-discord-red resize-none h-24"
                    placeholder="Нарушение правил сообщества..."
                 />
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={handleBan}
                  className="bg-discord-red hover:bg-red-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                >
                  ЗАБАНИТЬ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};