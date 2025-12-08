import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { X, Heart, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAllEvents, fetchMoodboard, type ApiEvent, type MoodBoardItem } from '../lib/api';

type GalleryItem = {
  id: number;
  src: string;
  eventId: number;
  eventName: string;
  eventType: string;
  caption: string;
};

export function GalleryPage() {
  const { accessToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [fullscreenImage, setFullscreenImage] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      navigate('/signup');
      return;
    }

    async function loadGallery() {
      try {
        setLoading(true);
        setError(null);
        
        const eventsData = await fetchAllEvents(accessToken);
        setEvents(eventsData);
        
        // Fetch moodboard items for all events
        const allItems: GalleryItem[] = [];
        for (const event of eventsData) {
          try {
            const moodboard = await fetchMoodboard(accessToken, event.id);
            for (const item of moodboard.items) {
              allItems.push({
                id: item.id,
                src: item.media.url,
                eventId: event.id,
                eventName: event.title || event.event_type.name_en,
                eventType: event.event_type.key,
                caption: item.caption || '',
              });
            }
          } catch (err) {
            // Skip events without moodboards
          }
        }
        
        setGalleryItems(allItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, [accessToken, authLoading, navigate]);

  const eventTypeMap: Record<string, string> = {
    malka: 'Malka',
    henna_night: 'Henna',
    bride_preparation: 'Bride Prep',
    wedding_night: 'Wedding',
    honeymoon: 'Honeymoon',
  };

  const availableFilters = ['All', ...Array.from(new Set(events.map(e => eventTypeMap[e.event_type.key] || e.event_type.name_en).filter(Boolean)))];
  
  const filteredImages = selectedFilter === 'All'
    ? galleryItems
    : galleryItems.filter(img => {
        const event = events.find(e => e.id === img.eventId);
        if (!event) return false;
        const eventTypeName = eventTypeMap[event.event_type.key] || event.event_type.name_en;
        return eventTypeName === selectedFilter;
      });

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
        <h1 className="text-4xl mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Inspiration Gallery</h1>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Filter Chips */}
        {availableFilters.length > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-soft mb-8">
            <div className="flex flex-wrap gap-3">
              {availableFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-6 py-2 rounded-xl transition-colors ${
                    selectedFilter === filter
                      ? 'bg-rose-300 text-white'
                      : 'bg-grey-50 text-grey-600 hover:bg-grey-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-soft text-center">
            <p className="text-grey-600 mb-2">No images in gallery yet.</p>
            <p className="text-sm text-grey-500">Upload images to event moodboards to see them here.</p>
          </div>
        ) : (
          <div className="columns-3 gap-6">
            {filteredImages.map((image) => (
              <button
                key={image.id}
                onClick={() => setFullscreenImage(image)}
                className="group relative break-inside-avoid mb-6 w-full"
              >
                <div className="rounded-2xl overflow-hidden shadow-soft group-hover:shadow-medium transition-all aspect-square">
                  <ImageWithFallback
                    src={image.src}
                    alt={image.caption || `${image.eventName} inspiration`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-end p-4">
                  <span className="text-white text-sm">{image.eventName}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Fullscreen Viewer */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-8"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-8 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-grey-100 transition-colors"
          >
            <X className="w-6 h-6 text-grey-800" />
          </button>

          <div className="max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-2xl overflow-hidden mb-4">
              <ImageWithFallback
                src={fullscreenImage.src}
                alt={fullscreenImage.caption || `${fullscreenImage.eventName} inspiration`}
                className="max-h-[80vh] w-auto mx-auto"
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  navigate(`/event/${fullscreenImage.eventId}?tab=moodboard`);
                  setFullscreenImage(null);
                }}
                className="px-6 py-3 bg-white rounded-xl hover:bg-grey-100 transition-colors flex items-center gap-2"
              >
                <span className="text-grey-800">View Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
