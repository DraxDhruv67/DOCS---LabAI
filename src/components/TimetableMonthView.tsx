import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface TimetableSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNo: string;
  subject?: { name: string; code: string };
  faculty?: { name: string };
}

export default function TimetableMonthView({ slots, userName }: { slots: TimetableSlot[], userName: string }) {
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  
  // A simplistic calendar generator for October 2026 (starts on Thursday, 31 days)
  const daysInMonth = 31;
  const startOffset = 3; // 0=Mon, 1=Tue, 2=Wed, 3=Thu (Oct 1, 2026 is Thursday)
  
  const calendarCells = Array.from({ length: 35 }).map((_, i) => {
    const date = i - startOffset + 1;
    if (date < 1 || date > daysInMonth) return null;
    return date;
  });

  const getDayName = (index: number) => {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return days[index % 7];
  };

  // Derive unique subjects for the right sidebar course list filter
  const uniqueSubjects = Array.from(new Set(slots.map(s => s.subject?.name).filter(Boolean)));
  const [activeFilters, setActiveFilters] = useState<string[]>(uniqueSubjects as string[]);

  const toggleFilter = (subj: string) => {
    setActiveFilters(prev => prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]);
  };

  // Predefined colors for blocks
  const blockColors = ['bg-emerald-100 text-emerald-800', 'bg-blue-100 text-blue-800', 'bg-gray-200 text-gray-800'];

  return (
    <div className="bg-[#f0f2f5] p-2 sm:p-4 rounded-xl shadow-inner border border-gray-300 font-sans">
      
      {/* Smartboard Header Mimic */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-[#f0f2f5] pb-4 px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">October 2026</h2>
          <span className="text-xs text-gray-500 hidden sm:inline-block">Select session/day or duration (month/week/day)</span>
        </div>

        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <div className="bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50">
            {userName || 'Student'} ▾
          </div>
          
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden text-sm font-medium">
            <button className="px-3 py-1.5 bg-gray-200 text-gray-800 hover:bg-gray-300">Month</button>
            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100">Week</button>
            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100">Day</button>
          </div>

          <div className="flex items-center text-gray-600 gap-2">
            <button className="p-1 hover:bg-gray-200 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <span className="font-semibold text-sm">Today</span>
            <button className="p-1 hover:bg-gray-200 rounded-full"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Calendar Grid */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-200 last:border-0">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Cells */}
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {calendarCells.map((date, index) => {
              const dayName = getDayName(index);
              // Find slots for this day of week that match active filters
              const daySlots = slots.filter(s => s.dayOfWeek.toUpperCase() === dayName && activeFilters.includes(s.subject?.name || ''));
              const isToday = date === 5; // Highlight the 5th based on the reference image

              return (
                <div key={index} className={`min-h-[100px] border-b border-r border-gray-100 p-1 flex flex-col ${isToday ? 'bg-blue-50/30' : ''}`}>
                  {date && (
                    <div className="flex justify-between items-start mb-1 px-1">
                      <span className={`text-xs font-semibold ${isToday ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
                        {date}
                      </span>
                    </div>
                  )}
                  
                  {date && (
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {daySlots.map((slot, sIdx) => {
                        const colorClass = blockColors[sIdx % blockColors.length];
                        return (
                          <div 
                            key={slot.id} 
                            onClick={() => setSelectedSlot(slot)}
                            className={`${colorClass} p-1.5 rounded-md text-[10px] leading-tight cursor-pointer hover:opacity-80 transition-opacity truncate`}
                          >
                            <div className="font-semibold">{slot.startTime}</div>
                            <div className="opacity-90">{slot.subject?.code || 'PRACTICAL'}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          
          {/* Selected Slot Panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col min-h-[120px]">
            <h3 className="font-bold text-gray-800 text-sm mb-3">Selected Slot</h3>
            {!selectedSlot ? (
              <div className="bg-gray-100 rounded-lg p-4 text-center text-xs text-gray-500 flex-1 flex items-center justify-center">
                No session selected. Click a session to see details here.
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs flex-1">
                <div className="font-bold text-blue-800 mb-1">{selectedSlot.subject?.name}</div>
                <div className="text-gray-600 mb-2">Code: {selectedSlot.subject?.code || 'N/A'}</div>
                <div className="flex justify-between text-gray-500 mb-1">
                  <span>Day:</span> <span className="font-semibold text-gray-800">{selectedSlot.dayOfWeek}</span>
                </div>
                <div className="flex justify-between text-gray-500 mb-1">
                  <span>Time:</span> <span className="font-semibold text-gray-800">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                </div>
                <div className="flex justify-between text-gray-500 mb-1">
                  <span>Faculty:</span> <span className="font-semibold text-gray-800">{selectedSlot.faculty?.name}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Room:</span> <span className="font-semibold text-gray-800">{selectedSlot.roomNo}</span>
                </div>
              </div>
            )}
          </div>

          {/* Course List Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Course List</h3>
              <div className="text-xs font-semibold text-blue-600 flex gap-2">
                <button className="hover:underline">Add New Session</button>
                <button className="hover:underline" onClick={() => setActiveFilters(uniqueSubjects as string[])}>Reset</button>
              </div>
            </div>

            <div className="space-y-3">
              {uniqueSubjects.length === 0 && <div className="text-xs text-gray-500">No courses allocated.</div>}
              {uniqueSubjects.map((subj, idx) => {
                const isActive = activeFilters.includes(subj as string);
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <button 
                      onClick={() => toggleFilter(subj as string)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}
                    >
                      {isActive && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 cursor-pointer" onClick={() => toggleFilter(subj as string)}>
                      <div className="text-xs font-medium text-gray-800 leading-tight mb-0.5">{subj}</div>
                      <div className="text-[10px] text-gray-500 font-mono tracking-wider">CODE-{idx+1}01</div>
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 flex items-center gap-2">
                      PRACTICE <span className="text-blue-500 hover:underline cursor-pointer">View</span>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-6 p-2 bg-yellow-50 text-yellow-800 text-xs rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              In Process Session (0)
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
