import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'MechanicProfile', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000 },
  photos: [{ url: String, publicId: String }],
  verifiedPurchase: { type: Boolean, default: true }
}, { timestamps: true });

reviewSchema.index({ mechanic: 1, createdAt: -1 });
export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
