
import React, { useState, useEffect } from 'react';
import { Wand2, Trash2, Moon, Sun, LayoutDashboard, Calendar as CalendarIcon, Users, Music2, LogOut, CloudCheck, CloudOff, Loader2, AlertCircle, Globe, Copy, Check } from 'lucide-react';
import { Member, ScheduleItem, SubstitutionLog, Song } from './types';
import MemberForm from './components/MemberForm';
import MemberList from './components/MemberList';
import Schedule from './components/Schedule';
import Dashboard from './components/Dashboard';
import Repertoire from './components/Repertoire';
import DateTimePicker from './components/DateTimePicker';
import Login from './components/Login';
import PublicCalendar from './components/PublicCalendar';
import { generateFullSchedule, regenerateDay } from './services/scheduler';
import { supabase } from './lib/supabase';

type View = 'scheduler' | 'dashboard' | 'members' | 'repertoire' | 'public_calendar';

const HarpIcon: React.FC<{ size?: number; className?: string; strokeWidth?: number }> = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('harp_auth') === 'true';
  });
  
  // Verifica se é uma visualização pública (link compartilhado)
  const [isPublicLinkMode, setIsPublicLinkMode] = useState(false);
  const [view, setView] = useState<View>('scheduler');
  
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [substitutionLogs, setSubstitutionLogs] = useState<SubstitutionLog[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [newDateInput, setNewDateInput] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('harp_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Efeito para checar URL Hash e Modo Escuro
  useEffect(() => {
    // Check for public link
    if (window.location.hash === '#public') {
      setIsPublicLinkMode(true);
      setView('public_calendar');
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('harp_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('harp_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [membersRes, songsRes, scheduleRes, logsRes] = await Promise.all([
          supabase.from('members').select('*'),
          supabase.from('songs').select('*'),
          supabase.from('schedules').select('*').order('date', { ascending: true }),
          supabase.from('substitution_logs').select('*')
        ]);

        if (membersRes.data) setMembers(membersRes.data);
        if (songsRes.data) setSongs(songsRes.data);
        if (logsRes.data) setSubstitutionLogs(logsRes.data);
        
        if (scheduleRes.data && membersRes.data) {
          const inflatedSchedule = scheduleRes.data.map((item: any) => ({
            ...item,
            musicians: (item.musician_ids || []).map((id: string) => membersRes.data.find(m => m.id === id)).filter(Boolean),
            singers: (item.singer_ids || []).map((id: string) => membersRes.data.find(m => m.id === id)).filter(Boolean),
            songs: item.song_ids || []
          }));
          setSchedule(inflatedSchedule);
          setSelectedDates(inflatedSchedule.map(s => s.date));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      sessionStorage.setItem('harp_auth', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('harp_auth');
    // Remove hash if exists to return to login cleanly
    if (window.location.hash === '#public') {
      history.pushState("", document.title, window.location.pathname + window.location.search);
      setIsPublicLinkMode(false);
    }
  };

  const handleCopyPublicLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#public`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ... (Funções de deletar, limpar, atualizar, regenerar, etc. mantidas iguais) ...
  const handleDeleteScheduleItem = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este culto?')) return;
    const previousSchedule = [...schedule];
    const previousSelectedDates = [...selectedDates];
    const itemToDelete = schedule.find(s => s.id === id);
    setIsSyncing(true);
    setSchedule(prev => prev.filter(s => s.id !== id));
    if (itemToDelete) setSelectedDates(prev => prev.filter(d => d !== itemToDelete.date));
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      alert(`ERRO AO EXCLUIR: ${err.message}`);
      setSchedule(previousSchedule);
      setSelectedDates(previousSelectedDates);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearAllSchedules = async () => {
    if (!window.confirm('ATENÇÃO: Isso apagará TODAS as escalas geradas.\nDeseja continuar?')) return;
    const previousSchedule = [...schedule];
    const previousSelectedDates = [...selectedDates];
    setIsSyncing(true);
    setSchedule([]);
    setSelectedDates([]);
    try {
      const { error } = await supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    } catch (err: any) {
      alert(`ERRO AO LIMPAR TUDO: ${err.message}`);
      setSchedule(previousSchedule);
      setSelectedDates(previousSelectedDates);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateScheduleItem = async (updatedItem: ScheduleItem) => {
    setIsSyncing(true);
    try {
      setSchedule(prev => prev.map(s => s.id === updatedItem.id ? updatedItem : s));
      const { error } = await supabase.from('schedules').update({
        musician_ids: updatedItem.musicians.map(m => m.id),
        singer_ids: updatedItem.singers.map(s => s.id)
      }).eq('id', updatedItem.id);
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao atualizar:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRegenerateDay = async (item: ScheduleItem) => {
    const updatedItem = regenerateDay(item, members);
    await handleUpdateScheduleItem(updatedItem);
  };

  const handleGenerateSchedule = async () => {
    if (selectedDates.length === 0) { alert("Selecione pelo menos uma data."); return; }
    if (members.length === 0) { alert("Cadastre membros antes de gerar a escala."); return; }
    setIsSyncing(true);
    try {
      const newSchedule = generateFullSchedule(selectedDates, members);
      setSchedule(newSchedule);
      const dbData = newSchedule.map(item => ({
        id: item.id,
        date: new Date(item.date).toISOString(),
        musician_ids: item.musicians.map(m => m.id),
        singer_ids: item.singers.map(s => s.id),
        song_ids: []
      }));
      const { error } = await supabase.from('schedules').insert(dbData);
      if (error) throw error;
    } catch (err: any) {
        alert(`Erro ao salvar escala: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddMember = async (member: Member) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('members').insert([member]);
      if (error) throw error;
      setMembers(prev => [...prev, member]);
    } catch (err) { console.error(err); } finally { setIsSyncing(false); }
  };

  const handleUpdateMember = async (member: Member) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('members').update(member).eq('id', member.id);
      if (error) throw error;
      setMembers(prev => prev.map(m => m.id === member.id ? member : m));
      setEditingMember(null);
    } catch (err) { console.error(err); } finally { setIsSyncing(false); }
  };

  const handleRemoveMember = async (id: string) => {
    if (window.confirm('Excluir este integrante?')) {
      setIsSyncing(true);
      try {
        const { error } = await supabase.from('members').delete().eq('id', id);
        if (error) throw error;
        setMembers(prev => prev.filter(m => m.id !== id));
      } catch (err) { console.error(err); } finally { setIsSyncing(false); }
    }
  };

  const handleAddSong = async (song: Song) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('songs').insert([song]);
      if (error) throw error;
      setSongs(prev => [...prev, song]);
    } catch (err) { console.error(err); } finally { setIsSyncing(false); }
  };

  const handleRemoveSong = async (id: string) => {
    if (window.confirm('Excluir esta música?')) {
      setIsSyncing(true);
      try {
        const { error } = await supabase.from('songs').delete().eq('id', id);
        if (error) throw error;
        setSongs(prev => prev.filter(s => s.id !== id));
      } catch (err) { console.error(err); } finally { setIsSyncing(false); }
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;
  
  // Se não estiver autenticado E não for modo público, mostra Login
  if (!isAuthenticated && !isPublicLinkMode) return <Login onLogin={handleLogin} isDarkMode={isDarkMode} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white"><HarpIcon size={24} /></div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none">Harpa de Davi</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestão Musical</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Esconde navegação de admin se estiver em modo público */}
             {!isPublicLinkMode && (
               <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  {['dashboard', 'scheduler', 'members', 'repertoire'].map((id) => (
                    <button key={id} onClick={() => setView(id as any)} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${view === id ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      {id === 'dashboard' ? 'Dashboard' : id === 'scheduler' ? 'Escalas' : id === 'members' ? 'Equipe' : 'Músicas'}
                    </button>
                  ))}
               </div>
             )}
             
             <div className="flex items-center gap-2">
                {!isPublicLinkMode && (
                   <button 
                      onClick={handleCopyPublicLink} 
                      className={`hidden md:flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${copiedLink ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500'}`}
                      title="Copiar Link Público"
                   >
                     {copiedLink ? <Check size={16} /> : <Globe size={16} />}
                     {copiedLink ? 'Copiado!' : 'Link Público'}
                   </button>
                )}

                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:scale-110 transition-all">
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                {isAuthenticated && (
                  <button onClick={handleLogout} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-500 hover:bg-red-100 transition-all" title="Sair">
                    <LogOut size={20} />
                  </button>
                )}
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8">
        {view === 'dashboard' ? (
           <Dashboard members={members} schedule={schedule} logs={substitutionLogs} songs={songs} />
        ) : view === 'scheduler' ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Adicionar Culto</label>
                  <DateTimePicker value={newDateInput} onChange={setNewDateInput} />
                </div>
                <button onClick={() => { if (newDateInput) { setSelectedDates(prev => [...new Set([...prev, newDateInput])].sort()); setNewDateInput(''); } }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all">
                  <CalendarIcon size={18} /> Agendar
                </button>
                <button onClick={handleGenerateSchedule} className="bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                  <Wand2 size={18} /> Gerar Escala Automática
                </button>
              </div>

              {selectedDates.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                  {selectedDates.map(dateStr => {
                    const dateObj = new Date(dateStr);
                    const dateFormatted = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    const timeFormatted = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <span key={dateStr} className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold border border-indigo-100 dark:border-indigo-800/50">
                        <span className="opacity-70">{dateFormatted}</span>
                        <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                        <span>{timeFormatted}</span>
                        <button
                          onClick={() => setSelectedDates(prev => prev.filter(d => d !== dateStr))}
                          className="ml-1 p-1 hover:bg-white dark:hover:bg-indigo-900 rounded-md transition-colors text-indigo-400 hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            
            <Schedule 
              schedule={schedule} 
              allMembers={members} 
              allSongs={songs} 
              onRegenerateDay={handleRegenerateDay} 
              onDeleteScheduleItem={handleDeleteScheduleItem}
              onClear={handleClearAllSchedules} 
              onSubstitute={() => {}} 
              onUpdateScheduleItem={handleUpdateScheduleItem} 
            />
          </div>
        ) : view === 'members' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <MemberForm 
              onAdd={handleAddMember} 
              onUpdate={handleUpdateMember} 
              editingMember={editingMember} 
              onCancelEdit={() => setEditingMember(null)} 
            />
            <div className="lg:col-span-2">
              <MemberList 
                members={members} 
                onRemove={handleRemoveMember} 
                onEdit={setEditingMember} 
              />
            </div>
          </div>
        ) : view === 'repertoire' ? (
            <Repertoire songs={songs} onAddSong={handleAddSong} onRemoveSong={handleRemoveSong} />
        ) : (
            // VISÃO PÚBLICA (CALENDÁRIO)
            <PublicCalendar schedule={schedule} songs={songs} />
        )}
      </main>
    </div>
  );
};

export default App;
