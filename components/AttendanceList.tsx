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
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-[2rem] shadow-xl shadow-green-500/20 transform rotate-2">
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
                    <div key={item.id} className={`bg-white dark:bg-slate-900/60 backdrop-blur-md border transition-all duration-300 rounded-3xl overflow-hidden ${isExpanded ? 'border-green-500 shadow-xl ring-1 ring-green-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-900'}`}>
                        {/* Card Header (Clickable) */}
                        <div 
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="p-6 cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border ${dateInfo.isPast ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>
                                    <span className="text-[10px] font-black uppercase text-slate-500">{dateInfo.weekday.substring(0,3)}</span>
                                    <span className="text-xl font-black text-slate-800 dark:text-white">{dateInfo.day}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white capitalize">{dateInfo.weekday}, {dateInfo.time}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{dateInfo.month}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className={`text-xs font-bold uppercase tracking-wider ${isComplete ? 'text-green-500' : 'text-amber-500'}`}>
                                        {isComplete ? 'Finalizado' : 'Pendente'}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {presentCount}/{totalMembers} Presentes
                                    </p>
                                </div>
                                <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-slate-100 dark:bg-slate-800' : ''}`}>
                                     <CalendarCheck size={20} className={isComplete ? "text-green-500" : "text-slate-400"} />
                                </div>
                            </div>
                        </div>

                        {/* Expandable Content */}
                        {isExpanded && (
                            <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-6"></div>
                                
                                {members.length === 0 ? (
                                    <p className="text-center text-slate-400 italic py-4">Ninguém escalado para este culto.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                        {members.map(member => {
                                            const status = getStatus(item, member.id);
                                            // undefined = pendente, true = presente, false = falta
                                            
                                            return (
                                                <button 
                                                    key={member.id}
                                                    onClick={() => handleToggleAttendance(item.id, member.id, status)}
                                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                        status === true 
                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                                                            : status === false
                                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 opacity-70'
                                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                                                            {member.photoUrl ? (
                                                                <img src={member.photoUrl} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                                                    {member.name.substring(0,2).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold">{member.name}</p>
                                                            <p className="text-[10px] opacity-70 uppercase font-semibold">{member.role === 'musician' ? member.instruments?.[0] : 'Vocal'}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        {status === true && <CheckCircle2 size={20} />}
                                                        {status === false && <XCircle size={20} />}
                                                        {status === undefined && <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => saveAttendance(item)}
                                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                                    >
                                        <Save size={18} /> Salvar Lista
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