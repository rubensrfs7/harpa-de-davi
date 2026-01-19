
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
            w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl 
            flex items-center justify-between cursor-pointer transition-all
            ${isOpen ? 'ring-2 ring-indigo-500/20 bg-white dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700/80'}
        `}
      >
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <CalendarIcon size={18} className={`${isOpen ? 'text-indigo-500' : 'text-slate-400'}`} />
        </div>
        
        <span className={`font-medium ${value ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
            {value ? formatDisplayValue() : 'Selecione data e hora...'}
        </span>

        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[300px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Month/Year */}
          <div className="flex items-center justify-between mb-4">
            <button 
                onClick={() => changeMonth(-1)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
            >
                <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button 
                onClick={() => changeMonth(1)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
            >
                <ChevronRight size={18} />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 mb-2">
            {WEEK_DAYS.map((day, i) => (
                <div key={i} className="h-8 w-8 flex items-center justify-center text-xs font-bold text-slate-400">
                    {day}
                </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1 mb-4">
            {renderCalendarGrid()}
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-4"></div>

          {/* Time Selector Styled */}
          <div className="flex items-center justify-between pt-1">
             <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                 <Clock size={16} />
                 <span className="text-xs font-semibold uppercase tracking-wide">Horário</span>
             </div>
             <div className="relative group">
                 <input
                    type="time"
                    value={timeValue}
                    onChange={handleTimeChange}
                    className="appearance-none bg-slate-900 dark:bg-slate-800 text-white font-bold text-lg px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer text-center w-32 tracking-wider transition-transform active:scale-95 shadow-sm"
                 />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
