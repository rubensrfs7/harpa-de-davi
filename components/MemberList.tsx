
import React from 'react';
import { Trash2, Music, Mic, Users, X, Info, Drum, CalendarClock, Edit2, UserX, Ban } from 'lucide-react';
import { Member } from '../types';

// Custom Instrument Icons for the List (Smaller)
const PianoIcon = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M6 5v10" /><path d="M10 5v10" /><path d="M14 5v10" /><path d="M18 5v10" /><path d="M2 15h20" />
  </svg>
);

const BassIcon = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 15.5c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5 2-4.5 4.5-4.5 4.5 2 4.5 4.5z" />
    <path d="M9 12l10-10" /><path d="M17 2l3 3" />
  </svg>
);

const ElectricGuitarIcon = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M13 14c0 3-2.5 5-5.5 5S2 17 2 14s2.5-5 5.5-5 5.5 2 5.5 5z" />
    <path d="M11 10.5L20 1.5" /><path d="M18.5 0l4 4" />
  </svg>
);

const AcousticGuitarIcon = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5z" />
    <path d="M12 9l8-8" /><circle cx="9" cy="13" r="1.5" />
  </svg>
);

interface MemberListProps {
  members: Member[];
  onRemove: (id: string) => void;
  onEdit: (member: Member) => void;
}

const getInitials = (name: string) => {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
};

const getInstrumentIcon = (instrument: string) => {
  const lower = instrument.toLowerCase();
  if (lower.includes('bateria')) return <Drum size={12} />;
  if (lower.includes('violão') || lower.includes('violao')) return <AcousticGuitarIcon size={12} />;
  if (lower.includes('guitarra')) return <ElectricGuitarIcon size={12} />;
  if (lower.includes('teclado') || lower.includes('piano')) return <PianoIcon size={12} />;
  if (lower.includes('baixo')) return <BassIcon size={12} />;
  return <Music size={12} />;
};

const MemberCard: React.FC<{ member: Member; onRemove: (id: string) => void; onEdit: (member: Member) => void }> = ({ member, onRemove, onEdit }) => {
  const isMusician = member.role === 'musician';
  const isSuspended = member.isSuspended;
  
  return (
    <div className={`group relative flex items-center gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 ${isSuspended ? 'border-red-100 dark:border-red-900/30 opacity-60 grayscale-[0.5]' : 'border-slate-100 dark:border-slate-700'}`}>
       <div className="relative flex-shrink-0">
          {member.photoUrl ? (
             <img src={member.photoUrl} alt={member.name} className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${isSuspended ? 'border-red-300' : 'border-white dark:border-slate-700'}`} />
          ) : (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border-2 ${isSuspended ? 'bg-slate-400 border-red-300' : isMusician ? 'bg-indigo-500 border-indigo-100' : 'bg-purple-500 border-purple-100'} text-white`}>
                {getInitials(member.name)}
            </div>
          )}
          
          <div className="absolute -top-1 -left-1 flex flex-col gap-0.5">
              {member.onlyWeekends && !isSuspended && (
                  <div className="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 p-1 rounded-full border border-white dark:border-slate-800" title="Apenas final de semana">
                      <CalendarClock size={10} />
                  </div>
              )}
              {member.noWednesdays && !isSuspended && !member.onlyWeekends && (
                  <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 p-1 rounded-full border border-white dark:border-slate-800" title="Sem Quarta">
                      <Ban size={10} />
                  </div>
              )}
              {member.noFridays && !isSuspended && !member.onlyWeekends && (
                  <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 p-1 rounded-full border border-white dark:border-slate-800" title="Sem Sexta">
                      <Ban size={10} />
                  </div>
              )}
          </div>

          {isSuspended && (
              <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full border border-white dark:border-slate-800" title="Suspenso">
                  <UserX size={10} />
              </div>
          )}
       </div>

       <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`font-bold truncate text-sm ${isSuspended ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'}`}>{member.name}</p>
            {isSuspended && <span className="text-[8px] font-black text-red-500 bg-red-50 px-1 rounded">SUSPENSO</span>}
          </div>
          <div className="flex flex-wrap gap-1 mt-0.5">
             {isMusician ? (
                 member.instruments?.map(inst => (
                     <span key={inst} className={`inline-flex items-center gap-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${isSuspended ? 'text-slate-400 bg-slate-100' : 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'}`}>
                         {getInstrumentIcon(inst)} {inst}
                     </span>
                 ))
             ) : (
                <span className={`inline-flex items-center gap-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${isSuspended ? 'text-slate-400 bg-slate-100' : 'text-purple-600 bg-purple-50 dark:bg-purple-900/30'}`}>
                    <Mic size={10} /> Vocal
                </span>
             )}
          </div>
       </div>

       <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
                onClick={() => onEdit(member)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                title="Editar"
            >
                <Edit2 size={14} />
          </button>
          <button
                onClick={() => onRemove(member.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                title="Excluir"
            >
                <Trash2 size={14} />
          </button>
       </div>
    </div>
  );
};

const MemberList: React.FC<MemberListProps> = ({ members, onRemove, onEdit }) => {
  if (members.length === 0) return (
    <div className="p-10 text-center text-slate-400 text-sm">Lista vazia.</div>
  );

  return (
    <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-2 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} onRemove={onRemove} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
};

export default MemberList;
