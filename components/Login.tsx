import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, Music2 } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

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
      const { data, error: dbError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .eq('password', password)
        .maybeSingle();

      if (dbError) throw new Error(dbError.message || 'Erro ao consultar banco');

      if (data) {
        onLogin(true);
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } catch (err: any) {
      console.error("Erro detalhado:", err);
      const message = err.message || 'Erro inesperado na conexão.';
      setError(`Falha na autenticação: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-[#0B1120]">
      
      {/* Lado Esquerdo - Imagem e Branding (Escondido no Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        {/* Imagem de Fundo de Alta Qualidade (Música/Concerto/Igreja) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop" 
            alt="Worship Background" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-indigo-950/50 to-slate-900/80"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center p-12 text-center">
            <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
                <HarpIcon size={64} className="text-white" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-4">
              Harpa<span className="text-indigo-400">de</span>Davi
            </h1>
            <p className="text-lg text-slate-300 max-w-md font-medium leading-relaxed">
              Organize suas escalas, gerencie repertórios e facilite a adoração da sua igreja com excelência.
            </p>
        </div>

        <div className="absolute bottom-8 left-8 text-slate-500 text-xs font-medium">
          © {new Date().getFullYear()} Harpa de Davi Tech
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[420px] space-y-8 animate-in slide-in-from-right-8 duration-700 fade-in">
          
          <div className="text-center space-y-2">
            <div className="flex lg:hidden justify-center mb-4">
               <div className="p-3 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                  <HarpIcon size={32} />
               </div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              Bem-vindo
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Faça login para acessar o painel de controle
            </p>
          </div>

          {/* Quote Box (Estilo AgroCenso) */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-4 text-center">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 italic">
              "Louvai ao Senhor com harpa, cantai a ele com saltério de dez cordas."
            </p>
            <p className="text-[10px] text-indigo-400 dark:text-indigo-400 font-bold mt-1 uppercase tracking-widest">
              — Salmos 33:2
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                USUÁRIO
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-white font-medium transition-all placeholder:text-slate-400 text-sm"
                  placeholder="seu@email.com"
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                SENHA
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-white font-medium transition-all placeholder:text-slate-400 text-sm tracking-widest"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs font-medium text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>

            <div className="text-center pt-2">
              <a href="#" className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Esqueci minha senha
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;