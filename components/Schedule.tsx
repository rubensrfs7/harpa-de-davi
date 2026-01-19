
import React, { useState } from 'react';
import { RefreshCw, Music, Mic, Trash2, CalendarDays, Clock, Music2, Youtube, Share2, Link as LinkIcon, Check, Edit3, X, Save } from 'lucide-react';
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
    weekday: date.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase(),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const Schedule: React.FC<ScheduleProps> = ({ schedule, allMembers, allSongs, onRegenerateDay, onDeleteScheduleItem, onClear, onUpdateScheduleItem, readOnly = false }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<{ musicians: string[], singers: string[] }>({ musicians: [], singers: [] });

  const startEditing = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditState({
      musicians: item.musicians.map(m => m.id),
      singers: item.singers.map(s => s.id)
    });
  };

  const handleSave = (item: ScheduleItem) => {
    const updatedMusicians = editState.musicians.map(id => allMembers.find(m => m.id === id)).filter(Boolean) as Member[];
    const updatedSingers = editState.singers.map(id => allMembers.find(m => m.id === id)).filter(Boolean) as Member[];
    
    onUpdateScheduleItem({
      ...item,
      musicians: updatedMusicians,
      singers: updatedSingers
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
    
    // Definição segura de emojis via Unicode para evitar erros de encoding
    const eHarp = '\uD83C\uDFBC';   // 🎼
    const eCal = '\uD83D\uDCC5';    // 📅
    const eClock = '\u23F0';        // ⏰
    const ePiano = '\uD83C\uDFB9';  // 🎹
    const eMic = '\uD83C\uDFA4';    // 🎤
    const eNotes = '\uD83C\uDFB6';  // 🎶
    
    let text = `*ESCALA HARPA DE DAVI* ${eHarp}\n\n`;
    text += `${eCal} *Data:* ${dateInfo.weekday}, ${dateInfo.day} de ${dateInfo.month}\n`;
    text += `${eClock} *Horário:* ${dateInfo.time}\n\n`;

    text += `*${ePiano} EQUIPE DE MÚSICA:*\n`;
    if (item.musicians.length > 0) {
      item.musicians.forEach(m => {
        const instruments = m.instruments?.join(', ') || 'Instrumentista';
        text += `• ${m.name} (${instruments})\n`;
      });
    } else {
      text += `_Nenhum músico definido_\n`;
    }
    text += `\n`;

    text += `*${eMic} EQUIPE DE VOCAL:*\n`;
    if (item.singers.length > 0) {
      item.singers.forEach(s => {
        text += `• ${s.name}\n`;
      });
    } else {
      text += `_Nenhum vocal definido_\n`;
    }
    text += `\n`;

    text += `*${eNotes} LOUVORES:*\n`;
    if (item.songs && item.songs.length > 0) {
       item.songs.forEach(songId => {
         const song = allSongs.find(s => s.id === songId);
         if (song) text += `• ${song.title} - ${song.artist}\n`;
       });
    } else {
       text += `_A definir_\n`;
    }

    // Utilizar api.whatsapp.com garante melhor compatibilidade com web/desktop
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (schedule.length === 0) return (
    <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
      <CalendarDays size={48} className="mx-auto text-slate-300 mb-4" />
      <p className="text-slate-500 font-medium">Nenhuma escala gerada ainda.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex justify-end no-print">
          <button onClick={onClear} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 transition-colors">
            <Trash2 size={14} /> Limpar Todas as Escalas
          </button>
        </div>
      )}

      {schedule.map((item) => {
        const dateInfo = formatDateTime(item.date);
        const isEditing = editingId === item.id;
        
        return (
          <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row overflow-hidden shadow-sm hover:shadow-lg transition-all">
            
            {/* Sidebar (Data e Ações) */}
            <div className="md:w-36 bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
              <div className="text-center">
                <p className="text-[10px] font-black text-indigo-500 tracking-widest">{dateInfo.month}</p>
                <p className="text-4xl font-black text-slate-800 dark:text-white my-1">{dateInfo.day}</p>
                <p className="text-[10px] font-bold text-slate-400">{dateInfo.weekday}</p>
              </div>

              <div className="flex flex-col gap-2 no-print">
                <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-500 flex items-center justify-center gap-1.5 shadow-sm">
                  <Clock size={12} /> {dateInfo.time}
                </div>
                
                {!readOnly && (
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => handleShare(item)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors" title="Compartilhar no WhatsApp"><Share2 size={16} /></button>
                    {isEditing ? (
                      <button onClick={() => handleSave(item)} className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"><Save size={16} /></button>
                    ) : (
                      <button onClick={() => startEditing(item)} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"><Edit3 size={16} /></button>
                    )}
                    <button onClick={() => onDeleteScheduleItem(item.id)} className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all active:scale-90"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
            </div>

            {/* Conteúdo da Escala */}
            <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Músicos */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Music size={14} className="text-indigo-500" /> Músicos Instrumentistas
                </h4>
                <div className="space-y-3">
                  {isEditing ? (
                    ['Teclado', 'Baixo', 'Bateria', 'Guitarra', 'Violão'].map((inst, idx) => (
                      <div key={inst} className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">{inst}</label>
                        <select 
                          value={editState.musicians[idx] || ''} 
                          onChange={(e) => updateMusician(idx, e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg text-xs font-bold p-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="">Nenhum</option>
                          {allMembers.filter(m => m.role === 'musician' && m.instruments?.includes(inst)).map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                    ))
                  ) : (
                    item.musicians.map(m => (
                      <div key={m.id} className="flex items-center gap-3">
                        {m.photoUrl ? <img src={m.photoUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700" /> : <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-[10px] font-black">{getInitials(m.name)}</div>}
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">{m.name}</p>
                          <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">{m.instruments?.join(', ')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Vocais */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Mic size={14} className="text-purple-500" /> Equipe de Louvor Vocal
                </h4>
                <div className="space-y-3">
                  {isEditing ? (
                    [0, 1, 2].map((idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Vocal {idx + 1}</label>
                        <select 
                          value={editState.singers[idx] || ''} 
                          onChange={(e) => updateSinger(idx, e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg text-xs font-bold p-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="">Nenhum</option>
                          {allMembers.filter(m => m.role === 'singer').map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                    ))
                  ) : (
                    item.singers.map(s => (
                      <div key={s.id} className="flex items-center gap-3">
                        {s.photoUrl ? <img src={s.photoUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700" /> : <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-[10px] font-black">{getInitials(s.name)}</div>}
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{s.name}</p>
                      </div>
                    ))
                  )}
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
