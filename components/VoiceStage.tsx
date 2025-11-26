
import React, { useEffect, useState } from 'react';
import { Channel, User } from '../types';
import { voiceService } from '../services/voiceService';
import { Mic, MicOff, PhoneOff, Video, VideoOff, ScreenShare, Signal } from 'lucide-react';

interface VoiceStageProps {
  channel: Channel;
  users: Record<string, User>;
  currentUser: User;
}

export const VoiceStage: React.FC<VoiceStageProps> = ({ channel, users, currentUser }) => {
  const [voiceState, setVoiceState] = useState(voiceService['state']);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    // Join the channel when component mounts (or ensure we are joined)
    voiceService.joinChannel(channel.id);
    
    // Subscribe to state updates
    const unsubscribe = voiceService.subscribe((state) => {
        setVoiceState({ ...state });
    });

    return () => {
        unsubscribe();
        // IMPORTANT: Removed voiceService.leaveChannel() here.
        // This allows the user to switch to a text channel (unmounting this component)
        // while staying connected to voice.
    };
  }, [channel.id]);

  const toggleMic = () => voiceService.toggleMute();
  const disconnect = () => voiceService.leaveChannel();
  
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  return (
    <div className="flex-1 bg-black flex flex-col min-w-0 relative h-full">
       
       {/* Top Header Overlay (Optional, for channel context) */}
       <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none">
           <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded px-3 py-1.5 flex items-center">
               <Signal size={16} className="text-discord-green mr-2" />
               <span className="text-white font-bold text-sm tracking-wide">Голосовой канал</span>
               <span className="mx-2 text-gray-500">/</span>
               <span className="text-white font-medium text-sm">{channel.name}</span>
           </div>
       </div>

       {/* Main Grid Area */}
       <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center custom-scrollbar">
           <div className="flex flex-wrap gap-3 justify-center w-full max-w-full content-center items-center h-full">
               
               {/* Show current user + other participants */}
               {voiceState.participants.length === 0 && (
                   <div className="text-discord-muted flex flex-col items-center animate-pulse">
                       <div className="w-20 h-20 rounded-full bg-[#1E1F22] mb-4"></div>
                       <p>Ожидание подключения...</p>
                   </div>
               )}

               {voiceState.participants.map(userId => {
                   const user = users[userId] || { username: 'Unknown', avatar: '' };
                   const isSpeaking = voiceState.speakingUsers.has(userId);
                   const isSelf = userId === currentUser.id;
                   const isMuted = isSelf ? voiceState.isMuted : false; 

                   return (
                       <div 
                         key={userId} 
                         className={`relative w-[400px] h-[225px] bg-[#1E1F22] rounded-xl flex flex-col items-center justify-center group border-[3px] transition-all duration-100 shadow-lg
                            ${isSpeaking ? 'border-discord-green' : 'border-[#1E1F22] hover:border-[#2B2D31]'}
                         `}
                       >
                           {/* Avatar Circle */}
                           <div className={`w-24 h-24 rounded-full overflow-hidden relative mb-2 transition-transform duration-200 ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
                                <img src={user.avatar} alt={user.username} className={`w-full h-full object-cover bg-[#2B2D31] ${isMuted ? 'opacity-50' : ''}`} />
                           </div>
                           
                           {/* Mute Indicator icon in corner of card */}
                           {isMuted && (
                               <div className="absolute top-3 right-3 bg-[#111214]/80 p-1.5 rounded-full backdrop-blur-sm">
                                   <MicOff size={16} className="text-discord-red" />
                               </div>
                           )}

                           {/* Name Tag */}
                           <div className="absolute bottom-4 left-4 bg-[#111214]/80 px-2.5 py-1 rounded-[4px] backdrop-blur-sm flex items-center max-w-[80%]">
                                <span className={`text-white font-bold text-sm truncate ${isMuted ? 'text-gray-400' : ''}`}>
                                    {user.username}
                                </span>
                           </div>
                       </div>
                   );
               })}
           </div>
       </div>

       {/* Bottom Control Dock */}
       <div className="mb-6 flex justify-center shrink-0 z-20">
           <div className="bg-[#1E1F22] rounded-[16px] px-3 py-2 flex items-center space-x-2 shadow-2xl border border-[#111214]">
                
                {/* Camera */}
                <button 
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-[12px] flex items-center justify-center transition-all duration-200 relative group
                        ${isVideoOn ? 'bg-white text-black' : 'bg-[#2B2D31] text-white hover:bg-[#3F4147]'}
                    `}
                    title="Включить камеру"
                >
                    {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
                    {!isVideoOn && <div className="absolute -top-1 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#2B2D31] hidden"></div>}
                </button>
                
                {/* Screen Share */}
                <button 
                    onClick={toggleScreenShare}
                    className={`w-12 h-12 rounded-[12px] flex items-center justify-center transition-all duration-200 group
                        ${isScreenSharing ? 'bg-discord-green text-white' : 'bg-[#2B2D31] text-white hover:bg-[#3F4147]'}
                    `}
                    title="Демонстрация экрана"
                >
                    <ScreenShare size={22} />
                </button>

               {/* Mic Toggle */}
               <button 
                    onClick={toggleMic}
                    className={`w-12 h-12 rounded-[12px] flex items-center justify-center transition-all duration-200
                        ${voiceState.isMuted ? 'bg-discord-red text-white' : 'bg-[#2B2D31] text-white hover:bg-[#3F4147]'}
                    `}
                    title="Микрофон"
               >
                   {voiceState.isMuted ? <MicOff size={22} /> : <Mic size={22} />}
               </button>
               
               <div className="w-[1px] h-8 bg-[#3F4147] mx-2"></div>

               {/* Disconnect */}
               <button 
                    onClick={disconnect}
                    className="w-12 h-12 rounded-[12px] bg-discord-red flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    title="Отключиться"
               >
                   <PhoneOff size={22} />
               </button>
           </div>
       </div>
    </div>
  );
};
