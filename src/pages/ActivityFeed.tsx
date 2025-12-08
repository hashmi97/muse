import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Heart, Image, DollarSign, CheckCircle2, FileText, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchActivityLogs, fetchAllEvents, type ActivityLog, type ApiEvent } from '../lib/api';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatActivityVerb(verb: string, metadata: Record<string, unknown>): string {
  // Format common verbs nicely
  const verbMap: Record<string, string> = {
    created: 'created',
    updated: 'updated',
    deleted: 'deleted',
    added: 'added',
    completed: 'completed',
    uploaded: 'uploaded',
  };
  
  const baseVerb = verbMap[verb] || verb.replace(/_/g, ' ');
  const metadataStr = metadata && typeof metadata === 'object' 
    ? Object.entries(metadata)
        .map(([key, value]) => {
          if (key === 'title' || key === 'label' || key === 'name') {
            return `"${value}"`;
          }
          return null;
        })
        .filter(Boolean)
        .join(' ')
    : '';
  
  return `${baseVerb} ${metadataStr}`.trim();
}

function getActivityIcon(verb: string, targetType: string | null): typeof Image {
  if (verb.includes('moodboard') || verb.includes('image') || verb.includes('photo') || targetType === 'moodboarditem') {
    return Image;
  }
  if (verb.includes('budget') || verb.includes('honeymoon') || targetType === 'budgetlineitem' || targetType === 'honeymoonitem') {
    return DollarSign;
  }
  if (verb.includes('task') || targetType === 'task') {
    return CheckCircle2;
  }
  if (verb.includes('event') || targetType === 'event') {
    return Calendar;
  }
  if (verb.includes('comment') || verb.includes('note')) {
    return FileText;
  }
  return Heart;
}

function getActivityColor(verb: string, targetType: string | null): string {
  const colors = [
    'from-rose-100 to-peach-100',
    'from-peach-100 to-rose-100',
    'from-rose-100 to-rose-200',
    'from-peach-100 to-peach-200',
  ];
  // Use a simple hash to assign consistent colors
  const hash = (verb + (targetType || '')).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function ActivityFeed() {
  const { accessToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [events, setEvents] = useState<Map<number, ApiEvent>>(new Map());
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
        
        // Load events for linking
        const eventsData = await fetchAllEvents(accessToken);
        const eventsMap = new Map(eventsData.map(e => [e.id, e]));
        setEvents(eventsMap);
        
        // Load activities
        const activitiesData = await fetchActivityLogs(accessToken);
        setActivities(activitiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity feed');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [accessToken, authLoading, navigate]);

  const handleActivityClick = (activity: ActivityLog) => {
    if (activity.target_type === 'event' && activity.target_id) {
      navigate(`/event/${activity.target_id}`);
    }
    // Add more navigation logic for other target types if needed
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
        <h1 className="text-4xl mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Activity Feed</h1>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 shadow-soft">
          {activities.length === 0 ? (
            <div className="text-center py-16 text-grey-600">
              <p>No activity yet.</p>
              <p className="text-sm mt-2">Activity will appear here as you and your partner make changes.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.verb, activity.target_type);
                const color = getActivityColor(activity.verb, activity.target_type);
                const formattedAction = formatActivityVerb(activity.verb, activity.metadata);
                const event = activity.target_type === 'event' && activity.target_id 
                  ? events.get(activity.target_id) 
                  : null;
                const actionText = event 
                  ? `${formattedAction} ${event.title || event.event_type.name_en}`
                  : formattedAction;
                
                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 ${activity.target_type === 'event' ? 'cursor-pointer hover:bg-grey-50 p-2 -m-2 rounded-lg transition-colors' : ''}`}
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-rose-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-grey-700 mb-1">
                        <span className="text-grey-800 font-medium">User {activity.actor || 'Unknown'}</span>{' '}
                        {actionText}
                      </p>
                      <p className="text-sm text-grey-500">{formatRelativeTime(activity.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
