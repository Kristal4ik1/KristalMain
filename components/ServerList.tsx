
import React from 'react';
import { Server } from '../types';
import { Plus, Compass } from 'lucide-react';
import { KristalLogo } from './KristalLogo';

interface ServerListProps {
  servers: Server[];
  activeServerId: string;
  onServerClick: (id: string) => void;
  onAddServerClick: () => void;
}

const ServerIcon: React.FC<{ 
  name?: string; 
  icon?: string; 
  active?: boolean;
  onClick?: () => void;
  special?: 'home' | 'add' | 'explore';
}> = ({ name, icon, active, onClick, special }) => {
  
  return (
    <div className="relative group flex items-center justify-center w-full mb-2">
      {/* Active Indicator */}
      <div className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 
        ${active ? 'h-10' : 'h-2 group-hover:h-5 scale-0 group-hover:scale-100'} 
        origin-left`} 
      />

      <button
        onClick={onClick}
        className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-200 overflow-hidden flex items-center justify-center
          ${active ? 'bg-discord-accent rounded-[16px]' : 'bg-discord-dark group-hover:bg-discord-accent'}
          ${special === 'add' || special === 'explore' ? 'bg-discord-dark text-discord-green group-hover:bg-discord-green group-hover:text-white' : ''}
        `}
      >
        {special === 'home' && <KristalLogo size={28} />}
        {special === 'add' && <Plus size={24} className="text-discord-green group-hover:text-white" />}
        {special === 'explore' && <Compass size={24} className="text-discord-green group-hover:text-white" />}
        
        {!special && icon && <img src={icon} alt={name} className="w-full h-full object-cover" />}
        {!special && !icon && name && <span className="text-sm font-medium text-discord-text">{name.substring(0, 2).toUpperCase()}</span>}
      </button>
    </div>
  );
};

export const ServerList: React.FC<ServerListProps> = ({ servers, activeServerId, onServerClick, onAddServerClick }) => {
  return (
    <div className="w-[72px] bg-discord-sidebar flex flex-col items-center py-3 overflow-y-auto no-scrollbar shrink-0">
      <ServerIcon 
        special="home" 
        active={activeServerId === 'home'} 
        onClick={() => onServerClick('home')}
      />
      <div className="w-8 h-[2px] bg-discord-light rounded-lg mb-2 mx-auto" />
      
      {servers.map((server) => (
        <ServerIcon 
          key={server.id} 
          name={server.name} 
          icon={server.icon} 
          active={activeServerId === server.id} 
          onClick={() => onServerClick(server.id)}
        />
      ))}

      <div className="w-8 h-[2px] bg-discord-light rounded-lg mb-2 mx-auto" />
      <ServerIcon special="add" onClick={onAddServerClick} />
      <ServerIcon special="explore" />
    </div>
  );
};
