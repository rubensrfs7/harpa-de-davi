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
    <div className={`bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-xl border transition-all ${editingMember ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          {editingMember ? 'Editar Integrante' : 'Novo Integrante'}
        </h3>
        {editingMember && (
          <button onClick={onCancelEdit} className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full transition-colors">
            <X size={16} />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto */}
        <div className="flex justify-center mb-2">
          <div className="relative group">
            <div 
              className={`w-28 h-28 rounded-lg flex items-center justify-center overflow-hidden transition-all cursor-pointer shadow-lg ${
                photoUrl ? 'border-4 border-white dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Camera size={28} />
                  <span className="text-[10px] font-bold">FOTO</span>
                </div>
              )}
            </div>
            {photoUrl && (
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setPhotoUrl(''); }}
                className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:scale-110 transition-all"
              >
                <Trash2 size={12} />
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
        </div>

        {validationError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
            <AlertTriangle size={16} />
            {validationError}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Nome Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-md focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none"
            placeholder="Ex: João Silva"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setRole('musician'); }}
            className={`flex flex-col items-center gap-2 py-4 rounded-lg border-2 transition-all ${
              role === 'musician' 
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm' 
              : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300'
            }`}
          >
            <Music size={24} />
            <span className="font-bold text-xs uppercase">Músico</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('singer'); }}
            className={`flex flex-col items-center gap-2 py-4 rounded-lg border-2 transition-all ${
              role === 'singer' 
              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-600 dark:text-purple-400 shadow-sm' 
              : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300'
            }`}
          >
            <Mic size={24} />
            <span className="font-bold text-xs uppercase">Cantor</span>
          </button>
        </div>

        {role === 'musician' && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Instrumentos</label>
            <div className="grid grid-cols-3 gap-2">
                {PREDEFINED_INSTRUMENTS.map((inst) => (
                    <button
                        key={inst.id}
                        type="button"
                        onClick={() => handleToggleInstrument(inst.id)}
                        className={`flex flex-col items-center gap-2 py-3 rounded-md border transition-all ${
                            selectedInstruments.includes(inst.id)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        <inst.icon size={18} />
                        <span className="text-[10px] font-bold">{inst.id}</span>
                    </button>
                ))}
            </div>
          </div>
        )}

        <div className="space-y-4 pt-2">
           <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg space-y-4 border border-slate-100 dark:border-slate-800">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Restrições & Status</label>
               
               {/* Toggle 1 */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${onlyWeekends ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                        <CalendarClock size={16} />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Apenas FDS</p>
                     </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOnlyWeekends(!onlyWeekends)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${onlyWeekends ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${onlyWeekends ? 'left-6' : 'left-1'}`}></div>
                  </button>
               </div>

               {/* Toggles Days */}
               <div className="grid grid-cols-2 gap-3">
                  <div className={`flex items-center justify-between p-2 rounded-lg border ${noWednesdays ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'border-transparent'}`}>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Sem Quarta</span>
                      <button
                        type="button"
                        onClick={() => setNoWednesdays(!noWednesdays)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${noWednesdays ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${noWednesdays ? 'left-4.5' : 'left-0.5'}`}></div>
                      </button>
                  </div>
                  <div className={`flex items-center justify-between p-2 rounded-lg border ${noFridays ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'border-transparent'}`}>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Sem Sexta</span>
                      <button
                        type="button"
                        onClick={() => setNoFridays(!noFridays)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${noFridays ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${noFridays ? 'left-4.5' : 'left-0.5'}`}></div>
                      </button>
                  </div>
               </div>

               {/* Toggle Status */}
               <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                     {isSuspended ? <UserX size={16} className="text-red-500" /> : <UserCheck size={16} className="text-green-500" />}
                     <p className={`text-xs font-bold ${isSuspended ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {isSuspended ? 'Membro Suspenso' : 'Membro Ativo'}
                     </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSuspended(!isSuspended)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isSuspended ? 'bg-red-500' : 'bg-green-500'}`}
                  >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isSuspended ? 'left-6' : 'left-1'}`}></div>
                  </button>
               </div>
           </div>
        </div>

        <button
          type="submit"
          className={`w-full font-bold py-4 rounded-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
              editingMember 
              ? 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-700' 
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-slate-200'
          }`}
        >
          {editingMember ? <Save size={18} /> : <Plus size={18} />}
          {editingMember ? 'Salvar Alterações' : 'Cadastrar Membro'}
        </button>
      </form>
    </div>
  );
};

export default MemberForm;