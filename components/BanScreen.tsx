
import React from 'react';
import { Ban, LogOut } from 'lucide-react';

interface BanScreenProps {
    reason?: string;
    onLogout: () => void;
}

export const BanScreen: React.FC<BanScreenProps> = ({ reason, onLogout }) => {
  return (
    <div className="fixed inset-0 bg-[#313338] z-[9999] flex items-center justify-center p-4">
        <div className="bg-[#1E1F22] max-w-md w-full rounded-lg shadow-2xl p-8 border border-discord-red/50 text-center">
            <div className="w-20 h-20 bg-discord-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ban size={48} className="text-discord-red" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Аккаунт заблокирован</h1>
            <p className="text-discord-muted mb-6">
                Ваша учетная запись была заблокирована администратором системы. Доступ к платформе ограничен.
            </p>
            
            {reason && (
                <div className="bg-[#2B2D31] p-4 rounded text-left mb-8 border-l-4 border-discord-red">
                    <div className="text-xs font-bold text-discord-muted uppercase mb-1">Причина блокировки</div>
                    <div className="text-white text-sm">{reason}</div>
                </div>
            )}
            
            <button 
                onClick={onLogout}
                className="flex items-center justify-center w-full bg-[#4E5058] hover:bg-[#6D6F78] text-white py-2 rounded font-medium transition-colors"
            >
                <LogOut size={18} className="mr-2" />
                Выйти из аккаунта
            </button>
        </div>
    </div>
  );
};
