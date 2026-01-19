import React, { useState } from 'react';
import { Plus, Music2, Youtube, FileText, Trash2, Search, ExternalLink, Mic2 } from 'lucide-react';
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
    <div className="animate-in slide-in-from-right-4 fade-in duration-500">
       <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl">
                <Music2 size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Repertório Digital</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie as músicas, letras e versões</p>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 transition-all hover:shadow-md sticky top-28">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
              <span className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><Plus size={16} /></span>
              Nova Música
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Nome da Música</label>
                <div className="relative">
                    <Music2 className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all"
                        placeholder="Ex: Porque Ele Vive"
                        required
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Cantor / Banda</label>
                <div className="relative">
                    <Mic2 className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all"
                        placeholder="Ex: Harpa Cristã"
                        required
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Link da Letra</label>
                <div className="relative">
                    <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                        type="url"
                        value={lyricsLink}
                        onChange={(e) => setLyricsLink(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all"
                        placeholder="https://letras.mus.br/..."
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Link do YouTube (Versão)</label>
                <div className="relative">
                    <Youtube className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                        type="url"
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 outline-none transition-all"
                        placeholder="https://youtube.com/..."
                    />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 dark:bg-pink-600 hover:bg-slate-800 dark:hover:bg-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-slate-900/10 dark:shadow-pink-500/20 active:scale-[0.98] mt-2"
              >
                Salvar Música
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-8">
             <div className="bg-white dark:bg-slate-900/50 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-6 min-h-[500px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Biblioteca ({songs.length})</h3>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar música..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredSongs.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-slate-400">
                            Nenhuma música encontrada.
                        </div>
                    ) : (
                        filteredSongs.map(song => (
                            <div key={song.id} className="group relative bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-pink-200 dark:hover:border-pink-900/50 transition-all hover:shadow-md">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="pr-6">
                                        <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1" title={song.title}>{song.title}</h4>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{song.artist}</p>
                                    </div>
                                    <button 
                                        onClick={() => onRemoveSong(song.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <div className="flex gap-2 mt-3">
                                    {song.lyricsLink && (
                                        <a 
                                            href={song.lyricsLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                                        >
                                            <FileText size={12} /> Letra
                                        </a>
                                    )}
                                    {song.youtubeLink && (
                                        <a 
                                            href={song.youtubeLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                        >
                                            <Youtube size={12} /> Versão
                                        </a>
                                    )}
                                    {!song.lyricsLink && !song.youtubeLink && (
                                        <span className="text-[10px] text-slate-300 italic py-1.5">Sem links cadastrados</span>
                                    )}
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