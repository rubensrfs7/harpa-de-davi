
import React from 'react';
import { BarChart3, TrendingUp, UserMinus, UserPlus, Award, Music2, Users2, CalendarCheck2, ListOrdered, ArrowUpRight } from 'lucide-react';
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
  const presenceStats = members.map(member => {
    let count = 0;
    schedule.forEach(day => {
      if (day.musicians.some(m => m.id === member.id)) count++;
      if (day.singers.some(s => s.id === member.id)) count++;
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
    .slice(0, 6);

  const maxSongCount = Math.max(...topSongs.map(s => s.count), 1);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-[2rem] shadow-xl shadow-indigo-500/20 transform rotate-[-5deg]">
            <BarChart3 size={32} />
        </div>
        <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Visão Geral</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Análise de métricas e performance da equipe</p>
        </div>
      </div>

      {/* Stats Cards Modernos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Integrantes', val: members.length, icon: Users2, from: 'from-blue-500', to: 'to-cyan-400' },
            { label: 'Cultos', val: schedule.length, icon: CalendarCheck2, from: 'from-violet-500', to: 'to-purple-400' },
            { label: 'Repertório', val: songs.length, icon: Music2, from: 'from-pink-500', to: 'to-rose-400' },
            { label: 'Trocas', val: logs.length, icon: TrendingUp, from: 'from-amber-500', to: 'to-orange-400' },
          ].map((item, i) => (
            <div key={i} className="group bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                   <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.from} ${item.to} text-white shadow-lg`}>
                      <item.icon size={20} />
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight size={16} />
                   </div>
                </div>
                <div>
                    <p className="text-3xl font-black text-slate-800 dark:text-white mb-1">{item.val}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Presence Card */}
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-xl text-amber-500">
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
                                <div className="w-10 h-10 rounded-full shadow-md overflow-hidden border-2 border-white dark:border-slate-700">
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

        {/* Top Songs Card */}
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-xl text-pink-500">
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
                        <div key={item.song?.id} className="group flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-pink-500/20">
                                {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{item.song?.title}</p>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide truncate">{item.song?.artist}</p>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-slate-800 dark:text-white">{item.count}</span>
                                <span className="text-[10px] text-slate-400 uppercase">Vezes</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
