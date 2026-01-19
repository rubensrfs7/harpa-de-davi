
import React from 'react';
import { Calendar as CalendarIcon, Clock, Music, Mic, Music2, MapPin, Sparkles, ChevronRight } from 'lucide-react';
import { ScheduleItem, Song } from '../types';

interface PublicCalendarProps {
  schedule: ScheduleItem[];
  songs: Song[];
}

const PublicCalendar: React.FC<PublicCalendarProps> = ({ schedule, songs }) => {
  // Ordenar escalas por data
  const sortedSchedule = [...schedule].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Encontrar o próximo culto baseado na data atual
  const now = new Date();
  const nextEventIndex = sortedSchedule.findIndex(s => new Date(s.date) >= now);
  // Se não encontrar (todos passaram), ou se a lista estiver vazia, o índice será -1. 
  // Se todos passaram, talvez queiramos mostrar o último, mas a lógica "Próximo" foca no futuro.
  
  // Função para pegar iniciais do nome para o avatar
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between px-2 md:px-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Agenda</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Próximos cultos</p>
          </div>
        </div>
        
        {/* Dica visual apenas mobile */}
        {sortedSchedule.length > 1 && (
             <div className="md:hidden flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full animate-pulse">
                Deslize <ChevronRight size={12} />
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
        /* 
           CONTAINER HÍBRIDO: 
           - Mobile: Flex Row + Overflow X + Snap (Carrossel)
           - Desktop: Grid (Grade Padrão)
        */
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
                {/* Badge "Próximo" */}
                {isNext && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-bl-2xl z-10 flex items-center gap-1 shadow-sm">
                        <Sparkles size={10} className="text-yellow-300" /> Próximo
                    </div>
                )}

                {/* Cabeçalho do Card (Data e Hora) */}
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

                {/* Corpo do Card (Equipes) */}
                <div className="p-6 space-y-6 flex-1 flex flex-col">
                  
                  {/* Seção Músicos */}
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

                  {/* Seção Vocal */}
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

                  {/* Seção Músicas (Resumida) - Sempre no rodapé do card */}
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
  );
};

export default PublicCalendar;
