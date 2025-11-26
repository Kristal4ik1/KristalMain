
import React from 'react';
import { X } from 'lucide-react';

interface GiftModalProps {
  onClose: () => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#313338] w-[400px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative border border-[#1E1F22] text-center p-6 justify-center min-h-[200px]">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-discord-muted hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-2">Подарки</h2>
        <p className="text-discord-muted text-base mt-4">
          не знаю че сюда добавить
        </p>
      </div>
    </div>
  );
};
