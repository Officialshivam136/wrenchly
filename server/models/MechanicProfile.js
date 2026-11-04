import mongoose from 'mongoose';

const pointSchema = { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], required: true, validate: { validator: value => value.length === 2 && value.every(Number.isFinite), message: 'Location must be [longitude, latitude].' } } };
const mechanicSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, maxlength: 1000 },
  address: { type: String, required: true, trim: true },
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], required: true, validate: { validator: value => value.length === 2 && value.every(Number.isFinite), message: 'Location must be [longitude, latitude].' } } },
  specialties: [{ type: String, enum: ['engine', 'tires', 'ev', 'bodywork', 'towing', 'brakes', 'diagnostics', 'oil-change'] }],
  operationalRadiusKm: { type: Number, min: 1, max: 200, default: 25 },
  pricing: { hourly: { type: Number, min: 0, default: 85 }, visit: { type: Number, min: 0, default: 75 }, currency: { type: String, default: 'USD' } },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending', index: true },
  availabilityStatus: { type: String, enum: ['online', 'offline', 'busy'], default: 'offline', index: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  totalReviews: { type: Number, min: 0, default: 0 },
  certifications: [{ name: String, issuer: String, documentUrl: String, expiresAt: Date }],
  documents: [{ kind: { type: String, enum: ['license', 'insurance', 'registration', 'other'] }, url: String, publicId: String }],
  workingHours: { type: Map, of: { open: String, close: String, closed: Boolean } },
  serviceImages: [{ url: String, publicId: String }],
  earnings: { completedJobs: { type: Number, default: 0 }, grossCents: { type: Number, default: 0 } }
}, { timestamps: true, toJSON: { virtuals: true } });

mechanicSchema.index({ location: '2dsphere' });
mechanicSchema.virtual('displayPrice').get(function displayPrice() { return `From $${this.pricing?.visit || 0}`; });
export default mongoose.models.MechanicProfile || mongoose.model('MechanicProfile', mechanicSchema);
