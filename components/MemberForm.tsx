
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Music, Mic, Drum, Camera, X, CalendarClock, UserCheck, UserX, Save, Ban, ImagePlus, Trash2, AlertTriangle } from 'lucide-react';
import { Member, Role } from '../types';

// Custom Instrument Icons
const PianoIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M6 5v10" />
    <path d="M10 5v10" />
    <path d="M14 5v10" />
    <path d="M18 5v10" />
    <path d="M2 15h20" />
  </svg>
);

const BassIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 15.5c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5 2-4.5 4.5-4.5 4.5 2 4.5 4.5z" />
    <path d="M9 12l10-10" />
    <path d="M17 2l3 3" />
    <path d="M18.5 3.5l1.5 1.5" />
    <path d="M7 16a1 1 0 100-2 1 1 0 000 2z" />
    <path d="M5 15a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);

const ElectricGuitarIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M13 14c0 3-2.5 5-5.5 5S2 17 2 14s2.5-5 5.5-5 5.5 2 5.5 5z" />
    <path d="M11 10.5L20 1.5" />
    <path d="M18.5 0l4 4" />
    <path d="M13 12l1-1" />
  </svg>
);

const AcousticGuitarIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5z" />
    <path d="M12 9l8-8" />
    <path d="M19 0l4 4" />
    <circle cx="9" cy="13" r="1.5" />
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
      // 1.5MB = 1,572,864 bytes
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
      setValidationError("Atenção: Você esqueceu de selecionar o instrumento do músico!");
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
    <div className={`bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-sm border transition-all ${editingMember ? 'border-indigo-500 shadow-indigo-100 dark:shadow-indigo-900/20' : 'border-slate-200/60 dark:border-slate-800/60'}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className={`p-1.5 rounded-lg ${editingMember ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
            {editingMember ? <Save size={16} /> : <Plus size={16} />}
          </span>
          {editingMember ? 'Editar Perfil' : 'Novo Cadastro'}
        </h3>
        {editingMember && (
          <button onClick={onCancelEdit} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
            <X size={14} /> Cancelar
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Foto do Perfil */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Foto do Integrante</label>
          <div className="relative group">
            <div 
              className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all cursor-pointer hover:border-indigo-400 ${
                photoUrl ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20' : 'border-slate-300 dark:border-slate-600'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Camera size={24} />
                  <span className="text-[10px] font-bold">ADICIONAR</span>
                </div>
              )}
            </div>
            {photoUrl && (
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setPhotoUrl(''); }}
                className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-slate-900"
              >
                <Trash2 size={12} />
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
          <p className="text-[9px] text-slate-400 font-medium">PNG, JPG até 1.5MB</p>
        </div>

        {validationError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-3 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
            <AlertTriangle className="text-red-500 shrink-0" size={16} />
            <p className="text-xs font-bold text-red-600 dark:text-red-400">{validationError}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase ml-1">Nome Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); if(validationError) setValidationError(null); }}
            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl focus:bg-white dark:focus:bg-slate-700 outline-none transition-all font-medium ${validationError && !name ? 'border-red-500/50' : 'border-transparent focus:border-indigo-500/20'}`}
            placeholder="Ex: João Silva"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setRole('musician'); setValidationError(null); }}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
              role === 'musician' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
            }`}
          >
            <Music size={20} />
            <span className="font-bold text-xs uppercase">Músico</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('singer'); setValidationError(null); }}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
              role === 'singer' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
            }`}
          >
            <Mic size={20} />
            <span className="font-bold text-xs uppercase">Cantor</span>
          </button>
        </div>

        {role === 'musician' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold uppercase ml-1 ${validationError && selectedInstruments.length === 0 ? 'text-red-500 font-black' : 'text-slate-500 dark:text-slate-400'}`}>
                Instrumentos {validationError && selectedInstruments.length === 0 && ' (OBRIGATÓRIO)'}
              </label>
            </div>
            <div className={`grid grid-cols-3 gap-2 p-2 rounded-2xl transition-colors ${validationError && selectedInstruments.length === 0 ? 'bg-red-50 dark:bg-red-900/10 ring-2 ring-red-500/20' : ''}`}>
                {PREDEFINED_INSTRUMENTS.map((inst) => (
                    <button
                        key={inst.id}
                        type="button"
                        onClick={() => handleToggleInstrument(inst.id)}
                        className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl border transition-all ${
                            selectedInstruments.includes(inst.id)
                            ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'
                        }`}
                    >
                        <inst.icon size={18} />
                        <span className="text-[10px] font-bold">{inst.id}</span>
                    </button>
                ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
           <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase ml-1">Regras de Disponibilidade</label>
           
           <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                 <CalendarClock size={18} className="text-amber-500" />
                 <div>
                   <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">Apenas FDS?</p>
                   <p className="text-[10px] text-slate-400">Só escala sáb/dom</p>
                 </div>
              </div>
              <button
                type="button"
                onClick={() => setOnlyWeekends(!onlyWeekends)}
                className={`w-12 h-6 rounded-full transition-colors relative ${onlyWeekends ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${onlyWeekends ? 'left-7' : 'left-1'}`}></div>
              </button>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${noWednesdays ? 'bg-red-50 dark:bg-red-900/10 border-red-200' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex items-center gap-2">
                    <Ban size={14} className={noWednesdays ? "text-red-500" : "text-slate-400"} />
                    <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">Sem Quarta</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoWednesdays(!noWednesdays)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${noWednesdays ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${noWednesdays ? 'left-4.5' : 'left-0.5'}`}></div>
                  </button>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${noFridays ? 'bg-red-50 dark:bg-red-900/10 border-red-200' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex items-center gap-2">
                    <Ban size={14} className={noFridays ? "text-red-500" : "text-slate-400"} />
                    <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">Sem Sexta</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoFridays(!noFridays)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${noFridays ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${noFridays ? 'left-4.5' : 'left-0.5'}`}></div>
                  </button>
              </div>
           </div>

           <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                 {isSuspended ? <UserX size={18} className="text-red-500" /> : <UserCheck size={18} className="text-green-500" />}
                 <div>
                   <p className={`text-xs font-bold uppercase ${isSuspended ? 'text-red-600' : 'text-slate-700 dark:text-slate-200'}`}>Status do Membro</p>
                   <p className="text-[10px] text-slate-400">{isSuspended ? 'Membro inativo' : 'Membro ativo'}</p>
                 </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSuspended(!isSuspended)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isSuspended ? 'bg-red-500' : 'bg-green-500'}`}
              >
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isSuspended ? 'left-7' : 'left-1'}`}></div>
              </button>
           </div>
        </div>

        <button
          type="submit"
          className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] ${editingMember ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20' : 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white shadow-slate-900/10'}`}
        >
          {editingMember ? 'Atualizar Membro' : 'Salvar Membro'}
        </button>
      </form>
    </div>
  );
};

export default MemberForm;
