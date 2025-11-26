
import React, { useState, useRef } from 'react';
import { X, Upload, ChevronRight, Layout, Camera } from 'lucide-react';

interface CreateServerModalProps {
  onClose: () => void;
  onCreate: (name: string, icon?: string) => void;
  onJoin: (inviteCode: string) => Promise<void>;
}

export const CreateServerModal: React.FC<CreateServerModalProps> = ({ onClose, onCreate, onJoin }) => {
  const [mode, setMode] = useState<'LANDING' | 'CREATE' | 'JOIN'>('LANDING');
  const [serverName, setServerName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [serverIcon, setServerIcon] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverName.trim()) {
      onCreate(serverName, serverIcon || undefined);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setIsJoining(true);
    
    try {
        await onJoin(inviteCode);
    } catch (err: any) {
        setJoinError(err.message || 'Ошибка вступления');
        setIsJoining(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServerIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (mode === 'LANDING') {
      return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white text-black w-[440px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={24} /></button>
                
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Создайте свой сервер</h2>
                    <p className="text-gray-600 text-sm mb-6">Свой сервер — место, где можно общаться с друзьями и сообществом.</p>

                    <button 
                        onClick={() => setMode('CREATE')}
                        className="w-full border border-gray-300 rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 mb-2 group transition-colors"
                    >
                         <div className="flex items-center">
                             <div className="w-10 h-10 mr-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Layout size={20} />
                             </div>
                             <span className="font-bold text-gray-700">Свой шаблон</span>
                         </div>
                         <ChevronRight className="text-gray-400 group-hover:text-black" />
                    </button>
                </div>

                <div className="bg-gray-100 p-4 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Уже есть приглашение?</h3>
                    <button 
                        onClick={() => setMode('JOIN')}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded font-medium text-sm transition-colors"
                    >
                        Присоединиться к серверу
                    </button>
                </div>
            </div>
        </div>
      );
  }

  if (mode === 'JOIN') {
      return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white text-black w-[440px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={24} /></button>
                
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Присоединиться</h2>
                    <p className="text-gray-600 text-sm mb-6 text-center">Введите инвайт-код или ссылку приглашения ниже.</p>

                    <form onSubmit={handleJoinSubmit}>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                             Ссылка-приглашение <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full bg-gray-200 text-black p-2.5 rounded border-none outline-none focus:ring-2 focus:ring-discord-accent transition-all mb-2"
                            placeholder="hTKzmak"
                            required
                        />
                        <div className="text-xs text-gray-500 mb-4">
                            Приглашения выглядят так: hTKzmak, https://kristal.chat/hTKzmak
                        </div>
                        
                        {joinError && (
                            <div className="text-xs text-red-500 font-bold mb-4">{joinError}</div>
                        )}
                    </form>
                    
                    <div className="bg-gray-100 -mx-6 -mb-6 p-4 flex justify-between items-center mt-6">
                        <button 
                            onClick={() => setMode('LANDING')}
                            className="text-gray-600 hover:underline text-sm font-medium px-4"
                        >
                            Назад
                        </button>
                        <button 
                            onClick={handleJoinSubmit}
                            disabled={!inviteCode.trim() || isJoining}
                            className="bg-discord-accent hover:bg-discord-accent/80 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors disabled:opacity-50"
                        >
                            {isJoining ? 'Вступление...' : 'Вступить'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // CREATE Mode
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white text-black w-[440px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={24} />
        </button>

        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Свой сервер</h2>
          <p className="text-gray-600 text-sm">
             Персонализируйте свой новый сервер, выбрав ему название и значок. Вы сможете изменить их в любой момент.
          </p>

          <form onSubmit={handleCreateSubmit} className="mt-6">
            
            {/* Upload Area */}
            <div className="flex justify-center mb-6">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden group"
                >
                    {serverIcon ? (
                      <>
                        <img src={serverIcon} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-white font-bold uppercase">Change</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera size={24} className="text-discord-accent mb-1" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Upload</span>
                      </>
                    )}
                </div>
            </div>

            <div className="text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Название сервера
              </label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full bg-gray-200 text-black p-2.5 rounded border-none outline-none focus:ring-2 focus:ring-discord-accent transition-all"
                placeholder="Мой классный сервер"
                required
              />
              <div className="text-[10px] text-gray-500 mt-2">
                Создавая сервер, вы соглашаетесь с Руководящими принципами сообщества Kristal.
              </div>
            </div>
          </form>
        </div>

        <div className="bg-gray-100 p-4 flex justify-between items-center">
          <button 
            onClick={() => setMode('LANDING')}
            className="text-gray-600 hover:underline text-sm font-medium px-4"
          >
            Назад
          </button>
          <button 
            onClick={handleCreateSubmit}
            disabled={!serverName.trim()}
            className="bg-discord-accent hover:bg-discord-accent/80 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors disabled:opacity-50"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};
