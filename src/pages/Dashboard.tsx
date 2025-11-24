import React from 'react';
import { Navigation } from '../components/Navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Calendar, DollarSign, Plane, Image, CheckCircle2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const upcomingEvents = [
  { name: 'Malka', date: 'Dec 15, 2024', color: 'from-rose-200 to-rose-300' },
  { name: 'Henna Night', date: 'Jan 8, 2025', color: 'from-peach-200 to-rose-200' },
  { name: 'Wedding Night', date: 'Jan 10, 2025', color: 'from-rose-300 to-rose-400' },
];

const recentActivity = [
  { user: 'Jinan', action: 'added 3 new photos to Wedding Night mood board', time: '2 hours ago' },
  { user: 'Hisham', action: 'updated the honeymoon budget', time: '5 hours ago' },
  { user: 'Jinan', action: 'completed task "Book photographer"', time: 'Yesterday' },
  { user: 'Hisham', action: 'added notes to Henna Night event', time: '2 days ago' },
];

export function Dashboard() {
  return (
    <div className="min-h-screen bg-grey-50">
      <Navigation />
      
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl p-8 shadow-soft mb-8 overflow-hidden relative">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl overflow-hidden">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1762941744800-385b067dff21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwY291cGxlJTIwd2VkZGluZ3xlbnwxfHx8fDE3NjM5NzY0NjR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Hisham & Jinan"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Welcome back, Hisham & Jinan
              </h1>
              <p className="text-grey-600 text-lg">
                Your wedding is in 47 days. You're making wonderful progress!
              </p>
            </div>
            <div className="absolute top-8 right-8">
              <Heart className="w-12 h-12 text-rose-100" fill="currentColor" />
            </div>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Upcoming Events</h3>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${event.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-grey-800 truncate">{event.name}</div>
                    <div className="text-sm text-grey-500">{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/calendar" className="block mt-6 text-center text-rose-300 hover:text-rose-400 transition-colors">
              View Calendar →
            </Link>
          </div>
          
          {/* Budget Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Budget Summary</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-grey-600">Total Budget</span>
                  <span className="text-grey-800">$45,000</span>
                </div>
                <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-gradient-to-r from-rose-300 to-peach-300 rounded-full" />
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t border-grey-100">
                <div>
                  <div className="text-sm text-grey-600">Spent</div>
                  <div className="text-xl text-rose-300">$27,500</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-grey-600">Remaining</div>
                  <div className="text-xl text-grey-800">$17,500</div>
                </div>
              </div>
            </div>
            <Link to="/budget" className="block mt-6 text-center text-rose-300 hover:text-rose-400 transition-colors">
              View Budget →
            </Link>
          </div>
          
          {/* Honeymoon Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <Plane className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Honeymoon</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-300" />
                <span className="text-grey-700">Destination selected</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-300" />
                <span className="text-grey-700">Flights booked</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-grey-300" />
                <span className="text-grey-500">Hotel reservation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-grey-300" />
                <span className="text-grey-500">Activities planned</span>
              </div>
            </div>
            <Link to="/honeymoon" className="block mt-6 text-center text-rose-300 hover:text-rose-400 transition-colors">
              View Details →
            </Link>
          </div>
        </div>
        
        {/* Second Row */}
        <div className="grid grid-cols-3 gap-8 mt-8">
          {/* Mood Board Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <Image className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Recent Inspiration</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <Link to="/gallery" className="block mt-4 text-center text-rose-300 hover:text-rose-400 transition-colors">
              View Gallery →
            </Link>
          </div>
          
          {/* Activity Feed */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-soft">
            <h3 className="text-xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-peach-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-rose-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-grey-700">
                      <span className="text-grey-800">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-sm text-grey-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/activity" className="block mt-6 text-center text-rose-300 hover:text-rose-400 transition-colors">
              View All Activity →
            </Link>
          </div>
        </div>
        
        {/* Shared Notes */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mt-8">
          <h3 className="text-xl mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Shared Notes</h3>
          <textarea
            placeholder="Add a note or thought to share with your partner..."
            className="w-full h-24 p-4 border border-grey-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
