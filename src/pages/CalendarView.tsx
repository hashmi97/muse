import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const eventColors: Record<string, string> = {
  malka: 'bg-rose-300',
  'bride-prep': 'bg-peach-200',
  henna: 'bg-rose-400',
  wedding: 'bg-rose-500',
  honeymoon: 'bg-peach-300',
};

const calendarEvents = [
  { date: 8, type: 'malka', name: 'Malka Venue Visit' },
  { date: 15, type: 'malka', name: 'Malka Day' },
  { date: 20, type: 'bride-prep', name: 'Dress Fitting' },
  { date: 25, type: 'wedding', name: 'Final Catering Meeting' },
];

export function CalendarView() {
  const [currentMonth] = useState('December 2024');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const daysInMonth = 31;
  const firstDayOffset = 4; // December 1, 2024 is a Sunday, but starting on Thursday for display
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="min-h-screen bg-grey-50">
      <Navigation />
      
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>Calendar</h1>
          <button className="px-6 py-3 bg-rose-300 text-white rounded-xl hover:bg-rose-400 transition-colors shadow-soft flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
        
        {/* Calendar Card */}
        <div className="bg-white rounded-2xl p-8 shadow-soft">
          {/* Month Selector */}
          <div className="flex items-center justify-between mb-8">
            <button className="p-2 hover:bg-grey-50 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-grey-600" />
            </button>
            <h2 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              {currentMonth}
            </h2>
            <button className="p-2 hover:bg-grey-50 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-grey-600" />
            </button>
          </div>
          
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {days.map((day) => (
              <div key={day} className="text-center text-sm text-grey-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4">
            {/* Empty cells for offset */}
            {[...Array(firstDayOffset)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {/* Days */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dayEvents = calendarEvents.filter(e => e.date === day);
              const isToday = day === 15;
              
              return (
                <div
                  key={day}
                  className={`min-h-24 p-3 rounded-xl border-2 transition-all ${
                    isToday
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-grey-100 hover:border-grey-200'
                  }`}
                >
                  <div className={`text-sm mb-2 ${isToday ? 'text-rose-300' : 'text-grey-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left text-xs p-2 rounded-lg text-white ${eventColors[event.type]} hover:opacity-80 transition-opacity`}
                      >
                        {event.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Event Legend */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Event Types</h3>
          <div className="grid grid-cols-6 gap-4">
            {Object.entries(eventColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color}`} />
                <span className="text-sm text-grey-600 capitalize">{type.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Event Detail Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 px-8"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-full h-2 rounded-full mb-6 ${eventColors[selectedEvent.type]}`} />
            <h3 className="text-2xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {selectedEvent.name}
            </h3>
            <p className="text-grey-600 mb-6">{currentMonth.split(' ')[0]} {selectedEvent.date}, 2024</p>
            <p className="text-grey-700 mb-6">
              Event details and notes will appear here.
            </p>
            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full py-3 bg-grey-100 rounded-xl hover:bg-grey-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
