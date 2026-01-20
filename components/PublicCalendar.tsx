import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Music, Mic, Music2, MapPin, Sparkles, ChevronRight, Search, FileText, Youtube, BookOpen, User, ChevronLeft } from 'lucide-react';
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

// Subcomponente para Card de Música (Visualização Pública)
const PublicSongCard: React.FC<{ song: Song; singer?: Member }> = ({ song, singer }) => {
    const videoId = getYoutubeId(song.youtubeLink || '');
    const [imgSrc, setImgSrc] = useState(videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
    const [isLowQuality, setIsLowQuality] = useState(false);

    const handleImgError = () => {
        if (!isLowQuality && videoId) {
            setIsLowQuality(true);
            setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
        }
    };

    return (
        <div className="group relative bg-[#0f172a] rounded-[2rem] border border-slate-800 hover:border-pink-500/50 transition-all duration-300 shadow-lg shadow-black/20 overflow-hidden h-[220px] flex flex-col justify-between isolate">
            {/* Background Image Layer */}
            {imgSrc ? (
                <>
                    <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden">
                        <img 
                            src={imgSrc} 
                            alt={song.title} 
                            onError={handleImgError}
                            className={`w-full h-full object-cover bg-center transition-transform duration-700 opacity-60 group-hover:opacity-100 ${isLowQuality ? 'scale-[1.35]' : 'group-hover:scale-110'}`} 
                        />
                    </div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none"></div>
                </>
            ) : (
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 to-slate-950"></div>
            )}

            {/* Content Container */}
            <div className="relative z-10 p-5 flex flex-col h-full justify-between pointer-events-none">
                
                {/* Header Content */}
                <div className="pt-1">
                    <h4 className="font-bold text-white line-clamp-2 text-xl drop-shadow-lg leading-tight" title={song.title}>{song.title}</h4>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mt-1 drop-shadow-md">{song.artist}</p>
                </div>
                
                {/* Body Content (Bottom) */}
                <div className="mt-auto space-y-4 pointer-events-auto">
                    {/* Info Badges Row */}
                    <div className="flex items-center gap-3">
                        {/* Key Badge */}
                        {song.key && (
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-500 text-white font-black text-sm shadow-lg shadow-pink-500/30" title={`Tom: ${song.key}`}>
                                {song.key}
                            </div>
                        )}
                        
                        {/* Singer Badge */}
                        {singer && (
                            <div className="flex items-center gap-2 pl-1 pr-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                                <div className="w-7 h-7 rounded-full bg-purple-900/50 overflow-hidden flex items-center justify-center border border-purple-500/30">
                                    {singer.photoUrl ? (
                                        <img src={singer.photoUrl} alt={singer.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[9px] font-bold text-purple-300">{getInitials(singer.name)}</span>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-slate-200 truncate max-w-[100px]">
                                    {singer.name.split(' ')[0]}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex gap-3">
                        {song.lyricsLink ? (
                            <a 
                                href={song.lyricsLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl bg-black/60 backdrop-blur-sm text-orange-400 hover:bg-orange-900/40 hover:text-orange-300 transition-colors border border-orange-500/30 hover:border-orange-500/50"
                            >
                                <FileText size={16} /> Letra
                            </a>
                        ) : <div className="flex-1"></div>}
                        
                        {song.youtubeLink ? (
                            <a 
                                href={song.youtubeLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl bg-black/60 backdrop-blur-sm text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors border border-red-500/30 hover:border-red-500/50"
                            >
                                <Youtube size={16} /> Vídeo
                            </a>
                        ) : <div className="flex-1"></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PublicCalendar: React.FC<PublicCalendarProps> = ({ schedule, songs, members }) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'repertoire'>('agenda');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para navegação de mês (Inicializa com o mês atual do usuário)
  const [viewDate, setViewDate] = useState(new Date());

  // --- LÓGICA DA AGENDA ---
  
  // 1. Filtra escalas que JÁ PASSARAM (Data < Hoje à meia-noite)
  // O usuário pediu: "escalas que passou da data pode tirar a visualização"
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const upcomingSchedule = schedule.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= todayMidnight;
  });

  // 2. Filtra pelo MÊS SELECIONADO (viewDate)
  const filteredSchedule = upcomingSchedule.filter(item => {
    const d = new Date(item.date);
    return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Índice para destacar o próximo evento no mês
  const now = new Date();
  const nextEventIndex = filteredSchedule.findIndex(s => new Date(s.date) >= now);

  const formatCardDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  // --- LÓGICA DO REPERTÓRIO ---
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20 pt-4">
      
      {/* Header & Tabs */}
      <div className="px-4 md:px-0 space-y-6">
        
        {/* Tab Switcher */}
        <div className="bg-slate-200 dark:bg-slate-800/50 p-1.5 rounded-2xl flex relative">
           <button 
             onClick={() => setActiveTab('agenda')}
             className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
               activeTab === 'agenda' 
               ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
               : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
             }`}
           >
             <CalendarIcon size={16} /> Agenda
           </button>
           <button 
             onClick={() => setActiveTab('repertoire')}
             className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
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
                <button 
                    onClick={() => changeMonth(-1)}
                    className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={() => changeMonth(1)}
                    className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
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
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center mx-4 md:mx-0">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                 <MapPin size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Sem escalas neste mês</h3>
              <p className="text-sm text-slate-400 mt-1">Nenhum evento programado para {MONTH_NAMES[viewDate.getMonth()]}.</p>
            </div>
          ) : (
            <div className="
                flex flex-nowrap gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-8 -mx-4
                md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:pb-0 md:px-0 md:mx-0 md:overflow-visible
                no-scrollbar
            ">
              {filteredSchedule.map((item, index) => {
                const dateInfo = formatCardDate(item.date);
                const isNext = index === nextEventIndex;
                
                return (
                  <div 
                    key={item.id} 
                    className={`
                        group relative flex flex-col shrink-0 snap-center
                        w-[85vw] md:w-auto 
                        bg-white dark:bg-slate-900 rounded-[2.5rem] border overflow-hidden transition-all duration-300
                        ${isNext 
                            ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-xl shadow-indigo-500/10' 
                            : 'border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none'
                        }
                    `}
                  >
                    {isNext && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-bl-2xl z-10 flex items-center gap-1 shadow-sm">
                            <Sparkles size={10} className="text-yellow-300" /> Próximo
                        </div>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl shadow-sm border ${isNext ? 'bg-indigo-600 border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
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

                      <div className="flex-1">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          <Mic size={12} className="text-purple-500" /> Equipe Vocal
                        </h4>
                        {item.singers.length > 0 ? (
                          <div className="space-y-3">
                            {item.singers.map(singer => (
                              <div key={singer.id} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-[10px] font-bold text-purple-600 border border-purple-100 dark:border-purple-800/30 shrink-0 shadow-sm">
                                  {singer.photoUrl ? (
                                    <img src={singer.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                  ) : getInitials(singer.name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{singer.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs italic text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">Escala em definição</p>
                        )}
                      </div>

                      {item.songs && item.songs.length > 0 && (
                          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    <Music2 size={12} className="text-pink-500" /> Louvores
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {item.songs.slice(0, 3).map(songId => {
                                        const song = songs.find(s => s.id === songId);
                                        return song ? (
                                            <span key={songId} className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold truncate max-w-[150px]">
                                                {song.title}
                                            </span>
                                        ) : null;
                                    })}
                                    {item.songs.length > 3 && (
                                        <span className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg font-bold">
                                            +{item.songs.length - 3}
                                        </span>
                                    )}
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

      {/* --- CONTEÚDO DO REPERTÓRIO --- */}
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
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-pink-500/20 outline-none transition-all shadow-sm text-slate-800 dark:text-white"
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSongs.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
                        <Music2 className="mx-auto mb-2 opacity-20" size={48} />
                        <p className="text-sm font-medium">Nenhuma música encontrada.</p>
                    </div>
                ) : (
                    filteredSongs.map(song => {
                        const singer = members.find(m => m.id === song.singerId);
                        return (
                            <PublicSongCard key={song.id} song={song} singer={singer} />
                        );
                    })
                )}
             </div>
        </div>
      )}

    </div>
  );
};

export default PublicCalendar;