import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, User, Music, Moon, Church, Plane } from 'lucide-react';

const events = [
  { id: 'engagement', name: 'Engagement', icon: Heart },
  { id: 'malka', name: 'Malka', icon: Sparkles },
  { id: 'bride-prep', name: 'Bride Preparation', icon: User },
  { id: 'henna', name: 'Henna Night', icon: Music },
  { id: 'wedding', name: 'Wedding Night', icon: Moon },
  { id: 'honeymoon', name: 'Honeymoon', icon: Plane },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set(['wedding']));
  
  const toggleEvent = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };
  
  const handleContinue = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-peach-50 py-16">
      <div className="max-w-5xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-rose-300" fill="currentColor" />
            <h2 className="text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>Muse</h2>
          </div>
          <h1 className="text-4xl mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Select Your Events
          </h1>
          <p className="text-grey-600">Choose the events you're planning for your celebration</p>
        </div>
        
        {/* Event Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {events.map((event) => {
            const Icon = event.icon;
            const isSelected = selectedEvents.has(event.id);
            
            return (
              <button
                key={event.id}
                onClick={() => toggleEvent(event.id)}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all hover:shadow-medium ${
                  isSelected
                    ? 'border-rose-300 shadow-soft'
                    : 'border-grey-100 hover:border-grey-200'
                }`}
              >
                {/* Toggle indicator */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-rose-300 bg-rose-300'
                    : 'border-grey-300'
                }`}>
                  {isSelected && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-br from-rose-100 to-peach-100'
                    : 'bg-grey-50'
                }`}>
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-rose-300' : 'text-grey-400'}`} />
                </div>
                
                {/* Name */}
                <h3 className={`text-lg ${isSelected ? 'text-grey-800' : 'text-grey-600'}`}>
                  {event.name}
                </h3>
              </button>
            );
          })}
        </div>
        
        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={selectedEvents.size === 0}
            className="px-12 py-4 bg-rose-300 text-white rounded-xl hover:bg-rose-400 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
