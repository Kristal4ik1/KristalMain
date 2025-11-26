
import React, { useState } from 'react';
import { User, Server } from '../types';
import { X, Search, Copy, Check } from 'lucide-react';

interface InviteModalProps {
  server: Server;
  friends: User[]; // List of friends to invite
  onClose: () => void;
  inviteLink?: string; // Optional custom link structure
}

export const InviteModal: React.FC<InviteModalProps> = ({ server, friends, onClose, inviteLink }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState<Set<string>>(new Set());

  const link = inviteLink || `https://nexus.chat/${server.inviteCode || server.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (userId: string) => {
    setInvited(prev => new Set(prev).add(userId));
    // In a real app, this would trigger an API call to send a DM or notification
  };

  const filteredFriends = friends.filter(f => 
    f.username.toLowerCase().includes(searchTerm.toLowerCase()) && !invited.has(f.id)
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#313338] w-[440px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative border border-[#1E1F22]">
        
        {/* Header */}
        <div className="p-4 relative">
             <h2 className="text-base font-bold text-white uppercase truncate pr-8">Пригласить друзей в {server.name}</h2>
             <div className="text-xs text-discord-muted mt-1"># {server.channels[0]?.name || 'general'}</div>
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-discord-muted hover:text-white"
             >
                <X size={24} />
             </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Найти друзей" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1E1F22] text-discord-text p-2 rounded border border-[#1E1F22] focus:border-discord-accent outline-none pr-8"
                />
                <Search size={16} className="absolute right-2 top-2.5 text-discord-muted" />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto max-h-[300px] p-4 pt-2 space-y-1 custom-scrollbar">
            {filteredFriends.length === 0 && invited.size > 0 && searchTerm === '' ? (
                 <div className="text-center text-discord-muted text-sm py-8">Вы всех пригласили!</div>
            ) : filteredFriends.length === 0 ? (
                 <div className="text-center text-discord-muted text-sm py-8">Друзья не найдены.</div>
            ) : (
                filteredFriends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-[#35373C] rounded group">
                        <div className="flex items-center">
                             <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                                 <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                             </div>
                             <div>
                                 <div className="text-white font-medium text-sm">{friend.username}</div>
                                 <div className="text-discord-muted text-xs">{friend.username}</div>
                             </div>
                        </div>
                        <button 
                            onClick={() => handleInvite(friend.id)}
                            className="border border-discord-green text-discord-green hover:bg-discord-green hover:text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                        >
                            Пригласить
                        </button>
                    </div>
                ))
            )}
            
            {/* Show invited users faintly? Or just hide them (implemented hiding) */}
        </div>

        {/* Footer Link */}
        <div className="p-4 bg-[#2B2D31] flex flex-col">
            <h3 className="text-xs font-bold text-discord-muted uppercase mb-2">Или отправьте другу ссылку-приглашение на сервер</h3>
            <div className="flex bg-[#1E1F22] rounded p-1 items-center">
                 <input 
                    readOnly
                    value={link}
                    className="flex-1 bg-transparent border-none outline-none text-discord-text text-sm px-2"
                 />
                 <button 
                    onClick={handleCopy}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-all w-24 flex items-center justify-center
                        ${copied ? 'bg-discord-green text-white' : 'bg-discord-accent hover:bg-[#4752C4] text-white'}
                    `}
                 >
                    {copied ? 'Скопировано' : 'Копировать'}
                 </button>
            </div>
            <div className="text-[10px] text-discord-muted mt-2">
                Ваша ссылка-приглашение перестанет действовать через 7 дней. <span className="text-blue-400 cursor-pointer hover:underline">Изменить ссылку-приглашение.</span>
            </div>
        </div>

      </div>
    </div>
  );
};
