
import React, { useState } from 'react';
import { X, Hash, Volume2 } from 'lucide-react';
import { ChannelType } from '../types';

interface CreateChannelModalProps {
  onClose: () => void;
  onCreate: (name: string, type: ChannelType) => void;
  defaultType?: ChannelType;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ onClose, onCreate, defaultType = ChannelType.TEXT }) => {
  const [channelType, setChannelType] = useState<ChannelType>(defaultType);
  const [channelName, setChannelName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelName.trim()) {
      onCreate(channelName.trim(), channelType);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#313338] w-[460px] rounded shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-discord-muted hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="p-4 pt-6">
          <h2 className="text-xl font-bold text-white mb-2">Создать канал</h2>
          
          <div className="mb-4">
             <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Тип канала</label>
             <div className="space-y-2">
                 {/* Text Option */}
                 <div 
                    onClick={() => setChannelType(ChannelType.TEXT)}
                    className={`flex items-center justify-between p-3 rounded cursor-pointer border ${channelType === ChannelType.TEXT ? 'bg-[#404249] border-transparent' : 'bg-[#2B2D31] border-transparent hover:bg-[#35373C]'}`}
                 >
                     <div className="flex items-center">
                         <Hash size={24} className="text-discord-muted mr-3" />
                         <div>
                             <div className="text-white font-medium">Текстовый канал</div>
                             <div className="text-xs text-discord-muted">Отправляйте сообщения, изображения, GIF и эмодзи</div>
                         </div>
                     </div>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${channelType === ChannelType.TEXT ? 'border-discord-text' : 'border-discord-muted'}`}>
                         {channelType === ChannelType.TEXT && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                     </div>
                 </div>

                 {/* Voice Option */}
                 <div 
                    onClick={() => setChannelType(ChannelType.VOICE)}
                    className={`flex items-center justify-between p-3 rounded cursor-pointer border ${channelType === ChannelType.VOICE ? 'bg-[#404249] border-transparent' : 'bg-[#2B2D31] border-transparent hover:bg-[#35373C]'}`}
                 >
                     <div className="flex items-center">
                         <Volume2 size={24} className="text-discord-muted mr-3" />
                         <div>
                             <div className="text-white font-medium">Голосовой канал</div>
                             <div className="text-xs text-discord-muted">Общайтесь голосом, видео и демонстрацией экрана</div>
                         </div>
                     </div>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${channelType === ChannelType.VOICE ? 'border-discord-text' : 'border-discord-muted'}`}>
                         {channelType === ChannelType.VOICE && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                     </div>
                 </div>
             </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Название канала</label>
            <div className="bg-[#1E1F22] flex items-center p-2 rounded">
                 {channelType === ChannelType.TEXT ? <Hash size={18} className="text-discord-muted mr-2" /> : <Volume2 size={18} className="text-discord-muted mr-2" />}
                 <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="bg-transparent flex-1 text-white border-none outline-none text-sm placeholder-discord-muted"
                    placeholder="new-channel"
                    autoFocus
                 />
            </div>
            
            <div className="mt-8 flex justify-end">
               <button 
                 type="button" 
                 onClick={onClose}
                 className="text-white hover:underline mr-6 font-medium text-sm"
               >
                 Отмена
               </button>
               <button 
                 type="submit"
                 disabled={!channelName}
                 className="bg-discord-accent hover:bg-[#4752C4] text-white px-6 py-2.5 rounded font-medium text-sm transition-colors disabled:opacity-50"
               >
                 Создать канал
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
