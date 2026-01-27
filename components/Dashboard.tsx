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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: 'Integrantes', val: members.length, icon: Users2, from: 'from-blue-500', to: 'to-cyan-400' },
            { label: 'Cultos', val: schedule.length, icon: CalendarCheck2, from: 'from-violet-500', to: 'to-purple-400' },
            { label: 'Assiduidade', val: `${attendanceRate}%`, icon: ThumbsUp, from: 'from-green-500', to: 'to-emerald-400' },
            { label: 'Faltas Totais', val: totalAbsencesRecorded, icon: AlertOctagon, from: 'from-red-500', to: 'to-rose-400' },
            { label: 'Repertório', val: songs.length, icon: Music2, from: 'from-pink-500', to: 'to-rose-400' },
          ].map((item, i) => (
            <div key={i} className="group bg-white dark:bg-slate-900/60 backdrop-blur-md p-5 rounded-xl border border-white/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                   <div className={`p-3 rounded-lg bg-gradient-to-br ${item.from} ${item.to} text-white shadow-lg`}>
                      <item.icon size={18} />
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight size={14} />
                   </div>
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white mb-1">{item.val}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Participação e Faltas */}
        <div className="xl:col-span-2 space-y-8">
            {/* Presence Card */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg text-amber-500">
                        <Award size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Top Participações</h3>
                    </div>
                </div>
                
                {presenceStats.length === 0 ? (
                    <p className="text-center text-slate-400 py-10">Sem dados disponíveis.</p>
                ) : (
                    <div className="space-y-6">
                        {presenceStats.slice(0, 5).map((stat, idx) => (
                            <div key={stat.member.id} className="relative">
                                <div className="flex items-center gap-4 z-10 relative">
                                    <span className={`w-6 text-sm font-black italic ${idx === 0 ? 'text-amber-500 text-lg' : 'text-slate-300'}`}>#{idx + 1}</span>
                                    <div className="w-10 h-10 rounded-lg shadow-md overflow-hidden border-2 border-white dark:border-slate-700">
                                    {stat.member.photoUrl ? (
                                        <img src={stat.member.photoUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">{getInitials(stat.member.name)}</div>
                                    )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{stat.member.name}</span>
                                            <span className="text-xs font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{stat.count}x</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
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
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-xl border border-red-50 dark:border-red-900/20 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-500">
                        <AlertOctagon size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Ranking de Faltas</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg uppercase">
                        Confirmadas
                    </span>
                </div>
                
                {absenceStats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mb-3">
                            <ThumbsUp className="text-green-500" size={24} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-300 font-bold text-sm">Nenhuma falta registrada!</p>
                        <p className="text-xs text-slate-400">Parabéns pela assiduidade da equipe.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {absenceStats.slice(0, 6).map((stat, idx) => (
                            <div key={stat.member.id} className="flex items-center gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500 shadow-sm shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-800 dark:text-white truncate text-sm">{stat.member.name}</p>
                                    <p className="text-[10px] text-red-500 font-bold">{stat.absences} faltas em {stat.totalScheduled} escalas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Coluna Direita: Top Songs */}
        <div className="xl:col-span-1">
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none h-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg text-pink-500">
                        <ListOrdered size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Músicas em Alta</h3>
                    </div>
                </div>

                {topSongs.length === 0 ? (
                    <p className="text-center text-slate-400 py-10">Sem dados disponíveis.</p>
                ) : (
                    <div className="space-y-5">
                        {topSongs.map((item, idx) => (
                            <div key={item.song?.id} className="group flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-pink-500/20 shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-700 dark:text-slate-200 truncate text-sm">{item.song?.title}</p>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide truncate">{item.song?.artist}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="block font-black text-slate-800 dark:text-white text-sm">{item.count}</span>
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