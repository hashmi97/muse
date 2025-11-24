import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Calendar, CheckCircle2, DollarSign, Image, FileText, Plus, Heart, Users, Clock, MapPin } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Calendar },
  { id: 'planning', label: 'Planning', icon: MapPin },
  { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'moodboard', label: 'Mood Board', icon: Image },
  { id: 'notes', label: 'Notes', icon: FileText },
];

const tasks = [
  { name: 'Book venue', completed: true },
  { name: 'Send invitations', completed: true },
  { name: 'Finalize menu', completed: false },
  { name: 'Arrange transportation', completed: false },
  { name: 'Confirm photographer', completed: false },
];

export function EventPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="min-h-screen bg-grey-50">
      <Navigation />
      
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20">
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-300 to-rose-400" />
            <h1 className="text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>Wedding Night</h1>
          </div>
          <p className="text-grey-600 text-lg">January 10, 2025</p>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft mb-8 p-2">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-rose-50 text-rose-300'
                      : 'text-grey-600 hover:bg-grey-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Event Summary */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <h3 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Event Summary</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-grey-600 mb-2">Venue</label>
                  <input 
                    type="text"
                    defaultValue="Grand Ballroom, Plaza Hotel"
                    className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-grey-600 mb-2">Time</label>
                  <input 
                    type="text"
                    defaultValue="6:00 PM"
                    className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-grey-600 mb-2">Guest Count</label>
                  <input 
                    type="text"
                    defaultValue="200"
                    className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-grey-600 mb-2">Dress Code</label>
                  <input 
                    type="text"
                    defaultValue="Black Tie"
                    className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-6">
              <button className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all text-left">
                <CheckCircle2 className="w-6 h-6 text-rose-300 mb-3" />
                <div className="text-lg text-grey-800 mb-1">Tasks</div>
                <div className="text-sm text-grey-600">3 of 8 completed</div>
              </button>
              <button className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all text-left">
                <DollarSign className="w-6 h-6 text-rose-300 mb-3" />
                <div className="text-lg text-grey-800 mb-1">Budget</div>
                <div className="text-sm text-grey-600">$15k of $25k spent</div>
              </button>
              <button className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all text-left">
                <Image className="w-6 h-6 text-rose-300 mb-3" />
                <div className="text-lg text-grey-800 mb-1">Mood Board</div>
                <div className="text-sm text-grey-600">12 images saved</div>
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'planning' && (
          <div className="space-y-8">
            {/* Venue Details */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-rose-300" />
                <h3 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Venue Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-grey-600 mb-2">Venue Name</label>
                  <input 
                    type="text"
                    defaultValue="Grand Ballroom, Plaza Hotel"
                    className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-grey-600 mb-2">Contact Person</label>
                  <input 
                    type="text"
                    defaultValue="Sarah Johnson"
                    className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-grey-600 mb-2">Phone</label>
                  <input 
                    type="text"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-grey-600 mb-2">Email</label>
                  <input 
                    type="text"
                    defaultValue="events@plazahotel.com"
                    className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-grey-600 mb-2">Address</label>
                  <input 
                    type="text"
                    defaultValue="123 Grand Avenue, City Center, NY 10001"
                    className="w-full px-4 py-3 border border-grey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
              </div>
            </div>

            {/* Vendors Section */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Vendors</h3>
                <button className="px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Vendor
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-grey-50 rounded-xl">
                  <div className="text-sm text-grey-600 mb-2">Photographer</div>
                  <div className="text-grey-800 mb-1">John Smith Photography</div>
                  <div className="text-sm text-grey-600 mb-3">john@photography.com</div>
                  <div className="text-rose-300">$3,000</div>
                </div>
                <div className="p-6 bg-grey-50 rounded-xl">
                  <div className="text-sm text-grey-600 mb-2">Catering</div>
                  <div className="text-grey-800 mb-1">Gourmet Catering Co.</div>
                  <div className="text-sm text-grey-600 mb-3">info@gourmetcatering.com</div>
                  <div className="text-rose-300">$8,000</div>
                </div>
                <div className="p-6 bg-grey-50 rounded-xl">
                  <div className="text-sm text-grey-600 mb-2">Florist</div>
                  <div className="text-grey-800 mb-1">Bloom & Petals</div>
                  <div className="text-sm text-grey-600 mb-3">hello@bloompetals.com</div>
                  <div className="text-rose-300">$2,500</div>
                </div>
                <div className="p-6 bg-grey-50 rounded-xl">
                  <div className="text-sm text-grey-600 mb-2">DJ/Music</div>
                  <div className="text-grey-800 mb-1">Elite Entertainment</div>
                  <div className="text-sm text-grey-600 mb-3">bookings@eliteent.com</div>
                  <div className="text-rose-300">$1,500</div>
                </div>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-rose-300" />
                <h3 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Event Timeline</h3>
              </div>
              <div className="space-y-4">
                {[
                  { time: '5:00 PM', event: 'Guest arrival & cocktail hour' },
                  { time: '6:00 PM', event: 'Ceremony begins' },
                  { time: '6:30 PM', event: 'Couple\'s grand entrance' },
                  { time: '7:00 PM', event: 'Dinner service' },
                  { time: '8:30 PM', event: 'First dance & speeches' },
                  { time: '9:00 PM', event: 'Cake cutting' },
                  { time: '9:30 PM', event: 'Open dance floor' },
                  { time: '11:30 PM', event: 'Event concludes' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-grey-50 transition-colors">
                    <div className="w-24 text-rose-300 flex-shrink-0">{item.time}</div>
                    <div className="text-grey-800">{item.event}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guest Management */}
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-soft">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-rose-300" />
                  <h3 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Guest List</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-grey-600">Total Invited</span>
                    <span className="text-2xl text-grey-800">200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-grey-600">Confirmed</span>
                    <span className="text-xl text-rose-300">145</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-grey-600">Declined</span>
                    <span className="text-xl text-grey-500">25</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-grey-100">
                    <span className="text-grey-600">Awaiting Response</span>
                    <span className="text-xl text-grey-800">30</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-soft">
                <h3 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Special Requirements</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-grey-600">Dietary Restrictions</span>
                    <span className="text-grey-800">12 guests</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-grey-600">Children Attending</span>
                    <span className="text-grey-800">8 guests</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-grey-600">Accessibility Needs</span>
                    <span className="text-grey-800">3 guests</span>
                  </div>
                  <button className="w-full mt-4 px-4 py-3 border border-grey-200 rounded-xl hover:bg-grey-50 transition-colors text-grey-700">
                    View Full Guest List
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Tasks</h3>
              <button className="px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-grey-50 transition-colors">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    task.completed ? 'border-rose-300 bg-rose-300' : 'border-grey-300'
                  }`}>
                    {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className={task.completed ? 'text-grey-500 line-through' : 'text-grey-800'}>
                    {task.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'budget' && (
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h3 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Budget Breakdown</h3>
            <div className="space-y-4">
              {[
                { name: 'Venue', planned: 10000, spent: 10000 },
                { name: 'Catering', planned: 8000, spent: 4000 },
                { name: 'Photography', planned: 3000, spent: 1000 },
                { name: 'Decor', planned: 2500, spent: 0 },
                { name: 'Music/DJ', planned: 1500, spent: 0 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-grey-100 last:border-0">
                  <span className="text-grey-800">{item.name}</span>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-sm text-grey-500">Planned</div>
                      <div className="text-grey-700">${item.planned.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-grey-500">Spent</div>
                      <div className="text-rose-300">${item.spent.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'moodboard' && (
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Mood Board</h3>
              <button className="px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Upload Image
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="group relative">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-soft">
                    <ImageWithFallback 
                      src={`https://images.unsplash.com/photo-${i === 1 ? '1722872112546-936593441be8' : i === 2 ? '1551468307-8c1e3c78013c' : i === 3 ? '1507088991476-665ae61e1eec' : i === 4 ? '1677768061409-3d4fbd0250d1' : i === 5 ? '1753541306536-7847bcc0489d' : '1658851866325-49fb8b7fbcb2'}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080`}
                      alt="Inspiration"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-5 h-5 text-rose-300" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h3 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Shared Notes</h3>
            <textarea
              placeholder="Add your notes, ideas, or important reminders here..."
              className="w-full h-64 p-4 border border-grey-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent"
            />
            <button className="mt-4 px-6 py-3 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors">
              Save Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
