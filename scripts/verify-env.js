import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Checking environment setup...');

// Load .env file
const result = dotenv.config({ path: path.join(__dirname, '../.env') });

if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
  process.exit(1);
}

console.log('Environment variables loaded:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Present' : '❌ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Present' : '❌ Missing');
console.log('- PORT:', process.env.PORT || '5001 (default)'); 