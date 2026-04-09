import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isBefore,
  startOfDay
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon, 
  X, 
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduledSession {
  id: string;
  date: string;
  time: string;
  category: string;
}

export function ScheduleCalendar({ isOpen, onClose, currentCategory }: { isOpen: boolean, onClose: () => void, currentCategory?: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ielts_sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  const saveSessions = (newSessions: ScheduledSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('ielts_sessions', JSON.stringify(newSessions));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    if (isBefore(day, startOfDay(new Date()))) return;
    setSelectedDate(day);
  };

  const handleSchedule = () => {
    const newSession: ScheduledSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      category: currentCategory || 'General Practice'
    };

    const updated = [...sessions, newSession];
    saveSessions(updated);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-blue-600" />
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <div className="flex gap-2">
        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isPast = isBefore(day, startOfDay(new Date()));
          const hasSession = sessions.some(s => s.date === format(day, 'yyyy-MM-dd'));

          return (
            <button
              key={day.toString()}
              disabled={isPast}
              onClick={() => onDateClick(day)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all
                ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-700' : 'text-slate-700 dark:text-slate-300'}
                ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                ${isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {format(day, 'd')}
              {hasSession && !isSelected && (
                <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Side: Calendar */}
            <div className="p-8 flex-1 border-r border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8 md:hidden">
                <h2 className="text-xl font-black">Schedule Practice</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
              </div>
              
              {renderHeader()}
              {renderDays()}
              {renderCells()}

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select 
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <React.Fragment key={i}>
                            <option value={`${i.toString().padStart(2, '0')}:00`}>{i.toString().padStart(2, '0')}:00</option>
                            <option value={`${i.toString().padStart(2, '0')}:30`}>{i.toString().padStart(2, '0')}:30</option>
                          </React.Fragment>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Section</label>
                    <div className="py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-blue-600 capitalize">
                      {currentCategory || 'General'}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSchedule}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-600/20"
                >
                  {isSuccess ? (
                    <><CheckCircle2 className="h-5 w-5 mr-2" /> Scheduled!</>
                  ) : (
                    <><Plus className="h-5 w-5 mr-2" /> Schedule Session</>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Side: Upcoming Sessions */}
            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/50 p-8 flex flex-col">
              <div className="hidden md:flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Upcoming</h3>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm text-slate-400 font-medium">No sessions scheduled yet.</p>
                  </div>
                ) : (
                  sessions
                    .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime())
                    .map(session => (
                      <motion.div 
                        layout
                        key={session.id}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[10px] font-bold text-blue-600 uppercase">
                            {session.category}
                          </div>
                          <button 
                            onClick={() => deleteSession(session.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white">{format(new Date(session.date), 'EEE, MMM d')}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {session.time}
                        </div>
                      </motion.div>
                    ))
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  * Scheduling helps you stay consistent. We'll show these in your dashboard.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
