import React from 'react';
import { BarChart3, TrendingUp, UserMinus, UserPlus, Award, Music2, Users2, CalendarCheck2, ListOrdered, ArrowUpRight, AlertOctagon, ThumbsUp, PieChart } from 'lucide-react';
import { Member, ScheduleItem, SubstitutionLog, Song } from '../types';

interface DashboardProps {
  members: Member[];
  schedule: ScheduleItem[];
  logs: SubstitutionLog[];
  songs: Song[];
}

const getInitials = (name: string) => {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
};

const Dashboard: React.FC<DashboardProps> = ({ members, schedule, logs, songs }) => {
  // --- EXISTING STATS ---
  const presenceStats = members.map(member => {
    let count = 0;
    schedule.forEach(day => {
      // Conta apenas se foi escalado E (não tem registro de falta ou presença confirmada)
      // Se tiver registro de presença (true), conta. Se tiver undefined, conta como 'escalado'.
      // Se tiver false (falta), NÃO conta como participação efetiva no Top Presence.
      const isScheduled = day.musicians.some(m => m.id === member.id) || day.singers.some(s => s.id === member.id);
      
      if (isScheduled) {
          const status = day.attendance ? day.attendance[member.id] : undefined;
          if (status !== false) { // Conta se for true ou undefined (assumimos que foi se não marcou falta ainda)
              count++;
          }
      }
    });
    return { member, count };
  }).sort((a, b) => b.count - a.count);

  const maxPresence = Math.max(...presenceStats.map(s => s.count), 1);

  const songFrequencyMap: Record<string, number> = {};
  schedule.forEach(day => {
    (day.songs || []).forEach(songId => {
      songFrequencyMap[songId] = (songFrequencyMap[songId] || 0) + 1;
    });
  });

  const topSongs = Object.entries(songFrequencyMap)
    .map(([id, count]) => ({
      song: songs.find(s => s.id === id),
      count
    }))
    .filter(item => item.song)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- NEW METRICS: ABSENCE & ATTENDANCE ---
  
  // 1. Ranking de Faltas
  const absenceStats = members.map(member => {
      let absences = 0;
      let totalScheduled = 0;

      schedule.forEach(day => {
          const isScheduled = day.musicians.some(m => m.id === member.id) || day.singers.some(s => s.id === member.id);
          if (isScheduled && day.attendance) {
              totalScheduled++;
              if (day.attendance[member.id] === false) {
                  absences++;
              }
          }
      });
      return { member, absences, totalScheduled };
  })
  .filter(s => s.absences > 0)
  .sort((a, b) => b.absences - a.absences); // Quem faltou mais primeiro

  // 2. Taxa de Assiduidade Geral
  let totalPresences = 0;
  let totalAbsencesRecorded = 0;
  
  schedule.forEach(day => {
      if (day.attendance) {
          const vals = Object.values(day.attendance);
          totalPresences += vals.filter(v => v === true).length;
          totalAbsencesRecorded += vals.filter(v => v === false).length;
      }
  });
  
  const totalChecks = totalPresences + totalAbsencesRecorded;
  const attendanceRate = totalChecks > 0 ? Math.round((totalPresences / totalChecks) * 100) : 100;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl shadow-xl shadow-indigo-500/20">
            <BarChart3 size={32} />
        </div>
        <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Visão Geral</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Análise de métricas e performance da equipe</p>
        </div>
      </div>

      {/* Stats Cards Modernos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {[
            { label: 'Integrantes', val: members.length, icon: Users2, from: 'from-blue-500', to: 'to-cyan-400', shadow: 'shadow-blue-500/20' },
            { label: 'Cultos', val: schedule.length, icon: CalendarCheck2, from: 'from-violet-500', to: 'to-purple-400', shadow: 'shadow-violet-500/20' },
            { label: 'Assiduidade', val: `${attendanceRate}%`, icon: ThumbsUp, from: 'from-green-500', to: 'to-emerald-400', shadow: 'shadow-green-500/20' },
            { label: 'Faltas Totais', val: totalAbsencesRecorded, icon: AlertOctagon, from: 'from-red-500', to: 'to-rose-400', shadow: 'shadow-red-500/20' },
            { label: 'Repertório', val: songs.length, icon: Music2, from: 'from-pink-500', to: 'to-rose-400', shadow: 'shadow-pink-500/20' },
          ].map((item, i) => (
            <div key={i} className={`group bg-white dark:bg-slate-900/60 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl ${item.shadow}`}>
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                   <div className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${item.from} ${item.to} text-white shadow-lg`}>
                      <item.icon size={20} />
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                      <ArrowUpRight size={14} />
                   </div>
                </div>
                <div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-1 tracking-tighter">{item.val}</p>
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</p>
                </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Participação e Faltas */}
        <div className="lg:col-span-2 space-y-8">
            {/* Presence Card */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none">
                <div className="flex items-center justify-between mb-8 sm:mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-500 shadow-inner">
                            <Award size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight">Top Participações</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Membros mais ativos</p>
                        </div>
                    </div>
                </div>
                
                {presenceStats.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <Award className="mx-auto mb-4 text-slate-200" size={48} />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sem dados disponíveis</p>
                    </div>
                ) : (
                    <div className="space-y-6 sm:space-y-8">
                        {presenceStats.slice(0, 5).map((stat, idx) => (
                            <div key={stat.member.id} className="relative group/item">
                                <div className="flex items-center gap-4 sm:gap-6 z-10 relative">
                                    <span className={`w-6 sm:w-8 text-base sm:text-lg font-black italic text-center ${idx === 0 ? 'text-amber-500' : 'text-slate-300'}`}>#{idx + 1}</span>
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg overflow-hidden border-2 border-white dark:border-slate-700 shrink-0 transition-transform duration-500 group-hover/item:scale-110">
                                    {stat.member.photoUrl ? (
                                        <img src={stat.member.photoUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black uppercase text-slate-500">{getInitials(stat.member.name)}</div>
                                    )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-2 gap-4">
                                            <span className="font-black text-slate-800 dark:text-slate-200 text-base sm:text-lg truncate">{stat.member.name}</span>
                                            <span className="text-[11px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-800/50">{stat.count}x</span>
                                        </div>
                                        <div className="h-2.5 sm:h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                            <div 
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                                                style={{ width: `${(stat.count / maxPresence) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ranking de Faltas (Novo) */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-8 sm:mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-500 shadow-inner">
                            <AlertOctagon size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight">Ranking de Faltas</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Monitoramento de ausências</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm">
                        Confirmadas
                    </span>
                </div>
                
                {absenceStats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50/30 dark:bg-green-900/10 rounded-3xl border-2 border-dashed border-green-100 dark:border-green-900/30">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/10">
                            <ThumbsUp className="text-green-500" size={32} />
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-black text-lg uppercase tracking-tight">Nenhuma falta registrada!</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Parabéns pela assiduidade da equipe.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {absenceStats.slice(0, 6).map((stat, idx) => (
                            <div key={stat.member.id} className="group flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-red-500/30 hover:bg-red-50/30 transition-all duration-500 shadow-sm hover:shadow-md">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-sm text-slate-400 shadow-sm shrink-0 border border-slate-100 dark:border-slate-700 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                                    {idx + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-black text-slate-800 dark:text-white truncate text-base tracking-tight">{stat.member.name}</p>
                                    <p className="text-[11px] text-red-500 font-black uppercase tracking-widest mt-0.5">{stat.absences} faltas em {stat.totalScheduled} escalas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Coluna Direita: Top Songs */}
        <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none h-full">
                <div className="flex items-center justify-between mb-8 sm:mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-2xl text-pink-500 shadow-inner">
                            <ListOrdered size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight">Músicas em Alta</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Mais tocadas no mês</p>
                        </div>
                    </div>
                </div>

                {topSongs.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <Music2 className="mx-auto mb-4 text-slate-200" size={48} />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sem dados disponíveis</p>
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {topSongs.map((item, idx) => (
                            <div key={item.song?.id} className="group flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all duration-500 border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-pink-500/20 shrink-0 transition-transform duration-500 group-hover:scale-110">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-800 dark:text-slate-200 truncate text-base tracking-tight group-hover:text-pink-500 transition-colors">{item.song?.title}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">{item.song?.artist}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <span className="block font-black text-slate-800 dark:text-white text-xs">{item.count}x</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;