import React, { useState } from 'react';
import { Plus, Music2, Youtube, FileText, Trash2, Search, Mic2, Edit, X, Save, Music, User, Folder, ChevronLeft, LayoutGrid, List, Sparkles, Loader2 } from 'lucide-react';
import { Song, Member } from '../types';
import { GoogleGenAI } from "@google/genai";

interface RepertoireProps {
  songs: Song[];
  members: Member[];
  onAddSong: (song: Song) => void;
  onUpdateSong: (song: Song) => void;
  onRemoveSong: (id: string) => void;
}

const MUSICAL_KEYS = [
  'C', 'Cm', 'C#', 'C#m', 'D', 'Dm', 'Eb', 'Ebm', 'E', 'Em', 'F', 'Fm', 
  'F#', 'F#m', 'G', 'Gm', 'Ab', 'Abm', 'A', 'Am', 'Bb', 'Bbm', 'B', 'Bm'
];

// Helper functions outside component
const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Subcomponente para Card de Música
const SongCard: React.FC<{ 
    song: Song; 
    singer?: Member; 
    onEdit: (song: Song) => void; 
    onRemove: (id: string) => void; 
}> = ({ song, singer, onEdit, onRemove }) => {
    const videoId = getYoutubeId(song.youtubeLink || '');
    const [imgSrc, setImgSrc] = useState(videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
    const [isLowQuality, setIsLowQuality] = useState(false);

    const handleImgError = () => {
        if (!isLowQuality && videoId) {
            setIsLowQuality(true);
            setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
        }
    };

    return (
        <div className="group relative bg-[#0f172a] rounded-xl border border-slate-800 hover:border-pink-500/50 transition-all duration-300 shadow-lg shadow-black/20 overflow-hidden h-[220px] flex flex-col justify-between isolate">
            
            {/* Action Buttons (Top Right) - High Z-Index & Clickable */}
            <div className="absolute top-4 right-4 flex gap-2 z-30 pointer-events-auto">
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(song); }}
                    className="p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg text-slate-200 hover:text-white border border-white/10 transition-all shadow-lg hover:scale-105 active:scale-95"
                    title="Editar"
                >
                    <Edit size={18} />
                </button>
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(song.id); }}
                    className="p-2.5 bg-black/40 hover:bg-red-500/90 backdrop-blur-md rounded-lg text-slate-200 hover:text-white border border-white/10 transition-all shadow-lg hover:scale-105 active:scale-95"
                    title="Excluir (Deletar do Banco)"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Background Image Layer */}
            {imgSrc ? (
                <>
                    <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden">
                        <img 
                            src={imgSrc} 
                            alt={song.title} 
                            onError={handleImgError}
                            className={`w-full h-full object-cover bg-center transition-transform duration-700 opacity-60 group-hover:opacity-100 ${isLowQuality ? 'scale-[1.35]' : 'group-hover:scale-110'}`} 
                        />
                    </div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none"></div>
                </>
            ) : (
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 to-slate-950"></div>
            )}

            {/* Content Container */}
            <div className="relative z-10 p-5 flex flex-col h-full justify-between pointer-events-none">
                
                {/* Header Content */}
                <div className="pr-20 pt-1">
                    <h4 className="font-bold text-white line-clamp-2 text-xl drop-shadow-lg leading-tight" title={song.title}>{song.title}</h4>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mt-1 drop-shadow-md">{song.artist}</p>
                </div>
                
                {/* Body Content (Bottom) */}
                <div className="mt-auto space-y-4 pointer-events-auto">
                    {/* Info Badges Row */}
                    <div className="flex items-center gap-3">
                        {/* Key Badge */}
                        {song.key && (
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-500 text-white font-black text-sm shadow-lg shadow-pink-500/30" title={`Tom: ${song.key}`}>
                                {song.key}
                            </div>
                        )}
                        
                        {/* Singer Badge */}
                        {singer && (
                            <div className="flex items-center gap-2 pl-1 pr-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                                <div className="w-7 h-7 rounded-full bg-purple-900/50 overflow-hidden flex items-center justify-center border border-purple-500/30">
                                    {singer.photoUrl ? (
                                        <img src={singer.photoUrl} alt={singer.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[9px] font-bold text-purple-300">{getInitials(singer.name)}</span>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-slate-200 truncate max-w-[100px]">
                                    {singer.name.split(' ')[0]}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex gap-3">
                        {song.lyricsLink ? (
                            <a 
                                href={song.lyricsLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg bg-black/60 backdrop-blur-sm text-orange-400 hover:bg-orange-900/40 hover:text-orange-300 transition-colors border border-orange-500/30 hover:border-orange-500/50"
                            >
                                <FileText size={16} /> Letra
                            </a>
                        ) : <div className="flex-1"></div>}
                        
                        {song.youtubeLink ? (
                            <a 
                                href={song.youtubeLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg bg-black/60 backdrop-blur-sm text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors border border-red-500/30 hover:border-red-500/50"
                            >
                                <Youtube size={16} /> Vídeo
                            </a>
                        ) : <div className="flex-1"></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Repertoire: React.FC<RepertoireProps> = ({ songs, members, onAddSong, onUpdateSong, onRemoveSong }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyricsLink, setLyricsLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [key, setKey] = useState('');
  const [selectedSingerId, setSelectedSingerId] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDetectingKey, setIsDetectingKey] = useState(false);
  
  // Estado para navegação por pastas
  const [selectedSingerFilter, setSelectedSingerFilter] = useState<string | 'uncategorized' | null>(null);

  const detectKey = async (override = false) => {
      // Se não for override (manual), só busca se o campo estiver vazio
      if (!override && key) return;
      if (!title.trim() || !artist.trim()) return;

      setIsDetectingKey(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `Identify the original musical key of the song "${title}" by "${artist}". 
              Return ONLY the key in standard notation (e.g. C, Cm, C#, Db, etc). 
              If valid, choose one from this list: ${MUSICAL_KEYS.join(', ')}.
              If unsure, return nothing. Do not add any explanation.`,
          });
          
          const detected = response.text?.trim();
          if (detected) {
               // Normalização simples e verificação
               const match = MUSICAL_KEYS.find(k => k.toLowerCase() === detected.toLowerCase());
               if (match) setKey(match);
          }
      } catch (error) {
          console.error("Erro ao detectar tom:", error);
      } finally {
          setIsDetectingKey(false);
      }
  };

  const startEditing = (song: Song) => {
    setEditingId(song.id);
    setTitle(song.title);
    setArtist(song.artist);
    setLyricsLink(song.lyricsLink || '');
    setYoutubeLink(song.youtubeLink || '');
    setKey(song.key || '');
    setSelectedSingerId(song.singerId || '');
    
    // Rola para o topo para ver o formulário
    const formElement = document.getElementById('song-form');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTitle('');
    setArtist('');
    setLyricsLink('');
    setYoutubeLink('');
    setKey('');
    setSelectedSingerId('');
    setIsDetectingKey(false);
  };

  const handleRemoveClick = (id: string) => {
      // Se estiver editando a música que será removida, limpa o form
      if (editingId === id) {
          cancelEditing();
      }
      onRemoveSong(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    // Constrói o objeto Song. Importante: Manter o ID se estiver editando.
    const songData: Song = {
      id: editingId ? editingId : crypto.randomUUID(), // Temporário se for add, será substituído pelo DB
      title: title.trim(),
      artist: artist.trim(),
      lyricsLink: lyricsLink.trim() || undefined,
      youtubeLink: youtubeLink.trim() || undefined,
      key: key || undefined,
      singerId: selectedSingerId || undefined,
    };

    if (editingId) {
        onUpdateSong(songData);
    } else {
        onAddSong(songData);
    }
    cancelEditing();
  };

  // Lógica de Filtragem
  // Se houver busca, ignora as pastas e mostra tudo que combina
  const isSearching = searchTerm.trim().length > 0;

  const filteredSongs = songs.filter(song => {
    // 1. Filtro de Texto (Search)
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // 2. Filtro de Pasta (Singer) - Apenas se NÃO estiver pesquisando
    if (!isSearching && selectedSingerFilter) {
        if (selectedSingerFilter === 'uncategorized') {
            return !song.singerId;
        }
        return song.singerId === selectedSingerFilter;
    }

    return true;
  });

  const singerOptions = (members || [])
    .filter(m => m.role === 'singer')
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Agrupamento para as pastas
  const groupedSongs = songs.reduce((acc, song) => {
      const sId = song.singerId || 'uncategorized';
      if (!acc[sId]) acc[sId] = 0;
      acc[sId]++;
      return acc;
  }, {} as Record<string, number>);

  const singersWithSongs = Object.keys(groupedSongs).filter(id => id !== 'uncategorized').map(id => {
      return members.find(m => m.id === id);
  }).filter(Boolean) as Member[];

  const uncategorizedCount = groupedSongs['uncategorized'] || 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-xl shadow-xl shadow-pink-500/20">
                <Music2 size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Repertório</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Gestão de músicas e tonalidades</p>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-4">
          <div id="song-form" className={`bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-xl shadow-xl shadow-slate-200/40 dark:shadow-none border transition-all sticky top-28 ${editingId ? 'border-pink-500 ring-4 ring-pink-500/10' : 'border-white/50 dark:border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {editingId ? (
                        <>
                            <span className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg"><Edit size={16} /></span>
                            Editar Música
                        </>
                    ) : (
                        <>
                            <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><Plus size={16} /></span>
                            Nova Música
                        </>
                    )}
                </h3>
                {editingId && (
                    <button type="button" onClick={cancelEditing} className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Título</label>
                <div className="relative">
                    <Music2 className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-md focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold placeholder:text-slate-400 outline-none transition-all"
                        placeholder="Nome da música"
                        required
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Artista Original</label>
                <div className="relative">
                    <Mic2 className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        onBlur={() => detectKey(false)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-md focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold placeholder:text-slate-400 outline-none transition-all"
                        placeholder="Cantor ou Banda Original"
                        required
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tom</label>
                         {/* Manual trigger for AI Key detection */}
                         {title && artist && !isDetectingKey && (
                            <button 
                                type="button" 
                                onClick={() => detectKey(true)}
                                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                title="Detectar tom com IA"
                            >
                                <Sparkles size={10} /> IA
                            </button>
                         )}
                    </div>
                    <div className="relative">
                        {isDetectingKey ? (
                             <Loader2 className="absolute left-3 top-3.5 text-indigo-500 animate-spin" size={16} />
                        ) : (
                             <Music className="absolute left-3 top-3.5 text-slate-400" size={16} />
                        )}
                        <select
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            disabled={isDetectingKey}
                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-md focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold outline-none transition-all appearance-none ${isDetectingKey ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <option value="">-</option>
                            {MUSICAL_KEYS.map(k => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Quem Canta</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-slate-400" size={16} />
                        <select
                            value={selectedSingerId}
                            onChange={(e) => setSelectedSingerId(e.target.value)}
                            className="w-full pl-10 pr-2 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-md focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold outline-none transition-all appearance-none text-sm"
                        >
                            <option value="">--</option>
                            {singerOptions.map(singer => (
                                <option key={singer.id} value={singer.id}>{singer.name.split(' ')[0]}</option>
                            ))}
                        </select>
                    </div>
                  </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Link Letra</label>
                <div className="relative">
                    <FileText className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                        type="url"
                        value={lyricsLink}
                        onChange={(e) => setLyricsLink(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-md focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all"
                        placeholder="https://..."
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Link Vídeo</label>
                <div className="relative">
                    <Youtube className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                        type="url"
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-md focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all"
                        placeholder="https://..."
                    />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full font-bold py-4 rounded-lg transition-all shadow-lg active:scale-95 mt-2 flex items-center justify-center gap-2 ${
                    editingId 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-500/30' 
                    : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900'
                }`}
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? 'Salvar Alterações' : 'Adicionar ao Acervo'}
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-8">
             <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 p-8 min-h-[500px]">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-black text-slate-800 dark:text-white">{songs.length}</span>
                       <span className="text-sm font-bold text-slate-400 uppercase">Músicas cadastradas</span>
                    </div>
                    <div className="relative w-full sm:max-w-xs group">
                        <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Pesquisar no acervo..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-pink-500/20 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* VISUALIZAÇÃO DE PASTAS DE CANTORES */}
                {!isSearching && !selectedSingerFilter ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Folder size={14} /> Pastas por Cantor
                        </h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* Card "Sem Cantor" (se houver músicas) */}
                            {uncategorizedCount > 0 && (
                                <button 
                                    onClick={() => setSelectedSingerFilter('uncategorized')}
                                    className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 group-hover:text-pink-500 transition-colors">
                                        <Music size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Geral / Outros</p>
                                        <p className="text-xs text-slate-400 mt-1">{uncategorizedCount} músicas</p>
                                    </div>
                                </button>
                            )}

                            {/* Cards dos Cantores */}
                            {singersWithSongs.map(singer => (
                                <button 
                                    key={singer.id}
                                    onClick={() => setSelectedSingerFilter(singer.id)}
                                    className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-pink-500 transition-all">
                                        {singer.photoUrl ? (
                                            <img src={singer.photoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">
                                                {getInitials(singer.name)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate max-w-[120px]">{singer.name}</p>
                                        <p className="text-xs text-slate-400 mt-1">{groupedSongs[singer.id]} músicas</p>
                                    </div>
                                </button>
                            ))}

                            {/* Estado vazio se não houver nenhuma música */}
                            {singersWithSongs.length === 0 && uncategorizedCount === 0 && (
                                <div className="col-span-full py-10 text-center text-slate-400">
                                    <p className="text-sm">Nenhuma música cadastrada ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* CABEÇALHO DA LISTA FILTRADA (PASTA OU BUSCA) */}
                        {!isSearching && selectedSingerFilter && (
                             <div className="flex items-center gap-4 mb-6 animate-in slide-in-from-left-2">
                                <button 
                                    onClick={() => setSelectedSingerFilter(null)}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-300"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        {selectedSingerFilter === 'uncategorized' ? 'Geral / Outros' : members.find(m => m.id === selectedSingerFilter)?.name}
                                    </h3>
                                    <p className="text-xs text-slate-400">Exibindo {filteredSongs.length} músicas</p>
                                </div>
                             </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredSongs.length === 0 ? (
                                <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                    <Music2 className="mx-auto mb-2 opacity-20" size={48} />
                                    <p className="text-sm font-medium">Nenhuma música encontrada.</p>
                                </div>
                            ) : (
                                filteredSongs.map(song => {
                                    const singer = members.find(m => m.id === song.singerId);
                                    return (
                                        <SongCard 
                                            key={song.id} 
                                            song={song} 
                                            singer={singer} 
                                            onEdit={startEditing} 
                                            onRemove={handleRemoveClick} 
                                        />
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default Repertoire;