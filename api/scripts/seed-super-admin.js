const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function main() {
  const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URI || process.env.MONGO_URL ||
    `mongodb://localhost:27017/fringodb`;

  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const userSchema = new mongoose.Schema({
    is_deleted: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    roles: { type: [String], default: [] },
    fullName: { type: String, required: true },
    phone: String,
    profilePhoto: String,
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
  }, { timestamps: true, collection: 'Users' });

  const User = mongoose.model('User', userSchema);

  const email = 'admin@gmail.com';
  const plainPassword = '12345678';
  const username = 'admin';

  try {
    const hashed = await bcrypt.hash(plainPassword, 10);

    const res = await User.updateOne(
      { email },
      {
        $set: {
          username,
          password: hashed,
          roles: ['super-admin'],
          fullName: 'Super Admin',
          emailVerified: true,
        },
      },
      { upsert: true }
    );

    console.log(`Upserted user ${email}:`, res.upsertedId ? 'created' : 'updated');
  } catch (err) {
    console.error('Failed to upsert super-admin:', err.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }

  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
