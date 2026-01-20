import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Music, Mic, Trash2, CalendarDays, Clock, Share2, Edit3, Save, Music2, AlertCircle, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
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

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

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
  // Estado para controlar qual item está aberto no Modal
  const [viewItem, setViewItem] = useState<ScheduleItem | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<{ musicians: string[], singers: string[], songs: string[] }>({ musicians: [], singers: [], songs: [] });
  
  // Estado para o filtro de mês
  const [currentDate, setCurrentDate] = useState(new Date());

  const startEditing = (item: ScheduleItem) => {
    setEditingId(item.id);
    setViewItem(item); // Garante que o modal abra
    
    // AUTO-CORREÇÃO: Filtra apenas músicas que existem no banco de dados atual
    const validSongs = (item.songs || []).filter(id => allSongs.some(s => s.id === id));

    setEditState({
      musicians: item.musicians.map(m => m.id),
      singers: item.singers.map(s => s.id),
      songs: validSongs
    });
  };

  const closeModal = () => {
      setViewItem(null);
      setEditingId(null);
  };

  const handleSave = (item: ScheduleItem) => {
    const updatedMusicians = editState.musicians.map(id => allMembers.find(m => m.id === id)).filter(Boolean) as Member[];
    const updatedSingers = editState.singers.map(id => allMembers.find(m => m.id === id)).filter(Boolean) as Member[];
    
    const updatedItem = {
      ...item,
      musicians: updatedMusicians,
      singers: updatedSingers,
      songs: editState.songs
    };

    onUpdateScheduleItem(updatedItem);
    setEditingId(null);
    setViewItem(updatedItem); // Mantém o modal aberto com os dados novos, mas sai do modo edição
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

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // Filtragem local
  const filteredSchedule = schedule.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.getMonth() === currentDate.getMonth() && 
           itemDate.getFullYear() === currentDate.getFullYear();
  });

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          {/* Navegador de Mês */}
          <div className="flex items-center gap-4">
              <button 
                  onClick={() => changeMonth(-1)}
                  className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                  <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-black text-slate-800 dark:text-white capitalize min-w-[150px] text-center">
                  {MONTH_NAMES[currentDate.getMonth()]} <span className="text-slate-400 font-medium">{currentDate.getFullYear()}</span>
              </h3>
              <button 
                  onClick={() => changeMonth(1)}
                  className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                  <ChevronRight size={20} />
              </button>
          </div>

          <button onClick={onClear} className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <Trash2 size={16} /> Limpar Tudo (Banco de Dados)
          </button>
        </div>
      )}

      {/* GRID DE CARDS COMPACTOS */}
      {filteredSchedule.length === 0 ? (
        <div className="py-24 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-slate-300 dark:border-slate-800">
          <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
             <CalendarDays size={40} className="text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Nenhuma escala neste mês</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Nenhum culto encontrado para {MONTH_NAMES[currentDate.getMonth()]}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredSchedule.map((item) => {
                const dateInfo = formatDateTime(item.date);
                
                return (
                    <div 
                        key={item.id} 
                        onClick={() => setViewItem(item)}
                        className="group relative bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between h-48"
                    >
                        {/* Compact Header */}
                        <div className="p-4 flex flex-col items-center justify-center h-full text-center">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">
                                {dateInfo.month}
                            </span>
                            <span className="text-4xl font-black text-slate-800 dark:text-white leading-none my-2">
                                {dateInfo.day}
                            </span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize mb-2">
                                {dateInfo.weekday.split('-')[0]}
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <Clock size={12} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{dateInfo.time}</span>
                            </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex justify-around">
                             <button 
                                onClick={(e) => { e.stopPropagation(); startEditing(item); }} 
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                title="Editar"
                             >
                                <Edit3 size={16} />
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleShare(item); }} 
                                className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                title="Compartilhar"
                             >
                                <Share2 size={16} />
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteScheduleItem(item.id); }} 
                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Excluir"
                             >
                                <Trash2 size={16} />
                             </button>
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      {/* --- MODAL DE DETALHES/EDIÇÃO (USANDO PORTAL PARA OVERLAY FULL SCREEN) --- */}
      {viewItem && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
              
              <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700">
                  
                  {/* Modal Header */}
                  <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Detalhes do Culto</span>
                             <h2 className="text-xl font-black text-slate-800 dark:text-white capitalize">
                                {new Date(viewItem.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                             </h2>
                          </div>
                      </div>
                      <button onClick={closeModal} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-8">
                      {(() => {
                          const dateInfo = formatDateTime(viewItem.date);
                          const isEditing = editingId === viewItem.id;
                          
                          return (
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left Side: Date & Time Info */}
                                <div className="md:w-48 flex flex-col items-center text-center">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl w-full border border-slate-100 dark:border-slate-800">
                                        <span className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">{dateInfo.month}</span>
                                        <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 block">{dateInfo.day}</span>
                                        <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 w-full">
                                            <Clock size={14} className="text-slate-400" />
                                            <span className="text-xs font-black text-slate-600 dark:text-slate-300">{dateInfo.time}</span>
                                        </div>
                                    </div>

                                    {!readOnly && (
                                        <div className="flex flex-col gap-2 mt-6 w-full">
                                            {isEditing ? (
                                                <button onClick={() => handleSave(viewItem)} className="w-full py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all font-bold flex items-center justify-center gap-2">
                                                    <Save size={18} /> Salvar
                                                </button>
                                            ) : (
                                                <button onClick={() => startEditing(viewItem)} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all font-bold flex items-center justify-center gap-2">
                                                    <Edit3 size={18} /> Editar
                                                </button>
                                            )}
                                            <button onClick={() => handleShare(viewItem)} className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-green-600 rounded-xl transition-all font-bold flex items-center justify-center gap-2">
                                                <Share2 size={18} /> Whatsapp
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Content */}
                                <div className="flex-1">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                                    viewItem.musicians.length > 0 ? viewItem.musicians.map(m => (
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
                                                    viewItem.singers.length > 0 ? viewItem.singers.map(s => (
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
                                        <div className="space-y-5 lg:col-span-2">
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
                                                        {viewItem.songs && viewItem.songs.length > 0 ? viewItem.songs.map(songId => {
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
                          );
                      })()}
                  </div>
              </div>
          </div>,
          document.body
      )}
    </div>
  );
};

export default Schedule;