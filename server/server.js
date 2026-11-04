import 'dotenv/config';
import http from 'node:http';
import { Readable } from 'node:stream';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Razorpay from 'razorpay';
import User from './models/User.js';
import MechanicProfile from './models/MechanicProfile.js';
import ServiceRequest from './models/ServiceRequest.js';
import Review from './models/Review.js';

const port = Number(process.env.PORT || 5000);
const defaultLocation = [77.5946, 12.9716];
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const jwtSecret = process.env.JWT_SECRET || 'wrenchly-local-secret';
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: clientOrigin, methods: ['GET', 'POST', 'PATCH'] } });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const cloudinaryReady = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (cloudinaryReady) cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
const razorpayReady = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const razorpay = razorpayReady ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }) : null;

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const memory = {
  users: [
    { id: 'u1', name: 'Alex Morgan', email: 'alex@example.com', password: bcrypt.hashSync('password', 10), role: 'user', location: { type: 'Point', coordinates: defaultLocation }, vehicles: [{ year: 2021, make: 'Toyota', model: 'Camry' }] },
    { id: 'a1', name: 'Wrenchly Admin', email: 'admin@wrenchly.com', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
    { id: 'me1', name: 'Mike Reynolds', email: 'mechanic@example.com', password: bcrypt.hashSync('mechanic123', 10), role: 'mechanic' }
  ],
  mechanics: [
    { id: 'm1', userId: 'me1', name: 'Indiranagar Auto Care', initials: 'IA', verified: true, approvalStatus: 'approved', rating: 4.9, reviews: 184, distance: '0.8 km', minutes: 8, price: 'From ₹850', specialty: 'Engine & diagnostics', specialties: ['engine', 'brakes', 'diagnostics'], services: ['Oil change', 'Brake service', 'Diagnostics'], open: true, availabilityStatus: 'online', address: '12th Main Road, Indiranagar, Bengaluru', color: '#e5f5ef', accent: '#088061', image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=800&q=80', location: { type: 'Point', coordinates: [77.641, 12.9719] } },
    { id: 'm2', name: 'Bengaluru Mobile Mechanics', initials: 'BM', verified: true, approvalStatus: 'approved', rating: 4.8, reviews: 96, distance: '1.4 km', minutes: 12, price: 'From ₹700', specialty: 'At-home roadside service', specialties: ['tires', 'towing', 'oil-change'], services: ['Battery & electrical', 'Tire service', 'Oil change'], open: true, availabilityStatus: 'online', address: 'Available across Bengaluru', color: '#fff1d6', accent: '#c57908', image: 'https://images.unsplash.com/photo-1632823469850-1f77d9deabdf?auto=format&fit=crop&w=800&q=80', location: { type: 'Point', coordinates: [77.5946, 12.9716] } },
    { id: 'm3', name: 'Greenline EV Garage', initials: 'GE', verified: true, approvalStatus: 'approved', rating: 4.7, reviews: 213, distance: '2.1 km', minutes: 18, price: 'From ₹950', specialty: 'EV & hybrid certified', specialties: ['ev', 'diagnostics', 'brakes'], services: ['EV diagnostics', 'AC & heating', 'Brake service'], open: true, availabilityStatus: 'online', ratingCount: 213, address: 'Koramangala, Bengaluru', color: '#e8efff', accent: '#4169c8', image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=800&q=80', location: { type: 'Point', coordinates: [77.6101, 12.9352] } },
    { id: 'm4', name: 'Koramangala Service Co.', initials: 'KS', verified: false, approvalStatus: 'pending', rating: 4.6, reviews: 71, distance: '3.7 km', minutes: 28, price: 'From ₹650', specialty: 'General repair', specialties: ['bodywork', 'oil-change'], services: ['Oil change', 'Wheel alignment', 'Inspection'], open: false, availabilityStatus: 'offline', address: '80 Feet Road, Koramangala, Bengaluru', color: '#f3eafd', accent: '#8757b8', image: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=800&q=80', location: { type: 'Point', coordinates: [77.6245, 12.9352] } }
  ],
  requests: [
    { id: 'b1', mechanicId: 'm1', mechanicName: 'Indiranagar Auto Care', customerId: 'u1', customerName: 'Alex Morgan', specialty: 'brakes', service: 'Brake inspection', vehicle: '2021 Toyota Camry', date: '2025-02-14', time: '10:30 AM', status: 'completed', emergency: false, total: 850, createdAt: new Date().toISOString(), location: { type: 'Point', coordinates: defaultLocation } },
    { id: 'b2', mechanicId: 'm2', mechanicName: 'Bengaluru Mobile Mechanics', customerId: 'u1', customerName: 'Alex Morgan', specialty: 'oil-change', service: 'Oil change', vehicle: '2021 Toyota Camry', date: '2025-02-20', time: '2:00 PM', status: 'pending', emergency: false, total: 700, createdAt: new Date().toISOString(), location: { type: 'Point', coordinates: defaultLocation } }
  ],
  reviews: [
    { id: 'rev1', requestId: 'b0', mechanicId: 'm1', mechanic: 'm1', userId: 'u1', userName: 'Alex Morgan', rating: 5, comment: 'Arrived within 15 minutes. Very professional and diagnosed the brake fluid issue quickly!', compliments: ['Punctual Arrival', 'Transparent Pricing'], createdAt: '2025-01-20T10:00:00.000Z', verifiedPurchase: true },
    { id: 'rev2', requestId: 'b_old', mechanicId: 'm1', mechanic: 'm1', userId: 'u2', userName: 'Priya Sharma', rating: 5, comment: 'Clean work and explained every step before changing the engine oil and filters.', compliments: ['Clean Work', 'Professional Tools'], createdAt: '2025-01-15T14:30:00.000Z', verifiedPurchase: true },
    { id: 'rev3', requestId: 'b_old2', mechanicId: 'm2', mechanic: 'm2', userId: 'u3', userName: 'Rahul Menon', rating: 5, comment: 'Helped me on the highway with a flat tyre during peak traffic. Lifesaver!', compliments: ['Punctual Arrival', 'Quick Fix'], createdAt: '2025-01-10T18:00:00.000Z', verifiedPurchase: true }
  ],
  config: { commissionRate: 12, platformFee: 9, emergencyRadiusKm: 10 }
};

const isMongo = () => mongoose.connection.readyState === 1;
const tokenFor = user => jwt.sign({ sub: String(user._id || user.id), id: String(user._id || user.id), name: user.name, email: user.email, role: user.role }, jwtSecret, { expiresIn: '7d' });
const safeUser = user => ({ id: String(user._id || user.id), name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl });
const makePoint = (lng, lat) => ({ type: 'Point', coordinates: [Number(lng), Number(lat)] });
const distanceMiles = (a, b) => { const [lng1, lat1] = a; const [lng2, lat2] = b; const r = Math.PI / 180; const dLat = (lat2 - lat1) * r; const dLng = (lng2 - lng1) * r; const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2; return 3958.8 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)); };
const mechanicDto = (m, from) => { const coords = m.location?.coordinates || defaultLocation; const miles = from ? distanceMiles(from, coords) : Number.parseFloat(m.distance) || 0; const specialties = m.specialties || ['diagnostics']; return { ...m, id: String(m._id || m.id), mechanicId: String(m._id || m.id), distance: `${miles.toFixed(1)} mi`, minutes: Math.max(5, Math.round(miles * 8)), open: m.availabilityStatus ? m.availabilityStatus === 'online' : Boolean(m.open), price: m.price || `From ₹${m.pricing?.visit || 750}`, specialty: m.specialty || specialties[0] || 'General repair', specialties, services: m.services || specialties.map(value => value.replace('-', ' ')), reviews: m.totalReviews ?? m.reviews ?? 0, verified: m.approvalStatus === 'approved' || Boolean(m.verified), location: m.location || { type: 'Point', coordinates: coords } }; };

export const protect = (req, res, next) => { const token = req.headers.authorization?.replace(/^Bearer\s+/, ''); if (!token) return res.status(401).json({ message: 'Authentication required.' }); try { req.user = jwt.verify(token, jwtSecret); next(); } catch { return res.status(401).json({ message: 'Your session has expired.' }); } };
export const authorize = roles => (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'You do not have permission for this action.' });
const socketUser = token => { try { return jwt.verify(token?.replace(/^Bearer\s+/, ''), jwtSecret); } catch { return null; } };

async function findNearby({ lng, lat, radius, unit = 'km', specialty, all = false }) {
  const maxMeters = Number(radius || 25) * (unit === 'miles' ? 1609.34 : 1000);
  if (isMongo()) {
    const query = { approvalStatus: 'approved' };
    if (!all) { query.availabilityStatus = { $in: ['online', 'busy'] }; query.location = { $near: { $geometry: makePoint(lng, lat), $maxDistance: maxMeters } }; }
    if (specialty) query.specialties = specialty;
    const docs = await MechanicProfile.find(query).limit(100).lean();
    return docs.map(m => mechanicDto(m, [Number(lng), Number(lat)]));
  }
  return memory.mechanics.filter(m => m.approvalStatus === 'approved' && (all || m.open || m.availabilityStatus === 'online') && (all || distanceMiles([Number(lng), Number(lat)], m.location.coordinates) <= (unit === 'miles' ? Number(radius || 25) : Number(radius || 25) * 0.621371)) && (!specialty || m.specialties.includes(specialty))).map(m => mechanicDto(m, [Number(lng), Number(lat)]));
}
async function findRequest(id) { return isMongo() ? ServiceRequest.findById(id) : memory.requests.find(r => String(r.id) === String(id)); }
async function createRequest(data) {
  if (isMongo()) { const doc = await ServiceRequest.create(data); return doc.toObject(); }
  const request = { id: `req_${Date.now()}`, ...data, createdAt: new Date().toISOString(), timeline: [{ status: data.status || 'pending', at: new Date().toISOString() }] }; memory.requests.unshift(request); return request;
}
async function updateRequest(id, changes) {
  if (isMongo()) return ServiceRequest.findByIdAndUpdate(id, { $set: changes, ...(changes.status ? { $push: { timeline: { status: changes.status, note: changes.note } } } : {}) }, { new: true }).lean();
  const request = memory.requests.find(r => String(r.id) === String(id)); if (request) Object.assign(request, changes, changes.status ? { timeline: [...(request.timeline || []), { status: changes.status, at: new Date().toISOString(), note: changes.note }] } : {}); return request;
}

app.get('/api/health', (_, res) => res.json({ ok: true, mode: isMongo() ? 'mongodb' : 'demo', cloudinary: cloudinaryReady, razorpay: razorpayReady, realtime: true }));
app.post('/api/auth/register', async (req, res, next) => { try { const { name, email, password } = req.body; if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: 'Name, email and a password of at least 8 characters are required.' }); if (isMongo()) { if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with that email already exists.' }); const user = await User.create({ name, email: email.toLowerCase(), password }); return res.status(201).json({ user: safeUser(user), token: tokenFor(user) }); } if (memory.users.some(u => u.email === email.toLowerCase())) return res.status(409).json({ message: 'An account with that email already exists.' }); const user = { id: `u${Date.now()}`, name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role: 'user' }; memory.users.push(user); res.status(201).json({ user: safeUser(user), token: tokenFor(user) }); } catch (error) { next(error); } });
app.post('/api/auth/login', async (req, res, next) => { try { const email = req.body.email?.toLowerCase(); let user; if (isMongo()) user = await User.findOne({ email }).select('+password'); else user = memory.users.find(u => u.email === email); const valid = user && (isMongo() ? await user.comparePassword(req.body.password || '') : await bcrypt.compare(req.body.password || '', user.password)); if (!valid) return res.status(401).json({ message: 'Email or password is incorrect.' }); res.json({ user: safeUser(user), token: tokenFor(user) }); } catch (error) { next(error); } });
app.get('/api/me', protect, (req, res) => res.json(req.user));

app.get('/api/mechanics/nearby', async (req, res, next) => { try { const lng = Number(req.query.lng ?? defaultLocation[0]); const lat = Number(req.query.lat ?? defaultLocation[1]); if (!Number.isFinite(lng) || !Number.isFinite(lat)) return res.status(400).json({ message: 'Valid lng and lat are required.' }); res.json(await findNearby({ ...req.query, lng, lat, all: req.query.all === 'true' })); } catch (error) { next(error); } });
app.get('/api/mechanics', async (req, res, next) => { try { const serviceSpecialties = { 'Oil change': 'oil-change', 'Brake service': 'brakes', Diagnostics: 'diagnostics', 'Tire service': 'tires', 'EV diagnostics': 'ev' }; const specialty = req.query.specialty || serviceSpecialties[req.query.service]; const result = await findNearby({ lng: req.query.lng ?? defaultLocation[0], lat: req.query.lat ?? defaultLocation[1], radius: req.query.radius || 25, unit: req.query.unit || 'miles', specialty, all: req.query.all === 'true' }); let sorted = result; if (req.query.sort === 'rating') sorted = [...result].sort((a, b) => b.rating - a.rating); res.json(sorted); } catch (error) { next(error); } });
app.get('/api/mechanics/:id', async (req, res, next) => { try { const mechanic = isMongo() ? await MechanicProfile.findById(req.params.id).lean() : memory.mechanics.find(m => m.id === req.params.id); mechanic ? res.json(mechanicDto(mechanic)) : res.status(404).json({ message: 'Mechanic not found.' }); } catch (error) { next(error); } });
app.post('/api/mechanics/apply', protect, authorize(['user', 'mechanic']), async (req, res, next) => { try { if (!isMongo()) { const mechanic = { id: `m${Date.now()}`, userId: req.user.id, name: req.body.businessName, businessName: req.body.businessName, address: req.body.address, specialties: req.body.specialties || ['diagnostics'], specialty: req.body.specialties?.[0] || 'diagnostics', approvalStatus: 'pending', availabilityStatus: 'offline', open: false, rating: 0, reviews: 0, location: makePoint(req.body.lng || defaultLocation[0], req.body.lat || defaultLocation[1]), price: 'From ₹750' }; memory.mechanics.unshift(mechanic); return res.status(201).json(mechanic); } const profile = await MechanicProfile.create({ user: req.user.id, businessName: req.body.businessName, address: req.body.address, specialties: req.body.specialties, location: makePoint(req.body.lng, req.body.lat), operationalRadiusKm: req.body.operationalRadiusKm, pricing: req.body.pricing }); await User.findByIdAndUpdate(req.user.id, { role: 'mechanic' }); res.status(201).json(profile); } catch (error) { next(error); } });
app.patch('/api/mechanics/status', protect, authorize(['mechanic']), async (req, res, next) => { try { if (isMongo()) { const profile = await MechanicProfile.findOneAndUpdate({ user: req.user.id }, { availabilityStatus: req.body.status }, { new: true }); return res.json(profile); } const mechanic = memory.mechanics.find(m => m.userId === req.user.id); if (!mechanic) return res.status(404).json({ message: 'Mechanic profile not found.' }); mechanic.availabilityStatus = req.body.status; mechanic.open = req.body.status === 'online'; res.json(mechanic); } catch (error) { next(error); } });

app.get('/api/requests', protect, async (req, res, next) => { try { if (isMongo()) { let query = {}; if (req.user.role === 'user') query = { user: req.user.id }; if (req.user.role === 'mechanic') { const profile = await MechanicProfile.findOne({ user: req.user.id }).select('_id').lean(); query = { mechanic: profile?._id }; } return res.json(await ServiceRequest.find(query).populate('user mechanic').sort('-createdAt').lean()); } const result = req.user.role === 'admin' ? memory.requests : req.user.role === 'mechanic' ? memory.requests.filter(r => r.mechanicId === 'm1' || r.mechanicId === req.user.id) : memory.requests.filter(r => r.customerId === req.user.id); res.json(result); } catch (error) { next(error); } });
app.get('/api/bookings', protect, async (req, res, next) => { try { if (isMongo()) { const query = req.user.role === 'admin' ? {} : { user: req.user.id }; return res.json(await ServiceRequest.find(query).sort('-createdAt').lean()); } res.json(req.user.role === 'admin' ? memory.requests : memory.requests.filter(request => request.customerId === req.user.id)); } catch (error) { next(error); } });
app.post('/api/requests', protect, authorize(['user']), async (req, res, next) => { try { const { mechanicId, specialty = 'diagnostics', service, vehicle, date, time, scheduledFor, notes, lng = defaultLocation[0], lat = defaultLocation[1], emergency = false } = req.body; if (!service && !emergency) return res.status(400).json({ message: 'A service type is required.' }); const selected = isMongo() ? await MechanicProfile.findById(mechanicId).lean() : memory.mechanics.find(m => m.id === mechanicId); const request = await createRequest({ user: req.user.id, customerId: req.user.id, customerName: req.user.name, mechanic: isMongo() ? mechanicId : undefined, mechanicId, mechanicName: selected?.businessName || selected?.name, emergency, serviceType: emergency ? 'roadside' : 'scheduled', specialty, service: service || specialty, vehicle, date, time, scheduledFor: scheduledFor || (date && time ? `${date}T${time}` : undefined), notes, location: makePoint(lng, lat), status: 'pending', total: selected?.pricing?.visit || Number.parseInt(selected?.price?.replace(/\D/g, '') || '750', 10) }); io.to('mechanics:online').emit('new_service_request', request); res.status(201).json(request); } catch (error) { next(error); } });
app.post('/api/bookings', protect, authorize(['user']), async (req, res, next) => {
  try {
    const { mechanicId, service = 'diagnostics', issueType = 'unknown', issueDescription = '', urgency = 'scheduled', photos = [], vehicle, date, time, notes, lng = defaultLocation[0], lat = defaultLocation[1] } = req.body;
    const selected = isMongo() ? await MechanicProfile.findById(mechanicId).lean() : memory.mechanics.find(m => m.id === mechanicId);
    if (!selected || !date || !time) return res.status(400).json({ message: 'Please select a mechanic, date and time.' });
    const total = selected.pricing?.visit || Number.parseInt(selected.price?.replace(/\D/g, '') || '75', 10);
    const vehicleData = typeof vehicle === 'string' ? { description: vehicle } : vehicle;
    const request = await createRequest({ user: req.user.id, customerId: req.user.id, customerName: req.user.name, mechanic: isMongo() ? mechanicId : undefined, mechanicId, mechanicName: selected.businessName || selected.name, emergency: urgency === 'emergency', serviceType: urgency === 'emergency' ? 'roadside' : 'scheduled', specialty: selected.specialties?.[0] || 'diagnostics', service, issueType, issueDescription, urgency, photos, vehicle: vehicleData, date, time, notes, location: makePoint(lng, lat), status: 'pending', total, pricing: { estimateCents: total * 100, currency: 'USD' } });
    io.to('mechanics:online').emit('new_service_request', request);
    res.status(201).json(request);
  } catch (error) { next(error); }
});
app.post('/api/payments/order', protect, authorize(['user']), async (req, res, next) => { try { const request = await findRequest(req.body.requestId); if (!request) return res.status(404).json({ message: 'Service request not found.' }); const amount = Number(request.total || request.pricing?.estimateCents / 100 || 75); const receipt = `wrenchly_${String(req.body.requestId).slice(-18)}`; if (!razorpayReady) return res.json({ provider: 'demo', keyId: null, orderId: `demo_order_${Date.now()}`, amount: amount * 100, currency: 'INR', requestId: req.body.requestId }); const order = await razorpay.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt, notes: { requestId: String(req.body.requestId), userId: req.user.id } }); res.json({ provider: 'razorpay', keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency, requestId: req.body.requestId }); } catch (error) { next(error); } });
app.post('/api/payments/verify', protect, authorize(['user']), async (req, res, next) => { try { const { requestId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body; if (razorpayReady) { const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex'); if (expected !== razorpay_signature) return res.status(400).json({ message: 'Payment signature verification failed.' }); } const updated = await updateRequest(requestId, { status: 'paid', ...(isMongo() ? { 'payment.provider': razorpayReady ? 'razorpay' : 'demo', 'payment.transactionId': razorpay_payment_id || `demo_payment_${Date.now()}`, 'payment.paidAt': new Date(), 'pricing.finalCents': Number(req.body.amount || 0) } : { payment: { provider: razorpayReady ? 'razorpay' : 'demo', transactionId: razorpay_payment_id || `demo_payment_${Date.now()}`, paidAt: new Date().toISOString() } }) }); io.to(`request:${requestId}`).emit('service_status_changed', updated); res.json({ ok: true, request: updated }); } catch (error) { next(error); } });
app.get('/api/requests/:id', protect, async (req, res, next) => { try { const request = await findRequest(req.params.id); request ? res.json(request) : res.status(404).json({ message: 'Request not found.' }); } catch (error) { next(error); } });
app.patch('/api/requests/:id/status', protect, authorize(['mechanic', 'admin']), async (req, res, next) => { try { const allowed = ['accepted', 'in-route', 'diagnosing', 'in-progress', 'completed', 'paid', 'rejected', 'cancelled']; if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid service status.' }); const updated = await updateRequest(req.params.id, { status: req.body.status, ...(req.body.status === 'accepted' ? { acceptedAt: new Date() } : {}), ...(req.body.status === 'completed' ? { completedAt: new Date() } : {}) }); io.to(`request:${req.params.id}`).emit('service_status_changed', updated); res.json(updated); } catch (error) { next(error); } });
app.patch('/api/bookings/:id/status', protect, authorize(['admin', 'mechanic']), (req, res, next) => { req.params.id = req.params.id; return updateRequest(req.params.id, { status: req.body.status }).then(updated => { if (!updated) return res.status(404).json({ message: 'Booking not found.' }); res.json(updated); }).catch(next); });
app.post('/api/requests/:id/review', protect, authorize(['user']), async (req, res, next) => {
  try {
    const request = await findRequest(req.params.id);
    if (!request) return res.status(404).json({ message: 'Service request not found.' });
    if (!['completed', 'paid'].includes(request.status)) return res.status(400).json({ message: 'Reviews are available after service is completed or paid.' });
    
    if (!isMongo()) {
      const review = {
        id: `rev_${Date.now()}`,
        request: req.params.id,
        user: req.user.id,
        userName: req.user.name,
        mechanic: request.mechanicId || request.mechanic,
        rating: Number(req.body.rating || 5),
        comment: req.body.comment || '',
        compliments: req.body.compliments || [],
        createdAt: new Date().toISOString(),
        verifiedPurchase: true
      };
      if (!memory.reviews) memory.reviews = [];
      memory.reviews.unshift(review);
      request.reviewed = true;
      request.review = review;
      
      const mech = memory.mechanics.find(m => m.id === (request.mechanicId || request.mechanic));
      if (mech) {
        mech.reviews = (mech.reviews || 0) + 1;
      }
      return res.status(201).json(review);
    }
    
    const review = await Review.create({
      request: request._id,
      user: req.user.id,
      mechanic: request.mechanic,
      rating: Number(req.body.rating || 5),
      comment: req.body.comment,
      photos: req.body.photos,
      verifiedPurchase: true
    });
    await MechanicProfile.findByIdAndUpdate(request.mechanic, { $inc: { totalReviews: 1 } });
    await ServiceRequest.findByIdAndUpdate(request._id, { $set: { 'review.rating': review.rating, 'review.comment': review.comment } });
    res.status(201).json(review);
  } catch (error) { next(error); }
});

app.get('/api/mechanics/:id/reviews', async (req, res, next) => {
  try {
    if (isMongo()) {
      const list = await Review.find({ mechanic: req.params.id }).populate('user', 'name avatarUrl').sort('-createdAt').lean();
      return res.json(list);
    }
    const list = (memory.reviews || []).filter(r => r.mechanic === req.params.id || r.mechanicId === req.params.id);
    res.json(list);
  } catch (error) { next(error); }
});

app.get('/api/admin/stats', protect, authorize(['admin']), async (_, res, next) => { try { if (isMongo()) { const [users, mechanics, bookings, pending, activeRequests, revenue] = await Promise.all([User.countDocuments({ role: 'user' }), MechanicProfile.countDocuments({ approvalStatus: 'approved' }), ServiceRequest.countDocuments(), ServiceRequest.countDocuments({ status: 'pending' }), ServiceRequest.countDocuments({ emergency: true, status: { $nin: ['completed', 'paid', 'cancelled'] } }), ServiceRequest.aggregate([{ $group: { _id: null, total: { $sum: '$pricing.finalCents' } } }])]); const revenueCents = revenue[0]?.total || 0; return res.json({ users, mechanics, activeMechanics: mechanics, totalMechanics: mechanics, bookings, pending, activeEmergencyRequests: activeRequests, revenueCents, revenue: revenueCents / 100 }); } const mechanics = memory.mechanics.filter(m => m.approvalStatus === 'approved').length; const bookings = memory.requests.length; const pending = memory.requests.filter(r => r.status === 'pending').length; const revenue = memory.requests.reduce((sum, r) => sum + (r.total || 0), 0); res.json({ users: memory.users.filter(u => u.role === 'user').length, mechanics, activeMechanics: mechanics, totalMechanics: memory.mechanics.length, bookings, pending, activeEmergencyRequests: memory.requests.filter(r => r.emergency && !['completed', 'paid', 'cancelled'].includes(r.status)).length, revenueCents: revenue * 100, revenue }); } catch (error) { next(error); } });
app.get('/api/admin/mechanics/pending', protect, authorize(['admin']), async (_, res, next) => { try { if (isMongo()) return res.json(await MechanicProfile.find({ approvalStatus: 'pending' }).populate('user').sort('-createdAt').lean()); res.json(memory.mechanics.filter(m => m.approvalStatus === 'pending')); } catch (error) { next(error); } });
app.get('/api/admin/customers', protect, authorize(['admin']), async (_, res, next) => { try { if (isMongo()) return res.json(await User.find({ role: 'user' }).select('name email phone isActive createdAt vehicles').sort('-createdAt').lean()); res.json(memory.users.filter(user => user.role === 'user').map(user => ({ ...safeUser(user), isActive: user.isActive !== false, vehicles: user.vehicles || [], createdAt: user.createdAt || new Date().toISOString() }))); } catch (error) { next(error); } });
app.get('/api/admin/settings', protect, authorize(['admin']), async (_, res, next) => { try { res.json(isMongo() ? { commissionRate: 12, platformFee: 9, emergencyRadiusKm: 10 } : memory.config); } catch (error) { next(error); } });
app.patch('/api/admin/settings', protect, authorize(['admin']), async (req, res, next) => { try { const allowed = ['commissionRate', 'platformFee', 'emergencyRadiusKm']; if (!isMongo()) allowed.forEach(key => { if (req.body[key] !== undefined) memory.config[key] = Number(req.body[key]); }); res.json(isMongo() ? { commissionRate: Number(req.body.commissionRate || 12), platformFee: Number(req.body.platformFee || 9), emergencyRadiusKm: Number(req.body.emergencyRadiusKm || 10) } : memory.config); } catch (error) { next(error); } });
app.patch('/api/admin/mechanics/:id/decision', protect, authorize(['admin']), async (req, res, next) => { try { if (!['approved', 'rejected', 'suspended'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid approval decision.' }); if (isMongo()) return res.json(await MechanicProfile.findByIdAndUpdate(req.params.id, { approvalStatus: req.body.status }, { new: true })); const mechanic = memory.mechanics.find(m => m.id === req.params.id); if (!mechanic) return res.status(404).json({ message: 'Mechanic application not found.' }); mechanic.approvalStatus = req.body.status; mechanic.verified = req.body.status === 'approved'; res.json(mechanic); } catch (error) { next(error); } });
app.post('/api/admin/mechanics', protect, authorize(['admin']), async (req, res, next) => { try { if (isMongo()) { const owner = await User.create({ name: req.body.name, email: `partner-${Date.now()}@wrenchly.local`, password: `temporary-${Date.now()}`, role: 'mechanic' }); const profile = await MechanicProfile.create({ user: owner._id, businessName: req.body.name, address: req.body.address, location: makePoint(req.body.lng || -87.6298, req.body.lat || 41.8781), specialties: ['diagnostics'], approvalStatus: 'approved', availabilityStatus: 'offline' }); return res.status(201).json(profile); } const mechanic = { id: `m${Date.now()}`, name: req.body.name, businessName: req.body.name, initials: req.body.name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase(), address: req.body.address, specialty: 'General repair', specialties: ['diagnostics'], services: ['General repair'], approvalStatus: 'approved', verified: true, availabilityStatus: 'offline', open: false, rating: 0, reviews: 0, price: 'From $75', location: makePoint(req.body.lng || -87.6298, req.body.lat || 41.8781) }; memory.mechanics.unshift(mechanic); res.status(201).json(mechanic); } catch (error) { next(error); } });
app.post('/api/uploads', protect, upload.single('file'), async (req, res, next) => { try { if (!req.file) return res.status(400).json({ message: 'A file is required.' }); if (!cloudinaryReady) return res.json({ url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, provider: 'local-demo' }); const result = await new Promise((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder: 'wrenchly' }, (error, value) => error ? reject(error) : resolve(value)); Readable.from(req.file.buffer).pipe(stream); }); res.status(201).json({ url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' }); } catch (error) { next(error); } });

io.use((socket, next) => { const user = socketUser(socket.handshake.auth?.token || socket.handshake.headers.authorization); if (!user) return next(new Error('Unauthorized socket connection.')); socket.user = user; next(); });
io.on('connection', socket => {
  const { id, role } = socket.user;
  socket.join(`user:${id}`);
  if (role === 'mechanic') { socket.join('mechanic:' + id); socket.join('mechanics:online'); }
  socket.on('join_request', requestId => socket.join(`request:${requestId}`));
  socket.on('request_emergency_dispatch', async (payload, callback = () => {}) => { try { if (role !== 'user') return callback({ ok: false, message: 'Only vehicle owners can create SOS requests.' }); const { lng, lat, specialty = 'towing', notes, vehicle } = payload || {}; if (!Number.isFinite(Number(lng)) || !Number.isFinite(Number(lat))) return callback({ ok: false, message: 'A valid location is required for SOS.' }); const request = await createRequest({ user: id, customerId: id, customerName: socket.user.name, emergency: true, serviceType: 'roadside', specialty, notes, vehicle, location: makePoint(lng, lat), status: 'pending', service: `Emergency ${specialty}` }); const nearby = await findNearby({ lng, lat, radius: 10, unit: 'km', specialty }); nearby.forEach(mechanic => io.to(`mechanic:${mechanic.id}`).emit('emergency_request', { ...request, distance: mechanic.distance })); io.to('mechanics:online').emit('emergency_request', { ...request, candidateCount: nearby.length }); socket.join(`request:${request.id || request._id}`); callback({ ok: true, request }); } catch (error) { callback({ ok: false, message: error.message }); } });
  socket.on('accept_job', async ({ requestId } = {}, callback = () => {}) => { try { if (role !== 'mechanic') return callback({ ok: false, message: 'Mechanic access required.' }); const updated = await updateRequest(requestId, { status: 'accepted', mechanicId: id, acceptedAt: new Date() }); io.to(`request:${requestId}`).emit('service_status_changed', updated); callback({ ok: true, request: updated }); } catch (error) { callback({ ok: false, message: error.message }); } });
  socket.on('mechanic_location_update', ({ requestId, lng, lat } = {}) => { if (role === 'mechanic' && requestId) io.to(`request:${requestId}`).emit('mechanic_location_update', { requestId, location: makePoint(lng, lat), at: new Date().toISOString() }); });
  socket.on('send_chat_message', ({ requestId, message } = {}) => { if (requestId && message) io.to(`request:${requestId}`).emit('chat_message', { requestId, message, from: socket.user.name, at: new Date().toISOString() }); });
});

app.use((error, _req, res, _next) => { console.error(error); res.status(error.status || 500).json({ message: error.message || 'Unexpected server error.' }); });

if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✓ MongoDB Atlas connected')).catch(error => console.warn(`MongoDB unavailable; demo fallback enabled: ${error.message}`));
server.listen(port, () => console.log(`Wrenchly API + Socket.io running at http://localhost:${port}`));
