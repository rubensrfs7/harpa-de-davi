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

// --- SUBCOMPONENTE: CARD DE MÚSICA (Visual Rico com Links Explícitos) ---
const RepertoireSongCard: React.FC<{ song: Song; singer?: Member }> = ({ song, singer }) => {
    const videoId = getYoutubeId(song.youtubeLink || '');
    // Usa hqdefault para qualidade melhor no card grande
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

    return (
        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            
            {/* Imagem / Thumbnail (Clicável para o vídeo se existir) */}
            <a 
                href={song.youtubeLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative h-44 w-full block overflow-hidden bg-slate-100 dark:bg-slate-900 ${!song.youtubeLink ? 'pointer-events-none' : 'cursor-pointer'}`}
            >
                {thumbUrl ? (
                    <img src={thumbUrl} alt={song.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        <Music2 className="text-slate-300 dark:text-slate-600" size={48} />
                    </div>
                )}
                
                {/* Badge de Tonalidade (Canto Superior Direito) */}
                {song.key && (
                    <div className="absolute top-3 right-3 bg-pink-600 text-white px-2.5 py-1 rounded-md text-xs font-black shadow-lg shadow-black/20 border border-white/10 z-20">
                        {song.key}
                    </div>
                )}

                {/* Overlay Play Button (Se tiver vídeo) */}
                {song.youtubeLink && (
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center z-10">
                        <div className="bg-white/90 text-red-600 p-3 rounded-full opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-xl backdrop-blur-sm">
                            <Play size={24} fill="currentColor" className="ml-1" />
                        </div>
                    </div>
                )}
            </a>

            {/* Informações da Música */}
            <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-slate-800 relative">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight mb-1 line-clamp-2" title={song.title}>
                        {song.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide truncate">
                        {song.artist}
                    </p>
                </div>

                <div className="mt-4 space-y-3">
                    {/* Botões de Ação */}
                    <div className="flex gap-2">
                        {song.youtubeLink ? (
                            <a 
                                href={song.youtubeLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 transition-colors text-xs font-bold"
                            >
                                <Youtube size={14} /> Vídeo
                            </a>
                        ) : (
                            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-300 border border-slate-100 dark:border-slate-700/50 text-xs font-bold cursor-not-allowed">
                                <Youtube size={14} /> Vídeo
                            </div>
                        )}

                        {song.lyricsLink ? (
                            <a 
                                href={song.lyricsLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 transition-colors text-xs font-bold"
                            >
                                <FileText size={14} /> Letra
                            </a>
                        ) : (
                            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-300 border border-slate-100 dark:border-slate-700/50 text-xs font-bold cursor-not-allowed">
                                <FileText size={14} /> Letra
                            </div>
                        )}
                    </div>

                    {/* Cantor da Pasta (Rodapé Pequeno) */}
                    {singer && (
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                                {singer.photoUrl ? (
                                    <img src={singer.photoUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[7px] font-bold text-slate-500">
                                        {getInitials(singer.name)}
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">
                                {singer.name}
                            </span>
                        </div>
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
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20 pt-4">
      
      {/* Header & Tabs */}
      <div className="px-4 md:px-0 space-y-6">
        <div className="bg-slate-200 dark:bg-slate-800/50 p-1.5 rounded-lg flex relative">
           <button 
             onClick={() => setActiveTab('agenda')}
             className={`flex-1 py-3 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
               activeTab === 'agenda' 
               ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
               : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
             }`}
           >
             <CalendarIcon size={16} /> Agenda
           </button>
           <button 
             onClick={() => setActiveTab('repertoire')}
             className={`flex-1 py-3 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
               activeTab === 'repertoire' 
               ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-white shadow-sm' 
               : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
             }`}
           >
             <Music2 size={16} /> Repertório
           </button>
        </div>
      </div>

      {/* --- CONTEÚDO DA AGENDA --- */}
      {activeTab === 'agenda' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          
          {/* Navegador de Meses */}
          <div className="flex items-center justify-between px-4 md:px-0 mb-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-white capitalize">
               {MONTH_NAMES[viewDate.getMonth()]} <span className="text-slate-400 font-medium">{viewDate.getFullYear()}</span>
            </h2>
            <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={() => changeMonth(1)} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>
          </div>

          <div className="px-4 md:px-0">
             {filteredSchedule.length > 1 && (
                <div className="md:hidden flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full w-fit mb-2 animate-pulse">
                   Deslize para ver mais <ChevronRight size={12} />
                </div>
             )}
          </div>

          {filteredSchedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center mx-4 md:mx-0">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                 <MapPin size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Sem escalas neste mês</h3>
              <p className="text-sm text-slate-400 mt-1">Nenhum evento programado para {MONTH_NAMES[viewDate.getMonth()]}.</p>
            </div>
          ) : (
            <div className="flex flex-nowrap gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-8 -mx-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:pb-0 md:px-0 md:mx-0 md:overflow-visible no-scrollbar">
              {filteredSchedule.map((item, index) => {
                const dateInfo = formatCardDate(item.date);
                const isNext = index === nextEventIndex;
                
                return (
                  <div key={item.id} className={`group relative flex flex-col shrink-0 snap-center w-[85vw] md:w-auto bg-white dark:bg-slate-900 rounded-xl border overflow-hidden transition-all duration-300 ${isNext ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-xl shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none'}`}>
                    {isNext && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-bl-xl z-10 flex items-center gap-1 shadow-sm">
                            <Sparkles size={10} className="text-yellow-300" /> Próximo
                        </div>
                    )}

                    {/* Cabeçalho do Card */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg shadow-sm border ${isNext ? 'bg-indigo-600 border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${isNext ? 'text-indigo-200' : 'text-indigo-500'}`}>{dateInfo.month}</span>
                          <span className={`text-2xl font-black leading-none ${isNext ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{dateInfo.day}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{dateInfo.weekday}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock size={12} className="text-slate-400" />
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{dateInfo.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6 flex-1 flex flex-col">
                      {/* Instrumentistas */}
                      <div className="flex-1">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          <Music size={12} className="text-indigo-500" /> Instrumentistas
                        </h4>
                        {item.musicians.length > 0 ? (
                          <div className="space-y-3">
                            {item.musicians.map(musician => (
                              <div key={musician.id} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 dark:border-indigo-800/30 shrink-0 shadow-sm">
                                  {musician.photoUrl ? (
                                    <img src={musician.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                  ) : getInitials(musician.name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{musician.name}</p>
                                  <p className="text-[9px] font-semibold text-slate-400 uppercase truncate max-w-[150px]">{musician.instruments?.join(', ')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs italic text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">Escala em definição</p>
                        )}
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

                      {/* Vocal com Destaque para Ministro */}
                      <div className="flex-1">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          <Mic size={12} className="text-purple-500" /> Equipe Vocal
                        </h4>
                        {item.singers.length > 0 ? (
                          <div className="space-y-3">
                            {item.singers.map(singer => {
                                const isLeader = singer.id === item.worshipLeaderId;
                                return (
                                  <div key={singer.id} className={`flex items-center gap-3 p-1.5 rounded-lg ${isLeader ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30' : ''}`}>
                                    <div className="relative shrink-0">
                                        <div className={`w-9 h-9 rounded-full ${isLeader ? 'bg-amber-500' : 'bg-purple-50 dark:bg-purple-900/20'} flex items-center justify-center text-[10px] font-bold ${isLeader ? 'text-white' : 'text-purple-600'} border ${isLeader ? 'border-amber-400' : 'border-purple-100 dark:border-purple-800/30'} shadow-sm`}>
                                            {singer.photoUrl ? (
                                                <img src={singer.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : getInitials(singer.name)}
                                        </div>
                                        {isLeader && (
                                            <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900 shadow-sm" title="Ministro de Louvor">
                                                <Crown size={8} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate flex items-center gap-1">
                                          {singer.name}
                                      </p>
                                      {isLeader && <p className="text-[8px] font-black uppercase text-amber-500 tracking-wider">Ministro</p>}
                                    </div>
                                  </div>
                                );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs italic text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">Escala em definição</p>
                        )}

                        {item.backupSinger && (
                           <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center gap-2">
                                <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                                    <Shield size={10} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reserva</p>
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{item.backupSinger.name}</p>
                                </div>
                           </div>
                        )}
                      </div>

                      {/* Louvores (Com Thumbnails Pequenas e Key) */}
                      {item.songs && item.songs.length > 0 && (
                          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    <Music2 size={12} className="text-pink-500" /> Louvores
                                </h4>
                                <div className="space-y-2">
                                  {item.songs.map(songId => {
                                    const song = songs.find(s => s.id === songId);
                                    if (!song) return null;
                                    
                                    // ENCONTRA O CANTOR ESPECÍFICO DESSA MÚSICA
                                    const songSinger = members.find(m => m.id === song.singerId);

                                    const Wrapper = (song.youtubeLink || song.lyricsLink) ? 'a' : 'div';
                                    const props = (song.youtubeLink || song.lyricsLink)
                                      ? { 
                                          href: song.youtubeLink || song.lyricsLink, 
                                          target: "_blank", 
                                          rel: "noopener noreferrer",
                                          title: "Ouvir Música"
                                        }
                                      : {};
                                    
                                    const videoId = getYoutubeId(song.youtubeLink || '');
                                    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/default.jpg` : null;

                                    return (
                                      <Wrapper
                                        key={songId}
                                        {...props}
                                        className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all group/song relative
                                            bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700
                                            ${(song.youtubeLink || song.lyricsLink) 
                                                ? 'hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer' 
                                                : ''
                                            }
                                        `}
                                      >
                                        {/* Pequena Thumbnail no card da agenda */}
                                        <div className="shrink-0 w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-600 relative mt-0.5">
                                            {thumbUrl ? (
                                                <img src={thumbUrl} alt="" className="w-full h-full object-cover transform group-hover/song:scale-110 transition-transform" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                                    <Music2 size={16} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                                            <div className="flex justify-between items-start w-full gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover/song:text-indigo-600 dark:group-hover/song:text-indigo-400 transition-colors">
                                                            {song.title}
                                                        </p>
                                                        {(song.youtubeLink || song.lyricsLink) && <ExternalLink size={10} className="text-slate-400 group-hover/song:text-indigo-500 shrink-0" />}
                                                    </div>
                                                    <p className="text-[10px] font-medium text-slate-400 truncate leading-tight">{song.artist}</p>
                                                </div>
                                                
                                                {/* Key Badge Destacado */}
                                                {song.key && (
                                                    <div className="shrink-0 flex items-center justify-center px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-black text-slate-600 dark:text-slate-300 group-hover/song:bg-pink-500 dark:group-hover/song:bg-pink-600 group-hover/song:text-white group-hover/song:border-pink-400 transition-colors shadow-sm min-w-[24px]">
                                                        {song.key}
                                                    </div>
                                                )}
                                            </div>

                                            {/* MOSTRA O CANTOR DA MÚSICA SE EXISTIR */}
                                            {songSinger && (
                                                <div className="flex items-center gap-1.5 mt-1.5" title={`Cantor: ${songSinger.name}`}>
                                                    <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                                                        {songSinger.photoUrl ? (
                                                            <img src={songSinger.photoUrl} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[6px] font-bold text-slate-500">
                                                                {getInitials(songSinger.name)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">
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
        <div className="px-4 md:px-0 animate-in fade-in slide-in-from-right-4 duration-500">
             
             {/* Search Bar */}
             <div className="relative mb-6">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Pesquisar música ou artista..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-pink-500/20 outline-none transition-all shadow-sm text-slate-800 dark:text-white"
                />
             </div>

            {/* VISUALIZAÇÃO DE PASTAS DE CANTORES */}
            {!isSearching && !selectedSingerFilter ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Folder size={14} /> Pastas por Cantor
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                         <button 
                            onClick={() => setSelectedSingerFilter('all')}
                            className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all group"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white">
                                <ListMusic size={24} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-white text-sm">Todas as Músicas</p>
                                <p className="text-xs text-indigo-100 mt-1">{songs.length} músicas</p>
                            </div>
                        </button>

                        {uncategorizedCount > 0 && (
                            <button 
                                onClick={() => setSelectedSingerFilter('uncategorized')}
                                className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10 transition-all group"
                            >
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 group-hover:text-pink-500 transition-colors">
                                    <Music size={24} />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Geral / Outros</p>
                                    <p className="text-xs text-slate-400 mt-1">{uncategorizedCount} músicas</p>
                                </div>
                            </button>
                        )}

                        {singersWithSongs.map(singer => (
                            <button 
                                key={singer.id}
                                onClick={() => setSelectedSingerFilter(singer.id)}
                                className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-pink-500 transition-all">
                                    {singer.photoUrl ? (
                                        <img src={singer.photoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">
                                            {getInitials(singer.name)}
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate max-w-[120px]">{singer.name}</p>
                                    <p className="text-xs text-slate-400 mt-1">{groupedSongs[singer.id]} músicas</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {!isSearching && selectedSingerFilter && (
                            <div className="flex items-center gap-4 mb-6 animate-in slide-in-from-left-2">
                            <button onClick={() => setSelectedSingerFilter(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-300">
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    {getFilterTitle()}
                                </h3>
                                <p className="text-xs text-slate-400">Exibindo {filteredSongs.length} músicas</p>
                            </div>
                            </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSongs.length === 0 ? (
                            <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                <Music2 className="mx-auto mb-2 opacity-20" size={48} />
                                <p className="text-sm font-medium">Nenhuma música encontrada.</p>
                            </div>
                        ) : (
                            filteredSongs.map(song => {
                                const singer = members.find(m => m.id === song.singerId);
                                return (
                                    <RepertoireSongCard key={song.id} song={song} singer={singer} />
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
      )}

    </div>
  );
};

export default PublicCalendar;