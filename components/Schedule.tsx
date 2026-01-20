import React, { useState } from 'react';
import { Music, Mic, Trash2, CalendarDays, Clock, Share2, Edit3, Save, Music2, AlertCircle } from 'lucide-react';
import { ScheduleItem, Member, Song } from '../types';

interface ScheduleProps {
  schedule: ScheduleItem[];
  allMembers: Member[];
  allSongs: Song[];
  onRegenerateDay: (item: ScheduleItem) => void;
  onDeleteScheduleItem: (id: string) => void;
  onClear: () => void;
  onSubstitute: (scheduleItemId: string, memberOutId: string, memberInId: string) => void;
  onUpdateScheduleItem: (updatedItem: ScheduleItem) => void;
  readOnly?: boolean;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
    weekday: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const Schedule: React.FC<ScheduleProps> = ({ schedule, allMembers, allSongs, onDeleteScheduleItem, onClear, onUpdateScheduleItem, readOnly = false }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<{ musicians: string[], singers: string[], songs: string[] }>({ musicians: [], singers: [], songs: [] });

  const startEditing = (item: ScheduleItem) => {
    setEditingId(item.id);
    
    // AUTO-CORREÇÃO: Filtra apenas músicas que existem no banco de dados atual
    // Isso impede que IDs antigos/deletados apareçam como "Música não encontrada"
    const validSongs = (item.songs || []).filter(id => allSongs.some(s => s.id === id));

    setEditState({
      musicians: item.musicians.map(m => m.id),
      singers: item.singers.map(s => s.id),
      songs: validSongs
    });
  };

  const handleSave = (item: ScheduleItem) => {
    const updatedMusicians = editState.musicians.map(id => allMembers.find(m => m.id === id)).filter(Boolean) as Member[];
    const updatedSingers = editState.singers.map(id => allMembers.find(m => m.id === id)).filter(Boolean) as Member[];
    
    onUpdateScheduleItem({
      ...item,
      musicians: updatedMusicians,
      singers: updatedSingers,
      songs: editState.songs
    });
    setEditingId(null);
  };

  const updateMusician = (idx: number, id: string) => {
    const newM = [...editState.musicians];
    newM[idx] = id;
    setEditState({ ...editState, musicians: newM });
  };

  const updateSinger = (idx: number, id: string) => {
    const newS = [...editState.singers];
    newS[idx] = id;
    setEditState({ ...editState, singers: newS });
  };

  const handleShare = (item: ScheduleItem) => {
    const dateInfo = formatDateTime(item.date);
    const eHarp = '\uD83C\uDFBC';
    const eCal = '\uD83D\uDCC5';
    const eClock = '\u23F0';
    const ePiano = '\uD83C\uDFB9';
    const eMic = '\uD83C\uDFA4';
    const eNotes = '\uD83C\uDFB6';
    
    let text = `*ESCALA HARPA DE DAVI* ${eHarp}\n\n`;
    text += `${eCal} *Data:* ${dateInfo.weekday}, ${dateInfo.day} de ${dateInfo.month}\n`;
    text += `${eClock} *Horário:* ${dateInfo.time}\n\n`;

    text += `*${ePiano} EQUIPE DE MÚSICA:*\n`;
    if (item.musicians.length > 0) {
      item.musicians.forEach(m => {
        text += `• ${m.name} (${m.instruments?.join(', ') || 'Instrumentista'})\n`;
      });
    } else { text += `_Nenhum músico definido_\n`; }
    text += `\n`;

    text += `*${eMic} EQUIPE DE VOCAL:*\n`;
    if (item.singers.length > 0) {
      item.singers.forEach(s => text += `• ${s.name}\n`);
    } else { text += `_Nenhum vocal definido_\n`; }
    text += `\n`;

    text += `*${eNotes} LOUVORES:*\n`;
    if (item.songs && item.songs.length > 0) {
       item.songs.forEach(songId => {
         const song = allSongs.find(s => s.id === songId);
         if (song) text += `• ${song.title} - ${song.artist}\n`;
       });
    } else { text += `_A definir_\n`; }

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (schedule.length === 0) return (
    <div className="py-24 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-slate-300 dark:border-slate-800">
      <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
         <CalendarDays size={40} className="text-slate-400" />
      </div>
      <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Nenhuma escala programada</p>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Adicione datas ou gere automaticamente para começar.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex justify-end no-print">
          <button onClick={onClear} className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <Trash2 size={16} /> Limpar Tudo
          </button>
        </div>
      )}

      {schedule.map((item) => {
        const dateInfo = formatDateTime(item.date);
        const isEditing = editingId === item.id;
        
        return (
          <div key={item.id} className="group relative bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl transition-all duration-300 overflow-hidden">
            
            {/* Top Date Bar */}
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

            <div className="flex flex-col md:flex-row">
                {/* Left Side: Date & Time Info */}
                <div className="md:w-48 bg-slate-50 dark:bg-slate-800/30 p-8 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">{dateInfo.month}</span>
                    <span className="text-5xl font-black text-slate-800 dark:text-white mb-2">{dateInfo.day}</span>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 capitalize mb-4">{dateInfo.weekday}</span>
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">{dateInfo.time}</span>
                    </div>

                    {!readOnly && (
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => handleShare(item)} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-green-500 rounded-xl shadow-sm hover:shadow-md transition-all" title="Compartilhar">
                                <Share2 size={18} />
                            </button>
                            {isEditing ? (
                                <button onClick={() => handleSave(item)} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all">
                                    <Save size={18} />
                                </button>
                            ) : (
                                <button onClick={() => startEditing(item)} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-xl shadow-sm hover:shadow-md transition-all" title="Editar">
                                    <Edit3 size={18} />
                                </button>
                            )}
                            <button onClick={() => onDeleteScheduleItem(item.id)} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl shadow-sm hover:shadow-md transition-all" title="Excluir">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: Content */}
                <div className="flex-1 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {/* Musicians Column */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                                    <Music size={18} />
                                </div>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Instrumentistas</h4>
                            </div>

                            <div className="space-y-4">
                                {isEditing ? (
                                    ['Teclado', 'Baixo', 'Bateria', 'Guitarra', 'Violão'].map((inst, idx) => (
                                        <div key={inst} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">{inst}</label>
                                            <select 
                                                value={editState.musicians[idx] || ''} 
                                                onChange={(e) => updateMusician(idx, e.target.value)}
                                                className="w-full bg-white dark:bg-slate-900 border-none rounded-lg text-sm font-bold p-2 outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-indigo-500"
                                            >
                                                <option value="">-- Selecione --</option>
                                                {allMembers.filter(m => m.role === 'musician' && m.instruments?.includes(inst)).map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))
                                ) : (
                                    item.musicians.length > 0 ? item.musicians.map(m => (
                                        <div key={m.id} className="flex items-center gap-4 group/item">
                                            <div className="relative">
                                                {m.photoUrl ? (
                                                    <img src={m.photoUrl} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-500/20">
                                                        {getInitials(m.name)}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 text-[9px] font-black text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    {m.instruments?.[0]?.substring(0,3).toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{m.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 group-hover/item:text-indigo-500 transition-colors">{m.instruments?.join(', ')}</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-slate-400 italic">Nenhum músico escalado.</p>
                                )}
                            </div>
                        </div>

                        {/* Singers Column */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                                    <Mic size={18} />
                                </div>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Vocais</h4>
                            </div>

                            <div className="space-y-4">
                                {isEditing ? (
                                    [0, 1, 2].map((idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Vocal {idx + 1}</label>
                                            <select 
                                                value={editState.singers[idx] || ''} 
                                                onChange={(e) => updateSinger(idx, e.target.value)}
                                                className="w-full bg-white dark:bg-slate-900 border-none rounded-lg text-sm font-bold p-2 outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-purple-500"
                                            >
                                                <option value="">-- Selecione --</option>
                                                {allMembers.filter(m => m.role === 'singer').map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))
                                ) : (
                                    item.singers.length > 0 ? item.singers.map(s => (
                                        <div key={s.id} className="flex items-center gap-4 group/item">
                                            <div className="relative">
                                                {s.photoUrl ? (
                                                    <img src={s.photoUrl} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-purple-500/20">
                                                        {getInitials(s.name)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Equipe de Louvor</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-slate-400 italic">Nenhum vocal escalado.</p>
                                )}
                            </div>
                        </div>

                         {/* Songs Column */}
                         <div className="space-y-5 lg:col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-lg">
                                    <Music2 size={18} />
                                </div>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Músicas</h4>
                            </div>

                            <div className="space-y-4">
                                {isEditing ? (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Adicionar Louvor</label>
                                        
                                        {allSongs.length === 0 ? (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-xs font-bold mb-3">
                                                <AlertCircle size={16} />
                                                <span>Nenhuma música no acervo.</span>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 mb-3">
                                                <select 
                                                    className="flex-1 bg-white dark:bg-slate-900 border-none rounded-lg text-sm font-bold p-2 outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-pink-500"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if(val && !editState.songs.includes(val)) {
                                                            setEditState(prev => ({...prev, songs: [...prev.songs, val]}));
                                                            e.target.value = ""; // Reset select
                                                        }
                                                    }}
                                                >
                                                    <option value="">+ Selecione uma música</option>
                                                    {allSongs
                                                        .filter(s => !editState.songs.includes(s.id))
                                                        .sort((a, b) => a.title.localeCompare(b.title))
                                                        .map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.title} — {s.artist} {s.key ? `(${s.key})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        
                                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                            {editState.songs.map((songId, idx) => {
                                                const song = allSongs.find(s => s.id === songId);
                                                // Se a música não existir (e.g. deletada durante edição), não renderiza nada para evitar "Música não encontrada"
                                                if (!song) return null; 
                                                
                                                return (
                                                    <div key={songId} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                                         <div className="min-w-0">
                                                             <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{song.title}</p>
                                                             <p className="text-[10px] text-slate-400 truncate">
                                                                {song.artist} {song.key ? `• ${song.key}` : ''}
                                                             </p>
                                                         </div>
                                                         <button 
                                                            onClick={() => setEditState(prev => ({...prev, songs: prev.songs.filter(id => id !== songId)}))} 
                                                            className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Remover da escala"
                                                         >
                                                             <Trash2 size={14} />
                                                         </button>
                                                    </div>
                                                )
                                            })}
                                            {editState.songs.length === 0 && allSongs.length > 0 && (
                                                <p className="text-center text-xs text-slate-400 py-2">Nenhuma música selecionada.</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {item.songs && item.songs.length > 0 ? item.songs.map(songId => {
                                            const song = allSongs.find(s => s.id === songId);
                                            if (!song) return null;
                                            return (
                                                <div key={songId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{song.title}</p>
                                                        <p className="text-[10px] text-slate-400">{song.artist} {song.key ? `• ${song.key}` : ''}</p>
                                                    </div>
                                                </div>
                                            );
                                        }) : <p className="text-sm text-slate-400 italic">Nenhum louvor definido.</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Schedule;