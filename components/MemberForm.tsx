import React, { useState, useRef, useEffect } from 'react';
import { Plus, Music, Mic, Drum, Camera, X, CalendarClock, UserCheck, UserX, Save, Ban, Trash2, AlertTriangle } from 'lucide-react';
import { Member, Role } from '../types';

// Custom Icons
const PianoIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M6 5v10" /><path d="M10 5v10" /><path d="M14 5v10" /><path d="M18 5v10" /><path d="M2 15h20" />
  </svg>
);
const BassIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 15.5c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5 2-4.5 4.5-4.5 4.5 2 4.5 4.5z" />
    <path d="M9 12l10-10" /><path d="M17 2l3 3" /><path d="M18.5 3.5l1.5 1.5" /><path d="M7 16a1 1 0 100-2 1 1 0 000 2z" /><path d="M5 15a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);
const ElectricGuitarIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M13 14c0 3-2.5 5-5.5 5S2 17 2 14s2.5-5 5.5-5 5.5 2 5.5 5z" />
    <path d="M11 10.5L20 1.5" /><path d="M18.5 0l4 4" /><path d="M13 12l1-1" />
  </svg>
);
const AcousticGuitarIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5z" />
    <path d="M12 9l8-8" /><path d="M19 0l4 4" /><circle cx="9" cy="13" r="1.5" />
  </svg>
);

