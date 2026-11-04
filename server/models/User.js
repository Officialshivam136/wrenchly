import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vehicleSchema = new mongoose.Schema({
  year: { type: Number, min: 1886, max: 2100 },
  make: { type: String, trim: true, maxlength: 60 },
  model: { type: String, trim: true, maxlength: 60 },
  vin: { type: String, trim: true, uppercase: true, maxlength: 17 },
  photoUrl: String
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['user', 'mechanic', 'admin'], default: 'user', index: true },
  phone: { type: String, trim: true },
  avatarUrl: String,
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: [0, 0] } },
  vehicles: { type: [vehicleSchema], default: [] },
  isActive: { type: Boolean, default: true },
  lastSeenAt: Date
}, { timestamps: true, toJSON: { virtuals: true } });

userSchema.index({ location: '2dsphere' });
userSchema.pre('save', async function hashPassword(next) { if (!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 12); next(); });
userSchema.methods.comparePassword = function comparePassword(candidate) { return bcrypt.compare(candidate, this.password); };
userSchema.methods.toSafeObject = function toSafeObject() { const value = this.toObject(); delete value.password; return value; };

export default mongoose.models.User || mongoose.model('User', userSchema);
