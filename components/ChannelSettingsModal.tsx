
import React, { useState } from 'react';
import { Channel, ChannelType } from '../types';
import { X, Trash2, Hash, Volume2 } from 'lucide-react';

interface ChannelSettingsModalProps {
  channel: Channel;
  onClose: () => void;
  onSave: (channelId: string, data: Partial<Channel>) => Promise<void>;
  onDelete: (channelId: string) => Promise<void>;
}

export const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({ channel, onClose, onSave, onDelete }) => {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [name, setName] = useState(channel.name);
  const [topic, setTopic] = useState(channel.topic || '');
  const [slowMode, setSlowMode] = useState(channel.slowMode || 0);
  const [ageRestricted, setAgeRestricted] = useState(channel.ageRestricted || false);
  const [bitrate, setBitrate] = useState(channel.bitrate || 64);
  const [userLimit, setUserLimit] = useState(channel.userLimit || 0);
  const [videoQuality, setVideoQuality] = useState(channel.videoQuality || 'AUTO');
  const [region, setRegion] = useState(channel.region || 'Automatic');
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to update change state
  const onChange = (setter: any, value: any) => {
      setter(value);
      setHasChanges(true);
  };

  const handleSave = async () => {
      setIsLoading(true);
      try {
          await onSave(channel.id, {
              name,
              topic,
              slowMode,
              ageRestricted,
              bitrate,
              userLimit,
              videoQuality,
              region: region === 'Automatic' ? undefined : region
          });
          setHasChanges(false);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleDelete = async () => {
      if(confirm('Вы уверены, что хотите удалить этот канал? Это действие нельзя отменить.')) {
          await onDelete(channel.id);
          onClose();
      }
  };

  const slowModeOptions = [
      { value: 0, label: 'Выкл' },
      { value: 5, label: '5с' },
      { value: 10, label: '10с' },
      { value: 15, label: '15с' },
      { value: 30, label: '30с' },
      { value: 60, label: '1м' },
      { value: 120, label: '2м' },
      { value: 300, label: '5м' },
      { value: 600, label: '10м' },
      { value: 900, label: '15м' },
      { value: 1800, label: '30м' },
      { value: 3600, label: '1ч' },
      { value: 7200, label: '2ч' },
      { value: 21600, label: '6ч' },
  ];

  const regions = ['Automatic', 'Brazil', 'Rotterdam', 'Hong Kong', 'India', 'Japan', 'Russia', 'Singapore', 'South Africa', 'Sydney', 'US Central', 'US East', 'US South', 'US West'];

  return (
    <div className="fixed inset-0 bg-discord-dark z-50 flex animate-in fade-in duration-200 font-sans">
        {/* Sidebar */}
        <div className="w-[30%] bg-[#2B2D31] flex flex-col items-end pt-16 pr-6">
            <div className="w-48">
                <div className="text-xs font-bold text-discord-muted uppercase mb-4 px-2 flex items-center">
                    {channel.type === ChannelType.TEXT ? <Hash size={12} className="mr-1" /> : <Volume2 size={12} className="mr-1" />}
                    {name.toUpperCase()}
                </div>
                
                <div 
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`px-2 py-1.5 rounded cursor-pointer font-medium text-sm mb-1 ${activeTab === 'OVERVIEW' ? 'bg-[#404249] text-white' : 'text-discord-muted hover:bg-[#35373C] hover:text-discord-text'}`}
                >
                    Обзор
                </div>
                <div className="text-discord-muted hover:bg-[#35373C] hover:text-discord-text px-2 py-1.5 rounded cursor-pointer font-medium text-sm mb-1">
                    Права доступа
                </div>
                <div className="text-discord-muted hover:bg-[#35373C] hover:text-discord-text px-2 py-1.5 rounded cursor-pointer font-medium text-sm mb-1">
                    Приглашения
                </div>
                <div className="text-discord-muted hover:bg-[#35373C] hover:text-discord-text px-2 py-1.5 rounded cursor-pointer font-medium text-sm mb-1">
                    Интеграция
                </div>
                
                <div className="h-[1px] bg-discord-light my-2"></div>
                
                <div 
                    onClick={handleDelete}
                    className="text-discord-red hover:bg-[#35373C] px-2 py-1.5 rounded cursor-pointer font-medium text-sm flex items-center justify-between group"
                >
                    Удалить канал <Trash2 size={14} className="opacity-50 group-hover:opacity-100" />
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#313338] pt-16 pl-10 pr-20 overflow-y-auto pb-24">
             <div className="max-w-[660px]">
                <h2 className="text-xl font-bold text-white mb-6">Обзор</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Название канала</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => onChange(setName, e.target.value)}
                            className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none outline-none focus:ring-1 focus:ring-discord-accent"
                        />
                    </div>

                    {channel.type === ChannelType.TEXT && (
                        <div>
                            <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Тема канала</label>
                            <textarea 
                                value={topic}
                                onChange={(e) => onChange(setTopic, e.target.value)}
                                className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none outline-none focus:ring-1 focus:ring-discord-accent h-20 resize-none"
                                placeholder="Всем привет!"
                            />
                        </div>
                    )}
                    
                    {channel.type === ChannelType.TEXT && (
                         <div>
                            <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Медленный режим</label>
                            <div className="relative">
                                <select 
                                    value={slowMode}
                                    onChange={(e) => onChange(setSlowMode, Number(e.target.value))}
                                    className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none outline-none appearance-none cursor-pointer"
                                >
                                    {slowModeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-xs text-discord-muted mt-1">Участники не смогут отправлять больше одного сообщения в течение этого периода времени.</div>
                         </div>
                    )}

                    <div className="flex items-center justify-between">
                         <div>
                             <div className="font-medium text-white mb-1">Канал с возрастным ограничением</div>
                             <div className="text-xs text-discord-muted max-w-md">Для просмотра содержимого этого канала пользователям необходимо подтвердить, что они достигли совершеннолетия.</div>
                         </div>
                         <div 
                            onClick={() => onChange(setAgeRestricted, !ageRestricted)}
                            className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${ageRestricted ? 'bg-discord-green' : 'bg-[#80848E]'}`}
                         >
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${ageRestricted ? 'left-5' : 'left-1'}`}></div>
                         </div>
                    </div>

                    {channel.type === ChannelType.VOICE && (
                        <>
                            <div className="h-[1px] bg-discord-light my-2"></div>

                            <div>
                                <div className="flex justify-between mb-2">
                                     <label className="text-xs font-bold text-discord-muted uppercase">Битрейт</label>
                                     <span className="text-xs font-bold text-discord-muted">{bitrate}kbps</span>
                                </div>
                                <input 
                                    type="range"
                                    min="8"
                                    max="96"
                                    value={bitrate}
                                    onChange={(e) => onChange(setBitrate, Number(e.target.value))}
                                    className="w-full h-1.5 bg-[#4E5058] rounded-lg appearance-none cursor-pointer accent-discord-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Качество видео</label>
                                <div className="bg-[#1E1F22] p-1 rounded flex">
                                     <div 
                                        onClick={() => onChange(setVideoQuality, 'AUTO')}
                                        className={`flex-1 text-center py-1.5 rounded text-sm font-medium cursor-pointer ${videoQuality === 'AUTO' ? 'bg-[#404249] text-white shadow-sm' : 'text-discord-muted hover:text-white'}`}
                                     >
                                         Автоматически
                                     </div>
                                     <div 
                                        onClick={() => onChange(setVideoQuality, '720p')}
                                        className={`flex-1 text-center py-1.5 rounded text-sm font-medium cursor-pointer ${videoQuality === '720p' ? 'bg-[#404249] text-white shadow-sm' : 'text-discord-muted hover:text-white'}`}
                                     >
                                         720p
                                     </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                     <label className="text-xs font-bold text-discord-muted uppercase">Лимит пользователей</label>
                                     <span className="text-xs font-bold text-discord-muted">{userLimit === 0 ? '∞' : userLimit}</span>
                                </div>
                                <input 
                                    type="range"
                                    min="0"
                                    max="99"
                                    value={userLimit}
                                    onChange={(e) => onChange(setUserLimit, Number(e.target.value))}
                                    className="w-full h-1.5 bg-[#4E5058] rounded-lg appearance-none cursor-pointer accent-discord-accent"
                                />
                                <div className="text-xs text-discord-muted mt-1">Ограничивает количество пользователей, которые могут подключаться к этому голосовому каналу.</div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Назначение региона</label>
                                <select 
                                    value={region}
                                    onChange={(e) => onChange(setRegion, e.target.value)}
                                    className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none outline-none appearance-none cursor-pointer"
                                >
                                    {regions.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <div className="text-xs text-discord-muted mt-1">Для всех пользователей канала независимо от их местонахождения будет предпринята попытка подключения к указанному вами региону.</div>
                            </div>
                        </>
                    )}

                </div>
             </div>

             <button 
                onClick={onClose}
                className="absolute right-10 top-16 text-discord-muted hover:text-white border-2 border-discord-muted hover:border-white rounded-full p-1 transition-colors"
             >
                <X size={18} />
                <div className="text-xs font-bold text-center mt-1">ESC</div>
             </button>

             {hasChanges && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#111214] p-3 flex justify-end items-center px-10 border-t border-[#1E1F22] z-50 animate-in slide-in-from-bottom-2">
                     <div className="mr-auto text-white text-sm font-medium">Есть несохраненные изменения</div>
                     <button 
                        onClick={() => {
                            setName(channel.name);
                            setTopic(channel.topic || '');
                            setSlowMode(channel.slowMode || 0);
                            setAgeRestricted(channel.ageRestricted || false);
                            setBitrate(channel.bitrate || 64);
                            setUserLimit(channel.userLimit || 0);
                            setVideoQuality(channel.videoQuality || 'AUTO');
                            setRegion(channel.region || 'Automatic');
                            setHasChanges(false);
                        }} 
                        className="text-white hover:underline mr-6 font-medium text-sm"
                    >
                        Сброс
                     </button>
                     <button 
                        onClick={handleSave} 
                        disabled={isLoading}
                        className="bg-discord-green hover:bg-emerald-600 text-white px-6 py-2 rounded font-medium text-sm transition-colors disabled:opacity-50"
                     >
                        {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                     </button>
                </div>
             )}
        </div>
    </div>
  );
};
