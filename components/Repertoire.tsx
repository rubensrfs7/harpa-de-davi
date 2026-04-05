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
    index: number;
    singer?: Member; 
    onEdit: (song: Song) => void; 
    onRemove: (id: string) => void; 
}> = ({ song, index, singer, onEdit, onRemove }) => {
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
        <div className="group relative bg-white dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-pink-500/50 transition-all duration-500 shadow-sm hover:shadow-xl overflow-hidden flex items-center p-3 gap-4">
            
            {/* Numbering & Thumb Container */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {/* Numbering */}
                <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 text-white font-black rounded-xl text-xs shadow-lg shadow-pink-500/30 ring-2 ring-white dark:ring-slate-800 z-10">
                    {index + 1}
                </div>

                {/* Square Thumb */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative shadow-inner">
                    {imgSrc ? (
                        <img 
                            src={imgSrc} 
                            alt={song.title} 
                            onError={handleImgError}
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLowQuality ? 'scale-[1.4]' : ''}`} 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                            <Music2 size={32} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                    <h4 className="font-black text-slate-800 dark:text-white truncate text-base sm:text-lg leading-tight group-hover:text-pink-500 transition-colors" title={song.title}>{song.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mt-1 truncate">{song.artist}</p>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                    {song.key && (
                        <span className="px-2.5 py-0.5 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[10px] font-black rounded-lg border border-pink-100 dark:border-pink-800/50 shadow-sm">
                            {song.key}
                        </span>
                    )}
                    {singer && (
                        <div className="flex items-center gap-2 px-2.5 py-0.5 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden border border-white dark:border-slate-600">
                                {singer.photoUrl ? (
                                    <img src={singer.photoUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[7px] font-black text-purple-500 uppercase">{getInitials(singer.name)}</span>
                                )}
                            </div>
                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 truncate max-w-[90px] uppercase tracking-tighter">
                                {singer.name.split(' ')[0]}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mt-3">
                    {song.lyricsLink && (
                        <a 
                            href={song.lyricsLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-orange-500 hover:text-orange-600 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95"
                        >
                            <div className="p-1 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                                <FileText size={12} />
                            </div>
                            Letra
                        </a>
                    )}
                    {song.youtubeLink && (
                        <a 
                            href={song.youtubeLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-red-500 hover:text-red-600 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95"
                        >
                            <div className="p-1 bg-red-50 dark:bg-red-900/20 rounded-md">
                                <Youtube size={12} />
                            </div>
                            Vídeo
                        </a>
                    )}
                </div>
            </div>

            {/* Actions (Vertical) */}
            <div className="flex flex-col gap-2 border-l border-slate-100 dark:border-slate-800 pl-3">
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(song); }}
                    className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all active:scale-90 shadow-sm border border-transparent hover:border-indigo-100"
                    title="Editar"
                >
                    <Edit size={18} />
                </button>
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(song.id); }}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all active:scale-90 shadow-sm border border-transparent hover:border-red-100"
                    title="Excluir"
                >
                    <Trash2 size={18} />
                </button>
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
      if (!override && key) return;
      if (!title.trim() || !artist.trim()) return;

      setIsDetectingKey(true);
      try {
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `Identify the original musical key of the song "${title}" by "${artist}". 
              Return ONLY the key in standard notation (e.g. C, Cm, C#, Db, etc). 
              If valid, choose one from this list: ${MUSICAL_KEYS.join(', ')}.
              If unsure, return nothing. Do not add any explanation.`,
          });
          
          const detected = response.text?.trim();
          if (detected) {
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
      if (editingId === id) cancelEditing();
      onRemoveSong(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    const songData: Song = {
      id: editingId ? editingId : crypto.randomUUID(),
      title: title.trim(),
      artist: artist.trim(),
      lyricsLink: lyricsLink.trim() || undefined,
      youtubeLink: youtubeLink.trim() || undefined,
      key: key || undefined,
      singerId: selectedSingerId || undefined,
    };

    if (editingId) onUpdateSong(songData);
    else onAddSong(songData);
    cancelEditing();
  };

  const isSearching = searchTerm.trim().length > 0;

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (!isSearching && selectedSingerFilter) {
        if (selectedSingerFilter === 'uncategorized') return !song.singerId;
        return song.singerId === selectedSingerFilter;
    }
    return true;
  });

  const singerOptions = (members || [])
    .filter(m => m.role === 'singer')
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

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
       <div className="flex items-center gap-4 mb-10">
            <div className="p-5 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl shadow-2xl shadow-pink-500/20">
                <Music2 size={32} />
            </div>
            <div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-none">Repertório</h2>
                <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Gestão de músicas e tonalidades</p>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-4">
          <div id="song-form" className={`bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl transition-all duration-500 sticky top-28 ${editingId ? 'border-pink-500 ring-8 ring-pink-500/5 shadow-pink-500/10' : 'border-slate-100 dark:border-slate-800 shadow-slate-200/50 dark:shadow-none border'}`}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 leading-tight">
                        {editingId ? 'Editar Música' : 'Nova Música'}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {editingId ? 'Atualize os dados da música' : 'Adicione ao acervo da equipe'}
                    </p>
                </div>
                {editingId && (
                    <button type="button" onClick={cancelEditing} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 rounded-xl transition-all active:scale-90 shadow-sm">
                        <X size={20} />
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Título</label>
                <div className="relative group">
                    <Music2 className="absolute left-4 top-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-pink-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold placeholder:text-slate-400 outline-none transition-all shadow-inner"
                        placeholder="Nome da música"
                        required
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Artista Original</label>
                <div className="relative group">
                    <Mic2 className="absolute left-4 top-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                    <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        onBlur={() => detectKey(false)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-pink-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold placeholder:text-slate-400 outline-none transition-all shadow-inner"
                        placeholder="Cantor ou Banda Original"
                        required
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                         <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Tom</label>
                         {title && artist && !isDetectingKey && (
                            <button 
                                type="button" 
                                onClick={() => detectKey(true)}
                                className="text-[9px] font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors uppercase tracking-widest"
                                title="Detectar tom com IA"
                            >
                                <Sparkles size={10} /> IA
                            </button>
                         )}
                    </div>
                    <div className="relative group">
                        {isDetectingKey ? (
                             <Loader2 className="absolute left-3 top-4 text-indigo-500 animate-spin" size={18} />
                        ) : (
                             <Music className="absolute left-3 top-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                        )}
                        <select
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            disabled={isDetectingKey}
                            className={`w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-pink-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-black outline-none transition-all appearance-none shadow-inner ${isDetectingKey ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <option value="">-</option>
                            {MUSICAL_KEYS.map(k => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Quem Canta</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                        <select
                            value={selectedSingerId}
                            onChange={(e) => setSelectedSingerId(e.target.value)}
                            className="w-full pl-10 pr-2 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-pink-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-black outline-none transition-all appearance-none text-xs shadow-inner uppercase tracking-tighter"
                        >
                            <option value="">--</option>
                            {singerOptions.map(singer => (
                                <option key={singer.id} value={singer.id}>{singer.name.split(' ')[0]}</option>
                            ))}
                        </select>
                    </div>
                  </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Link Letra</label>
                <div className="relative group">
                    <FileText className="absolute left-4 top-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                    <input
                        type="url"
                        value={lyricsLink}
                        onChange={(e) => setLyricsLink(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-pink-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all shadow-inner"
                        placeholder="https://..."
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Link Vídeo</label>
                <div className="relative group">
                    <Youtube className="absolute left-4 top-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                    <input
                        type="url"
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-pink-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all shadow-inner"
                        placeholder="https://..."
                    />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full font-black py-5 rounded-2xl transition-all shadow-2xl active:scale-[0.98] mt-4 flex items-center justify-center gap-3 text-sm uppercase tracking-widest ${
                    editingId 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-500/30' 
                    : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-slate-900/20'
                }`}
              >
                {editingId ? <Save size={20} /> : <Plus size={20} />}
                {editingId ? 'Salvar Alterações' : 'Adicionar ao Acervo'}
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-8">
             <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-10 min-h-[600px] shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-2xl">
                          <span className="text-3xl font-black text-pink-600 dark:text-pink-400">{songs.length}</span>
                       </div>
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-tight">Músicas no<br/>Acervo</span>
                    </div>
                    <div className="relative w-full sm:max-w-xs group">
                        <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Pesquisar no acervo..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-5 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:border-pink-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* VISUALIZAÇÃO DE PASTAS DE CANTORES */}
                {!isSearching && !selectedSingerFilter ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2 mb-6">
                            <Folder size={16} className="text-pink-500" /> Pastas por Cantor
                        </h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {/* Card "Sem Cantor" */}
                            {uncategorizedCount > 0 && (
                                <button 
                                    onClick={() => setSelectedSingerFilter('uncategorized')}
                                    className="flex flex-col items-center justify-center gap-4 p-8 bg-white dark:bg-slate-800/50 rounded-3xl border-2 border-slate-50 dark:border-slate-800 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-2xl hover:shadow-pink-500/10 transition-all group active:scale-95"
                                >
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                        <Music size={32} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight">Geral</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{uncategorizedCount} músicas</p>
                                    </div>
                                </button>
                            )}

                            {/* Cards dos Cantores */}
                            {singersWithSongs.map(singer => (
                                <button 
                                    key={singer.id}
                                    onClick={() => setSelectedSingerFilter(singer.id)}
                                    className="flex flex-col items-center justify-center gap-4 p-8 bg-white dark:bg-slate-800/50 rounded-3xl border-2 border-slate-50 dark:border-slate-800 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-2xl hover:shadow-pink-500/10 transition-all group active:scale-95"
                                >
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 group-hover:border-pink-500 transition-all duration-500 shadow-xl">
                                        {singer.photoUrl ? (
                                            <img src={singer.photoUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-400 text-sm font-black uppercase">
                                                {getInitials(singer.name)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight truncate max-w-[120px]">{singer.name.split(' ')[0]}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{groupedSongs[singer.id]} músicas</p>
                                    </div>
                                </button>
                            ))}

                            {singersWithSongs.length === 0 && uncategorizedCount === 0 && (
                                <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <Music2 className="mx-auto mb-4 opacity-20" size={64} />
                                    <p className="text-sm font-black uppercase tracking-widest">Nenhuma música cadastrada</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* CABEÇALHO DA LISTA FILTRADA */}
                        {!isSearching && selectedSingerFilter && (
                             <div className="flex items-center gap-5 mb-8">
                                <button 
                                    onClick={() => setSelectedSingerFilter(null)}
                                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-pink-500 hover:text-white transition-all text-slate-500 dark:text-slate-300 shadow-sm active:scale-90"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                                        {selectedSingerFilter === 'uncategorized' ? 'Geral / Outros' : members.find(m => m.id === selectedSingerFilter)?.name}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Exibindo {filteredSongs.length} músicas</p>
                                </div>
                             </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {filteredSongs.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30">
                                    <Music2 className="mx-auto mb-4 opacity-10" size={64} />
                                    <p className="text-sm font-black uppercase tracking-widest">Nenhuma música encontrada</p>
                                </div>
                            ) : (
                                filteredSongs.map((song, index) => {
                                    const singer = members.find(m => m.id === song.singerId);
                                    return (
                                        <SongCard 
                                            key={song.id} 
                                            song={song} 
                                            index={index}
                                            singer={singer} 
                                            onEdit={startEditing} 
                                            onRemove={handleRemoveClick} 
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default Repertoire;