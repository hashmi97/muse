import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { CalendarView } from './pages/CalendarView';
import { BudgetPlanner } from './pages/BudgetPlanner';
import { HoneymoonPlanner } from './pages/HoneymoonPlanner';
import { EventPage } from './pages/EventPage';
import { GalleryPage } from './pages/GalleryPage';
import { ActivityFeed } from './pages/ActivityFeed';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/budget" element={<BudgetPlanner />} />
        <Route path="/honeymoon" element={<HoneymoonPlanner />} />
        <Route path="/event/:eventId" element={<EventPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/activity" element={<ActivityFeed />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
