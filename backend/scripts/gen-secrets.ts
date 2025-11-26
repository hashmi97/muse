import { randomBytes } from 'crypto';

const hex = () => randomBytes(32).toString('hex');

console.log('Suggested env values (paste into .env):');
console.log(`JWT_SECRET=${hex()}`);
console.log(`REFRESH_TOKEN_SECRET=${hex()}`);
