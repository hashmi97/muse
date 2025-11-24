import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { X, Heart, Download } from 'lucide-react';

const eventFilters = ['All', 'Malka', 'Bride Prep', 'Henna', 'Wedding', 'Honeymoon'];

const galleryImages = [
  { id: 1, src: 'https://images.unsplash.com/photo-1722872112546-936593441be8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwaW5zcGlyYXRpb24lMjBlbGVnYW50fGVufDF8fHx8MTc2Mzk3NjQ2NXww&ixlib=rb-4.1.0&q=80&w=1080', event: 'Wedding', tall: true },
  { id: 2, src: 'https://images.unsplash.com/photo-1551468307-8c1e3c78013c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZGVjb3IlMjBtaW5pbWFsfGVufDF8fHx8MTc2Mzk3NjQ2NXww&ixlib=rb-4.1.0&q=80&w=1080', event: 'Wedding', tall: false },
  { id: 3, src: 'https://images.unsplash.com/photo-1507088991476-665ae61e1eec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZHJlc3MlMjBkZXRhaWxzfGVufDF8fHx8MTc2Mzk1MDY4NHww&ixlib=rb-4.1.0&q=80&w=1080', event: 'Bride Prep', tall: true },
  { id: 4, src: 'https://images.unsplash.com/photo-1677768061409-3d4fbd0250d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwdGFibGUlMjBzZXR0aW5nfGVufDF8fHx8MTc2MzkwNzU4N3ww&ixlib=rb-4.1.0&q=80&w=1080', event: 'Wedding', tall: false },
  { id: 5, src: 'https://images.unsplash.com/photo-1753541306536-7847bcc0489d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGZsb3dlcnMlMjBzb2Z0fGVufDF8fHx8MTc2Mzg4NDMyN3ww&ixlib=rb-4.1.0&q=80&w=1080', event: 'Henna', tall: false },
  { id: 6, src: 'https://images.unsplash.com/photo-1658851866325-49fb8b7fbcb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMHN1bnNldCUyMGNvdXBsZXxlbnwxfHx8fDE3NjM5NzM2NjN8MA&ixlib=rb-4.1.0&q=80&w=1080', event: 'Honeymoon', tall: true },
  { id: 7, src: 'https://images.unsplash.com/photo-1648538923547-074724ca7a18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25leW1vb24lMjBkZXN0aW5hdGlvbiUyMGJlYWNofGVufDF8fHx8MTc2Mzk3NjQ2Nnww&ixlib=rb-4.1.0&q=80&w=1080', event: 'Honeymoon', tall: false },
];

export function GalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [fullscreenImage, setFullscreenImage] = useState<any>(null);
  
  const filteredImages = selectedFilter === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.event === selectedFilter);
  
  return (
    <div className="min-h-screen bg-grey-50">
      <Navigation />
      
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-20">
        {/* Header */}
        <h1 className="text-4xl mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Inspiration Gallery</h1>
        
        {/* Filter Chips */}
        <div className="bg-white rounded-2xl p-4 shadow-soft mb-8">
          <div className="flex flex-wrap gap-3">
            {eventFilters.map((filter) => (
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
        
        {/* Masonry Grid */}
        <div className="columns-3 gap-6 space-y-6">
          {filteredImages.map((image) => (
            <button
              key={image.id}
              onClick={() => setFullscreenImage(image)}
              className="group relative break-inside-avoid mb-6 w-full"
            >
              <div className={`rounded-2xl overflow-hidden shadow-soft group-hover:shadow-medium transition-all ${
                image.tall ? 'aspect-[3/4]' : 'aspect-square'
              }`}>
                <ImageWithFallback 
                  src={image.src}
                  alt={`${image.event} inspiration`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-end p-4">
                <span className="text-white text-sm">{image.event}</span>
              </div>
            </button>
          ))}
        </div>
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
                alt={`${fullscreenImage.event} inspiration`}
                className="max-h-[80vh] w-auto mx-auto"
              />
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <button className="px-6 py-3 bg-white rounded-xl hover:bg-grey-100 transition-colors flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-300" />
                <span className="text-grey-800">Save</span>
              </button>
              <button className="px-6 py-3 bg-white rounded-xl hover:bg-grey-100 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4 text-grey-800" />
                <span className="text-grey-800">Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
