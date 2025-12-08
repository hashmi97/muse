import React, { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Calendar, DollarSign, Plane, Image, CheckCircle2, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardSummary, type DashboardSummary } from '../lib/api';

const EVENT_TYPE_COLORS: Record<string, string> = {
  malka: 'from-rose-200 to-rose-300',
  henna_night: 'from-peach-200 to-rose-200',
  bride_preparation: 'from-rose-100 to-peach-100',
  wedding_night: 'from-rose-300 to-rose-400',
  honeymoon: 'from-peach-300 to-rose-300',
};

function formatDate(dateString: string | null): string {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

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
  return formatDate(dateString);
}

function formatActivityVerb(verb: string, metadata: Record<string, unknown>): string {
  // Simple formatting - can be enhanced later
  return verb.replace(/_/g, ' ');
}

function calculateDaysUntil(dateString: string | null): number | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : null;
}

export function Dashboard() {
  const { accessToken, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      navigate('/signup');
      return;
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardSummary(accessToken);
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [accessToken]);

  const daysUntilWedding = summary?.upcoming_events[0]?.start_date
    ? calculateDaysUntil(summary.upcoming_events[0].start_date)
    : null;
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-grey-50">
        <Navigation />
        <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
          <div className="text-center text-grey-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-grey-50">
        <Navigation />
        <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-soft text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const planned = parseFloat(summary?.budget.planned || '0');
  const spent = parseFloat(summary?.budget.spent || '0');
  const remaining = planned - spent;
  const budgetPercent = planned > 0 ? (spent / planned) * 100 : 0;

  return (
    <div className="min-h-screen bg-grey-50">
      <Navigation />
      
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-soft mb-6 sm:mb-8 overflow-hidden relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl sm:rounded-2xl overflow-hidden">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1762941744800-385b067dff21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwY291cGxlJTIwd2VkZGluZ3xlbnwxfHx8fDE3NjM5NzY0NjR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt={user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Couple'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
              </h1>
              <p className="text-grey-600 text-sm sm:text-base md:text-lg">
                {daysUntilWedding !== null
                  ? `Your wedding is in ${daysUntilWedding} day${daysUntilWedding !== 1 ? 's' : ''}. You're making wonderful progress!`
                  : 'Welcome to your wedding planning dashboard!'}
              </p>
            </div>
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-rose-100" fill="currentColor" />
            </div>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Upcoming Events</h3>
            </div>
            <div className="space-y-4">
              {summary?.upcoming_events && summary.upcoming_events.length > 0 ? (
                summary.upcoming_events.map((event) => {
                  const color = EVENT_TYPE_COLORS[event.event_type] || 'from-rose-200 to-rose-300';
                  return (
                    <div key={event.id} className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm sm:text-base text-grey-800 truncate">{event.title}</div>
                        <div className="text-xs sm:text-sm text-grey-500">{formatDate(event.start_date)}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-grey-500 text-sm">No upcoming events</div>
              )}
            </div>
            <Link to="/calendar" className="block mt-4 sm:mt-6 text-center text-sm sm:text-base text-rose-300 hover:text-rose-400 transition-colors">
              View Calendar →
            </Link>
          </div>
          
          {/* Budget Summary */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Budget Summary</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm sm:text-base text-grey-600">Total Budget</span>
                  <span className="text-sm sm:text-base text-grey-800">${planned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-300 to-peach-300 rounded-full transition-all"
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between pt-3 sm:pt-4 border-t border-grey-100">
                <div>
                  <div className="text-xs sm:text-sm text-grey-600">Spent</div>
                  <div className="text-lg sm:text-xl text-rose-300">${spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm text-grey-600">Remaining</div>
                  <div className="text-lg sm:text-xl text-grey-800">${remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
            <Link to="/budget" className="block mt-4 sm:mt-6 text-center text-sm sm:text-base text-rose-300 hover:text-rose-400 transition-colors">
              View Budget →
            </Link>
          </div>
          
          {/* Honeymoon Progress */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Honeymoon</h3>
            </div>
            {summary?.honeymoon ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-rose-300" />
                  <span className="text-grey-700">
                    {summary.honeymoon.destination_city}, {summary.honeymoon.destination_country}
                  </span>
                </div>
                {summary.honeymoon.start_date && (
                  <div className="text-sm text-grey-600">
                    {formatDate(summary.honeymoon.start_date)}
                    {summary.honeymoon.end_date && ` - ${formatDate(summary.honeymoon.end_date)}`}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-grey-500 text-sm">No honeymoon plan yet</div>
            )}
            <Link to="/honeymoon" className="block mt-4 sm:mt-6 text-center text-sm sm:text-base text-rose-300 hover:text-rose-400 transition-colors">
              View Details →
            </Link>
          </div>
        </div>
        
        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
          {/* Mood Board Activity */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Image className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>Recent Inspiration</h3>
            </div>
            {summary?.moodboard_highlights && summary.moodboard_highlights.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {summary.moodboard_highlights.slice(0, 4).map((item) => (
                    <div key={item.id} className="aspect-square rounded-xl overflow-hidden">
                      <ImageWithFallback 
                        src={item.media_url}
                        alt={item.caption || 'Inspiration'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <Link to="/gallery" className="block mt-3 sm:mt-4 text-center text-sm sm:text-base text-rose-300 hover:text-rose-400 transition-colors">
                  View Gallery →
                </Link>
              </>
            ) : (
              <div className="text-grey-500 text-sm mb-4">No moodboard items yet</div>
            )}
          </div>
          
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 md:p-6 shadow-soft">
            <h3 className="text-lg sm:text-xl mb-4 sm:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Recent Activity</h3>
            <div className="space-y-4">
              {summary?.recent_activity && summary.recent_activity.length > 0 ? (
                summary.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-peach-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-rose-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-grey-700">
                        {formatActivityVerb(activity.verb, activity.metadata)}
                        {activity.target_type && (
                          <span className="text-grey-600"> on {activity.target_type}</span>
                        )}
                      </p>
                      <p className="text-sm text-grey-500 mt-1">{formatRelativeTime(activity.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-grey-500 text-sm">No recent activity</div>
              )}
            </div>
            <Link to="/activity" className="block mt-4 sm:mt-6 text-center text-sm sm:text-base text-rose-300 hover:text-rose-400 transition-colors">
              View All Activity →
            </Link>
          </div>
        </div>
        
        {/* Shared Notes */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 shadow-soft mt-6 sm:mt-8">
          <h3 className="text-lg sm:text-xl mb-3 sm:mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Shared Notes</h3>
          <textarea
            placeholder="Add a note or thought to share with your partner..."
            className="w-full h-20 sm:h-24 p-3 sm:p-4 border border-grey-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>
    </div>
  );
}
