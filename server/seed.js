import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import MechanicProfile from './models/MechanicProfile.js';

if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<username>')) {
  console.error('Set a real MONGODB_URI in server/.env before running the seed.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
await User.deleteMany({ email: { $in: ['alex@example.com', 'admin@wrenchly.com', 'mechanic@example.com'] } });
const [user, admin, mechanicUser] = await User.create([
  { name: 'Alex Morgan', email: 'alex@example.com', password: await bcrypt.hash('password', 12), role: 'user', location: { type: 'Point', coordinates: [-87.6298, 41.8781] }, vehicles: [{ year: 2021, make: 'Toyota', model: 'Camry' }] },
  { name: 'Wrenchly Admin', email: 'admin@wrenchly.com', password: await bcrypt.hash('admin123', 12), role: 'admin' },
  { name: 'Mike Reynolds', email: 'mechanic@example.com', password: await bcrypt.hash('mechanic123', 12), role: 'mechanic' }
]);
await MechanicProfile.deleteMany({ user: mechanicUser._id });
await MechanicProfile.create({ user: mechanicUser._id, businessName: 'Northside Auto Care', address: '2418 N Clark St, Chicago', location: { type: 'Point', coordinates: [-87.6285, 41.8842] }, specialties: ['engine', 'brakes', 'diagnostics'], operationalRadiusKm: 25, pricing: { hourly: 95, visit: 85, currency: 'USD' }, approvalStatus: 'approved', availabilityStatus: 'online', rating: 4.9, totalReviews: 184 });
console.log(`Seed complete. Created ${user.email}, ${admin.email}, ${mechanicUser.email}.`);
await mongoose.disconnect();
