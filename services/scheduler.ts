
import { Member, ScheduleItem } from '../types';

interface RotationState {
  usageMap: Record<string, number>;
  lastPlayedOnDay: Record<string, Record<number, number>>;
  scheduledThisWeek: Record<number, Set<string>>;
}

export const generateFullSchedule = (
  dates: string[],
  members: Member[]
): ScheduleItem[] => {
  const activeMembers = members.filter(m => !m.isSuspended);
  if (activeMembers.length === 0) return [];

  const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const state: RotationState = {
    usageMap: Object.fromEntries(activeMembers.map(m => [m.id, 0])),
    lastPlayedOnDay: Object.fromEntries(activeMembers.map(m => [m.id, {}])),
    scheduledThisWeek: {}
  };

  const schedule: ScheduleItem[] = [];

  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekIndex = Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (!state.scheduledThisWeek[weekIndex]) state.scheduledThisWeek[weekIndex] = new Set();

    const selectedMusicians: Member[] = [];
    
    // Banda Base: Teclado, Baixo, Bateria, Guitarra
    const coreInstruments = ['Teclado', 'Baixo', 'Bateria', 'Guitarra'];
    for (const inst of coreInstruments) {
      const candidates = activeMembers.filter(m => m.role === 'musician' && m.instruments?.includes(inst));
      const picked = pickMember(candidates, state, date, weekIndex, selectedMusicians);
      if (picked) selectedMusicians.push(picked);
    }

    // Violão Opcional (50% de chance)
    if (Math.random() > 0.5) {
      const violaoCandidates = activeMembers.filter(m => m.role === 'musician' && m.instruments?.includes('Violão'));
      const pickedViolao = pickMember(violaoCandidates, state, date, weekIndex, selectedMusicians);
      if (pickedViolao) selectedMusicians.push(pickedViolao);
    }

    // Vocal: Exatamente 3
    const selectedSingers: Member[] = [];
    const singersPool = activeMembers.filter(m => m.role === 'singer');
    for (let i = 0; i < 3; i++) {
      const picked = pickMember(singersPool, state, date, weekIndex, selectedSingers);
      if (picked) selectedSingers.push(picked);
    }

    // Registrar participação
    [...selectedMusicians, ...selectedSingers].forEach(m => {
      state.usageMap[m.id]++;
      state.lastPlayedOnDay[m.id][dayOfWeek] = date.getTime();
      state.scheduledThisWeek[weekIndex].add(m.id);
    });

    schedule.push({
      id: crypto.randomUUID(),
      date: dateStr,
      musicians: selectedMusicians,
      singers: selectedSingers,
      songs: []
    });
  }

  return schedule;
};

const pickMember = (pool: Member[], state: RotationState, date: Date, weekIndex: number, alreadySelected: Member[]): Member | null => {
  const dayOfWeek = date.getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  const candidates = pool.filter(m => {
    if (alreadySelected.some(s => s.id === m.id)) return false;
    if (isWeekday && m.onlyWeekends) return false;
    if (dayOfWeek === 3 && m.noWednesdays) return false;
    if (dayOfWeek === 5 && m.noFridays) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  // Priorizar quem tocou menos vezes e quem não tocou na semana
  return candidates.sort((a, b) => {
    const usageA = state.usageMap[a.id] || 0;
    const usageB = state.usageMap[b.id] || 0;
    const inWeekA = state.scheduledThisWeek[weekIndex]?.has(a.id) ? 1 : 0;
    const inWeekB = state.scheduledThisWeek[weekIndex]?.has(b.id) ? 1 : 0;
    
    if (inWeekA !== inWeekB) return inWeekA - inWeekB;
    return usageA - usageB || Math.random() - 0.5;
  })[0];
};

export const regenerateDay = (item: ScheduleItem, members: Member[]): ScheduleItem => {
  // Gera uma escala totalmente nova para aquele dia seguindo as mesmas regras
  const singleDayResult = generateFullSchedule([item.date], members);
  if (singleDayResult.length > 0) {
    return { ...singleDayResult[0], id: item.id, songs: item.songs };
  }
  return item;
};
