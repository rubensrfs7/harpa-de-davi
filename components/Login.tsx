
import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (success: boolean) => void;
  isDarkMode: boolean;
}

const HarpIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 3v18" />
    <path d="M6 3c7 0 13 4 13 12 0 4-6 6-13 6" />
    <path d="M9 5.5v13" />
    <path d="M12 8v8" />
    <path d="M15 10.5v3" />
  </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Consulta a tabela admins para validar as credenciais
      const { data, error: dbError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .eq('password', password)
        .maybeSingle();

      if (dbError) {
        throw new Error(dbError.message || 'Erro ao consultar banco de dados');
      }

      if (data) {
        onLogin(true);
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } catch (err: any) {
      console.error("Erro detalhado:", err);
      // Extrai a mensagem de erro de forma amigável
      const message = err.message || 'Erro inesperado na conexão.';
      setError(`Falha na autenticação: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl shadow-2xl shadow-indigo-500/30 mb-4 ring-8 ring-indigo-50 dark:ring-indigo-900/10">
            <HarpIcon className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Harpa de Davi</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium uppercase text-[10px] tracking-[0.2em] mt-1">Gestão de Escalas Musicais</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/60 dark:border-slate-800 p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Acesse o Sistema</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Entre com as credenciais cadastradas no Supabase</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-white font-medium transition-all"
                  placeholder="admin@harpa.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-800 outline-none text-slate-800 dark:text-white font-medium transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-3.5 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Entrar no Sistema</span>
                  <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck size={12} className="text-green-500" /> Segurança Verificada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
