
import React from 'react';
import { BarChart3, TrendingUp, UserMinus, UserPlus, Award, Music2, Users2, CalendarCheck2, ListOrdered } from 'lucide-react';
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
  // 1. Calculate Presence (Frequency in current schedule)
  const presenceStats = members.map(member => {
    let count = 0;
    schedule.forEach(day => {
      if (day.musicians.some(m => m.id === member.id)) count++;
      if (day.singers.some(s => s.id === member.id)) count++;
    });
    return { member, count };
  }).sort((a, b) => b.count - a.count);

  const maxPresence = Math.max(...presenceStats.map(s => s.count), 1);

  // 2. Calculate Top Songs Frequency
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
    .slice(0, 6);

  const maxSongCount = Math.max(...topSongs.map(s => s.count), 1);

  // 3. Calculate Substitution Stats
  const subStats = members.map(member => {
    const timesOut = logs.filter(l => l.memberOut.id === member.id).length;
    const timesIn = logs.filter(l => l.memberIn.id === member.id).length;
    return { member, timesOut, timesIn };
  }).filter(s => s.timesOut > 0 || s.timesIn > 0).sort((a, b) => (b.timesIn + b.timesOut) - (a.timesIn + a.timesOut));

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <BarChart3 size={28} />
          </div>
          <div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard de Presença</h2>
              <p className="text-slate-500 dark:text-slate-400">Análise das escalas ativas e histórico de trocas</p>
          </div>
        </div>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Integrantes', val: members.length, icon: Users2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
            { label: 'Cultos Marcados', val: schedule.length, icon: CalendarCheck2, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
            { label: 'Músicas no Acervo', val: songs.length, icon: Music2, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/10' },
            { label: 'Trocas Realizadas', val: logs.length, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                    <item.icon size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white">{item.val}</p>
                </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Presence Ranking Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between mb-8">
                <h3 className="flex items-center gap-3 font-black text-slate-800 dark:text-slate-100 text-lg">
                    <Award className="text-amber-500" size={24} />
                    Ranking de Escalação
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Frequência</span>
            </div>
            
            {presenceStats.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-slate-400 text-sm">Gere uma escala para ver os dados.</p>
                </div>
            ) : (
                <div className="space-y-6 max-h-[480px] overflow-y-auto custom-scrollbar pr-4">
                    {presenceStats.map((stat, idx) => (
                        <div key={stat.member.id} className="group flex items-center gap-4">
                            <span className="w-6 text-sm font-black text-slate-300 dark:text-slate-600 italic">#{idx + 1}</span>
                            
                            {/* Member Photo/Avatar */}
                            <div className="relative flex-shrink-0">
                                {stat.member.photoUrl ? (
                                    <img src={stat.member.photoUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md" alt="" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-slate-700 shadow-md">
                                        {getInitials(stat.member.name)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-500 transition-colors">
                                        {stat.member.name}
                                    </span>
                                    <span className="text-xs font-black text-slate-400">{stat.count}x</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(99,102,241,0.4)] ${
                                            idx < 3 ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient' : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                        style={{ width: `${(stat.count / maxPresence) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Most Played Songs Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between mb-8">
                <h3 className="flex items-center gap-3 font-black text-slate-800 dark:text-slate-100 text-lg">
                    <ListOrdered className="text-pink-500" size={24} />
                    Músicas Mais Tocadas
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Repertório</span>
            </div>

            {topSongs.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-slate-400 text-sm">Selecione músicas nas escalas para ver o ranking.</p>
                </div>
            ) : (
                <div className="space-y-6 max-h-[480px] overflow-y-auto custom-scrollbar pr-4">
                    {topSongs.map((item, idx) => (
                        <div key={item.song?.id} className="group space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-500 flex items-center justify-center font-black text-xs">
                                        {idx + 1}
                                    </div>
                                    <div className="truncate pr-4">
                                        <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{item.song?.title}</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{item.song?.artist}</p>
                                    </div>
                                </div>
                                <span className="font-black text-pink-500 text-xs bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-md">{item.count}x</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                                    style={{ width: `${(item.count / maxSongCount) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
      
      {/* Footer Substitution Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* History List */}
          <div className="lg:col-span-12">
            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-[0.2em]">Histórico Recente de Trocas</h3>
                    <TrendingUp size={18} className="text-slate-300" />
                </div>
                
                {logs.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm italic">Nenhuma alteração manual registrada.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {logs.slice().reverse().slice(0, 6).map(log => (
                            <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.timestamp).toLocaleDateString()}</span>
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-red-500 line-through truncate">{log.memberOut.name}</p>
                                        <p className="text-sm font-black text-slate-800 dark:text-white truncate">{log.memberIn.name}</p>
                                    </div>
                                    <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm">
                                        <TrendingUp size={14} className="text-indigo-500" />
                                    </div>
                                </div>
                                <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800/50 text-[10px] text-slate-400 font-medium">
                                    Escala de {new Date(log.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'long'})}
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
