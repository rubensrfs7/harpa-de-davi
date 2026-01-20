import React from 'react';
import { Trash2, Music, Mic, Edit2, Drum, CalendarClock, UserX, Ban } from 'lucide-react';
import { Member } from '../types';

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
  if (lower.includes('violão')) return <AcousticGuitarIcon size={12} />;
  if (lower.includes('guitarra')) return <ElectricGuitarIcon size={12} />;
  if (lower.includes('teclado') || lower.includes('piano')) return <PianoIcon size={12} />;
  if (lower.includes('baixo')) return <BassIcon size={12} />;
  return <Music size={12} />;
};

const MemberCard: React.FC<{ member: Member; onRemove: (id: string) => void; onEdit: (member: Member) => void }> = ({ member, onRemove, onEdit }) => {
  const isMusician = member.role === 'musician';
  const isSuspended = member.isSuspended;
  
  return (
    <div className={`group relative flex items-center gap-4 p-4 bg-white dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border transition-all duration-300 hover:shadow-lg ${isSuspended ? 'border-red-200 dark:border-red-900/30 bg-red-50/50' : 'border-white/50 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-900'}`}>
       
       {/* Avatar */}
       <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black shadow-md overflow-hidden ${isSuspended ? 'grayscale opacity-70' : ''}`}>
              {member.photoUrl ? (
                 <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                 <div className={`w-full h-full flex items-center justify-center text-white ${isMusician ? 'bg-gradient-to-br from-indigo-500 to-blue-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
                    {getInitials(member.name)}
                 </div>
              )}
          </div>
          
          {/* Status Badges */}
          <div className="absolute -top-2 -right-2 flex gap-1">
              {member.onlyWeekends && !isSuspended && (
                  <div className="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 p-1 rounded-full shadow-sm" title="Apenas FDS">
                      <CalendarClock size={10} />
                  </div>
              )}
              {isSuspended && (
                  <div className="bg-red-500 text-white p-1 rounded-full shadow-sm" title="Suspenso">
                      <UserX size={10} />
                  </div>
              )}
          </div>
       </div>

       {/* Info */}
       <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-bold truncate text-base ${isSuspended ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'}`}>{member.name}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
             {isMusician ? (
                 member.instruments?.map(inst => (
                     <span key={inst} className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${isSuspended ? 'text-slate-400 bg-slate-100' : 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'}`}>
                         {getInstrumentIcon(inst)} {inst}
                     </span>
                 ))
             ) : (
                <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${isSuspended ? 'text-slate-400 bg-slate-100' : 'text-purple-600 bg-purple-50 dark:bg-purple-900/30'}`}>
                    <Mic size={10} /> Vocal
                </span>
             )}
          </div>
       </div>

       {/* Actions (Visible on Hover) */}
       <div className="flex flex-col gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <button onClick={() => onEdit(member)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors shadow-sm">
             <Edit2 size={14} />
          </button>
          <button onClick={() => onRemove(member.id)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition-colors shadow-sm">
             <Trash2 size={14} />
          </button>
       </div>
    </div>
  );
};

const MemberList: React.FC<MemberListProps> = ({ members, onRemove, onEdit }) => {
  if (members.length === 0) return (
    <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
       <p className="text-sm font-medium">Sua equipe está vazia.</p>
       <p className="text-xs mt-1">Adicione músicos ou cantores.</p>
    </div>
  );

  return (
    <div className="p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} onRemove={onRemove} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
};

export default MemberList;