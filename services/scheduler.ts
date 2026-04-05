
import { Member, ScheduleItem } from '../types';

interface RotationState {
  usageMap: Record<string, number>;
  lastPlayedOnDay: Record<string, Record<number, number>>;
  scheduledThisWeek: Record<number, Set<string>>;
}

export const generateFullSchedule = (
  dates: (string | { date: string, isSpecial: boolean, specialName: string })[],
  members: Member[]
): ScheduleItem[] => {
  const activeMembers = members.filter(m => !m.isSuspended);
  if (activeMembers.length === 0) return [];

  const sortedDates = [...dates].sort((a, b) => {
    const dateA = typeof a === 'string' ? a : a.date;
    const dateB = typeof b === 'string' ? b : b.date;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  const state: RotationState = {
    usageMap: Object.fromEntries(activeMembers.map(m => [m.id, 0])),
    lastPlayedOnDay: Object.fromEntries(activeMembers.map(m => [m.id, {}])),
    scheduledThisWeek: {}
  };

  const schedule: ScheduleItem[] = [];

  for (const dateItem of sortedDates) {
    const dateStr = typeof dateItem === 'string' ? dateItem : dateItem.date;
    const isSpecial = typeof dateItem === 'string' ? false : dateItem.isSpecial;
    const specialName = typeof dateItem === 'string' ? undefined : dateItem.specialName;

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekIndex = Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (!state.scheduledThisWeek[weekIndex]) state.scheduledThisWeek[weekIndex] = new Set();

    if (isSpecial) {
      schedule.push({
        id: crypto.randomUUID(),
        date: dateStr,
        musicians: [],
        singers: [],
        isSpecial: true,
        specialName: specialName,
        songs: []
      });
      continue;
    }

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

    // --- NOVA LÓGICA: MINISTRO E RESERVA ---
    
    // 1. Sorteia o Ministro de Louvor (entre os 3 selecionados)
    let worshipLeaderId: string | undefined = undefined;
    if (selectedSingers.length > 0) {
        const randomIndex = Math.floor(Math.random() * selectedSingers.length);
        worshipLeaderId = selectedSingers[randomIndex].id;
    }

    // 2. Sorteia o Reserva (alguém do pool que NÃO foi selecionado)
    let backupSinger: Member | undefined = undefined;
    const backupCandidates = singersPool.filter(s => !selectedSingers.some(sel => sel.id === s.id));
    
    // Usa a mesma lógica de pickMember para o reserva para manter a rotatividade,
    // mas não adiciona ao scheduledThisWeek tão agressivamente (opcional), 
    // aqui vamos usar o pickMember normal para garantir que rode a escala.
    // Passamos selectedSingers como "alreadySelected" para não repetir.
    backupSinger = pickMember(backupCandidates, state, date, weekIndex, selectedSingers) || undefined;


    // Registrar participação (Incluindo reserva ou não? Geralmente reserva conta menos, 
    // mas aqui vamos contar para rodar a fila. Se preferir não contar reserva na estatística, remova o backupSinger daqui)
    [...selectedMusicians, ...selectedSingers].forEach(m => {
      state.usageMap[m.id]++;
      state.lastPlayedOnDay[m.id][dayOfWeek] = date.getTime();
      state.scheduledThisWeek[weekIndex].add(m.id);
    });

    // Reserva conta uso? Vamos assumir que sim para ele não ficar sendo reserva sempre e nunca titular
    if (backupSinger) {
       // state.usageMap[backupSinger.id]++; // Descomente se quiser que reserva conte como "escalado" para fins de fila
    }

    schedule.push({
      id: crypto.randomUUID(),
      date: dateStr,
      musicians: selectedMusicians,
      singers: selectedSingers,
      worshipLeaderId,
      backupSinger,
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
  const dateParam = item.isSpecial ? { date: item.date, isSpecial: true, specialName: item.specialName || '' } : item.date;
  const singleDayResult = generateFullSchedule([dateParam], members);
  if (singleDayResult.length > 0) {
    return { ...singleDayResult[0], id: item.id, songs: item.songs };
  }
  return item;
};