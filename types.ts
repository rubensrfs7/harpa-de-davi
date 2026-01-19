
export type Role = 'musician' | 'singer';

export interface Member {
  id: string;
  name: string;
  role: Role;
  instruments?: string[]; // Multiple instruments support
  photoUrl?: string; // Base64 or URL
  observation?: string;
  onlyWeekends?: boolean; // Rule 4: Musicians restricted to weekends
  noWednesdays?: boolean; // New: Restrict from Wednesday services
  noFridays?: boolean;    // New: Restrict from Friday services
  isSuspended?: boolean; // New: Suspension status
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  lyricsLink?: string;
  youtubeLink?: string;
}

export interface ScheduleItem {
  id: string;
  date: string; // ISO date string YYYY-MM-DDTHH:mm
  musicians: Member[];
  singers: Member[];
  songs?: string[];
}

export interface SubstitutionLog {
  id: string;
  date: string;
  scheduleItemId: string;
  memberOut: Member;
  memberIn: Member;
  timestamp: string;
}

export interface AppData {
  members: Member[];
  dates: string[];
  schedule: ScheduleItem[];
  substitutionLogs: SubstitutionLog[];
  songs: Song[];
}
