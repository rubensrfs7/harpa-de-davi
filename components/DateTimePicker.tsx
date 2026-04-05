import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, ChevronDown } from 'lucide-react';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse initial value or default to now
  const initialDate = value ? new Date(value) : new Date();
  
  // Internal state for the calendar view (navigating months without changing selection)
  const [viewDate, setViewDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? initialDate : null);
  // Default time set to 18:30 (Culto)
  const [timeValue, setTimeValue] = useState(value ? value.substring(11, 16) : '18:30');

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        // CORREÇÃO: Extrair hora/minuto do objeto Date localmente em vez de fazer substring na string.
        // Isso resolve o problema onde a string é UTC (ex: 11:30Z) mas queremos exibir a hora local (08:30).
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setTimeValue(`${hours}:${minutes}`);

        // Only update viewDate if the popup is closed, to avoid jumping while navigating
        if (!isOpen) {
             setViewDate(d);
        }
      }
    } else {
        setSelectedDate(null);
    }
  }, [value, isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
    
    // Combine date + time
    updateParentValue(newDate, timeValue);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    if (selectedDate) {
      updateParentValue(selectedDate, newTime);
    }
  };

  const updateParentValue = (date: Date, time: string) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // Format: YYYY-MM-DDTHH:mm
    onChange(`${year}-${month}-${day}T${time}`);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendarGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month); // 0 = Sunday
    
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const isSelected = selectedDate && 
        selectedDate.getDate() === i && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;
      
      const isToday = new Date().toDateString() === currentDate.toDateString();

      days.push(
        <button
          key={i}
          onClick={() => handleDateSelect(i)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all relative
            ${isSelected 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 font-bold' 
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }
            ${!isSelected && isToday ? 'ring-1 ring-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold' : ''}
          `}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return '';
    const dateStr = selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${dateStr}, ${timeValue}`;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            relative w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900/60 border-2 rounded-2xl 
            flex items-center justify-between cursor-pointer transition-all duration-500 group
            ${isOpen ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-[1.02]' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-xl'}
        `}
      >
        <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-500 ${isOpen ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-400'}`}>
            <CalendarIcon size={20} />
        </div>
        
        <span className={`text-sm font-black tracking-tight transition-colors duration-500 ${value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
            {value ? formatDisplayValue() : 'Selecione data e hora...'}
        </span>

        <div className={`p-1.5 rounded-lg transition-all duration-500 ${isOpen ? 'bg-indigo-500 text-white rotate-180 shadow-lg shadow-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50'}`}>
            <ChevronDown size={14} />
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-full sm:w-[320px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500 backdrop-blur-xl">
          
          {/* Header Month/Year */}
          <div className="flex items-center justify-between mb-6">
            <button 
                onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all active:scale-90"
            >
                <ChevronLeft size={20} />
            </button>
            <span className="text-base font-black text-slate-800 dark:text-white capitalize tracking-tight">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button 
                onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all active:scale-90"
            >
                <ChevronRight size={20} />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 mb-4">
            {WEEK_DAYS.map((day, i) => (
                <div key={i} className="h-10 w-10 flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {day}
                </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {renderCalendarGrid().map((day, i) => (
                <div key={i} className="flex items-center justify-center">
                    {day}
                </div>
            ))}
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6"></div>

          {/* Time Selector Styled */}
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                 <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Clock size={18} />
                 </div>
                 <span className="text-xs font-black uppercase tracking-[0.2em]">Horário</span>
             </div>
             <div className="relative group">
                 <input
                    type="time"
                    value={timeValue}
                    onChange={handleTimeChange}
                    className="appearance-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xl px-5 py-3 rounded-2xl border-none focus:ring-4 focus:ring-indigo-500/20 outline-none cursor-pointer text-center w-36 tracking-tighter transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                 />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;