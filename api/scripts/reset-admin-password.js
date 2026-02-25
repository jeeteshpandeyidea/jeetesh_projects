/**
 * Reset password for admin@gmail.com to admin@1234.
 * Run from api folder: node scripts/reset-admin-password.js
 * Uses MONGO_URI, DATABASE_URI, or MONGO_URL from env, or mongodb://localhost:27017/fringodb.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ADMIN_EMAIL = 'admin@gmail.com';
const NEW_PASSWORD = 'admin@1234';

async function main() {
  const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URI || process.env.MONGO_URL ||
    'mongodb://localhost:27017/fringodb';

  await mongoose.connect(MONGO_URI);

  const User = mongoose.connection.collection('Users');
  const hashed = await bcrypt.hash(NEW_PASSWORD, 10);

  const result = await User.updateOne(
    { email: ADMIN_EMAIL },
    { $set: { password: hashed, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    console.error(`No user found with email ${ADMIN_EMAIL}. Create the user first or run seed-super-admin.js.`);
    process.exitCode = 1;
  } else {
    console.log(`Password for ${ADMIN_EMAIL} has been set to ${NEW_PASSWORD}. You can sign in with these credentials.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
