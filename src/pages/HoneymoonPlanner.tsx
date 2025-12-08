import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { MapPin, Calendar, Plane, Hotel, Activity, DollarSign, Plus, Loader2, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAllEvents, fetchHoneymoonPlan, createOrUpdateHoneymoonPlan, createHoneymoonItem, deleteHoneymoonItem, type ApiEvent, type HoneymoonPlan, type HoneymoonItem } from '../lib/api';

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function calculateDays(startDate: string | null, endDate: string | null): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function HoneymoonPlanner() {
  const { accessToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [honeymoonEvent, setHoneymoonEvent] = useState<ApiEvent | null>(null);
  const [plan, setPlan] = useState<HoneymoonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState(false);
  const [planForm, setPlanForm] = useState({
    destination_country: '',
    destination_city: '',
    start_date: '',
    end_date: '',
    notes: '',
  });
  const [showAddItemForm, setShowAddItemForm] = useState<{ type: HoneymoonItem['type'] } | null>(null);
  const [itemForm, setItemForm] = useState({
    type: 'flights' as HoneymoonItem['type'],
    label: '',
    start_date: '',
    end_date: '',
    planned_amount: '',
    actual_amount: '',
    notes: '',
  });

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
        
        // Find honeymoon event
        const honeymoon = eventsData.find(e => e.event_type.key === 'honeymoon');
        if (!honeymoon) {
          setError('No honeymoon event found. Please create a honeymoon event in onboarding.');
          return;
        }
        
        setHoneymoonEvent(honeymoon);
        setPlanForm({
          destination_country: '',
          destination_city: '',
          start_date: honeymoon.start_date || '',
          end_date: honeymoon.end_date || '',
          notes: '',
        });

        // Load honeymoon plan
        try {
          const planData = await fetchHoneymoonPlan(accessToken, honeymoon.id);
          setPlan(planData);
          setPlanForm({
            destination_country: planData.destination_country || '',
            destination_city: planData.destination_city || '',
            start_date: planData.start_date || '',
            end_date: planData.end_date || '',
            notes: planData.notes || '',
          });
        } catch (err) {
          // Plan might not exist yet, that's okay
          setPlan(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load honeymoon data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [accessToken, authLoading, navigate]);

  const handleSavePlan = async () => {
    if (!accessToken || !honeymoonEvent) return;
    try {
      const planData = await createOrUpdateHoneymoonPlan(accessToken, honeymoonEvent.id, {
        destination_country: planForm.destination_country || undefined,
        destination_city: planForm.destination_city || undefined,
        start_date: planForm.start_date || undefined,
        end_date: planForm.end_date || undefined,
        notes: planForm.notes || undefined,
      });
      setPlan(planData);
      setEditingPlan(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save plan');
    }
  };

  const handleAddItem = async () => {
    if (!accessToken || !plan || !itemForm.label.trim()) return;
    try {
      await createHoneymoonItem(accessToken, plan.id, {
        type: itemForm.type,
        label: itemForm.label,
        start_date: itemForm.start_date || undefined,
        end_date: itemForm.end_date || undefined,
        planned_amount: itemForm.planned_amount || undefined,
        actual_amount: itemForm.actual_amount || undefined,
        notes: itemForm.notes || undefined,
      });
      setItemForm({
        type: 'flights',
        label: '',
        start_date: '',
        end_date: '',
        planned_amount: '',
        actual_amount: '',
        notes: '',
      });
      setShowAddItemForm(null);
      // Reload plan
      if (honeymoonEvent) {
        const planData = await fetchHoneymoonPlan(accessToken, honeymoonEvent.id);
        setPlan(planData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!accessToken || !confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteHoneymoonItem(accessToken, itemId);
      // Reload plan
      if (honeymoonEvent) {
        const planData = await fetchHoneymoonPlan(accessToken, honeymoonEvent.id);
        setPlan(planData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const itemsByType = {
    flights: plan?.items.filter(i => i.type === 'flights') || [],
    hotels: plan?.items.filter(i => i.type === 'hotels') || [],
    activities: plan?.items.filter(i => i.type === 'activities') || [],
    misc: plan?.items.filter(i => i.type === 'misc') || [],
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-grey-50">
        <Navigation />
        <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-rose-300 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-50">
      <Navigation />
      
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20">
        <h1 className="text-4xl mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Honeymoon Planner</h1>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {!honeymoonEvent ? (
          <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
            <p className="text-grey-600 mb-4">No honeymoon event found.</p>
            <p className="text-sm text-grey-500">Please create a honeymoon event in onboarding first.</p>
          </div>
        ) : (
          <>
            {/* Destination & Dates */}
            <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Destination</h3>
            </div>
                  {!editingPlan && (
                    <button
                      onClick={() => setEditingPlan(true)}
                      className="p-2 text-grey-400 hover:text-rose-300 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingPlan ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Country"
                      value={planForm.destination_country}
                      onChange={(e) => setPlanForm({ ...planForm, destination_country: e.target.value })}
                      className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={planForm.destination_city}
                      onChange={(e) => setPlanForm({ ...planForm, destination_city: e.target.value })}
                      className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePlan}
                        className="flex-1 px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingPlan(false);
                          if (plan) {
                            setPlanForm({
                              destination_country: plan.destination_country || '',
                              destination_city: plan.destination_city || '',
                              start_date: plan.start_date || '',
                              end_date: plan.end_date || '',
                              notes: plan.notes || '',
                            });
                          }
                        }}
                        className="px-4 py-2 bg-grey-200 text-grey-700 rounded-lg hover:bg-grey-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
            </div>
                ) : (
                  <>
                    {plan?.destination_city && plan?.destination_country ? (
                      <>
                        <h4 className="text-lg text-grey-800 mb-2">
                          {plan.destination_city}, {plan.destination_country}
                        </h4>
                        {plan.notes && <p className="text-grey-600">{plan.notes}</p>}
                      </>
                    ) : (
                      <p className="text-grey-500">No destination set</p>
                    )}
                  </>
                )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Dates</h3>
            </div>
                  {!editingPlan && (
                    <button
                      onClick={() => setEditingPlan(true)}
                      className="p-2 text-grey-400 hover:text-rose-300 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingPlan ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-grey-600 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={planForm.start_date}
                        onChange={(e) => setPlanForm({ ...planForm, start_date: e.target.value })}
                        className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-grey-600 mb-2">End Date</label>
                      <input
                        type="date"
                        value={planForm.end_date}
                        onChange={(e) => setPlanForm({ ...planForm, end_date: e.target.value })}
                        className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
                    </div>
                  </div>
                ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-grey-600 mb-2">Departure</label>
                      <div className="text-grey-800">{formatDate(plan?.start_date || null)}</div>
              </div>
              <div>
                <label className="block text-sm text-grey-600 mb-2">Return</label>
                      <div className="text-grey-800">{formatDate(plan?.end_date || null)}</div>
              </div>
                    {plan?.start_date && plan?.end_date && (
              <div className="pt-4 border-t border-grey-100">
                <div className="text-grey-600">Duration</div>
                        <div className="text-2xl text-grey-800">
                          {calculateDays(plan.start_date, plan.end_date)} days
                        </div>
                      </div>
                    )}
                  </div>
                )}
          </div>
        </div>
        
            {/* Flights */}
            <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Flights</h3>
            </div>
                <button
                  onClick={() => setShowAddItemForm({ type: 'flights' })}
                  className="px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Flight
                </button>
              </div>
              {showAddItemForm?.type === 'flights' ? (
                <div className="p-4 bg-rose-50 rounded-xl space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Flight details (e.g., Emirates EK 123)"
                    value={itemForm.label}
                    onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                    className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      placeholder="Departure date"
                      value={itemForm.start_date}
                      onChange={(e) => setItemForm({ ...itemForm, start_date: e.target.value })}
                      className="px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                    <input
                      type="number"
                      placeholder="Planned amount"
                      value={itemForm.planned_amount}
                      onChange={(e) => setItemForm({ ...itemForm, planned_amount: e.target.value })}
                      className="px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddItem}
                      className="flex-1 px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddItemForm(null)}
                      className="px-4 py-2 bg-grey-200 text-grey-700 rounded-lg hover:bg-grey-300 transition-colors"
                    >
                      Cancel
            </button>
          </div>
                </div>
              ) : null}
              {itemsByType.flights.length === 0 ? (
                <div className="text-center py-8 text-grey-500">No flights added yet</div>
              ) : (
          <div className="grid grid-cols-2 gap-6">
                  {itemsByType.flights.map((item) => (
                    <div key={item.id} className="p-4 bg-grey-50 rounded-xl relative group">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="absolute top-2 right-2 p-1 text-grey-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-sm text-grey-600 mb-2">Flight</div>
                      <div className="text-grey-800 mb-1">{item.label}</div>
                      {item.start_date && (
                        <div className="text-sm text-grey-500">{formatDate(item.start_date)}</div>
                      )}
                      {item.planned_amount && (
                        <div className="text-rose-300 mt-2">{formatCurrency(item.planned_amount)}</div>
                      )}
                    </div>
                  ))}
            </div>
              )}
        </div>
        
            {/* Hotels */}
            <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Hotel className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Accommodation</h3>
            </div>
                <button
                  onClick={() => setShowAddItemForm({ type: 'hotels' })}
                  className="px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors text-sm flex items-center gap-2"
                >
              <Plus className="w-4 h-4" />
                  Add Hotel
            </button>
          </div>
              {showAddItemForm?.type === 'hotels' ? (
                <div className="p-4 bg-rose-50 rounded-xl space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Hotel name"
                    value={itemForm.label}
                    onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                    className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      placeholder="Check-in"
                      value={itemForm.start_date}
                      onChange={(e) => setItemForm({ ...itemForm, start_date: e.target.value })}
                      className="px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                    <input
                      type="date"
                      placeholder="Check-out"
                      value={itemForm.end_date}
                      onChange={(e) => setItemForm({ ...itemForm, end_date: e.target.value })}
                      className="px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Planned amount"
                    value={itemForm.planned_amount}
                    onChange={(e) => setItemForm({ ...itemForm, planned_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setItemForm({ ...itemForm, type: 'hotels' });
                        handleAddItem();
                      }}
                      className="flex-1 px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddItemForm(null)}
                      className="px-4 py-2 bg-grey-200 text-grey-700 rounded-lg hover:bg-grey-300 transition-colors"
                    >
                      Cancel
                    </button>
          </div>
                </div>
              ) : null}
              {itemsByType.hotels.length === 0 ? (
                <div className="text-center py-12 text-grey-500">No hotels booked yet</div>
              ) : (
                <div className="space-y-3">
                  {itemsByType.hotels.map((item) => (
                    <div key={item.id} className="p-4 bg-grey-50 rounded-xl relative group">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="absolute top-2 right-2 p-1 text-grey-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-grey-800 font-medium mb-1">{item.label}</div>
                      {item.start_date && item.end_date && (
                        <div className="text-sm text-grey-600">
                          {formatDate(item.start_date)} - {formatDate(item.end_date)}
                        </div>
                      )}
                      {item.planned_amount && (
                        <div className="text-rose-300 mt-2">{formatCurrency(item.planned_amount)}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
        </div>
        
            {/* Activities & Budget */}
            <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Activities</h3>
            </div>
                  <button
                    onClick={() => setShowAddItemForm({ type: 'activities' })}
                    className="px-4 py-2 border border-grey-200 rounded-lg hover:bg-grey-50 transition-colors text-sm flex items-center gap-2"
                  >
                <Plus className="w-4 h-4" />
                Add Activity
              </button>
            </div>
                {showAddItemForm?.type === 'activities' ? (
                  <div className="p-4 bg-rose-50 rounded-xl space-y-3 mb-4">
                    <input
                      type="text"
                      placeholder="Activity name"
                      value={itemForm.label}
                      onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                      className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                    <input
                      type="number"
                      placeholder="Planned amount"
                      value={itemForm.planned_amount}
                      onChange={(e) => setItemForm({ ...itemForm, planned_amount: e.target.value })}
                      className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setItemForm({ ...itemForm, type: 'activities' });
                          handleAddItem();
                        }}
                        className="flex-1 px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddItemForm(null)}
                        className="px-4 py-2 bg-grey-200 text-grey-700 rounded-lg hover:bg-grey-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
                {itemsByType.activities.length === 0 ? (
                  <div className="text-center py-8 text-grey-500">No activities added yet</div>
                ) : (
                  <div className="space-y-3">
                    {itemsByType.activities.map((item) => (
                      <div key={item.id} className="p-4 border border-grey-200 rounded-xl relative group hover:bg-grey-50 transition-colors">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="absolute top-2 right-2 p-1 text-grey-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="text-grey-800 font-medium">{item.label}</div>
                        {item.notes && <div className="text-sm text-grey-500 mt-1">{item.notes}</div>}
                        {item.planned_amount && (
                          <div className="text-rose-300 mt-2">{formatCurrency(item.planned_amount)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-rose-300" />
              <h3 className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Budget</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-grey-600">Flights</span>
                    <span className="text-grey-800">
                      {formatCurrency(
                        itemsByType.flights.reduce((sum, item) => sum + (parseFloat(item.planned_amount) || 0), 0)
                      )}
                    </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-grey-600">Accommodation</span>
                    <span className="text-grey-800">
                      {formatCurrency(
                        itemsByType.hotels.reduce((sum, item) => sum + (parseFloat(item.planned_amount) || 0), 0)
                      )}
                    </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-grey-600">Activities</span>
                    <span className="text-grey-800">
                      {formatCurrency(
                        itemsByType.activities.reduce((sum, item) => sum + (parseFloat(item.planned_amount) || 0), 0)
                      )}
                    </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-grey-100">
                    <span className="text-grey-800 font-medium">Total Planned</span>
                    <span className="text-xl text-grey-800">
                      {plan ? formatCurrency(plan.total_planned) : '$0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-grey-600">Total Spent</span>
                    <span className="text-xl text-rose-300">
                      {plan ? formatCurrency(plan.total_spent) : '$0.00'}
                    </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-grey-600">Remaining</span>
                    <span className="text-xl text-grey-800">
                      {plan
                        ? formatCurrency(parseFloat(plan.total_planned) - parseFloat(plan.total_spent))
                        : '$0.00'}
                    </span>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

