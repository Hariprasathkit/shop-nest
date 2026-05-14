import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || 'ShopNest Admin';

if (!email || !password) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
  console.error('Example: $env:ADMIN_EMAIL="admin@example.com"; $env:ADMIN_PASSWORD="newpass123"; npm run reset:admin');
  process.exit(1);
}

if (password.length < 6) {
  console.error('ADMIN_PASSWORD must be at least 6 characters long.');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing from environment variables.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        password: hashedPassword,
        isAdmin: true,
      },
    },
    {
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );

  console.log(`Admin access ready for ${user.email}`);
} catch (error) {
  console.error('Failed to reset admin access:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
