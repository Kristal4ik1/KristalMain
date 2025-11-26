
import React from 'react';
import { UserBadge } from '../types';
import { Rocket, Gem, Shield, Bug, Code, Hammer, Award, Crown, Sparkles, Gamepad2, Ghost, Bot } from 'lucide-react';

interface UserBadgesProps {
    badges?: UserBadge[];
    className?: string;
}

export const UserBadges: React.FC<UserBadgesProps> = ({ badges, className = "" }) => {
    if (!badges || badges.length === 0) return null;

    const getIcon = (badge: UserBadge) => {
        switch (badge) {
            case UserBadge.NITRO: return <Rocket size={14} className="text-[#f47fff]" />;
            case UserBadge.BOOSTER: return <Gem size={14} className="text-[#f47fff]" />;
            case UserBadge.HYPESQUAD_BRAVERY: return <Shield size={14} className="text-[#9c84ef]" />;
            case UserBadge.HYPESQUAD_BRILLIANCE: return <Shield size={14} className="text-[#f47b67]" />;
            case UserBadge.HYPESQUAD_BALANCE: return <Shield size={14} className="text-[#45ddc0]" />;
            case UserBadge.BUG_HUNTER_SILVER: return <Bug size={14} className="text-[#b5bac1]" />;
            case UserBadge.BUG_HUNTER_GOLD: return <Bug size={14} className="text-[#f1c40f]" />;
            case UserBadge.ACTIVE_DEVELOPER: return <Code size={14} className="text-[#5865F2]" />;
            case UserBadge.STAFF: return <Hammer size={14} className="text-[#5865F2]" />;
            case UserBadge.PARTNER: return <Award size={14} className="text-[#5865F2]" />;
            case UserBadge.EARLY_SUPPORTER: return <Sparkles size={14} className="text-[#5865F2]" />;
            case UserBadge.HYPESQUAD_EVENTS: return <Crown size={14} className="text-[#f1c40f]" />;
            case UserBadge.QUESTS: return <Gamepad2 size={14} className="text-[#5865F2]" />;
            case UserBadge.CLOWN: return <span className="text-lg leading-none">🤡</span>;
            case UserBadge.LEGACY_USERNAME: return <span className="text-lg leading-none">#️⃣</span>;
            case UserBadge.VERIFIED_BOT_DEVELOPER: return <Bot size={14} className="text-[#5865F2]" />;
            default: return <Shield size={14} />;
        }
    };

    const getTooltip = (badge: UserBadge) => {
        return badge.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className={`flex gap-1 items-center bg-[#111214] rounded-lg p-1 border border-[#1E1F22] ${className}`}>
            {badges.map(badge => (
                <div 
                    key={badge} 
                    className="w-5 h-5 bg-[#2B2D31] rounded flex items-center justify-center cursor-help hover:bg-[#35373C] transition-colors"
                    title={getTooltip(badge)}
                >
                    {getIcon(badge)}
                </div>
            ))}
        </div>
    );
};
