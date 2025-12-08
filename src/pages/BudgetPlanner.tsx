import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAllEvents, fetchEventBudget, type ApiEvent, type EventBudget } from '../lib/api';

const eventColors: Record<string, string> = {
  malka: 'from-rose-200 to-rose-300',
  henna_night: 'from-peach-200 to-rose-200',
  bride_preparation: 'from-peach-100 to-peach-200',
  wedding_night: 'from-rose-300 to-rose-400',
  honeymoon: 'from-rose-100 to-peach-200',
};

type EventBudgetData = {
  event: ApiEvent;
  budget: EventBudget | null;
  loading: boolean;
};

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BudgetPlanner() {
  const { accessToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [eventBudgets, setEventBudgets] = useState<Map<number, EventBudgetData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      navigate('/signup');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const eventsData = await fetchAllEvents(accessToken);
        setEvents(eventsData);

        // Load budgets for all events
        const budgetsMap = new Map<number, EventBudgetData>();
        for (const event of eventsData) {
          budgetsMap.set(event.id, { event, budget: null, loading: true });
          try {
            const budget = await fetchEventBudget(accessToken, event.id);
            budgetsMap.set(event.id, { event, budget, loading: false });
          } catch (err) {
            budgetsMap.set(event.id, { event, budget: null, loading: false });
          }
        }
        setEventBudgets(budgetsMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load budget data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [accessToken, authLoading, navigate]);

  const toggleEvent = (eventId: number) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const totalPlanned = Array.from(eventBudgets.values()).reduce(
    (sum, data) => sum + (data.budget ? parseFloat(data.budget.total_planned) : 0),
    0
  );
  const totalSpent = Array.from(eventBudgets.values()).reduce(
    (sum, data) => sum + (data.budget ? parseFloat(data.budget.total_spent) : 0),
    0
  );
  
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
            <div className="text-3xl text-grey-800">{formatCurrency(totalPlanned)}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="text-grey-600 mb-2">Total Spent</div>
            <div className="text-3xl text-rose-300">{formatCurrency(totalSpent)}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="text-grey-600 mb-2">Remaining</div>
            <div className="text-3xl text-grey-800">{formatCurrency(totalPlanned - totalSpent)}</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-rose-300 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
            <p className="text-grey-600">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
            <p className="text-grey-600">No events found. Create events in onboarding first.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const budgetData = eventBudgets.get(event.id);
              const isExpanded = expandedEvents.has(event.id);
              const budget = budgetData?.budget;
              const eventTotal = budget ? parseFloat(budget.total_planned) : 0;
              const eventSpent = budget ? parseFloat(budget.total_spent) : 0;
              const percentSpent = eventTotal > 0 ? (eventSpent / eventTotal) * 100 : 0;
              const eventColor = eventColors[event.event_type.key] || 'from-grey-200 to-grey-300';
              const eventName = event.title || event.event_type.name_en;

              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                  <button
                    onClick={() => toggleEvent(event.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-grey-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${eventColor}`} />
                      <div className="text-left">
                        <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {eventName}
                        </h3>
                        <div className="text-sm text-grey-500">
                          {formatCurrency(eventSpent)} of {formatCurrency(eventTotal)} spent
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-48">
                        <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${eventColor} rounded-full transition-all`}
                            style={{ width: `${Math.min(100, percentSpent)}%` }}
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

                  {isExpanded && (
                    <div className="border-t border-grey-100 p-6">
                      {budgetData?.loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-rose-300 animate-spin" />
                        </div>
                      ) : budget && budget.categories.length > 0 ? (
                        <>
                          <div className="space-y-4">
                            {budget.categories.map((category) => {
                              const catPlanned = parseFloat(category.planned_amount);
                              const catSpent = parseFloat(category.spent_amount);
                              return (
                                <div
                                  key={category.id}
                                  className="flex items-center justify-between py-3 border-b border-grey-50 last:border-0"
                                >
                                  <div className="flex-1">
                                    <div className="text-grey-800 font-medium">{category.category.label}</div>
                                    <div className="text-xs text-grey-500 mt-1">
                                      {category.line_items.length} item{category.line_items.length !== 1 ? 's' : ''}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-8">
                                    <div className="text-right">
                                      <div className="text-sm text-grey-500">Planned</div>
                                      <div className="text-grey-700">{formatCurrency(catPlanned)}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-grey-500">Spent</div>
                                      <div className="text-rose-300">{formatCurrency(catSpent)}</div>
                                    </div>
                                    <div className="text-right w-24">
                                      <div className="text-sm text-grey-500">Remaining</div>
                                      <div className="text-grey-700">{formatCurrency(catPlanned - catSpent)}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => navigate(`/event/${event.id}?tab=budget`)}
                            className="mt-6 w-full py-3 border-2 border-dashed border-grey-200 rounded-xl hover:border-rose-300 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 text-grey-600 hover:text-rose-300"
                          >
                            <Plus className="w-4 h-4" />
                            Manage Budget
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-8 text-grey-600">
                          <p className="mb-4">No budget categories yet.</p>
                          <button
                            onClick={() => navigate(`/event/${event.id}?tab=budget`)}
                            className="px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors"
                          >
                            Create Budget
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