interface MemberFormProps {
  onAdd: (member: Member) => void;
  onUpdate: (member: Member) => void;
  editingMember: Member | null;
  onCancelEdit: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ onAdd, onUpdate, editingMember, onCancelEdit }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('musician');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [observation, setObservation] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [onlyWeekends, setOnlyWeekends] = useState(false);
  const [noWednesdays, setNoWednesdays] = useState(false);
  const [noFridays, setNoFridays] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setRole(editingMember.role);
      setSelectedInstruments(editingMember.instruments || []);
      setObservation(editingMember.observation || '');
      setPhotoUrl(editingMember.photoUrl || '');
      setOnlyWeekends(editingMember.onlyWeekends || false);
      setNoWednesdays(editingMember.noWednesdays || false);
      setNoFridays(editingMember.noFridays || false);
      setIsSuspended(editingMember.isSuspended || false);
      setValidationError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      resetForm();
    }
  }, [editingMember]);

  const resetForm = () => {
    setName('');
    setRole('musician');
    setSelectedInstruments([]);
    setObservation('');
    setPhotoUrl('');
    setOnlyWeekends(false);
    setNoWednesdays(false);
    setNoFridays(false);
    setIsSuspended(false);
    setValidationError(null);
  };

  const PREDEFINED_INSTRUMENTS = [
    { id: 'Teclado', icon: PianoIcon },
    { id: 'Violão', icon: AcousticGuitarIcon },
    { id: 'Bateria', icon: Drum },
    { id: 'Baixo', icon: BassIcon },
    { id: 'Guitarra', icon: ElectricGuitarIcon },
  ];

  const handleToggleInstrument = (id: string) => {
    setValidationError(null);
    setSelectedInstruments(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1572864) {
        alert("A imagem é muito grande (limite de 1.5MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError("O nome do integrante é obrigatório.");
      return;
    }

    if (role === 'musician' && selectedInstruments.length === 0) {
      setValidationError("Selecione pelo menos um instrumento.");
      return;
    }

    const memberData: Member = {
      id: editingMember ? editingMember.id : crypto.randomUUID(),
      name: name.trim(),
      role,
      instruments: role === 'musician' ? selectedInstruments : undefined,
      observation: observation.trim() || undefined,
      photoUrl: photoUrl || undefined,
      onlyWeekends,
      noWednesdays,
      noFridays,
      isSuspended
    };

    if (editingMember) {
      onUpdate(memberData);
    } else {
      onAdd(memberData);
    }
    resetForm();
  };

  return (
    <div className={`bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border transition-all duration-500 ${editingMember ? 'border-indigo-500 ring-8 ring-indigo-500/5 shadow-2xl shadow-indigo-500/10' : 'border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none'}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 leading-tight">
                {editingMember ? 'Editar Integrante' : 'Novo Integrante'}
            </h3>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                {editingMember ? 'Atualize as informações do membro' : 'Adicione um novo membro à equipe'}
            </p>
        </div>
        {editingMember && (
          <button 
            onClick={onCancelEdit} 
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 rounded-xl transition-all active:scale-90 shadow-sm"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Foto */}
        <div className="flex justify-center">
          <div className="relative group">
            <div 
              className={`w-32 h-32 rounded-3xl flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer shadow-xl border-4 ${
                photoUrl 
                ? 'border-white dark:border-slate-700 ring-4 ring-indigo-500/10' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    <Camera size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Foto</span>
                </div>
              )}
            </div>
            {photoUrl && (
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setPhotoUrl(''); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-xl shadow-xl hover:scale-110 active:scale-90 transition-all border-2 border-white dark:border-slate-900"
              >
                <Trash2 size={14} />
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
        </div>

        {validationError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-black p-4 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900/30 animate-in slide-in-from-top-2">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <AlertTriangle size={16} />
            </div>
            {validationError}
          </div>
        )}

        <div className="space-y-2.5">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none shadow-inner"
            placeholder="Ex: João Silva"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => { setRole('musician'); }}
            className={`flex flex-col items-center gap-3 py-5 rounded-2xl border-2 transition-all active:scale-95 ${
              role === 'musician' 
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/10' 
              : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${role === 'musician' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Music size={24} />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Músico</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('singer'); }}
            className={`flex flex-col items-center gap-3 py-5 rounded-2xl border-2 transition-all active:scale-95 ${
              role === 'singer' 
              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/10' 
              : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${role === 'singer' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Mic size={24} />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Cantor</span>
          </button>
        </div>

        {role === 'musician' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Instrumentos</label>
            <div className="grid grid-cols-3 gap-3">
                {PREDEFINED_INSTRUMENTS.map((inst) => (
                    <button
                        key={inst.id}
                        type="button"
                        onClick={() => handleToggleInstrument(inst.id)}
                        className={`flex flex-col items-center gap-2.5 py-4 rounded-2xl border-2 transition-all active:scale-90 ${
                            selectedInstruments.includes(inst.id)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/30 scale-[1.02]'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        <inst.icon size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{inst.id}</span>
                    </button>
                ))}
            </div>
          </div>
        )}

        <div className="space-y-4 pt-2">
           <div className="bg-slate-50 dark:bg-slate-800/30 p-5 sm:p-6 rounded-3xl space-y-5 border border-slate-100 dark:border-slate-800 shadow-inner">
               <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-2">Restrições & Status</label>
               
               {/* Toggle 1 */}
               <div className="flex items-center justify-between group/toggle">
                  <div className="flex items-center gap-4">
                     <div className={`p-2.5 rounded-xl transition-colors ${onlyWeekends ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                        <CalendarClock size={20} />
                     </div>
                     <div>
                       <p className="text-sm font-black text-slate-700 dark:text-slate-200 leading-tight">Apenas FDS</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sábados e Domingos</p>
                     </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOnlyWeekends(!onlyWeekends)}
                    className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${onlyWeekends ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                     <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${onlyWeekends ? 'left-8' : 'left-1'}`}></div>
                  </button>
               </div>

               {/* Toggles Days */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${noWednesdays ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                      <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${noWednesdays ? 'bg-red-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Sem Quarta</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNoWednesdays(!noWednesdays)}
                        className={`w-10 h-5 rounded-full transition-all relative shadow-inner ${noWednesdays ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-md ${noWednesdays ? 'left-5.5' : 'left-0.5'}`}></div>
                      </button>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${noFridays ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                      <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${noFridays ? 'bg-red-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Sem Sexta</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNoFridays(!noFridays)}
                        className={`w-10 h-5 rounded-full transition-all relative shadow-inner ${noFridays ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-md ${noFridays ? 'left-5.5' : 'left-0.5'}`}></div>
                      </button>
                  </div>
               </div>

               {/* Toggle Status */}
               <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-4">
                     <div className={`p-2.5 rounded-xl transition-colors ${isSuspended ? 'bg-red-100 text-red-600 shadow-sm' : 'bg-green-100 text-green-600 shadow-sm'}`}>
                        {isSuspended ? <UserX size={20} /> : <UserCheck size={20} />}
                     </div>
                     <div>
                        <p className={`text-sm font-black leading-tight ${isSuspended ? 'text-red-500' : 'text-green-600'}`}>
                            {isSuspended ? 'Membro Suspenso' : 'Membro Ativo'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Status atual na equipe</p>
                     </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSuspended(!isSuspended)}
                    className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${isSuspended ? 'bg-red-500' : 'bg-green-500'}`}
                  >
                     <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${isSuspended ? 'left-8' : 'left-1'}`}></div>
                  </button>
               </div>
           </div>
        </div>

        <button
          type="submit"
          className={`w-full font-black py-5 rounded-2xl transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3 text-sm uppercase tracking-widest ${
              editingMember 
              ? 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-700' 
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-slate-100'
          }`}
        >
          {editingMember ? <Save size={20} /> : <Plus size={20} />}
          {editingMember ? 'Salvar Alterações' : 'Cadastrar Membro'}
        </button>
      </form>
    </div>
  );
};

export default MemberForm;