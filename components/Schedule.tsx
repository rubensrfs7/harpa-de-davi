import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Music, Mic, Trash2, CalendarDays, Clock, Share2, Edit3, Save, Music2, AlertCircle, ChevronLeft, ChevronRight, X, Eye, ExternalLink, ChevronDown, Check, Search, Plus, Crown, UserPlus, Shield, Youtube, FileText } from 'lucide-react';
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

// --- COMPONENTE CUSTOM SELECT PARA MEMBROS ---
interface MemberSelectProps {
  label: string;
  value: string;
  options: Member[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

const MemberSelect: React.FC<MemberSelectProps> = ({ label, value, options, onChange, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedMember = options.find(m => m.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 flex items-center gap-1">
        {icon} {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 
          border rounded-lg cursor-pointer transition-all
          ${isOpen 
            ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-white dark:bg-slate-800' 
            : 'border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
          }
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
           {selectedMember ? (
             <>
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-600">
                   {selectedMember.photoUrl ? (
                     <img src={selectedMember.photoUrl} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {getInitials(selectedMember.name)}
                     </div>
                   )}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                  {selectedMember.name}
                </span>
             </>
           ) : (
             <span className="text-sm font-medium text-slate-400 px-1">-- Selecione --</span>
           )}
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
           <div 
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-400 text-sm font-medium border-b border-slate-50 dark:border-slate-700/50"
              onClick={() => { onChange(''); setIsOpen(false); }}
           >
             -- Remover Seleção --
           </div>
           {options.length === 0 ? (
             <div className="p-3 text-center text-xs text-slate-400 italic">Nenhum membro disponível.</div>
           ) : (
             options.map(member => (
               <div 
                 key={member.id}
                 onClick={() => { onChange(member.id); setIsOpen(false); }}
                 className={`
                    flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors
                    ${member.id === value ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}
                 `}
               >
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-600">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {getInitials(member.name)}
                        </div>
                      )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${member.id === value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>
                      {member.name}
                    </p>
                  </div>
                  {member.id === value && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
               </div>
             ))
           )}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE SEARCHABLE SONG SELECT ---
interface SongSelectProps {
  songs: Song[];
  excludeIds: string[];
  onSelect: (songId: string) => void;
}

const SongSelect: React.FC<SongSelectProps> = ({ songs, excludeIds, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSongs = songs
    .filter(s => !excludeIds.includes(s.id))
    .filter(s => 
      s.title.toLowerCase().includes(search.toLowerCase()) || 
      s.artist.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input 
          type="text"
          placeholder="Buscar ou adicionar música..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className={`
            w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 
            border rounded-lg text-sm font-medium
            focus:outline-none transition-all
            ${isOpen 
              ? 'border-pink-500 ring-2 ring-pink-500/20' 
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }
            text-slate-800 dark:text-white placeholder:text-slate-400
          `}
        />
        <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
          <Search size={16} />
        </div>
        {isOpen && (
          <div className="absolute top-2.5 right-3 cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setIsOpen(false)}>
             <ChevronDown size={16} />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
          {filteredSongs.length === 0 ? (
            <div className="p-4 text-center">
               <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Nenhuma música encontrada.</p>
               <p className="text-[10px] text-slate-400 mt-1">Vá em "Músicas" para cadastrar novas.</p>
            </div>
          ) : (
            <div className="py-1">
              {filteredSongs.map(song => (
                <div 
                  key={song.id}
                  onClick={() => {
                    onSelect(song.id);
                    setSearch('');
                    setIsOpen(false);
                  }}
                  className="px-3 py-2.5 hover:bg-pink-50 dark:hover:bg-pink-900/10 cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors truncate">
                        {song.title}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide truncate">
                        {song.artist}
                        {song.key && <span className="ml-1.5 text-slate-300 dark:text-slate-600">• {song.key}</span>}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} className="text-pink-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Schedule: React.FC<ScheduleProps> = ({ schedule, allMembers, allSongs, onDeleteScheduleItem, onClear, onUpdateScheduleItem, readOnly = false }) => {
  // Estado para controlar qual item está aberto no Modal
  const [viewItem, setViewItem] = useState<ScheduleItem | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<{ 
      musicians: string[], 
      singers: string[], 
      songs: string[],
      worshipLeaderId: string | null,
      backupSingerId: string | null
  }>({ musicians: [], singers: [], songs: [], worshipLeaderId: null, backupSingerId: null });
  
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
      songs: validSongs,
      worshipLeaderId: item.worshipLeaderId || null,
      backupSingerId: item.backupSinger?.id || null
    });
  };

  const closeModal = () => {
      setViewItem(null);
      setEditingId(null);
  };

  const handleSave = (item: ScheduleItem) => {
    const updatedMusicians = editState.musicians.map(id => allMembers.find(m => m.id === id)).filter(Boolean) as Member[];
    const updatedSingers = editState.singers.map(id => allMembers.find(m => m.id === id)).filter(Boolean) as Member[];
    
    // Garante que o ministro esteja entre os cantores (se o usuário removeu o ministro da lista de vocal, limpa)
    let finalLeaderId = editState.worshipLeaderId;
    if (finalLeaderId && !editState.singers.includes(finalLeaderId)) {
        finalLeaderId = null; // Reset if invalid
    }

    const updatedBackupSinger = editState.backupSingerId ? allMembers.find(m => m.id === editState.backupSingerId) : undefined;

    const updatedItem = {
      ...item,
      musicians: updatedMusicians,
      singers: updatedSingers,
      songs: editState.songs,
      worshipLeaderId: finalLeaderId || undefined,
      backupSinger: updatedBackupSinger
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
    
    // Se mudou o cantor e ele era o ministro, talvez precise resetar? 
    // Por enquanto deixamos flexível, validamos no Save.
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
    const eCrown = '\uD83D\uDC51';
    
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
      item.singers.forEach(s => {
          const isLeader = s.id === item.worshipLeaderId;
          text += `• ${s.name} ${isLeader ? eCrown : ''}\n`
      });
    } else { text += `_Nenhum vocal definido_\n`; }
    
    if (item.backupSinger) {
        text += `_Reserva: ${item.backupSinger.name}_\n`;
    }
    text += `\n`;

    text += `*${eNotes} LOUVORES:*\n`;
    if (item.songs && item.songs.length > 0) {
       item.songs.forEach(songId => {
         const song = allSongs.find(s => s.id === songId);
         if (song) {
             text += `• ${song.title} - ${song.artist}`;
             // Adiciona a tonalidade se houver
             if (song.key) {
                 text += ` (Tom: ${song.key})`;
             }
             text += `\n`;
             
             // Prioriza explicitamente o link do YouTube
             if (song.youtubeLink) {
                 text += `  Assista: ${song.youtubeLink}\n`;
             }
         }
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          {/* Navegador de Mês */}
          <div className="flex items-center gap-4">
              <button 
                  onClick={() => changeMonth(-1)}
                  className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                  <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-black text-slate-800 dark:text-white capitalize min-w-[150px] text-center">
                  {MONTH_NAMES[currentDate.getMonth()]} <span className="text-slate-400 font-medium">{currentDate.getFullYear()}</span>
              </h3>
              <button 
                  onClick={() => changeMonth(1)}
                  className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                  <ChevronRight size={20} />
              </button>
          </div>

          <button onClick={onClear} className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <Trash2 size={16} /> Limpar Tudo (Banco de Dados)
          </button>
        </div>
      )}

      {/* GRID DE CARDS COMPACTOS */}
      {filteredSchedule.length === 0 ? (
        <div className="py-24 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800">
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
                        className="group relative bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between h-48"
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
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-md">
                                <Clock size={12} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{dateInfo.time}</span>
                            </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex justify-around">
                             <button 
                                onClick={(e) => { e.stopPropagation(); startEditing(item); }} 
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                                title="Editar"
                             >
                                <Edit3 size={16} />
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleShare(item); }} 
                                className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors"
                                title="Compartilhar"
                             >
                                <Share2 size={16} />
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteScheduleItem(item.id); }} 
                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
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
              
              <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700">
                  
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
                      <button onClick={closeModal} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors">
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
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl w-full border border-slate-100 dark:border-slate-800">
                                        <span className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">{dateInfo.month}</span>
                                        <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 block">{dateInfo.day}</span>
                                        <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700 w-full">
                                            <Clock size={14} className="text-slate-400" />
                                            <span className="text-xs font-black text-slate-600 dark:text-slate-300">{dateInfo.time}</span>
                                        </div>
                                    </div>

                                    {!readOnly && (
                                        <div className="flex flex-col gap-2 mt-6 w-full">
                                            {isEditing ? (
                                                <button onClick={() => handleSave(viewItem)} className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-500/30 transition-all font-bold flex items-center justify-center gap-2">
                                                    <Save size={18} /> Salvar
                                                </button>
                                            ) : (
                                                <button onClick={() => startEditing(viewItem)} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all font-bold flex items-center justify-center gap-2">
                                                    <Edit3 size={18} /> Editar
                                                </button>
                                            )}
                                            <button onClick={() => handleShare(viewItem)} className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-green-600 rounded-lg transition-all font-bold flex items-center justify-center gap-2">
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
                                                        <MemberSelect
                                                            key={inst}
                                                            label={inst}
                                                            value={editState.musicians[idx] || ''}
                                                            options={allMembers.filter(m => m.role === 'musician' && m.instruments?.includes(inst))}
                                                            onChange={(newVal) => updateMusician(idx, newVal)}
                                                        />
                                                    ))
                                                ) : (
                                                    viewItem.musicians.length > 0 ? viewItem.musicians.map(m => (
                                                        <div key={m.id} className="flex items-center gap-4 group/item">
                                                            <div className="relative">
                                                                {m.photoUrl ? (
                                                                    <img src={m.photoUrl} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-500/20">
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
                                                    <>
                                                        {[0, 1, 2].map((idx) => {
                                                            const singerId = editState.singers[idx] || '';
                                                            const isLeader = singerId && editState.worshipLeaderId === singerId;

                                                            return (
                                                                <div key={idx} className="flex items-end gap-2">
                                                                    <div className="flex-1">
                                                                        <MemberSelect
                                                                            label={`Vocal ${idx + 1}`}
                                                                            value={singerId}
                                                                            options={allMembers.filter(m => m.role === 'singer')}
                                                                            onChange={(newVal) => updateSinger(idx, newVal)}
                                                                        />
                                                                    </div>
                                                                    {singerId && (
                                                                        <button
                                                                            onClick={() => setEditState(prev => ({...prev, worshipLeaderId: isLeader ? null : singerId }))}
                                                                            className={`mb-[10px] p-2 rounded-lg border transition-all ${isLeader ? 'bg-amber-100 border-amber-300 text-amber-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-300 hover:text-amber-500 hover:border-amber-200'}`}
                                                                            title={isLeader ? "Remover Ministro" : "Definir como Ministro"}
                                                                        >
                                                                            <Crown size={16} fill={isLeader ? "currentColor" : "none"} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        
                                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                                            <MemberSelect 
                                                                label="Cantor Reserva" 
                                                                value={editState.backupSingerId || ''} 
                                                                options={allMembers.filter(m => m.role === 'singer')} 
                                                                onChange={(newVal) => setEditState(prev => ({...prev, backupSingerId: newVal}))}
                                                                icon={<Shield size={10} />}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    // VIEW MODE SINGERS
                                                    <>
                                                        {viewItem.singers.length > 0 ? viewItem.singers.map(s => {
                                                            const isLeader = s.id === viewItem.worshipLeaderId;
                                                            return (
                                                                <div key={s.id} className={`flex items-center gap-4 p-2 rounded-lg ${isLeader ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30' : ''}`}>
                                                                    <div className="relative">
                                                                        {s.photoUrl ? (
                                                                            <img src={s.photoUrl} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                                                        ) : (
                                                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-black shadow-lg ${isLeader ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-purple-500 text-white shadow-purple-500/20'}`}>
                                                                                {getInitials(s.name)}
                                                                            </div>
                                                                        )}
                                                                        {isLeader && (
                                                                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                                                                                <Crown size={10} fill="currentColor" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                                            {s.name}
                                                                        </p>
                                                                        <p className="text-xs text-slate-400 mt-0.5">{isLeader ? 'Ministro de Louvor' : 'Vocal'}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }) : <p className="text-sm text-slate-400 italic">Nenhum vocal escalado.</p>}

                                                        {viewItem.backupSinger && (
                                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                                                        <Shield size={16} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reserva</p>
                                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{viewItem.backupSinger.name}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Songs Section */}
                                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-lg">
                                                    <Music2 size={18} />
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Repertório</h4>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    {editState.songs.map((songId, idx) => {
                                                        const song = allSongs.find(s => s.id === songId);
                                                        return (
                                                            <div key={idx} className="flex items-center gap-2">
                                                                <span className="text-xs font-black text-slate-300 w-4">{idx + 1}</span>
                                                                <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 flex items-center justify-between">
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{song?.title}</span>
                                                                    <button 
                                                                        onClick={() => {
                                                                            const newSongs = [...editState.songs];
                                                                            newSongs.splice(idx, 1);
                                                                            setEditState(prev => ({...prev, songs: newSongs}));
                                                                        }}
                                                                        className="text-slate-400 hover:text-red-500"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <div className="pl-6">
                                                        <SongSelect 
                                                            songs={allSongs} 
                                                            excludeIds={editState.songs} 
                                                            onSelect={(id) => setEditState(prev => ({...prev, songs: [...prev.songs, id]}))}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                viewItem.songs && viewItem.songs.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {viewItem.songs.map((songId, idx) => {
                                                            const song = allSongs.find(s => s.id === songId);
                                                            if (!song) return null;
                                                            return (
                                                                <div key={songId} className="group flex items-center gap-4 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg hover:border-pink-200 dark:hover:border-pink-900/50 transition-colors">
                                                                    <span className="text-xs font-black text-slate-300 w-4">{idx + 1}</span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{song.title}</p>
                                                                            {(song.youtubeLink || song.lyricsLink) && (
                                                                                <div className="flex gap-1">
                                                                                    {song.youtubeLink && <a href={song.youtubeLink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-red-500"><Youtube size={14} /></a>}
                                                                                    {song.lyricsLink && <a href={song.lyricsLink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-amber-500"><FileText size={14} /></a>}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-slate-400 uppercase tracking-wide truncate">{song.artist} {song.key && <span className="text-pink-500">• {song.key}</span>}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : <p className="text-sm text-slate-400 italic">Nenhum louvor definido.</p>
                                            )}
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