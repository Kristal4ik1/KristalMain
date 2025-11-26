
import React, { useState } from 'react';
import { KristalLogo } from './KristalLogo';
import { Download, Shield, Zap, Globe, X, Terminal, Wifi } from 'lucide-react';

interface LandingPageProps {
    onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
    const [showBlog, setShowBlog] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        setIsDownloading(true);
        
        // Create a link to the local file
        const link = document.createElement('a');
        link.href = 'KristalSetup.exe'; // Points to the file we added to the project
        link.download = 'KristalSetup.exe';
        document.body.appendChild(link);
        
        setTimeout(() => {
            link.click();
            document.body.removeChild(link);
            setIsDownloading(false);
        }, 1000);
    };

    return (
        <div className="w-full min-h-screen bg-[#1a1b1e] text-white overflow-x-hidden font-sans relative">
            {/* Nav */}
            <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-2">
                    <KristalLogo size={32} />
                    <span className="font-bold text-xl tracking-tight">Kristal</span>
                </div>
                
                <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-300">
                    <button onClick={handleDownload} className="hover:text-white transition-colors">Скачать</button>
                    <a href="#security" className="hover:text-white transition-colors">Безопасность</a>
                    <a 
                        href="https://t.me/Kristal4ik1" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="hover:text-white transition-colors"
                    >
                        Поддержка
                    </a>
                    <button onClick={() => setShowBlog(true)} className="hover:text-white transition-colors">Блог</button>
                </div>

                <div>
                    <button 
                        onClick={onOpenAuth}
                        className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-full font-medium text-sm transition-all"
                    >
                        Вход
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-20 pb-32 flex flex-col items-center text-center px-4">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-blue-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[20%] right-[20%] w-[25vw] h-[25vw] bg-purple-600/20 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-700">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                        ПРЕДСТАВЬТЕ МЕСТО,<br />
                        ГДЕ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">КРИСТАЛЬНО ЧИСТО</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed flex flex-col items-center">
                        <span>...где вы можете найти игровую группу, сообщество по интересам или просто место для общения с друзьями.</span>
                        <span className="mt-4 text-white font-medium flex items-center bg-white/10 px-4 py-2 rounded-full border border-green-500/30 text-sm shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                            <Wifi size={18} className="mr-2 text-green-400" /> 
                            Работает всегда и везде — <span className="text-green-400 ml-1 font-bold">без блокировок</span>
                        </span>
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex items-center bg-discord-accent hover:bg-[#4752C4] text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30 group disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isDownloading ? (
                                <>Загрузка...</>
                            ) : (
                                <><Download className="mr-3 group-hover:animate-bounce" /> Скачать для Windows</>
                            )}
                        </button>
                        <button 
                            onClick={onOpenAuth}
                            className="flex items-center bg-[#2B2D31] hover:bg-[#35373C] text-white px-8 py-4 rounded-full font-bold text-lg transition-all border border-white/10"
                        >
                            Открыть в браузере
                        </button>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        Версия для Windows 10/11 • v1.0.0 • Kristal Setup.exe
                    </div>
                </div>

                {/* Feature Mockup (Abstract) */}
                <div className="mt-20 relative z-10 w-full max-w-5xl mx-auto animate-in zoom-in-95 duration-1000 delay-200">
                    <div className="bg-[#313338] rounded-xl shadow-2xl border border-[#1E1F22] p-2 aspect-video overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#313338] to-[#111214]"></div>
                        
                        {/* Mock Interface Elements */}
                        <div className="absolute top-4 left-4 bottom-4 w-16 bg-[#1E1F22] rounded-lg flex flex-col items-center py-2 gap-3 opacity-80">
                            <div className="w-10 h-10 bg-discord-accent rounded-2xl"></div>
                            <div className="w-10 h-10 bg-[#313338] rounded-full"></div>
                            <div className="w-10 h-10 bg-[#313338] rounded-full"></div>
                        </div>
                        <div className="absolute top-4 left-24 bottom-4 w-60 bg-[#2B2D31] rounded-lg opacity-80 p-4">
                            <div className="w-3/4 h-4 bg-[#3F4147] rounded mb-4"></div>
                            <div className="w-full h-2 bg-[#3F4147] rounded mb-2"></div>
                            <div className="w-full h-2 bg-[#3F4147] rounded mb-2"></div>
                            <div className="w-2/3 h-2 bg-[#3F4147] rounded mb-6"></div>
                            
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                <div className="w-20 h-2 bg-[#3F4147] rounded"></div>
                            </div>
                        </div>
                        <div className="absolute top-4 left-[360px] right-4 bottom-20 bg-[#313338] rounded-lg p-6 flex flex-col justify-end">
                             <div className="flex items-start gap-4 mb-6">
                                 <div className="w-10 h-10 rounded-full bg-indigo-500 shrink-0"></div>
                                 <div className="space-y-2">
                                     <div className="w-32 h-4 bg-[#4E5058] rounded"></div>
                                     <div className="w-64 h-3 bg-[#404249] rounded"></div>
                                 </div>
                             </div>
                             <div className="flex items-start gap-4">
                                 <div className="w-10 h-10 rounded-full bg-green-500 shrink-0"></div>
                                 <div className="space-y-2">
                                     <div className="w-24 h-4 bg-[#4E5058] rounded"></div>
                                     <div className="w-96 h-3 bg-[#404249] rounded"></div>
                                     <div className="w-48 h-3 bg-[#404249] rounded"></div>
                                 </div>
                             </div>
                        </div>
                        <div className="absolute bottom-4 left-[360px] right-4 h-12 bg-[#3F4147] rounded-lg"></div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div id="security" className="bg-[#1a1b1e] py-24 relative z-20">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
                    <div className="p-6 rounded-2xl bg-[#2B2D31]/50 backdrop-blur hover:bg-[#2B2D31] transition-colors border border-white/5">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Анонимность и защита</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Kristal использует передовые протоколы шифрования для защиты ваших данных. Мы не сотрудничаем с цензорами и гарантируем доступ к сервису в любых условиях.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#2B2D31]/50 backdrop-blur hover:bg-[#2B2D31] transition-colors border border-white/5">
                        <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Обход ограничений</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Встроенные механизмы маршрутизации обеспечивают стабильное соединение даже при попытках блокировки провайдерами. Будьте на связи всегда.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#2B2D31]/50 backdrop-blur hover:bg-[#2B2D31] transition-colors border border-white/5">
                        <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center mb-4">
                            <Globe size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Глобальное сообщество</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Серверы по всему миру. Находите друзей из любой точки планеты, создавайте свои сообщества и делитесь тем, что важно, без границ.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-black py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <KristalLogo size={24} />
                        <span className="font-bold text-lg">Kristal</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        © 2023 Kristal Communications. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Blog Modal */}
            {showBlog && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowBlog(false)}>
                    <div 
                        className="bg-[#1E1F22] w-full max-w-2xl rounded-xl shadow-2xl border border-white/10 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#2B2D31]">
                            <h2 className="text-2xl font-bold flex items-center">
                                <Terminal className="mr-2 text-discord-green" /> Блог Разработчика
                            </h2>
                            <button onClick={() => setShowBlog(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-8">
                                <div className="border-l-2 border-discord-accent pl-4">
                                    <div className="text-xs text-discord-accent font-bold mb-1 uppercase">Последнее обновление</div>
                                    <h3 className="text-xl font-bold mb-2">Kristal 1.0: Начало пути</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                        Мы рады представить первую публичную версию Kristal! Наша цель — создать платформу, свободную от корпоративного контроля и произвольных блокировок. 
                                    </p>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        В этом обновлении:
                                        <ul className="list-disc list-inside mt-2 ml-2">
                                            <li>Полное сквозное шифрование личных сообщений (в разработке).</li>
                                            <li>Голосовые чаты с низким пингом.</li>
                                            <li>Устойчивость к блокировкам DPI.</li>
                                        </ul>
                                    </p>
                                </div>

                                <div className="border-l-2 border-gray-700 pl-4 opacity-75">
                                    <div className="text-xs text-gray-500 font-bold mb-1 uppercase">Анонс</div>
                                    <h3 className="text-lg font-bold mb-2">Планы по безопасности</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        В ближайших обновлениях мы внедрим децентрализованную систему серверов, чтобы сделать Kristal полностью неуязвимым для внешнего вмешательства. Следите за новостями!
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-[#2B2D31] text-center">
                            <a 
                                href="https://t.me/Kristal4ik1" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-discord-accent hover:underline text-sm font-medium"
                            >
                                Подписаться на Telegram канал обновлений
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
