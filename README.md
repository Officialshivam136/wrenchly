# Wrenchly — On-demand car mechanic finder

Production-oriented MERN platform for vehicle owners, mechanic partners, and super admins. The local experience works without credentials using an in-memory fallback; adding MongoDB Atlas, Cloudinary, Google Maps, and Razorpay turns on the cloud integrations.

## Architecture

```text
client/                    React + Vite installable PWA UI
  src/components/          map, SOS, admin verification, mechanic workspace
server/                    Express API + Socket.io
  models/                  User, MechanicProfile, ServiceRequest, Review
  server.js                REST API, RBAC, geospatial search, realtime events
  seed.js                  MongoDB Atlas demo seed
MongoDB Atlas              2dsphere indexed persistence
Cloudinary                 profile, inspection, vehicle and document uploads
Google Maps JavaScript API interactive Indian map when VITE_GOOGLE_MAPS_API_KEY is set
Razorpay                   service payment checkout; local demo checkout without keys
```

### Roles and lifecycle

- **User**: account, vehicles, nearby/all-network search, direct mechanic hiring, structured fault reports, damage photos, SOS, live status, payment, reviews.
- **Mechanic**: partner status, live inbox, accept/reject flow, job status updates, location events.
- **Admin**: marketplace stats, booking operations, mechanic approvals, partner management.

Service status is: `pending → accepted → in-route → diagnosing → in-progress → completed → paid`.

## Run it now

Requirements: Node.js 18+ and npm.

```bash
npm run install:all
npm run dev
```

Open **http://localhost:5173**. The API and Socket.io server run on **http://localhost:5000**.

### Install it as an app

Wrenchly includes a web app manifest, offline shell, app icons, mobile bottom navigation, and an install prompt. Open the site in Chrome or Edge, then choose **Install Wrenchly** from the browser address bar or the in-app install prompt. The installed app opens in a standalone window and keeps the customer UI optimized for phone screens.

### Demo accounts

- User: `alex@example.com` / `password`
- Admin: `admin@wrenchly.com` / `admin123`
- Mechanic: `mechanic@example.com` / `mechanic123`

## Cloud configuration

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

Set these values when available:

- `server/.env`: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- `server/.env`: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` enable real Razorpay orders and signature verification.
- `client/.env`: `VITE_GOOGLE_MAPS_API_KEY` for Google Maps; blank uses the Indian local map fallback. Set `VITE_RAZORPAY_KEY_ID` to label the client checkout with your public Razorpay key.

Then seed Atlas:

```bash
npm --prefix server run seed
npm run dev
```

Without a real Atlas URI, the API reports `{ "mode": "demo" }` from `/api/health` and uses the safe local fallback. Uploads similarly return a local data URL until Cloudinary keys are configured. Without Razorpay keys, a local demo payment is used so the complete booking flow can still be tested.

## API and realtime checklist

Geospatial search:

```text
GET /api/mechanics/nearby?lng=77.5946&lat=12.9716&radius=10&unit=km&specialty=towing
```

Use `GET /api/mechanics?lng=...&lat=...&all=true` to display every approved mechanic location, including partners that are currently offline. The customer UI exposes this as **Show all locations**. Nearby mode uses the browser’s geolocation and the configured radius.

Booking and payment endpoints:

- `POST /api/bookings` accepts `issueType`, `issueDescription`, `urgency`, `vehicle`, `photos`, `date`, and `time`.
- `POST /api/payments/order` creates a Razorpay order or local demo order.
- `POST /api/payments/verify` verifies the Razorpay HMAC signature and moves the request to `paid`.

The booking form gives the mechanic the user’s exact problem description, optional damage photo, vehicle details, urgency, and location so the mechanic can prepare tools before dispatch.

The Mongo path uses `location: { $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance } }` against a `2dsphere` index. Coordinates always follow GeoJSON `[longitude, latitude]` order.

Socket.io events:

- `request_emergency_dispatch`: user sends location; the server finds online mechanics within 10 km and broadcasts `emergency_request`.
- `accept_job`: mechanic accepts; server emits `service_status_changed` to the request room.
- `mechanic_location_update`: mechanic sends location; server emits `mechanic_location_update` to the request room.
- `join_request`: either client joins a request room for live status/chat.
- `send_chat_message`: request-scoped realtime messaging.

To test two tabs, sign in as the mechanic in one tab and the user in another. Put the mechanic online from the Partner dashboard, trigger Emergency SOS from the user tab, then accept the request from the mechanic tab. If the browser location permission is denied, the SOS modal shows a recoverable explanation and does not dispatch a partial request.

## Verification commands

```bash
npm run build
curl http://localhost:5000/api/health
curl "http://localhost:5000/api/mechanics/nearby?lng=77.5946&lat=12.9716&radius=10&unit=km"
```
