import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Music, Mic, Music2, MapPin, Sparkles, ChevronRight, Search, FileText, Youtube, BookOpen, User, ChevronLeft, Folder, Crown, Shield, ExternalLink, ListMusic, PlayCircle, Play } from 'lucide-react';
import { ScheduleItem, Song, Member } from '../types';

interface PublicCalendarProps {
  schedule: ScheduleItem[];
  songs: Song[];
  members: Member[];
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper para formatar data
const formatCardDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
    weekday: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
};

// --- SUBCOMPONENTE: THUMBNAIL COM TRATAMENTO DE QUALIDADE ---
const SongThumb: React.FC<{ videoId: string | null; title: string; size?: string; iconSize?: number }> = ({ videoId, title, size = "w-20 h-20 sm:w-24 sm:h-24", iconSize = 32 }) => {
    const [imgSrc, setImgSrc] = useState(videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
    const [isLowQuality, setIsLowQuality] = useState(false);

    const handleImgError = () => {
        if (!isLowQuality && videoId) {
            setIsLowQuality(true);
            setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
        }
    };

    return (
        <div className={`${size} rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative flex-shrink-0 shadow-inner`}>
            {imgSrc ? (
                <img 
                    src={imgSrc} 
                    alt={title} 
                    onError={handleImgError}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLowQuality ? 'scale-[1.4]' : ''}`} 
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                    <Music2 size={iconSize} />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
};

// --- SUBCOMPONENTE: CARD DE MÚSICA (Visual Rico com Links Explícitos) ---
const RepertoireSongCard: React.FC<{ song: Song; index: number; singer?: Member }> = ({ song, index, singer }) => {
    const videoId = getYoutubeId(song.youtubeLink || '');

    return (
        <div className="group relative bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex items-center p-3 gap-4">
            
            {/* Numbering & Thumb Container */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {/* Numbering */}
                <div className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white font-black rounded-lg text-sm shadow-lg shadow-pink-500/20">
                    {index + 1}
                </div>

                {/* Square Thumb */}
                <SongThumb videoId={videoId} title={song.title} />
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white truncate text-base sm:text-lg leading-tight" title={song.title}>{song.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 truncate">{song.artist}</p>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                    {song.key && (
                        <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[10px] font-black rounded border border-pink-200 dark:border-pink-800/50">
                            {song.key}
                        </span>
                    )}
                    {singer && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                            <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden">
                                {singer.photoUrl ? (
                                    <img src={singer.photoUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[6px] font-bold text-purple-500">{getInitials(singer.name)}</span>
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[80px]">
                                {singer.name.split(' ')[0]}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-2">
                    {song.lyricsLink && (
                        <a 
                            href={song.lyricsLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter"
                        >
                            <FileText size={14} /> Letra
                        </a>
                    )}
                    {song.youtubeLink && (
                        <a 
                            href={song.youtubeLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter"
                        >
                            <Youtube size={14} /> Vídeo
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

const PublicCalendar: React.FC<PublicCalendarProps> = ({ schedule, songs, members }) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'repertoire'>('agenda');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSingerFilter, setSelectedSingerFilter] = useState<string | 'uncategorized' | 'all' | null>(null);
  const [viewDate, setViewDate] = useState(new Date());

  // --- LÓGICA DA AGENDA ---
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const upcomingSchedule = schedule.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= todayMidnight;
  });

  const filteredSchedule = upcomingSchedule.filter(item => {
    const d = new Date(item.date);
    return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const now = new Date();
  const nextEventIndex = filteredSchedule.findIndex(s => new Date(s.date) >= now);

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  // --- LÓGICA DO REPERTÓRIO ---
  const isSearching = searchTerm.trim().length > 0;

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (!isSearching && selectedSingerFilter) {
        if (selectedSingerFilter === 'all') return true;
        if (selectedSingerFilter === 'uncategorized') return !song.singerId;
        return song.singerId === selectedSingerFilter;
    }
    return true;
  });

  const groupedSongs = songs.reduce((acc, song) => {
      const sId = song.singerId || 'uncategorized';
      if (!acc[sId]) acc[sId] = 0;
      acc[sId]++;
      return acc;
  }, {} as Record<string, number>);

  const singersWithSongs = Object.keys(groupedSongs).filter(id => id !== 'uncategorized').map(id => {
      return members.find(m => m.id === id);
  }).filter(Boolean) as Member[];

  const uncategorizedCount = groupedSongs['uncategorized'] || 0;

  const getFilterTitle = () => {
      if (selectedSingerFilter === 'all') return 'Todas as Músicas';
      if (selectedSingerFilter === 'uncategorized') return 'Geral / Outros';
      const singer = members.find(m => m.id === selectedSingerFilter);
      return singer ? singer.name : 'Músicas';
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 animate-in fade-in duration-700 pb-32 pt-4 sm:pt-6">
      
      {/* Header & Tabs */}
      <div className="px-4 sm:px-0">
        <div className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-2xl p-1.5 rounded-2xl flex relative shadow-inner border border-white/20 dark:border-slate-700/50">
           <button 
             onClick={() => setActiveTab('agenda')}
             className={`flex-1 py-3 sm:py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 ${
               activeTab === 'agenda' 
               ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xl scale-[1.02] border border-indigo-100 dark:border-indigo-900/50' 
               : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
             }`}
           >
             <CalendarIcon size={18} /> Agenda
           </button>
           <button 
             onClick={() => setActiveTab('repertoire')}
             className={`flex-1 py-3 sm:py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 ${
               activeTab === 'repertoire' 
               ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-white shadow-xl scale-[1.02] border border-pink-100 dark:border-pink-900/50' 
               : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
             }`}
           >
             <Music2 size={18} /> Repertório
           </button>
        </div>
      </div>

      {/* --- CONTEÚDO DA AGENDA --- */}
      {activeTab === 'agenda' && (
        <div className="animate-in fade-in slide-in-from-left-6 duration-700 space-y-6 sm:space-y-10">
          
          {/* Navegador de Meses */}
          <div className="flex items-center justify-between px-4 sm:px-0">
            <div className="space-y-1">
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white capitalize tracking-tighter">
                   {MONTH_NAMES[viewDate.getMonth()]}
                </h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{viewDate.getFullYear()}</p>
            </div>
            <div className="flex gap-3">
                <button 
                  onClick={() => changeMonth(-1)} 
                  className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => changeMonth(1)} 
                  className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
          </div>

          <div className="px-4 sm:px-0">
             {filteredSchedule.length > 1 && (
                <div className="md:hidden flex items-center gap-2 text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full w-fit mb-4 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                   <Sparkles size={12} className="animate-pulse" /> DESLIZE PARA VER MAIS <ChevronRight size={14} />
                </div>
             )}
          </div>

          {filteredSchedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center mx-4 sm:mx-0 shadow-2xl shadow-slate-200/20">
              <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl mb-6 text-slate-200 dark:text-slate-700">
                 <CalendarIcon size={64} strokeWidth={1} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">Sem escalas neste mês</h3>
              <p className="text-sm font-medium text-slate-400 mt-2 max-w-[240px]">Nenhum evento programado para {MONTH_NAMES[viewDate.getMonth()]}.</p>
            </div>
          ) : (
            <div className="flex flex-nowrap gap-6 overflow-x-auto snap-x snap-mandatory px-4 pb-12 -mx-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:pb-0 md:px-0 md:mx-0 md:overflow-visible no-scrollbar">
              {filteredSchedule.map((item, index) => {
                const dateInfo = formatCardDate(item.date);
                const isNext = index === nextEventIndex;
                const isSpecial = item.isSpecial;
                
                return (
                  <div key={item.id} className={`group relative flex flex-col shrink-0 snap-center w-[88vw] sm:w-[420px] md:w-auto bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 transition-all duration-700 ${
                      isSpecial 
                      ? 'border-amber-500 shadow-2xl shadow-amber-500/20 scale-[1.02]' 
                      : isNext 
                        ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-[1.02]' 
                        : 'border-slate-50 dark:border-slate-800 hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-900/30'
                  }`}>
                    {(isSpecial || isNext) && (
                        <div className={`absolute top-0 right-0 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 px-6 rounded-bl-[2rem] z-10 flex items-center gap-2 shadow-xl ${
                            isSpecial ? 'bg-amber-500 shadow-amber-500/30' : 'bg-indigo-600 shadow-indigo-500/30'
                        }`}>
                            <Sparkles size={12} className={`${isSpecial ? 'text-white' : 'text-yellow-300'} animate-pulse`} /> 
                            {isSpecial ? 'Evento Especial' : 'Próximo Culto'}
                        </div>
                    )}

                    {/* Cabeçalho do Card */}
                    <div className={`p-8 sm:p-10 flex items-center justify-between border-b-2 ${
                        isSpecial 
                        ? 'bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' 
                        : isNext 
                            ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' 
                            : 'bg-slate-50/30 dark:bg-slate-800/20 border-slate-50 dark:border-slate-800'
                    }`}>
                      <div className="flex items-center gap-6">
                        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl shadow-xl border-2 transition-all group-hover:scale-110 duration-500 ${
                            isSpecial 
                            ? 'bg-amber-500 border-amber-400' 
                            : isNext 
                                ? 'bg-indigo-600 border-indigo-400' 
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                        }`}>
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${isSpecial || isNext ? 'text-amber-100 dark:text-indigo-200' : 'text-indigo-500'}`}>{dateInfo.month}</span>
                          <span className={`text-3xl font-black leading-none ${isSpecial || isNext ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{dateInfo.day}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-black text-slate-900 dark:text-white capitalize leading-none tracking-tight">{dateInfo.weekday}</p>
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg shadow-inner ${isSpecial ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                <Clock size={12} className={isSpecial ? 'text-amber-600' : 'text-slate-500 dark:text-slate-400'} />
                            </div>
                            <p className={`text-sm font-black tracking-tight ${isSpecial ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>{dateInfo.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 sm:p-10 space-y-8 flex-1 flex flex-col">
                      {isSpecial ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 shadow-xl shadow-amber-500/10">
                                  <Sparkles size={40} />
                              </div>
                              <div className="space-y-2">
                                  <h3 className="text-2xl font-black text-amber-800 dark:text-amber-200 tracking-tight">
                                      {item.specialName || 'Evento Especial'}
                                  </h3>
                                  <p className="text-amber-600/70 dark:text-amber-400/70 font-bold uppercase text-[10px] tracking-[0.3em]">Participação de toda a igreja</p>
                              </div>
                              <p className="text-sm text-amber-700/60 dark:text-amber-300/60 max-w-xs mx-auto font-medium">
                                  Este evento não possui escala musical definida. Todos os membros e músicos participam livremente.
                              </p>
                          </div>
                      ) : (
                          <>
                            {/* Instrumentistas */}
                            <div className="flex-1">
                                <h4 className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">
                                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shadow-sm">
                                    <Music size={12} className="text-indigo-500" />
                                </div>
                                Instrumentistas
                                </h4>
                                {item.musicians.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {item.musicians.map(musician => (
                                    <div key={musician.id} className="flex items-center gap-4 group/member">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-xs font-black text-indigo-600 border-2 border-indigo-100 dark:border-indigo-800/30 shrink-0 shadow-xl shadow-indigo-500/5 overflow-hidden group-hover/member:scale-110 transition-all duration-500">
                                        {musician.photoUrl ? (
                                            <img src={musician.photoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : getInitials(musician.name)}
                                        </div>
                                        <div className="min-w-0">
                                        <p className="text-base font-black text-slate-800 dark:text-slate-100 truncate leading-tight tracking-tight">{musician.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase truncate tracking-widest mt-1">{musician.instruments?.join(' • ')}</p>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                ) : (
                                <div className="flex flex-col items-center justify-center py-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Escala em definição</p>
                                </div>
                                )}
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent w-full"></div>

                            {/* Vocal com Destaque para Ministro */}
                            <div className="flex-1">
                                <h4 className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">
                                <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shadow-sm">
                                    <Mic size={12} className="text-purple-500" />
                                </div>
                                Equipe Vocal
                                </h4>
                                {item.singers.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {item.singers.map(singer => {
                                        const isLeader = singer.id === item.worshipLeaderId;
                                        return (
                                        <div key={singer.id} className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-500 ${isLeader ? 'bg-amber-50/50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/30 shadow-xl shadow-amber-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                            <div className="relative shrink-0">
                                                <div className={`w-12 h-12 rounded-2xl ${isLeader ? 'bg-amber-500' : 'bg-purple-50 dark:bg-purple-900/20'} flex items-center justify-center text-xs font-black ${isLeader ? 'text-white' : 'text-purple-600'} border-2 ${isLeader ? 'border-amber-400' : 'border-purple-100 dark:border-purple-800/30'} shadow-xl overflow-hidden transition-transform duration-500 group-hover:scale-110`}>
                                                    {singer.photoUrl ? (
                                                        <img src={singer.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : getInitials(singer.name)}
                                                </div>
                                                {isLeader && (
                                                    <div className="absolute -top-2 -right-2 bg-amber-400 text-white rounded-xl p-1.5 border-2 border-white dark:border-slate-900 shadow-xl animate-bounce" title="Ministro de Louvor">
                                                        <Crown size={12} fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                            <p className="text-base font-black text-slate-800 dark:text-slate-100 truncate leading-tight tracking-tight">
                                                {singer.name}
                                            </p>
                                            {isLeader && <p className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-[0.2em] mt-1.5">Ministro de Louvor</p>}
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                                ) : (
                                <div className="flex flex-col items-center justify-center py-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Escala em definição</p>
                                </div>
                                )}

                                {item.backupSinger && (
                                <div className="mt-6 pt-6 border-t-2 border-slate-50 dark:border-slate-800 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-300 flex items-center justify-center shadow-inner border border-slate-100 dark:border-slate-700">
                                            <Shield size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Reserva Vocal</p>
                                            <p className="text-sm font-black text-slate-600 dark:text-slate-300 truncate tracking-tight">{item.backupSinger.name}</p>
                                        </div>
                                </div>
                                )}
                            </div>

                            {/* Louvores (Com Thumbnails Pequenas e Key) */}
                            {item.songs && item.songs.length > 0 && (
                                <div className="mt-auto pt-8 border-t-2 border-slate-50 dark:border-slate-800">
                                    <div className="space-y-5">
                                        <h4 className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                            <div className="w-6 h-6 rounded-lg bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center shadow-sm">
                                                <Music2 size={12} className="text-pink-500" />
                                            </div>
                                            Repertório do Culto
                                        </h4>
                                        <div className="space-y-3">
                                        {item.songs.map((songId, sIndex) => {
                                            const song = songs.find(s => s.id === songId);
                                            if (!song) return null;
                                            
                                            const songSinger = members.find(m => m.id === song.singerId);
                                            const Wrapper = (song.youtubeLink || song.lyricsLink) ? 'a' : 'div';
                                            const props = (song.youtubeLink || song.lyricsLink)
                                            ? { 
                                                href: song.youtubeLink || song.lyricsLink, 
                                                target: "_blank", 
                                                rel: "noopener noreferrer"
                                                }
                                            : {};
                                            
                                            const videoId = getYoutubeId(song.youtubeLink || '');

                                            return (
                                            <Wrapper
                                                key={songId}
                                                {...props}
                                                className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all duration-500 group/song relative
                                                    bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700
                                                    ${(song.youtubeLink || song.lyricsLink) 
                                                        ? 'hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer active:scale-[0.98]' 
                                                        : ''
                                                    }
                                                `}
                                            >
                                                {/* Numbering */}
                                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 text-white font-black rounded-xl text-xs shadow-xl shadow-pink-500/30 ring-4 ring-white dark:ring-slate-800 z-10">
                                                    {sIndex + 1}
                                                </div>

                                                <SongThumb 
                                                    videoId={videoId} 
                                                    title={song.title} 
                                                    size="shrink-0 w-16 h-16 rounded-xl" 
                                                    iconSize={20} 
                                                />

                                                <div className="min-w-0 flex-1 flex flex-col justify-center">
                                                    <div className="flex justify-between items-start w-full gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-base font-black text-slate-900 dark:text-slate-100 truncate group-hover/song:text-indigo-600 dark:group-hover/song:text-indigo-400 transition-colors leading-tight tracking-tight">
                                                                    {song.title}
                                                                </p>
                                                                {(song.youtubeLink || song.lyricsLink) && <ExternalLink size={14} className="text-slate-200 group-hover/song:text-indigo-500 shrink-0 transition-colors" />}
                                                            </div>
                                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 truncate mt-1.5 uppercase tracking-widest">{song.artist}</p>
                                                        </div>
                                                        
                                                        {song.key && (
                                                            <div className="shrink-0 flex items-center justify-center px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 text-[10px] font-black text-slate-600 dark:text-slate-300 group-hover/song:bg-pink-500 group-hover/song:text-white group-hover/song:border-pink-400 transition-all shadow-xl shadow-slate-200/10 min-w-[32px]">
                                                                {song.key}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {songSinger && (
                                                        <div className="flex items-center gap-2.5 mt-3">
                                                            <div className="w-6 h-6 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border-2 border-white dark:border-slate-600 shadow-xl">
                                                                {songSinger.photoUrl ? (
                                                                    <img src={songSinger.photoUrl} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-slate-500">
                                                                        {getInitials(songSinger.name)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 truncate max-w-[160px] uppercase tracking-tight">
                                                                {songSinger.name.split(' ')[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Wrapper>
                                            );
                                        })}
                                        </div>
                                    </div>
                                </div>
                            )}
                          </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- CONTEÚDO DO REPERTÓRIO (Visual de Cards Ricos) --- */}
      {activeTab === 'repertoire' && (
        <div className="px-4 sm:px-0 animate-in fade-in slide-in-from-right-4 duration-500 space-y-4 sm:space-y-6">
             
             {/* Search Bar */}
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-slate-400 group-focus-within:text-pink-500 transition-colors" size={20} />
                </div>
                <input 
                    type="text" 
                    placeholder="Pesquisar música ou artista..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                />
             </div>

            {/* VISUALIZAÇÃO DE PASTAS DE CANTORES */}
            {!isSearching && !selectedSingerFilter ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Folder size={14} className="text-pink-500" /> Pastas por Cantor
                        </h4>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                         <button 
                            onClick={() => setSelectedSingerFilter('all')}
                            className="flex flex-col items-center justify-center gap-4 p-6 sm:p-8 bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-900 rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.03] active:scale-95 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                                <Music2 size={80} />
                            </div>
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <ListMusic size={28} />
                            </div>
                            <div className="text-center relative z-10">
                                <p className="font-black text-white text-sm sm:text-base leading-tight">Todas as Músicas</p>
                                <p className="text-[10px] font-bold text-indigo-100/80 mt-1.5 uppercase tracking-widest">{songs.length} músicas</p>
                            </div>
                        </button>

                        {uncategorizedCount > 0 && (
                            <button 
                                onClick={() => setSelectedSingerFilter('uncategorized')}
                                className="flex flex-col items-center justify-center gap-4 p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-2xl hover:shadow-pink-500/10 active:scale-95 transition-all group"
                            >
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 group-hover:text-pink-500 transition-all shadow-inner">
                                    <Music size={28} />
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-tight">Geral / Outros</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{uncategorizedCount} músicas</p>
                                </div>
                            </button>
                        )}

                        {singersWithSongs.map(singer => (
                            <button 
                                key={singer.id}
                                onClick={() => setSelectedSingerFilter(singer.id)}
                                className="flex flex-col items-center justify-center gap-4 p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-2xl hover:shadow-pink-500/10 active:scale-95 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-pink-500 transition-all shadow-md group-hover:scale-110">
                                    {singer.photoUrl ? (
                                        <img src={singer.photoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-sm font-black">
                                            {getInitials(singer.name)}
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-tight truncate max-w-[120px]">{singer.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{groupedSongs[singer.id]} músicas</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {!isSearching && selectedSingerFilter && (
                            <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
                                <button 
                                    onClick={() => setSelectedSingerFilter(null)} 
                                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all text-slate-500 dark:text-slate-300 shadow-sm"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 leading-tight">
                                        {getFilterTitle()}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Exibindo {filteredSongs.length} músicas</p>
                                </div>
                            </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {filteredSongs.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 shadow-inner">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Music2 className="opacity-20" size={32} />
                                </div>
                                <p className="text-sm font-bold">Nenhuma música encontrada.</p>
                                <p className="text-xs mt-1">Tente outro termo de busca.</p>
                            </div>
                        ) : (
                            filteredSongs.map((song, index) => {
                                const singer = members.find(m => m.id === song.singerId);
                                return (
                                    <RepertoireSongCard key={song.id} song={song} index={index} singer={singer} />
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
      )}

    </div>
  );
};

export default PublicCalendar;
