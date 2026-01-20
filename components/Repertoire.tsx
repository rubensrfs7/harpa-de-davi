
import React, { useState } from 'react';
import { Plus, Music2, Youtube, FileText, Trash2, Search, Mic2 } from 'lucide-react';
import { Song } from '../types';

interface RepertoireProps {
  songs: Song[];
  onAddSong: (song: Song) => void;
  onRemoveSong: (id: string) => void;
}

const Repertoire: React.FC<RepertoireProps> = ({ songs, onAddSong, onRemoveSong }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyricsLink, setLyricsLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    const newSong: Song = {
      id: crypto.randomUUID(),
      title: title.trim(),
      artist: artist.trim(),
      lyricsLink: lyricsLink.trim() || undefined,
      youtubeLink: youtubeLink.trim() || undefined,
    };

    onAddSong(newSong);
    setTitle('');
    setArtist('');
    setLyricsLink('');
    setYoutubeLink('');
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-[2rem] shadow-xl shadow-pink-500/20 transform -rotate-3">
                <Music2 size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Repertório</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Gestão de músicas e links</p>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-4">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-white/50 dark:border-slate-700/50 sticky top-28">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><Plus size={16} /></span>
              Nova Música
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Título</label>
                <div className="relative">
                    <Music2 className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold placeholder:text-slate-400 outline-none transition-all"
                        placeholder="Nome da música"
                        required
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Artista</label>
                <div className="relative">
                    <Mic2 className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold placeholder:text-slate-400 outline-none transition-all"
                        placeholder="Cantor ou Banda"
                        required
                    />
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
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all"
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
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all"
                        placeholder="https://..."
                    />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 mt-2"
              >
                Salvar no Acervo
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-8">
             <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 min-h-[500px]">
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
                            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-pink-500/20 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredSongs.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                            Nenhuma música encontrada.
                        </div>
                    ) : (
                        filteredSongs.map(song => (
                            <div key={song.id} className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/5 transition-all duration-300">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="pr-8">
                                        <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1 text-lg" title={song.title}>{song.title}</h4>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{song.artist}</p>
                                    </div>
                                    <button 
                                        onClick={() => onRemoveSong(song.id)}
                                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <div className="flex gap-2 mt-auto">
                                    {song.lyricsLink ? (
                                        <a 
                                            href={song.lyricsLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-100 transition-colors"
                                        >
                                            <FileText size={14} /> Letra
                                        </a>
                                    ) : <div className="flex-1"></div>}
                                    
                                    {song.youtubeLink ? (
                                        <a 
                                            href={song.youtubeLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 transition-colors"
                                        >
                                            <Youtube size={14} /> Vídeo
                                        </a>
                                    ) : <div className="flex-1"></div>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Repertoire;
