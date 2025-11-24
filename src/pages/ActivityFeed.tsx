import React from 'react';
import { Navigation } from '../components/Navigation';
import { Heart, Image, DollarSign, CheckCircle2, FileText, Calendar } from 'lucide-react';

const activities = [
  {
    id: 1,
    user: 'Jinan',
    action: 'added 3 new photos to Wedding Night mood board',
    time: '2 hours ago',
    icon: Image,
    color: 'from-rose-100 to-peach-100',
  },
  {
    id: 2,
    user: 'Hisham',
    action: 'updated the honeymoon budget',
    time: '5 hours ago',
    icon: DollarSign,
    color: 'from-peach-100 to-rose-100',
  },
  {
    id: 3,
    user: 'Jinan',
    action: 'completed task "Book photographer"',
    time: 'Yesterday',
    icon: CheckCircle2,
    color: 'from-rose-100 to-rose-200',
  },
  {
    id: 4,
    user: 'Hisham',
    action: 'added notes to Henna Night event',
    time: '2 days ago',
    icon: FileText,
    color: 'from-peach-100 to-peach-200',
  },
  {
    id: 5,
    user: 'Jinan',
    action: 'scheduled venue visit for Malka',
    time: '3 days ago',
    icon: Calendar,
    color: 'from-rose-100 to-peach-100',
  },
  {
    id: 6,
    user: 'Hisham',
    action: 'uploaded wedding dress inspiration',
    time: '3 days ago',
    icon: Image,
    color: 'from-rose-100 to-rose-200',
  },
  {
    id: 7,
    user: 'Jinan',
    action: 'added new category to budget: Favors',
    time: '4 days ago',
    icon: DollarSign,
    color: 'from-peach-100 to-rose-100',
  },
  {
    id: 8,
    user: 'Hisham',
    action: 'completed task "Send save the dates"',
    time: '5 days ago',
    icon: CheckCircle2,
    color: 'from-rose-100 to-peach-100',
  },
  {
    id: 9,
    user: 'Jinan',
    action: 'created new event: Bride Preparation',
    time: '1 week ago',
    icon: Heart,
    color: 'from-rose-100 to-rose-200',
  },
  {
    id: 10,
    user: 'Hisham',
    action: 'updated honeymoon destination to Maldives',
    time: '1 week ago',
    icon: Calendar,
    color: 'from-peach-100 to-peach-200',
  },
];

export function ActivityFeed() {
  return (
    <div className="min-h-screen bg-grey-50">
      <Navigation />
      
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20">
        {/* Header */}
        <h1 className="text-4xl mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Activity Feed</h1>
        
        {/* Activity List */}
        <div className="bg-white rounded-2xl p-8 shadow-soft">
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-rose-400" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-grey-700 mb-1">
                      <span className="text-grey-800">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-sm text-grey-500">{activity.time}</p>
                  </div>
                  
                  {/* Divider line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-14 mt-16 w-0.5 h-6 bg-grey-100" style={{ marginLeft: '20px' }} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Load More */}
          <button className="w-full mt-8 py-3 border border-grey-200 rounded-xl hover:bg-grey-50 transition-colors text-grey-600">
            Load More Activity
          </button>
        </div>
      </div>
    </div>
  );
}
