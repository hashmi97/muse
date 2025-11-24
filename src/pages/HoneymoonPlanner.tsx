import React from 'react';
import { Navigation } from '../components/Navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { MapPin, Calendar, Plane, Hotel, Activity, DollarSign, Plus } from 'lucide-react';

export function HoneymoonPlanner() {
  return (
    <div className="min-h-screen bg-grey-50">
      <Navigation />
      
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20">
        {/* Header */}
        <h1 className="text-4xl mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Honeymoon Planner</h1>
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Destination */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Destination</h3>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden mb-4">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1648538923547-074724ca7a18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25leW1vb24lMjBkZXN0aW5hdGlvbiUyMGJlYWNofGVufDF8fHx8MTc2Mzk3NjQ2Nnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Maldives"
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="text-lg text-grey-800 mb-2">Maldives</h4>
            <p className="text-grey-600">Paradise islands with crystal clear waters and luxury resorts</p>
          </div>
          
          {/* Dates */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Dates</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-grey-600 mb-2">Departure</label>
                <input 
                  type="text"
                  defaultValue="January 12, 2025"
                  className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>
              <div>
                <label className="block text-sm text-grey-600 mb-2">Return</label>
                <input 
                  type="text"
                  defaultValue="January 22, 2025"
                  className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>
              <div className="pt-4 border-t border-grey-100">
                <div className="text-grey-600">Duration</div>
                <div className="text-2xl text-grey-800">10 days</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Flights Section */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Flights</h3>
            </div>
            <button className="px-4 py-2 border border-grey-200 rounded-lg hover:bg-grey-50 transition-colors text-sm">
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-grey-50 rounded-xl">
              <div className="text-sm text-grey-600 mb-2">Outbound</div>
              <div className="text-grey-800 mb-1">Emirates EK 123</div>
              <div className="text-grey-600">Dubai → Malé • 4h 15m</div>
              <div className="text-sm text-grey-500 mt-2">Jan 12, 2:30 PM</div>
            </div>
            <div className="p-4 bg-grey-50 rounded-xl">
              <div className="text-sm text-grey-600 mb-2">Return</div>
              <div className="text-grey-800 mb-1">Emirates EK 456</div>
              <div className="text-grey-600">Malé → Dubai • 4h 30m</div>
              <div className="text-sm text-grey-500 mt-2">Jan 22, 10:15 AM</div>
            </div>
          </div>
        </div>
        
        {/* Hotels Section */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Hotel className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Accommodation</h3>
            </div>
            <button className="px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Book Hotel
            </button>
          </div>
          <div className="text-center py-12 text-grey-500">
            No hotels booked yet. Start by adding your accommodation.
          </div>
        </div>
        
        {/* Activities & Budget Grid */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          {/* Activities */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Activities</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full p-4 border border-grey-200 rounded-xl hover:bg-grey-50 transition-colors text-left">
                <div className="text-grey-800">Snorkeling Tour</div>
                <div className="text-sm text-grey-500 mt-1">Full day experience</div>
              </button>
              <button className="w-full p-4 border border-grey-200 rounded-xl hover:bg-grey-50 transition-colors text-left">
                <div className="text-grey-800">Sunset Cruise</div>
                <div className="text-sm text-grey-500 mt-1">Private boat tour</div>
              </button>
              <button className="w-full py-3 border-2 border-dashed border-grey-200 rounded-xl hover:border-grey-300 hover:bg-grey-50 transition-all flex items-center justify-center gap-2 text-grey-600">
                <Plus className="w-4 h-4" />
                Add Activity
              </button>
            </div>
          </div>
          
          {/* Budget */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Budget</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-grey-600">Flights</span>
                <span className="text-grey-800">$1,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-grey-600">Accommodation</span>
                <span className="text-grey-500">Not booked</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-grey-600">Activities</span>
                <span className="text-grey-500">Not booked</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-grey-100">
                <span className="text-grey-800">Total Budget</span>
                <span className="text-xl text-grey-800">$4,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-grey-600">Remaining</span>
                <span className="text-xl text-rose-300">$3,000</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mood Board */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mt-8">
          <h3 className="text-xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Inspiration</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="aspect-square rounded-xl overflow-hidden">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1658851866325-49fb8b7fbcb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMHN1bnNldCUyMGNvdXBsZXxlbnwxfHx8fDE3NjM5NzM2NjN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Inspiration"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1722872112546-936593441be8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwaW5zcGlyYXRpb24lMjBlbGVnYW50fGVufDF8fHx8MTc2Mzk3NjQ2NXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Inspiration"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1551468307-8c1e3c78013c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZGVjb3IlMjBtaW5pbWFsfGVufDF8fHx8MTc2Mzk3NjQ2NXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Inspiration"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="aspect-square rounded-xl border-2 border-dashed border-grey-200 hover:border-grey-300 hover:bg-grey-50 transition-all flex flex-col items-center justify-center gap-2 text-grey-600">
              <Plus className="w-6 h-6" />
              <span className="text-sm">Upload</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
