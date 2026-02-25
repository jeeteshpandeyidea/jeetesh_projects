const mongoose = require('mongoose');

async function main() {
  const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URI || process.env.MONGO_URL ||
    `mongodb://localhost:27017/fringodb`;

  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    permissions: { type: [String], default: [] },
  }, { timestamps: true, collection: 'Roles' });

  const Role = mongoose.model('Role', roleSchema);

  const roles = [
    { name: 'Super Admin', slug: 'super-admin', description: 'Has all permissions', permissions: [] },
    { name: 'Admin', slug: 'admin', description: 'Administrative user', permissions: [] },
    { name: 'Manager', slug: 'manager', description: 'Managerial user', permissions: [] },
    { name: 'User', slug: 'user', description: 'Regular user', permissions: [] },
  ];

  for (const r of roles) {
    try {
      const res = await Role.updateOne(
        { slug: r.slug },
        { $set: { name: r.name, description: r.description, permissions: r.permissions } },
        { upsert: true }
      );
      console.log(`Upserted role ${r.slug}:`, res.upsertedId ? 'created' : 'updated');
    } catch (err) {
      console.error(`Failed to upsert ${r.slug}:`, err.message || err);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
