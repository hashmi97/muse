import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

const budgetData = {
  malka: {
    name: 'Malka',
    color: 'from-rose-200 to-rose-300',
    total: 8000,
    spent: 6500,
    categories: [
      { name: 'Venue', planned: 3000, spent: 3000 },
      { name: 'Catering', planned: 3500, spent: 2500 },
      { name: 'Decor', planned: 1000, spent: 800 },
      { name: 'Photography', planned: 500, spent: 200 },
    ],
  },
  henna: {
    name: 'Henna Night',
    color: 'from-peach-200 to-rose-200',
    total: 5000,
    spent: 3200,
    categories: [
      { name: 'Venue', planned: 2000, spent: 2000 },
      { name: 'Henna Artist', planned: 800, spent: 800 },
      { name: 'Decor', planned: 1200, spent: 400 },
      { name: 'Entertainment', planned: 1000, spent: 0 },
    ],
  },
  wedding: {
    name: 'Wedding Night',
    color: 'from-rose-300 to-rose-400',
    total: 25000,
    spent: 15000,
    categories: [
      { name: 'Venue', planned: 10000, spent: 10000 },
      { name: 'Catering', planned: 8000, spent: 4000 },
      { name: 'Photography', planned: 3000, spent: 1000 },
      { name: 'Decor', planned: 2500, spent: 0 },
      { name: 'Music/DJ', planned: 1500, spent: 0 },
    ],
  },
  bridePrep: {
    name: 'Bride Preparation',
    color: 'from-peach-100 to-peach-200',
    total: 3000,
    spent: 1800,
    categories: [
      { name: 'Dress', planned: 1500, spent: 1500 },
      { name: 'Makeup', planned: 500, spent: 300 },
      { name: 'Hair', planned: 400, spent: 0 },
      { name: 'Accessories', planned: 600, spent: 0 },
    ],
  },
  honeymoon: {
    name: 'Honeymoon',
    color: 'from-rose-100 to-peach-200',
    total: 4000,
    spent: 1000,
    categories: [
      { name: 'Flights', planned: 1500, spent: 1000 },
      { name: 'Accommodation', planned: 1800, spent: 0 },
      { name: 'Activities', planned: 500, spent: 0 },
      { name: 'Food & Dining', planned: 200, spent: 0 },
    ],
  },
};

export function BudgetPlanner() {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set(['wedding']));
  
  const toggleEvent = (eventKey: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventKey)) {
      newExpanded.delete(eventKey);
    } else {
      newExpanded.add(eventKey);
    }
    setExpandedEvents(newExpanded);
  };
  
  const totalPlanned = Object.values(budgetData).reduce((sum, event) => sum + event.total, 0);
  const totalSpent = Object.values(budgetData).reduce((sum, event) => sum + event.spent, 0);
  
  return (
    <div className="min-h-screen bg-grey-50">
      <Navigation />
      
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20">
        {/* Header */}
        <h1 className="text-4xl mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Budget Planner</h1>
        
        {/* Total Summary */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="text-grey-600 mb-2">Total Planned</div>
            <div className="text-3xl text-grey-800">${totalPlanned.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="text-grey-600 mb-2">Total Spent</div>
            <div className="text-3xl text-rose-300">${totalSpent.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="text-grey-600 mb-2">Remaining</div>
            <div className="text-3xl text-grey-800">${(totalPlanned - totalSpent).toLocaleString()}</div>
          </div>
        </div>
        
        {/* Event Budget Cards */}
        <div className="space-y-6">
          {Object.entries(budgetData).map(([key, event]) => {
            const isExpanded = expandedEvents.has(key);
            const percentSpent = (event.spent / event.total) * 100;
            
            return (
              <div key={key} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                {/* Event Header */}
                <button
                  onClick={() => toggleEvent(key)}
                  className="w-full p-6 flex items-center justify-between hover:bg-grey-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${event.color}`} />
                    <div className="text-left">
                      <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>{event.name}</h3>
                      <div className="text-sm text-grey-500">
                        ${event.spent.toLocaleString()} of ${event.total.toLocaleString()} spent
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-48">
                      <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${event.color} rounded-full transition-all`}
                          style={{ width: `${percentSpent}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-grey-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-grey-400" />
                    )}
                  </div>
                </button>
                
                {/* Expanded Categories */}
                {isExpanded && (
                  <div className="border-t border-grey-100 p-6">
                    <div className="space-y-4">
                      {event.categories.map((category, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b border-grey-50 last:border-0">
                          <div className="flex-1">
                            <div className="text-grey-800">{category.name}</div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <div className="text-sm text-grey-500">Planned</div>
                              <div className="text-grey-700">${category.planned.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-grey-500">Spent</div>
                              <div className="text-rose-300">${category.spent.toLocaleString()}</div>
                            </div>
                            <div className="text-right w-24">
                              <div className="text-sm text-grey-500">Remaining</div>
                              <div className="text-grey-700">${(category.planned - category.spent).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-6 w-full py-3 border-2 border-dashed border-grey-200 rounded-xl hover:border-grey-300 hover:bg-grey-50 transition-all flex items-center justify-center gap-2 text-grey-600">
                      <Plus className="w-4 h-4" />
                      Add Line Item
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
