import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { ok } from './http';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import calendarRoutes from './routes/calendar';
import moodboardRoutes from './routes/moodboard';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/calendar', calendarRoutes);
  app.use('/api/moodboard', moodboardRoutes);

  app.get('/api/health', (_, res) => ok(res, { status: 'ok', service: 'muse-backend' }));

  app.use((_, res) => {
    res.status(404).json({ data: null, error: 'Not found' });
  });

  return app;
}

export type AppInstance = ReturnType<typeof createApp>;
