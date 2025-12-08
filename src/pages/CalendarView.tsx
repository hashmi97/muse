import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCalendarEvents, type CalendarEvent } from '../lib/api';

const eventColors: Record<string, string> = {
  malka: 'bg-rose-300',
  henna_night: 'bg-rose-400',
  bride_preparation: 'bg-peach-200',
  wedding_night: 'bg-rose-500',
  honeymoon: 'bg-peach-300',
};

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function isToday(date: Date, day: number): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    day === today.getDate()
  );
}

function formatEventDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function CalendarView() {
  const { accessToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      navigate('/signup');
      return;
    }

    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCalendarEvents(accessToken);
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [accessToken, authLoading, navigate]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleViewEvent = (eventId: number) => {
    navigate(`/event/${eventId}`);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOffset = getFirstDayOfMonth(currentDate);
  const monthYear = getMonthYear(currentDate);

  // Filter events for the current month
  const monthEvents = events.filter((event) => {
    if (!event.start_date) return false;
    const eventDate = new Date(event.start_date);
    return (
      eventDate.getFullYear() === currentDate.getFullYear() &&
      eventDate.getMonth() === currentDate.getMonth()
    );
  });

  // Group events by day
  const eventsByDay: Record<number, CalendarEvent[]> = {};
  monthEvents.forEach((event) => {
    if (event.start_date) {
      const day = new Date(event.start_date).getDate();
      if (!eventsByDay[day]) {
        eventsByDay[day] = [];
      }
      eventsByDay[day].push(event);
    }
  });

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
            <button 
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-grey-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-grey-600" />
            </button>
            <h2 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              {monthYear}
            </h2>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-grey-50 rounded-lg transition-colors"
            >
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-rose-300 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-grey-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {/* Empty cells for offset */}
              {[...Array(firstDayOffset)].map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              
              {/* Days */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dayEvents = eventsByDay[day] || [];
                const isTodayDate = isToday(currentDate, day);
                
                return (
                  <div
                    key={day}
                    className={`min-h-24 p-3 rounded-xl border-2 transition-all ${
                      isTodayDate
                        ? 'border-rose-300 bg-rose-50'
                        : 'border-grey-100 hover:border-grey-200'
                    }`}
                  >
                    <div className={`text-sm mb-2 ${isTodayDate ? 'text-rose-300 font-semibold' : 'text-grey-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`w-full text-left text-xs p-2 rounded-lg text-white truncate ${
                            eventColors[event.event_type] || 'bg-grey-400'
                          } hover:opacity-80 transition-opacity`}
                          title={event.title}
                        >
                          {event.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Event Legend */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Event Types</h3>
          <div className="grid grid-cols-6 gap-4">
            {Object.entries(eventColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color}`} />
                <span className="text-sm text-grey-600 capitalize">{type.replace(/_/g, ' ')}</span>
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
            <div className={`w-full h-2 rounded-full mb-6 ${
              eventColors[selectedEvent.event_type] || 'bg-grey-400'
            }`} />
            <h3 className="text-2xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {selectedEvent.title}
            </h3>
            <p className="text-grey-600 mb-4">
              {formatEventDate(selectedEvent.start_date)}
              {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date && 
                ` - ${formatEventDate(selectedEvent.end_date)}`
              }
            </p>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => {
                  handleViewEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="flex-1 py-3 bg-rose-300 text-white rounded-xl hover:bg-rose-400 transition-colors"
              >
                View Event
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 py-3 bg-grey-100 rounded-xl hover:bg-grey-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
