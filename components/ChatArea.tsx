
import React, { useEffect, useRef, useState } from 'react';
import { Channel, Message, User, ChannelType, UserStatus } from '../types';
import { Hash, Bell, Pin, Users, Search, PlusCircle, Gift, Sticker, Smile, Trash2, Shield, Clock, X } from 'lucide-react';
import { VoiceStage } from './VoiceStage';
import { GiftModal } from './GiftModal';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  users: Record<string, User>;
  currentUser: User;
  onSendMessage: (content: string, attachments?: string[]) => void;
  onToggleUserList: () => void;
  showUserList: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onOpenModeration?: (user: User) => void;
  onOpenProfile?: (user: User) => void;
  onContextMenu?: (e: React.MouseEvent, user: User) => void;
}

// Cleaned up emoji list
const EMOJIS = {
    'Faces': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','🤡','👹','👺','👻','👽','👾','🤖','💩'],
    'Hands': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦵','🦶','👂','🦻','nose','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄'],
    'Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️'],
    'Nature': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🕸️','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','RAM','🐑','🐏','🐐','🦌','🦙','🦥','🦦','🦨','🦡','🐁','🐀','🐿️','🦔','🐾','🦃','🐔','🐓','🐣','🐤','🐥','🐦','🐧','🕊️','🦅','🦆','🦢','🦉','🦤','🪶','🦩','🦚','🦜'],
    'Food': ['🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🫓','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🫖','🍵','🧉','🧋','🧃','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽️','🥣','🥡','🥢']
};

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  channel, 
  messages, 
  users, 
  currentUser,
  onSendMessage,
  onToggleUserList,
  showUserList,
  onDeleteMessage,
  onOpenModeration,
  onOpenProfile,
  onContextMenu
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState('Faces');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, channel.id]);

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const isTimedOut = currentUser.timeoutUntil && new Date(currentUser.timeoutUntil) > new Date();

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (isTimedOut) return;
      if (!inputValue.trim()) return;

      const content = inputValue.trim();
      onSendMessage(content);
      setInputValue('');
      setShowEmojiPicker(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onSendMessage(file.name, [base64]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const addEmoji = (emoji: string) => {
      setInputValue(prev => prev + emoji);
      inputRef.current?.focus();
  };

  if (channel.type === ChannelType.VOICE) {
    return <VoiceStage channel={channel} users={users} currentUser={currentUser} />;
  }

  return (
    <div className="flex-1 bg-discord-dark flex flex-col min-w-0 relative">
      {/* Header */}
      <div className="h-12 border-b border-discord-light flex items-center justify-between px-4 shrink-0 shadow-sm z-10 bg-discord-dark">
        <div className="flex items-center">
          <Hash size={24} className="text-discord-muted mr-2" />
          <h3 className="font-bold text-white">{channel.name}</h3>
          {channel.id === 'ch-1' && <span className="ml-4 text-xs text-discord-muted border-l border-discord-muted pl-4">Официальные правила сервера</span>}
        </div>
        <div className="flex items-center space-x-4 text-discord-muted">
          <Bell size={24} className="hover:text-discord-text cursor-pointer" />
          <Pin size={24} className="hover:text-discord-text cursor-pointer" />
          <Users 
            size={24} 
            className={`hover:text-discord-text cursor-pointer ${showUserList ? 'text-white' : ''}`}
            onClick={onToggleUserList} 
          />
          <div className="relative">
            <input 
              type="text" 
              placeholder="Поиск" 
              className="bg-discord-sidebar text-sm rounded px-2 py-1 w-36 transition-all focus:w-60 text-discord-text outline-none" 
            />
            <Search size={16} className="absolute right-2 top-1.5" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Welcome Message */}
        <div className="mt-4 mb-8">
            <div className="w-16 h-16 bg-discord-lighter rounded-full flex items-center justify-center mb-4">
                <Hash size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Добро пожаловать в #{channel.name}!</h1>
            <p className="text-discord-muted">Это начало истории этого канала.</p>
        </div>

        {messages.map((msg, index) => {
          const user: User = users[msg.authorId] || { 
            id: 'unknown',
            username: 'Unknown', 
            avatar: '', 
            discriminator: '0000', 
            status: UserStatus.OFFLINE, 
            isBot: false 
          };
          const prevMsg = messages[index - 1];
          const isCompact = prevMsg && prevMsg.authorId === msg.authorId && (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 5 * 60 * 1000);
          
          return (
            <div key={msg.id} className={`group flex pr-4 ${isCompact ? 'mt-0.5 py-0.5 hover:bg-[#2e3035]' : 'mt-4 hover:bg-[#2e3035]'} -mx-4 px-4 relative`}>
              
              {/* Message Actions (Admin only) */}
              {currentUser.isAdmin && (
                <div className="absolute right-4 top-0 bg-[#313338] shadow-sm rounded flex items-center p-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 border border-[#2B2D31]">
                  <button 
                    onClick={() => onDeleteMessage?.(msg.id)}
                    className="p-1 hover:bg-discord-red hover:text-white text-discord-muted rounded"
                    title="Удалить сообщение"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={() => onOpenModeration?.(user)}
                    className="p-1 hover:bg-discord-accent hover:text-white text-discord-muted rounded ml-1"
                    title="Модерировать пользователя"
                  >
                    <Shield size={16} />
                  </button>
                </div>
              )}

              {!isCompact ? (
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden mr-4 shrink-0 cursor-pointer hover:opacity-80 mt-0.5"
                  onClick={(e) => {
                      if (e.type === 'click') {
                          currentUser.isAdmin && onOpenModeration?.(user);
                      }
                  }}
                  onContextMenu={(e) => {
                      e.preventDefault();
                      if (onContextMenu) onContextMenu(e, user);
                      else onOpenProfile?.(user);
                  }}
                >
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} alt={user.username} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 mr-4 text-[10px] text-discord-muted text-right opacity-0 group-hover:opacity-100 select-none pt-1.5">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                {!isCompact && (
                  <div className="flex items-center mb-0.5">
                    <span 
                      className="font-medium text-white mr-2 hover:underline cursor-pointer"
                      onClick={() => currentUser.isAdmin && onOpenModeration?.(user)}
                      onContextMenu={(e) => {
                          e.preventDefault();
                          if (onContextMenu) onContextMenu(e, user);
                          else onOpenProfile?.(user);
                      }}
                    >
                      {user.username}
                    </span>
                    {user.isBot && <span className="bg-discord-accent text-[10px] text-white px-1.5 rounded-[3px] py-[1px] mr-2">BOT</span>}
                    {user.isAdmin && <Shield size={14} className="text-discord-green mr-1" />}
                    <span className="text-xs text-discord-muted ml-1">
                      {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                <p className={`text-discord-text whitespace-pre-wrap leading-6 ${isCompact ? '' : ''}`}>
                  {msg.content}
                </p>
                {msg.attachments && msg.attachments.length > 0 && (
                   <div className="mt-2 space-y-2">
                       {msg.attachments.map((url, i) => (
                           <div key={i} className="max-w-sm rounded-lg overflow-hidden border border-[#2B2D31]">
                               <img src={url} alt="attachment" className="w-full h-full object-cover" />
                           </div>
                       ))}
                   </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6 pt-2 shrink-0 relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-20 right-4 w-[320px] bg-[#2B2D31] rounded-lg shadow-2xl border border-[#1E1F22] overflow-hidden z-50 flex flex-col h-[400px]">
                <div className="bg-[#232428] px-2 py-2 flex space-x-1 overflow-x-auto no-scrollbar shrink-0">
                    {Object.keys(EMOJIS).map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveEmojiTab(cat)}
                            className={`px-2 py-1 rounded text-xs font-bold transition-colors ${activeEmojiTab === cat ? 'bg-[#404249] text-white' : 'text-discord-muted hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="p-3 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-8 gap-1 content-start">
                    {EMOJIS[activeEmojiTab as keyof typeof EMOJIS].map(emoji => (
                        <button 
                            key={emoji} 
                            onClick={() => addEmoji(emoji)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#404249] rounded text-xl"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {isTimedOut ? (
           <div className="bg-discord-red/10 border border-discord-red/50 rounded-lg p-4 flex items-center justify-center text-discord-red font-bold">
              <Clock className="mr-2" size={20} />
              Вы временно не можете отправлять сообщения (Тайм-аут).
           </div>
        ) : (
          <>
            <div className="bg-discord-light rounded-lg p-2.5 flex items-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-discord-muted hover:text-discord-text mr-3 sticky-button"
              >
                <PlusCircle size={24} className="bg-discord-muted text-discord-dark rounded-full p-0.5 hover:text-white transition-colors" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <input
                ref={inputRef}
                type="text"
                className="bg-transparent flex-1 outline-none text-discord-text placeholder-discord-muted"
                placeholder={`Написать в #${channel.name}`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center space-x-3 mx-2 text-discord-muted">
                <Gift 
                  size={24} 
                  className="hover:text-discord-text cursor-pointer" 
                  onClick={() => setShowGiftModal(true)}
                />
                <Sticker 
                  size={24} 
                  className="hover:text-discord-text cursor-pointer" 
                  onClick={() => setShowStickerModal(true)}
                />
                <Smile 
                  size={24} 
                  className={`hover:text-discord-text cursor-pointer ${showEmojiPicker ? 'text-discord-text' : ''}`}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {showGiftModal && (
        <GiftModal onClose={() => setShowGiftModal(false)} />
      )}
      
      {showStickerModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center" onClick={() => setShowStickerModal(false)}>
             <div className="bg-[#313338] px-8 py-4 rounded-lg shadow-xl border border-[#1E1F22] text-white font-bold" onClick={e => e.stopPropagation()}>
                 потом
                 <button onClick={() => setShowStickerModal(false)} className="ml-4 text-discord-muted hover:text-white"><X size={16} /></button>
             </div>
        </div>
      )}
    </div>
  );
};
