import React, { useState } from 'react';
import { CheckCircle2, XCircle, CalendarCheck, Save, Search, UserCheck, AlertCircle } from 'lucide-react';
import { ScheduleItem, Member } from '../types';

interface AttendanceListProps {
  schedule: ScheduleItem[];
  onUpdateSchedule: (item: ScheduleItem) => void;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ schedule, onUpdateSchedule }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Estado local para edições antes de salvar
  const [localAttendance, setLocalAttendance] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Ordenar: Cultos mais recentes primeiro. Filtra futuros muito distantes se quiser, mas aqui mostraremos todos.
  const sortedSchedule = [...schedule].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleToggleAttendance = (scheduleId: string, memberId: string, currentStatus: boolean | undefined) => {
    // Se undefined, assume que estava pendente, clicando vira Presente (true). 
    // Se true, vira false. Se false, vira true.
    const newStatus = currentStatus === undefined ? true : !currentStatus;
    
    setLocalAttendance(prev => ({
      ...prev,
      [`${scheduleId}-${memberId}`]: newStatus
    }));
    setHasChanges(true);
  };

  const saveAttendance = (item: ScheduleItem) => {
    const currentAttendance = item.attendance || {};
    const updatesForThisItem: Record<string, boolean> = {};

    // Coleta as alterações do estado local para este item
    [...item.musicians, ...item.singers].forEach(m => {
        const key = `${item.id}-${m.id}`;
        if (localAttendance[key] !== undefined) {
            updatesForThisItem[m.id] = localAttendance[key];
        } else if (currentAttendance[m.id] !== undefined) {
            updatesForThisItem[m.id] = currentAttendance[m.id];
        }
    });

    onUpdateSchedule({
        ...item,
        attendance: updatesForThisItem
    });
    
    // Limpa o estado de mudanças visual apenas para dar feedback
    const remainingLocal = { ...localAttendance };
    Object.keys(updatesForThisItem).forEach(mId => {
        delete remainingLocal[`${item.id}-${mId}`];
    });
    setLocalAttendance(remainingLocal);
    setHasChanges(false);
    alert("Lista de presença salva com sucesso!");
  };

  const getStatus = (item: ScheduleItem, memberId: string) => {
    // Verifica primeiro o estado local (edição em andamento), depois o salvo
    const localVal = localAttendance[`${item.id}-${memberId}`];
    if (localVal !== undefined) return localVal;
    
    return item.attendance ? item.attendance[memberId] : undefined;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('pt-BR', { month: 'long' }),
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isPast: date < new Date()
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-xl shadow-green-500/20">
                <UserCheck size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Lista de Presença</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Confirme a participação da equipe nos cultos</p>
            </div>
        </div>

        <div className="space-y-4">
            {sortedSchedule.map((item) => {
                const dateInfo = formatDateTime(item.date);
                const isExpanded = expandedId === item.id;
                const members = [...item.musicians, ...item.singers];
                
                // Calcula estatísticas rápidas
                const totalMembers = members.length;
                const recordedCount = item.attendance ? Object.keys(item.attendance).length : 0;
                const presentCount = item.attendance ? Object.values(item.attendance).filter(Boolean).length : 0;
                const isComplete = totalMembers > 0 && recordedCount === totalMembers;

                return (
                    <div key={item.id} className={`bg-white dark:bg-slate-900/60 backdrop-blur-md border transition-all duration-500 rounded-3xl overflow-hidden ${isExpanded ? 'border-green-500 shadow-2xl shadow-green-500/10 ring-4 ring-green-500/5' : 'border-slate-100 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-900 hover:shadow-xl'}`}>
                        {/* Card Header (Clickable) */}
                        <div 
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="p-5 sm:p-6 cursor-pointer flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all duration-500 ${dateInfo.isPast ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 group-hover:scale-105'}`}>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{dateInfo.weekday.substring(0,3)}</span>
                                    <span className="text-2xl font-black text-slate-800 dark:text-white leading-none mt-0.5">{dateInfo.day}</span>
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white capitalize leading-tight">{dateInfo.weekday}, {dateInfo.time}</h3>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 capitalize mt-1 tracking-wide">{dateInfo.month}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-8">
                                <div className="text-right hidden sm:block">
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isComplete ? 'text-green-500' : 'text-amber-500'}`}>
                                        {isComplete ? 'Finalizado' : 'Pendente'}
                                    </p>
                                    <div className="flex items-center justify-end gap-1.5">
                                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${isComplete ? 'bg-green-500' : 'bg-amber-500'}`} 
                                                style={{ width: `${totalMembers > 0 ? (recordedCount / totalMembers) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400">
                                            {recordedCount}/{totalMembers}
                                        </span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-2xl transition-all duration-500 ${isExpanded ? 'rotate-180 bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-green-500 group-hover:bg-green-50'}`}>
                                     <CalendarCheck size={22} />
                                </div>
                            </div>
                        </div>

                        {/* Expandable Content */}
                        {isExpanded && (
                            <div className="px-6 pb-8 pt-2 animate-in slide-in-from-top-4 duration-500">
                                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-8"></div>
                                
                                {members.length === 0 ? (
                                    <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <AlertCircle className="mx-auto mb-3 text-slate-300" size={40} />
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Ninguém escalado para este culto</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                                        {members.map(member => {
                                            const status = getStatus(item, member.id);
                                            // undefined = pendente, true = presente, false = falta
                                            
                                            return (
                                                <button 
                                                    key={member.id}
                                                    onClick={() => handleToggleAttendance(item.id, member.id, status)}
                                                    className={`group/btn flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 ${
                                                        status === true 
                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300 shadow-lg shadow-green-500/5' 
                                                            : status === false
                                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300 opacity-80'
                                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-500/50 hover:bg-indigo-50/30'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-500 ${status === true ? 'border-green-200 shadow-md' : status === false ? 'border-red-200' : 'border-slate-100 dark:border-slate-700'}`}>
                                                            {member.photoUrl ? (
                                                                <img src={member.photoUrl} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center text-xs font-black uppercase ${status === true ? 'bg-green-100 text-green-600' : status === false ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                                                    {member.name.substring(0,2)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-black truncate max-w-[120px]">{member.name}</p>
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-0.5">{member.role === 'musician' ? member.instruments?.[0] : 'Vocal'}</p>
                                                        </div>
                                                    </div>

                                                    <div className={`transition-all duration-500 ${status !== undefined ? 'scale-110' : 'opacity-20 group-hover/btn:opacity-100'}`}>
                                                        {status === true && <CheckCircle2 size={24} className="text-green-500" />}
                                                        {status === false && <XCircle size={24} className="text-red-500" />}
                                                        {status === undefined && <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => saveAttendance(item)}
                                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-none"
                                    >
                                        <Save size={20} /> Salvar Lista
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default AttendanceList;