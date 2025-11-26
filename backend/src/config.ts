import dotenv from 'dotenv';

dotenv.config();

const required = ['PORT', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[config] Missing env var: ${key}`);
  }
});

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || '',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
  databaseUrl: process.env.DATABASE_URL || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  s3: {
    bucket: process.env.S3_BUCKET || '',
    region: process.env.S3_REGION || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
  }
} as const;
