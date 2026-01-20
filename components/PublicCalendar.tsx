import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Music, Mic, Music2, MapPin, Sparkles, ChevronRight, Search, FileText, Youtube, BookOpen } from 'lucide-react';
import { ScheduleItem, Song } from '../types';

interface PublicCalendarProps {
  schedule: ScheduleItem[];
  songs: Song[];
}

const PublicCalendar: React.FC<PublicCalendarProps> = ({ schedule, songs }) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'repertoire'>('agenda');
  const [searchTerm, setSearchTerm] = useState('');

  // --- LÓGICA DA AGENDA ---
  const sortedSchedule = [...schedule].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const now = new Date();
  const nextEventIndex = sortedSchedule.findIndex(s => new Date(s.date) >= now);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const formatCardDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
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
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            {activeTab === 'agenda' ? <CalendarIcon size={24} /> : <BookOpen size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Harpa de Davi</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Portal da Equipe de Louvor</p>
          </div>
        </div>

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
        <>
          <div className="px-4 md:px-0">
             {sortedSchedule.length > 1 && (
                <div className="md:hidden flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full w-fit mb-2 animate-pulse">
                   Deslize para ver mais <ChevronRight size={12} />
                </div>
             )}
          </div>

          {sortedSchedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center mx-4 md:mx-0">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                 <MapPin size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Nenhuma escala publicada</h3>
              <p className="text-sm text-slate-400 mt-1">Aguarde a divulgação das próximas datas.</p>
            </div>
          ) : (
            <div className="
                flex flex-nowrap gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-8 -mx-4
                md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:pb-0 md:px-0 md:mx-0 md:overflow-visible
                no-scrollbar
            ">
              {sortedSchedule.map((item, index) => {
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
        </>
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
                    filteredSongs.map(song => (
                        <div key={song.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{song.title}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{song.artist}</p>
                                </div>
                                {song.key && (
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 font-black text-xs">
                                        {song.key}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                {song.lyricsLink ? (
                                    <a 
                                        href={song.lyricsLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 transition-colors"
                                    >
                                        <FileText size={14} /> Letra
                                    </a>
                                ) : (
                                    <button disabled className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 font-bold text-xs cursor-not-allowed">
                                        <FileText size={14} /> Sem Letra
                                    </button>
                                )}

                                {song.youtubeLink ? (
                                    <a 
                                        href={song.youtubeLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                    >
                                        <Youtube size={14} /> Vídeo
                                    </a>
                                ) : (
                                    <button disabled className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 font-bold text-xs cursor-not-allowed">
                                        <Youtube size={14} /> Sem Vídeo
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
             </div>
        </div>
      )}

    </div>
  );
};

export default PublicCalendar;