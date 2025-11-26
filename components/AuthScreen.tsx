
import React, { useState } from 'react';
import { User } from '../types';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { KristalLogo } from './KristalLogo';
import { api } from '../services/api';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, username: string, password: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister, onBack, isLoading }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [localLoading, setLocalLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (pass: string) => {
      if (pass.length < 8) return "Пароль должен содержать минимум 8 символов";
      if (!/[A-Z]/.test(pass)) return "Пароль должен содержать хотя бы одну заглавную букву";
      if (!/[0-9]/.test(pass)) return "Пароль должен содержать хотя бы одну цифру";
      return null;
  };

  const handleRegisterStep1 = async () => {
      setLocalLoading(true);
      try {
          await api.register(email, username, password);
          setVerificationStep(true);
      } catch (err: any) {
          setError(err.message || 'Ошибка регистрации. Возможно, email занят.');
      } finally {
          setLocalLoading(false);
      }
  };

  const handleRegisterStep2 = async () => {
      setLocalLoading(true);
      try {
          const { user, token } = await api.verifyEmail(email, verificationCode);
          await onLogin(email, password);
      } catch (err: any) {
          setError(err.message || 'Ошибка подтверждения кода.');
      } finally {
          setLocalLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Заполните все обязательные поля');
      return;
    }

    // Login Flow
    if (!isRegistering) {
        try {
            await onLogin(email, password);
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка. Попробуйте снова.');
        }
        return;
    }

    // Registration Flow - Step 1: Input Validation & API Call
    if (!verificationStep) {
        if (!username.trim()) {
            setError('Введите имя пользователя');
            return;
        }

        if (!validateEmail(email)) {
            setError('Введите корректный адрес электронной почты');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        await handleRegisterStep1();
        return;
    }

    // Registration Flow - Step 2: Verification
    if (verificationStep) {
        if (verificationCode.length < 6) {
            setError('Введите полный код');
            return;
        }
        await handleRegisterStep2();
    }
  };

  const loading = isLoading || localLoading;

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#313338] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-discord-accent/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="bg-[#2B2D31]/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-300 border border-white/5">
        <button 
            onClick={() => {
                if (verificationStep) {
                    setVerificationStep(false);
                    setError('');
                } else {
                    onBack();
                }
            }}
            className="absolute top-4 left-4 text-discord-muted hover:text-white transition-colors flex items-center text-xs font-bold uppercase"
        >
            <ArrowLeft size={16} className="mr-1" /> Назад
        </button>

        <div className="text-center mb-6 mt-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-discord-accent to-purple-600 rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <KristalLogo size={56} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {verificationStep 
                ? 'Проверка почты' 
                : (isRegistering ? 'Создать аккаунт' : 'С возвращением!')}
          </h2>
          <p className="text-discord-muted text-sm">
            {verificationStep 
                ? `Мы отправили код подтверждения на ${email}` 
                : (isRegistering ? 'Присоединяйтесь к сообществу Kristal.' : 'Мы рады видеть вас снова в Kristal!')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!verificationStep && (
            <>
                <div>
                    <label className="block text-xs font-bold text-discord-muted uppercase mb-2">
                    Email <span className="text-discord-red">*</span>
                    </label>
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#1E1F22] text-discord-text p-2.5 rounded border-none outline-none focus:ring-2 focus:ring-discord-accent transition-all disabled:opacity-50"
                    placeholder="name@example.com"
                    />
                </div>

                {isRegistering && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    <label className="block text-xs font-bold text-discord-muted uppercase mb-2">
                        Имя пользователя <span className="text-discord-red">*</span>
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="w-full bg-[#1E1F22] text-discord-text p-2.5 rounded border-none outline-none focus:ring-2 focus:ring-discord-accent transition-all disabled:opacity-50"
                        placeholder="Как вас называть?"
                    />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-discord-muted uppercase mb-2">
                    Пароль <span className="text-discord-red">*</span>
                    </label>
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#1E1F22] text-discord-text p-2.5 rounded border-none outline-none focus:ring-2 focus:ring-discord-accent transition-all disabled:opacity-50"
                    placeholder="••••••••"
                    />
                    {isRegistering && (
                        <div className="text-[10px] text-discord-muted mt-1 space-y-0.5">
                            <div className={password.length >= 8 ? 'text-discord-green' : ''}>• Минимум 8 символов</div>
                            <div className={/[A-Z]/.test(password) ? 'text-discord-green' : ''}>• Одна заглавная буква</div>
                            <div className={/[0-9]/.test(password) ? 'text-discord-green' : ''}>• Одна цифра</div>
                        </div>
                    )}
                </div>
            </>
          )}

          {verificationStep && (
             <div className="animate-in slide-in-from-right-2 fade-in duration-200">
                  <div className="bg-discord-accent/10 border border-discord-accent/20 rounded p-3 mb-4 text-center">
                      <Mail className="mx-auto text-discord-accent mb-2" size={24} />
                      <div className="text-sm text-discord-text">Проверьте папку "Входящие" или "Спам".</div>
                  </div>
                  
                  <label className="block text-xs font-bold text-discord-muted uppercase mb-2">
                      Код подтверждения
                  </label>
                  <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full bg-[#1E1F22] text-discord-text p-2.5 rounded border-none outline-none focus:ring-2 focus:ring-discord-accent text-center text-lg tracking-widest"
                      placeholder="XXXXXX"
                      autoFocus
                  />
             </div>
          )}

          {error && (
            <div className="text-discord-red text-xs font-medium italic bg-discord-red/10 p-2 rounded border border-discord-red/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-discord-accent hover:bg-[#4752C4] text-white font-bold py-3 rounded transition-all mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-discord-accent/20"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            {verificationStep ? 'Подтвердить' : (isRegistering ? 'Далее' : 'Войти')}
          </button>

          {!verificationStep && (
            <div className="text-sm text-discord-muted mt-4 flex justify-center">
                {isRegistering ? 'Уже есть аккаунт?' : 'Нужна учетная запись?'}
                <button
                type="button"
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    setPassword('');
                }}
                disabled={loading}
                className="text-discord-accent hover:underline ml-1 font-medium disabled:opacity-50"
                >
                {isRegistering ? 'Войти' : 'Зарегистрироваться'}
                </button>
            </div>
          )}
          
           <div className="mt-6 text-[10px] text-discord-muted text-center border-t border-white/10 pt-3 opacity-70">
             Ваши данные надежно шифруются. Мы заботимся о вашей приватности.
           </div>
        </form>
      </div>
    </div>
  );
};
