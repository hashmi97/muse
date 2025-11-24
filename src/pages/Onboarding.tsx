import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, User, Music, Moon, Plane, Image } from 'lucide-react';

const events = [
  { id: 'malka', name: 'Malka', icon: Sparkles, defaultMoodboardEnabled: false },
  { id: 'henna', name: 'Henna Night', icon: Music, defaultMoodboardEnabled: true },
  { id: 'bride-prep', name: 'Bride Preparation', icon: User, defaultMoodboardEnabled: true },
  { id: 'wedding', name: 'Wedding Night', icon: Moon, defaultMoodboardEnabled: true },
  { id: 'honeymoon', name: 'Honeymoon', icon: Plane, defaultMoodboardEnabled: true },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set(['wedding']));
  const [moodboardEnabled, setMoodboardEnabled] = useState<Record<string, boolean>>(
    () =>
      events.reduce(
        (acc, event) => {
          acc[event.id] = event.defaultMoodboardEnabled ?? true;
          return acc;
        },
        {} as Record<string, boolean>
      )
  );
  
  const toggleEvent = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };
  
  const toggleMoodboard = (eventId: string) => {
    setMoodboardEnabled((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };
  
  const handleContinue = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-peach-50 py-16 flex items-center justify-center">
      <div className="max-w-[1600px] mx-auto px-8 w-full flex flex-col gap-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-rose-300" fill="currentColor" />
            <h2 className="text-3xl sm:text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>Muse</h2>
          </div>
          <h1 className="text-[clamp(2.5rem,4vw,3.5rem)]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Select Your Events
          </h1>
          <p className="text-grey-600 text-lg">
            Choose the events you're planning for your celebration
          </p>
        </div>
        
        {/* Event Grid */}
        <div
          className="grid gap-6 w-full justify-center"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', justifyItems: 'center' }}
        >
          {events.map((event) => {
            const Icon = event.icon;
            const isSelected = selectedEvents.has(event.id);
            
            return (
              <button
                key={event.id}
                onClick={() => toggleEvent(event.id)}
                className={`relative bg-white rounded-[24px] p-8 border-2 transition-all hover:shadow-medium h-[260px] w-full max-w-[420px] text-left ${
                  isSelected
                    ? 'border-rose-400 shadow-soft'
                    : 'border-grey-100 hover:border-grey-200'
                }`}
              >
                {/* Selection indicator */}
                <div
                  className={`absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-rose-400 bg-rose-50' : 'border-grey-300 bg-grey-100'
                  }`}
                >
                  {isSelected && <div className="w-4 h-4 bg-rose-300 rounded-full" />}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                    isSelected ? 'bg-gradient-to-br from-rose-100 to-peach-100' : 'bg-grey-50'
                  }`}
                >
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-rose-300' : 'text-grey-400'}`} />
                </div>

                {/* Name */}
                <h3
                  className={`text-[1.65rem] font-semibold ${isSelected ? 'text-grey-800' : 'text-grey-600'}`}
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {event.name}
                </h3>

                {/* Mood board toggle */}
                <div className="mt-4 flex items-center justify-start text-sm text-grey-500">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    <span>Mood board</span>
                  </div>
                </div>
                <div className="absolute right-4 bottom-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSelected) return;
                      toggleMoodboard(event.id);
                    }}
                    disabled={!isSelected}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      !isSelected
                        ? 'border-grey-300 bg-grey-100 opacity-60 cursor-not-allowed'
                        : moodboardEnabled[event.id]
                          ? 'border-rose-400 bg-rose-200'
                          : 'border-grey-300 bg-white'
                    }`}
                    aria-pressed={moodboardEnabled[event.id]}
                    aria-label={`Toggle mood board for ${event.name}`}
                  >
                    {isSelected && moodboardEnabled[event.id] && <span className="w-4 h-4 rounded-full bg-rose-400" />}
                  </button>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Continue Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleContinue}
            disabled={selectedEvents.size === 0}
            className="px-20 py-4 bg-rose-300 text-white rounded-full hover:bg-rose-400 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
