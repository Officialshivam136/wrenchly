import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({ status: String, at: { type: Date, default: Date.now }, note: String }, { _id: false });
const serviceRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'MechanicProfile', index: true },
  customerName: String,
  mechanicName: String,
  emergency: { type: Boolean, default: false, index: true },
  serviceType: { type: String, enum: ['scheduled', 'roadside'], default: 'scheduled' },
  service: { type: String, trim: true, maxlength: 120 },
  issueType: { type: String, enum: ['engine', 'battery', 'flat-tire', 'overheating', 'accident', 'brakes', 'electrical', 'unknown'], default: 'unknown' },
  issueDescription: { type: String, trim: true, maxlength: 2000 },
  urgency: { type: String, enum: ['scheduled', 'urgent', 'emergency'], default: 'scheduled' },
  specialty: { type: String, enum: ['engine', 'tires', 'ev', 'bodywork', 'towing', 'brakes', 'diagnostics', 'oil-change'], default: 'diagnostics' },
  status: { type: String, enum: ['pending', 'accepted', 'in-route', 'diagnosing', 'in-progress', 'completed', 'paid', 'rejected', 'cancelled'], default: 'pending', index: true },
  vehicle: { year: Number, make: String, model: String, vin: String, description: String },
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], required: true } },
  address: String,
  date: String,
  time: String,
  scheduledFor: Date,
  notes: { type: String, maxlength: 2000 },
  pricing: { estimateCents: Number, finalCents: Number, platformFeeCents: Number, currency: { type: String, default: 'USD' } },
  photos: [{ url: String, publicId: String, kind: String }],
  invoice: { number: String, url: String, issuedAt: Date },
  payment: { provider: String, transactionId: String, paidAt: Date },
  timeline: { type: [timelineSchema], default: [] },
  acceptedAt: Date,
  completedAt: Date
}, { timestamps: true });

serviceRequestSchema.index({ location: '2dsphere' });
serviceRequestSchema.index({ status: 1, emergency: 1, createdAt: -1 });
export default mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);
