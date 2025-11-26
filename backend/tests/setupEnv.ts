import path from 'path';
import dotenv from 'dotenv';

// Load environment variables for tests (defaults to .env in repo root)
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });
