import React, { useState, useEffect } from 'react';
import { Wand2, Trash2, Moon, Sun, LayoutDashboard, Calendar as CalendarIcon, Users, Music2, LogOut, Globe, Check, Eraser, UserCheck } from 'lucide-react';
import { Member, ScheduleItem, SubstitutionLog, Song } from './types.ts';
import MemberForm from './components/MemberForm.tsx';
import MemberList from './components/MemberList.tsx';
import Schedule from './components/Schedule.tsx';
import Dashboard from './components/Dashboard.tsx';
import Repertoire from './components/Repertoire.tsx';
import DateTimePicker from './components/DateTimePicker.tsx';
import Login from './components/Login.tsx';
import PublicCalendar from './components/PublicCalendar.tsx';
import AttendanceList from './components/AttendanceList.tsx';
import { generateFullSchedule, regenerateDay } from './services/scheduler.ts';
import { supabase } from './lib/supabase.ts';

type View = 'scheduler' | 'dashboard' | 'members' | 'repertoire' | 'public_calendar' | 'attendance';

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
  
  const [isPublicLinkMode, setIsPublicLinkMode] = useState(false);
  const [view, setView] = useState<View>('scheduler');
  
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // Apenas para NOVAS datas (Staging)
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

  useEffect(() => {
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

  // Função auxiliar para evitar [object Object]
  const formatError = (error: any): string => {
    if (!error) return 'Erro desconhecido';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error_description) return error.error_description;
    return JSON.stringify(error);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [membersRes, songsRes, scheduleRes, logsRes] = await Promise.all([
          supabase.from('members').select('*'),
          supabase.from('songs').select('*').order('title'),
          supabase.from('schedules').select('*').order('date', { ascending: true }),
          supabase.from('substitution_logs').select('*')
        ]);

        if (membersRes.data) setMembers(membersRes.data);
        
        let validSongIds = new Set<string>();

        // MAPEAMENTO ESTRITO: Banco (snake_case) -> App (camelCase)
        if (songsRes.data) {
          const formattedSongs: Song[] = songsRes.data.map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artist,
            lyricsLink: s.lyrics_link,   
            youtubeLink: s.youtube_link, 
            key: s.musical_key, // Atenção: Coluna 'musical_key'
            singerId: s.singer_id        
          }));
          setSongs(formattedSongs);
          formattedSongs.forEach(s => validSongIds.add(s.id));
        }

        if (logsRes.data) setSubstitutionLogs(logsRes.data);
        
        if (scheduleRes.data && membersRes.data) {
          const inflatedSchedule = scheduleRes.data.map((item: any) => {
             // LIMPEZA AUTOMÁTICA: Remove IDs de músicas que não existem mais na lista de músicas carregadas
             const cleanSongs = (item.song_ids || []).filter((id: string) => validSongIds.has(id));

             return {
                ...item,
                musicians: (item.musician_ids || []).map((id: string) => membersRes.data.find(m => m.id === id)).filter(Boolean),
                singers: (item.singer_ids || []).map((id: string) => membersRes.data.find(m => m.id === id)).filter(Boolean),
                songs: cleanSongs,
                attendance: item.attendance_record || undefined // Mapeia o JSONB do banco para o frontend
             };
          });

          // CORREÇÃO DE DUPLICIDADE VISUAL: Filtra itens com exatamente a mesma data/hora para a visualização
          // Mantém apenas o primeiro item encontrado para cada timestamp
          const uniqueMap = new Map();
          const uniqueSchedule: ScheduleItem[] = [];
          
          inflatedSchedule.forEach((item: ScheduleItem) => {
             const timeKey = new Date(item.date).getTime();
             if (!uniqueMap.has(timeKey)) {
                 uniqueMap.set(timeKey, true);
                 uniqueSchedule.push(item);
             }
          });

          setSchedule(uniqueSchedule);
          // NÃO PREENCHEMOS selectedDates AQUI. 
          // selectedDates serve apenas para a "Fila de Geração" de novos cultos.
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

  // --- HANDLERS COM TRATAMENTO DE ERRO APRIMORADO ---

  const handleDeleteScheduleItem = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este culto?')) return;
    const previousSchedule = [...schedule];
    
    // UI Otimista
    setSchedule(prev => prev.filter(s => s.id !== id));
    
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      alert(`ERRO AO EXCLUIR: ${formatError(err)}`);
      // Reverter
      setSchedule(previousSchedule);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearAllSchedules = async () => {
    if (!window.confirm('ATENÇÃO: Isso apagará TODAS as escalas geradas do banco de dados.\nDeseja continuar?')) return;
    const previousSchedule = [...schedule];
    
    setSchedule([]);
    setIsSyncing(true);
    
    try {
      const { error } = await supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    } catch (err: any) {
      alert(`ERRO AO LIMPAR TUDO: ${formatError(err)}`);
      setSchedule(previousSchedule);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateScheduleItem = async (updatedItem: ScheduleItem) => {
    setIsSyncing(true);

    // Prepare data outside try block so it is available in catch block for retry logic
    const safeMusicians = updatedItem.musicians.map(m => m.id).filter(id => id && id.length > 0);
    const safeSingers = updatedItem.singers.map(s => s.id).filter(id => id && id.length > 0);
    const safeSongs = (updatedItem.songs || []).filter(id => id && id.length > 0);
    const attendanceRecord = updatedItem.attendance || {};

    try {
      setSchedule(prev => prev.map(s => s.id === updatedItem.id ? updatedItem : s));

      const { error } = await supabase.from('schedules').update({
        musician_ids: safeMusicians,
        singer_ids: safeSingers,
        song_ids: safeSongs,
        attendance_record: attendanceRecord 
      }).eq('id', updatedItem.id);
      
      if (error) throw error;
    } catch (err) {
      // ERRO SILENCIOSO DE COLUNA FALTANDO
      // Se a coluna attendance_record não existir, tentamos salvar sem ela
      const errorMsg = formatError(err);
      if (errorMsg.includes('attendance_record')) {
          console.warn("Coluna attendance_record não encontrada. Tentando salvar sem ela.");
          try {
               const { error: retryError } = await supabase.from('schedules').update({
                musician_ids: safeMusicians,
                singer_ids: safeSingers,
                song_ids: safeSongs
              }).eq('id', updatedItem.id);
              if (retryError) throw retryError;
              return; // Sucesso no retry
          } catch (retryErr) {
             alert(`Erro ao atualizar escala (Retry falhou): ${formatError(retryErr)}`);
             return;
          }
      }
      console.error("Erro ao atualizar:", err);
      alert(`Erro ao atualizar escala: ${errorMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRegenerateDay = async (item: ScheduleItem) => {
    const updatedItem = regenerateDay(item, members);
    await handleUpdateScheduleItem(updatedItem);
  };

  const handleGenerateSchedule = async () => {
    if (selectedDates.length === 0) { alert("Selecione pelo menos uma data para agendar."); return; }
    if (members.length === 0) { alert("Cadastre membros antes de gerar a escala."); return; }
    
    // --- CORREÇÃO DE DUPLICIDADE ---
    const existingTimestamps = new Set(schedule.map(s => new Date(s.date).getTime()));
    
    const uniqueDatesToGenerate = selectedDates.filter(dateStr => {
        const timestamp = new Date(dateStr).getTime();
        return !existingTimestamps.has(timestamp);
    });

    if (uniqueDatesToGenerate.length === 0) {
        alert("Todas as datas selecionadas já possuem uma escala agendada. Nenhuma duplicata foi criada.");
        setSelectedDates([]);
        return;
    }

    if (uniqueDatesToGenerate.length < selectedDates.length) {
        const duplicatesCount = selectedDates.length - uniqueDatesToGenerate.length;
        if (!window.confirm(`Atenção: ${duplicatesCount} data(s) selecionada(s) já existem na escala e serão ignoradas. Deseja gerar apenas as ${uniqueDatesToGenerate.length} novas datas?`)) {
            return;
        }
    }

    setIsSyncing(true);
    try {
      const newScheduleItems = generateFullSchedule(uniqueDatesToGenerate, members);
      
      setSchedule(prev => [...prev, ...newScheduleItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      
      const dbData = newScheduleItems.map(item => ({
        id: item.id,
        date: new Date(item.date).toISOString(),
        musician_ids: item.musicians.map(m => m.id),
        singer_ids: item.singers.map(s => s.id),
        song_ids: [],
        attendance_record: {}
      }));

      const { error } = await supabase.from('schedules').insert(dbData);
      if (error) throw error;
      
      setSelectedDates([]);
      alert(`${newScheduleItems.length} novos cultos gerados com sucesso!`);

    } catch (err: any) {
        alert(`Erro ao salvar escala: ${formatError(err)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- MEMBROS ---

  const handleAddMember = async (member: Member) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('members').insert([member]);
      if (error) throw error;
      setMembers(prev => [...prev, member]);
    } catch (err) { 
        alert(`Erro ao adicionar membro: ${formatError(err)}`); 
    } finally { setIsSyncing(false); }
  };

  const handleUpdateMember = async (member: Member) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('members').update(member).eq('id', member.id);
      if (error) throw error;
      setMembers(prev => prev.map(m => m.id === member.id ? member : m));
      setEditingMember(null);
    } catch (err) { 
        alert(`Erro ao atualizar membro: ${formatError(err)}`); 
    } finally { setIsSyncing(false); }
  };

  const handleRemoveMember = async (id: string) => {
    if (window.confirm('Excluir este integrante?')) {
      const previousMembers = [...members];
      setMembers(prev => prev.filter(m => m.id !== id));
      setIsSyncing(true);
      try {
        const { error } = await supabase.from('members').delete().eq('id', id);
        if (error) throw error;
      } catch (err) { 
          alert(`Erro ao remover membro: ${formatError(err)}`); 
          setMembers(previousMembers);
      } finally { setIsSyncing(false); }
    }
  };

  // --- MÚSICAS ---

  const handleAddSong = async (song: Song) => {
    setIsSyncing(true);
    try {
      const safeSingerId = (song.singerId && song.singerId.trim() !== '') ? song.singerId : null;

      const dbSong = {
        title: song.title,
        artist: song.artist,
        lyrics_link: song.lyricsLink || null,
        youtube_link: song.youtubeLink || null,
        musical_key: song.key || null,
        singer_id: safeSingerId
      };
      
      const { data, error } = await supabase.from('songs').insert([dbSong]).select().single();
      
      if (error) throw error;

      if (data) {
          const newSong: Song = {
             id: data.id,
             title: data.title,
             artist: data.artist,
             lyricsLink: data.lyrics_link,
             youtubeLink: data.youtube_link,
             key: data.musical_key,
             singerId: data.singer_id
          };
          setSongs(prev => [...prev, newSong].sort((a, b) => a.title.localeCompare(b.title)));
      }
    } catch (err) { 
        console.error("Erro insert song:", err);
        alert(`Erro ao adicionar música: ${formatError(err)}`); 
    } finally { setIsSyncing(false); }
  };

  const handleUpdateSong = async (updatedSong: Song) => {
    setIsSyncing(true);
    try {
      const safeSingerId = (updatedSong.singerId && updatedSong.singerId.trim() !== '') ? updatedSong.singerId : null;

      const dbSongPayload = {
        title: updatedSong.title,
        artist: updatedSong.artist,
        lyrics_link: updatedSong.lyricsLink || null,
        youtube_link: updatedSong.youtubeLink || null,
        musical_key: updatedSong.key || null,
        singer_id: safeSingerId
      };

      const { error } = await supabase
        .from('songs')
        .update(dbSongPayload)
        .eq('id', updatedSong.id);
      
      if (error) throw error;

      setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
    } catch (err) { 
        console.error("Erro update song:", err);
        alert(`Erro ao atualizar música: ${formatError(err)}`); 
    } finally { setIsSyncing(false); }
  };

  const handleRemoveSong = async (id: string) => {
    if (!window.confirm('Excluir música? Esta ação removerá a música de todas as escalas existentes.')) return;

    const previousSongs = [...songs];
    const previousSchedule = [...schedule]; 

    setSongs(prev => prev.filter(s => s.id !== id));
    setSchedule(prev => prev.map(s => ({
        ...s,
        songs: s.songs?.filter(sid => sid !== id) || []
    })));

    setIsSyncing(true);

    try {
      const { data: affectedSchedules } = await supabase
          .from('schedules')
          .select('id, song_ids')
          .contains('song_ids', [id]);

      if (affectedSchedules && affectedSchedules.length > 0) {
          const updates = affectedSchedules.map(item => {
              const cleanIds = item.song_ids.filter((sid: string) => sid !== id);
              return supabase.from('schedules').update({ song_ids: cleanIds }).eq('id', item.id);
          });
          await Promise.all(updates);
      }

      const { error } = await supabase.from('songs').delete().eq('id', id);
      if (error) throw error;

    } catch (err) { 
        console.error("Erro delete song:", err);
        alert(`Erro ao excluir música: ${formatError(err)}`); 
        setSongs(previousSongs);
        setSchedule(previousSchedule);
    } finally { setIsSyncing(false); }
  };

  if (isLoading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0f172a] gap-4">
          <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
              <HarpIcon size={64} className="text-indigo-600 dark:text-indigo-400 relative z-10 animate-float" />
          </div>
          <p className="text-slate-500 font-medium text-sm animate-pulse">Carregando dados...</p>
      </div>
  );
  
  if (!isAuthenticated && !isPublicLinkMode) return <Login onLogin={handleLogin} isDarkMode={isDarkMode} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] pb-24 md:pb-12 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-[120px] pointer-events-none animate-blob"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-cyan-400/20 to-blue-500/20 rounded-full blur-[120px] pointer-events-none animate-blob animation-delay-2000"></div>

      {/* Floating Navbar Aligned */}
      <div className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4 md:px-6 mb-8">
        <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl px-4 py-3 shadow-xl shadow-indigo-500/5 transition-all">
          <div className="flex items-center justify-between">
            {/* Logo Area */}
            <div className="flex items-center gap-3 pl-2">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                 <HarpIcon size={20} />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none tracking-tight">Harpa de Davi</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            {!isPublicLinkMode && (
              <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'scheduler', label: 'Escalas', icon: CalendarIcon },
                  { id: 'attendance', label: 'Presença', icon: UserCheck },
                  { id: 'members', label: 'Equipe', icon: Users },
                  { id: 'repertoire', label: 'Músicas', icon: Music2 }
                ].map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setView(item.id as any)} 
                    className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                      view === item.id 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            
            {/* Actions Area */}
            <div className="flex items-center gap-2 pr-1">
               {!isPublicLinkMode && (
                  <button 
                    onClick={handleCopyPublicLink} 
                    className={`p-2.5 rounded-lg transition-all border ${
                      copiedLink 
                      ? 'bg-green-100 text-green-600 border-green-200' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                    title="Copiar Link Público"
                  >
                    {copiedLink ? <Check size={18} /> : <Globe size={18} />}
                  </button>
               )}

               <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
               >
                 {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
               </button>
               
               {isAuthenticated && (
                 <button 
                    onClick={handleLogout} 
                    className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                 >
                   <LogOut size={18} />
                 </button>
               )}
            </div>
          </div>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {view === 'dashboard' ? (
           <Dashboard members={members} schedule={schedule} logs={substitutionLogs} songs={songs} />
        ) : view === 'scheduler' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Bar */}
            <div className="relative z-30 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-xl border border-white/40 dark:border-slate-700/40 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Adicionar Culto</label>
                  <DateTimePicker value={newDateInput} onChange={setNewDateInput} />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => { if (newDateInput) { setSelectedDates(prev => [...new Set([...prev, newDateInput])].sort()); setNewDateInput(''); } }} 
                      className="flex-1 md:flex-none h-[52px] px-8 bg-indigo-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                    >
                      <CalendarIcon size={20} /> Agendar
                    </button>
                    <button 
                      onClick={handleGenerateSchedule} 
                      className="flex-1 md:flex-none h-[52px] px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg active:scale-95"
                    >
                      <Wand2 size={20} /> <span className="hidden md:inline">Gerar Escala</span><span className="md:hidden">Gerar</span>
                    </button>
                </div>
              </div>

              {selectedDates.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Datas para gerar</p>
                     <button 
                        onClick={() => setSelectedDates([])}
                        className="text-[10px] font-bold text-red-400 hover:text-red-500 flex items-center gap-1 hover:underline"
                     >
                        <Eraser size={12} /> Limpar Seleção
                     </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.map(dateStr => {
                      const dateObj = new Date(dateStr);
                      return (
                        <span key={dateStr} className="inline-flex items-center gap-3 pl-4 pr-2 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold border border-indigo-100 dark:border-indigo-800">
                          {dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} 
                          <span className="opacity-50">•</span> 
                          {dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          <button
                            onClick={() => setSelectedDates(prev => prev.filter(d => d !== dateStr))}
                            className="ml-1 p-1 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors text-indigo-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
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
        ) : view === 'attendance' ? (
           <AttendanceList schedule={schedule} onUpdateSchedule={handleUpdateScheduleItem} />
        ) : view === 'members' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <MemberForm 
                  onAdd={handleAddMember} 
                  onUpdate={handleUpdateMember} 
                  editingMember={editingMember} 
                  onCancelEdit={() => setEditingMember(null)} 
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <MemberList 
                members={members} 
                onRemove={handleRemoveMember} 
                onEdit={setEditingMember} 
              />
            </div>
          </div>
        ) : view === 'repertoire' ? (
            <Repertoire 
                songs={songs} 
                members={members}
                onAddSong={handleAddSong} 
                onUpdateSong={handleUpdateSong} 
                onRemoveSong={handleRemoveSong} 
            />
        ) : (
            <PublicCalendar schedule={schedule} songs={songs} members={members} />
        )}
      </main>
      
      {/* Mobile Tab Navigation */}
      {!isPublicLinkMode && isAuthenticated && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
           <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-2 grid grid-cols-5 gap-1">
                {[
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
                    { id: 'scheduler', icon: CalendarIcon, label: 'Escalas' },
                    { id: 'attendance', icon: UserCheck, label: 'Presença' },
                    { id: 'members', icon: Users, label: 'Equipe' },
                    { id: 'repertoire', icon: Music2, label: 'Músicas' }
                ].map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => setView(item.id as any)}
                        className={`flex flex-col items-center justify-center gap-1 h-16 rounded-lg transition-all duration-300 ${
                          view === item.id 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-y-[-8px]' 
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <item.icon size={20} />
                        {view !== item.id && <span className="text-[8px] font-bold uppercase tracking-wide">{item.label}</span>}
                    </button>
                ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default App;