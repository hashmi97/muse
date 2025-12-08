import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Calendar, CheckCircle2, DollarSign, Image, FileText, Plus, Heart, Users, Clock, MapPin, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchEvent, type ApiEvent, fetchEventBudget, createBudgetLineItem, deleteBudgetItem, type EventBudget, type EventBudgetCategory, type BudgetLineItem, fetchTasks, createTask, updateTask, deleteTask, type ApiTask, fetchMoodboard, uploadMedia, createMoodboardItem, deleteMoodboardItem, type MoodBoard, type MoodBoardItem } from '../lib/api';

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

function formatEventDate(dateString: string | null): string {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { accessToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksTotal: 0,
    budgetSpent: 0,
    budgetPlanned: 0,
    moodboardCount: 0,
  });
  const [budget, setBudget] = useState<EventBudget | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [showAddItemForm, setShowAddItemForm] = useState<number | null>(null);
  const [newItemData, setNewItemData] = useState({
    label: '',
    planned_amount: '',
    actual_amount: '',
    notes: '',
  });
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    due_date: '',
  });
  const [moodboard, setMoodboard] = useState<MoodBoard | null>(null);
  const [moodboardLoading, setMoodboardLoading] = useState(false);
  const [moodboardError, setMoodboardError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      navigate('/signup');
      return;
    }
    if (!eventId) {
      setError('Event ID is required');
      setLoading(false);
      return;
    }

    async function loadEvent() {
      try {
        setLoading(true);
        setError(null);
        const eventData = await fetchEvent(accessToken, parseInt(eventId, 10));
        if (!eventData) {
          setError('Event not found');
          return;
        }
        setEvent(eventData);
        // Stats will be calculated when other tabs are implemented
        // For now, set placeholder values
        setStats({
          tasksCompleted: 0,
          tasksTotal: 0,
          budgetSpent: 0,
          budgetPlanned: 0,
          moodboardCount: 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [accessToken, authLoading, navigate, eventId]);

  const loadBudget = async () => {
    if (!accessToken || !eventId) return;
    try {
      setBudgetLoading(true);
      setBudgetError(null);
      const budgetData = await fetchEventBudget(accessToken, parseInt(eventId, 10));
      setBudget(budgetData);
      // Update stats for overview tab
      const totalSpent = parseFloat(budgetData.total_spent) || 0;
      const totalPlanned = parseFloat(budgetData.total_planned) || 0;
      setStats(prev => ({
        ...prev,
        budgetSpent: totalSpent,
        budgetPlanned: totalPlanned,
      }));
    } catch (err) {
      setBudgetError(err instanceof Error ? err.message : 'Failed to load budget');
    } finally {
      setBudgetLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'budget' && accessToken && eventId) {
      loadBudget();
    }
  }, [activeTab, accessToken, eventId]);

  const loadTasks = async () => {
    if (!accessToken || !eventId) return;
    try {
      setTasksLoading(true);
      setTasksError(null);
      const tasksData = await fetchTasks(accessToken, parseInt(eventId, 10));
      setTasks(tasksData);
      // Update stats
      const completed = tasksData.filter(t => t.status === 'done').length;
      setStats(prev => ({
        ...prev,
        tasksCompleted: completed,
        tasksTotal: tasksData.length,
      }));
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tasks' && accessToken && eventId) {
      loadTasks();
    }
  }, [activeTab, accessToken, eventId]);

  const loadMoodboard = async () => {
    if (!accessToken || !eventId) return;
    try {
      setMoodboardLoading(true);
      setMoodboardError(null);
      const boardData = await fetchMoodboard(accessToken, parseInt(eventId, 10));
      setMoodboard(boardData);
      // Update stats
      setStats(prev => ({
        ...prev,
        moodboardCount: boardData.items.length,
      }));
    } catch (err) {
      setMoodboardError(err instanceof Error ? err.message : 'Failed to load moodboard');
    } finally {
      setMoodboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'moodboard' && accessToken && eventId) {
      loadMoodboard();
    }
  }, [activeTab, accessToken, eventId]);

  const handleUploadImage = async (file: File) => {
    if (!accessToken || !eventId || uploading) return;
    try {
      setUploading(true);
      setMoodboardError(null);
      // First upload the media file
      const media = await uploadMedia(accessToken, file);
      // Then create the moodboard item
      await createMoodboardItem(accessToken, parseInt(eventId, 10), {
        media_id: media.id,
        caption: '',
      });
      await loadMoodboard();
    } catch (err) {
      setMoodboardError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMoodboardItem = async (itemId: number) => {
    if (!accessToken || !confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteMoodboardItem(accessToken, itemId);
      await loadMoodboard();
    } catch (err) {
      setMoodboardError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleCreateTask = async () => {
    if (!accessToken || !eventId || !newTaskData.title.trim()) return;
    try {
      await createTask(accessToken, {
        title: newTaskData.title,
        description: newTaskData.description || undefined,
        due_date: newTaskData.due_date || undefined,
        event_id: parseInt(eventId, 10),
        status: 'todo',
      });
      setNewTaskData({ title: '', description: '', due_date: '' });
      setShowAddTaskForm(false);
      await loadTasks();
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleToggleTask = async (task: ApiTask) => {
    if (!accessToken) return;
    try {
      const newStatus = task.status === 'done' ? 'todo' : 'done';
      await updateTask(accessToken, task.id, { status: newStatus });
      await loadTasks();
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!accessToken || !confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(accessToken, taskId);
      await loadTasks();
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddItem = async (categoryId: number) => {
    if (!accessToken || !newItemData.label.trim()) return;
    try {
      await createBudgetLineItem(accessToken, categoryId, {
        label: newItemData.label,
        planned_amount: newItemData.planned_amount || undefined,
        actual_amount: newItemData.actual_amount || undefined,
        notes: newItemData.notes || undefined,
      });
      setNewItemData({ label: '', planned_amount: '', actual_amount: '', notes: '' });
      setShowAddItemForm(null);
      await loadBudget();
    } catch (err) {
      setBudgetError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!accessToken || !confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteBudgetItem(accessToken, itemId);
      await loadBudget();
    } catch (err) {
      setBudgetError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  if (error || !event) {
    return (
      <div className="min-h-screen bg-grey-50">
        <Navigation />
        <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20">
          <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
            <p className="text-grey-600 mb-4">{error || 'Event not found'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-rose-300 text-white rounded-xl hover:bg-rose-400 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-grey-50">
      <Navigation />
      
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20">
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-300 to-rose-400" />
            <h1 className="text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              {event.title || event.event_type.name_en}
            </h1>
          </div>
          <p className="text-grey-600 text-lg">
            {event.start_date ? formatEventDate(event.start_date) : 'TBD'}
            {event.end_date && event.end_date !== event.start_date && 
              ` - ${formatEventDate(event.end_date)}`
            }
          </p>
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
              <button 
                onClick={() => setActiveTab('tasks')}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all text-left"
              >
                <CheckCircle2 className="w-6 h-6 text-rose-300 mb-3" />
                <div className="text-lg text-grey-800 mb-1">Tasks</div>
                <div className="text-sm text-grey-600">
                  {stats.tasksTotal > 0 
                    ? `${stats.tasksCompleted} of ${stats.tasksTotal} completed`
                    : 'No tasks yet'
                  }
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('budget')}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all text-left"
              >
                <DollarSign className="w-6 h-6 text-rose-300 mb-3" />
                <div className="text-lg text-grey-800 mb-1">Budget</div>
                <div className="text-sm text-grey-600">
                  {stats.budgetPlanned > 0
                    ? `$${(stats.budgetSpent / 1000).toFixed(0)}k of $${(stats.budgetPlanned / 1000).toFixed(0)}k spent`
                    : 'No budget set'
                  }
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('moodboard')}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all text-left"
              >
                <Image className="w-6 h-6 text-rose-300 mb-3" />
                <div className="text-lg text-grey-800 mb-1">Mood Board</div>
                <div className="text-sm text-grey-600">
                  {stats.moodboardCount > 0
                    ? `${stats.moodboardCount} image${stats.moodboardCount !== 1 ? 's' : ''} saved`
                    : 'No images yet'
                  }
                </div>
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
              <div>
                <h3 className="text-2xl mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Tasks</h3>
                {tasks.length > 0 && (
                  <p className="text-sm text-grey-600">
                    {tasks.filter(t => t.status === 'done').length} of {tasks.length} completed
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                className="px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {tasksError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {tasksError}
              </div>
            )}

            {showAddTaskForm && (
              <div className="mb-6 p-4 bg-rose-50 rounded-xl space-y-3">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                  rows={2}
                />
                <input
                  type="date"
                  placeholder="Due date (optional)"
                  value={newTaskData.due_date}
                  onChange={(e) => setNewTaskData({ ...newTaskData, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTask}
                    className="flex-1 px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors"
                  >
                    Add Task
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTaskForm(false);
                      setNewTaskData({ title: '', description: '', due_date: '' });
                    }}
                    className="px-4 py-2 bg-grey-200 text-grey-700 rounded-lg hover:bg-grey-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {tasksLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-rose-300 animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-grey-600">
                <p>No tasks yet. Create your first task to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isCompleted = task.status === 'done';
                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-grey-50 transition-colors"
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isCompleted ? 'border-rose-300 bg-rose-300' : 'border-grey-300 hover:border-rose-300'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`${isCompleted ? 'text-grey-500 line-through' : 'text-grey-800'} font-medium mb-1`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className={`text-sm ${isCompleted ? 'text-grey-400' : 'text-grey-600'}`}>
                            {task.description}
                          </div>
                        )}
                        {task.due_date && (
                          <div className="text-xs text-grey-500 mt-1">
                            Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-grey-400 hover:text-rose-300 transition-colors flex-shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'budget' && (
          <div className="space-y-6">
            {budgetLoading ? (
              <div className="bg-white rounded-2xl p-8 shadow-soft flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-rose-300 animate-spin" />
              </div>
            ) : budgetError ? (
              <div className="bg-white rounded-2xl p-8 shadow-soft">
                <p className="text-grey-600">{budgetError}</p>
                <button
                  onClick={loadBudget}
                  className="mt-4 px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : budget ? (
              <>
                {/* Budget Summary */}
                <div className="bg-white rounded-2xl p-8 shadow-soft">
                  <h3 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Budget Summary</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-grey-600 mb-2">Total Planned</div>
                      <div className="text-2xl text-grey-800">{formatCurrency(budget.total_planned)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-grey-600 mb-2">Total Spent</div>
                      <div className="text-2xl text-rose-300">{formatCurrency(budget.total_spent)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-grey-600 mb-2">Remaining</div>
                      <div className="text-2xl text-grey-800">
                        {formatCurrency(parseFloat(budget.total_planned) - parseFloat(budget.total_spent))}
                      </div>
                    </div>
                  </div>
                  {parseFloat(budget.total_planned) > 0 && (
                    <div className="mt-6">
                      <div className="w-full bg-grey-100 rounded-full h-3">
                        <div
                          className="bg-rose-300 h-3 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (parseFloat(budget.total_spent) / parseFloat(budget.total_planned)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Budget Categories */}
                <div className="space-y-4">
                  {budget.categories.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
                      <p className="text-grey-600 mb-4">No budget categories yet.</p>
                      <p className="text-sm text-grey-500">Add line items to create categories automatically.</p>
                    </div>
                  ) : (
                    budget.categories.map((category) => (
                      <div key={category.id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="w-full p-6 flex items-center justify-between hover:bg-grey-50 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            <h4 className="text-xl mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                              {category.category.label}
                            </h4>
                            <div className="flex items-center gap-6 text-sm text-grey-600">
                              <span>Planned: {formatCurrency(category.planned_amount)}</span>
                              <span>Spent: {formatCurrency(category.spent_amount)}</span>
                              <span>{category.line_items.length} item{category.line_items.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          {expandedCategories.has(category.id) ? (
                            <ChevronUp className="w-5 h-5 text-grey-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-grey-400" />
                          )}
                        </button>

                        {expandedCategories.has(category.id) && (
                          <div className="px-6 pb-6 border-t border-grey-100">
                            <div className="mt-4 space-y-3">
                              {category.line_items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-4 bg-grey-50 rounded-xl"
                                >
                                  <div className="flex-1">
                                    <div className="text-grey-800 font-medium mb-1">{item.label}</div>
                                    <div className="flex items-center gap-4 text-sm text-grey-600">
                                      {item.planned_amount && (
                                        <span>Planned: {formatCurrency(item.planned_amount)}</span>
                                      )}
                                      {item.actual_amount && (
                                        <span>Spent: {formatCurrency(item.actual_amount)}</span>
                                      )}
                                      {item.notes && <span className="italic">{item.notes}</span>}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-2 text-grey-400 hover:text-rose-300 transition-colors"
                                    title="Delete item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}

                              {showAddItemForm === category.id ? (
                                <div className="p-4 bg-rose-50 rounded-xl space-y-3">
                                  <input
                                    type="text"
                                    placeholder="Item name"
                                    value={newItemData.label}
                                    onChange={(e) => setNewItemData({ ...newItemData, label: e.target.value })}
                                    className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                                  />
                                  <div className="grid grid-cols-2 gap-3">
                                    <input
                                      type="number"
                                      placeholder="Planned amount"
                                      value={newItemData.planned_amount}
                                      onChange={(e) => setNewItemData({ ...newItemData, planned_amount: e.target.value })}
                                      className="px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                                    />
                                    <input
                                      type="number"
                                      placeholder="Actual amount"
                                      value={newItemData.actual_amount}
                                      onChange={(e) => setNewItemData({ ...newItemData, actual_amount: e.target.value })}
                                      className="px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                                    />
                                  </div>
                                  <textarea
                                    placeholder="Notes (optional)"
                                    value={newItemData.notes}
                                    onChange={(e) => setNewItemData({ ...newItemData, notes: e.target.value })}
                                    className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAddItem(category.id)}
                                      className="flex-1 px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors"
                                    >
                                      Add Item
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowAddItemForm(null);
                                        setNewItemData({ label: '', planned_amount: '', actual_amount: '', notes: '' });
                                      }}
                                      className="px-4 py-2 bg-grey-200 text-grey-700 rounded-lg hover:bg-grey-300 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowAddItemForm(category.id)}
                                  className="w-full p-3 border-2 border-dashed border-grey-300 rounded-xl text-grey-600 hover:border-rose-300 hover:text-rose-300 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Line Item
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
                <p className="text-grey-600">No budget data available.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'moodboard' && (
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Mood Board</h3>
                {moodboard && (
                  <p className="text-sm text-grey-600">
                    {moodboard.items.length} image{moodboard.items.length !== 1 ? 's' : ''} saved
                  </p>
                )}
              </div>
              <label className="px-4 py-2 bg-rose-300 text-white rounded-lg hover:bg-rose-400 transition-colors flex items-center gap-2 cursor-pointer">
                <Plus className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadImage(file);
                    }
                  }}
                  disabled={uploading}
                />
              </label>
            </div>

            {moodboardError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {moodboardError}
              </div>
            )}

            {moodboardLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-rose-300 animate-spin" />
              </div>
            ) : moodboard && moodboard.items.length === 0 ? (
              <div className="text-center py-16 text-grey-600">
                <Image className="w-16 h-16 text-grey-300 mx-auto mb-4" />
                <p className="mb-2">No images yet.</p>
                <p className="text-sm">Upload your first image to get started!</p>
              </div>
            ) : moodboard ? (
              <div className="grid grid-cols-3 gap-6">
                {moodboard.items.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="aspect-square rounded-xl overflow-hidden shadow-soft">
                      <ImageWithFallback
                        src={item.media.url}
                        alt={item.caption || 'Mood board image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleDeleteMoodboardItem(item.id)}
                        className="p-2 bg-white rounded-full shadow-medium text-rose-300 hover:bg-rose-50 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
                        <p className="text-white text-sm truncate">{item.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-grey-600">
                <p>Failed to load moodboard.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h3 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Shared Notes</h3>
            <textarea
              placeholder="Add your notes, ideas, or important reminders here..."
              value={event?.description || ''}
              onChange={(e) => {
                // Note: Event update endpoint not available yet
                // This is a placeholder - will need backend endpoint to save
              }}
              className="w-full h-64 p-4 border border-grey-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent"
            />
            <div className="mt-4 flex items-center gap-4">
              <button
                disabled
                className="px-6 py-3 bg-grey-200 text-grey-500 rounded-lg cursor-not-allowed"
                title="Event update endpoint not yet available"
              >
                Save Notes
              </button>
              <p className="text-sm text-grey-500">
                Note: Event description update requires backend endpoint implementation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
