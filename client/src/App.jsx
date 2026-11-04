
import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Bell, CalendarDays, CarFront, Check, ChevronDown, CircleHelp, Clock3,
  Filter, Gauge, Heart, LayoutDashboard, ListFilter, LockKeyhole, LogOut, MapPin, Moon, Sun,
  Menu, MessageCircle, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal,
  Download, Sparkles, Star, PenTool, UserRound, Users, X, Wrench, Zap, Phone, AlertTriangle,
  FileText, CheckCircle2, Navigation, Award, Fuel, BatteryCharging, Printer, ThumbsUp, Activity
} from 'lucide-react';
import NearbyMechanicsMap from './components/NearbyMechanicsMap';
import EmergencySOSButton from './components/EmergencySOSButton';
import AdminDashboardView from './components/AdminDashboardView';
import MechanicDashboardView from './components/MechanicDashboardView';
import Tilt3DCard from './components/Tilt3DCard';
import CarShowroom3D from './components/CarShowroom3D';
import DispatchTracker3D from './components/DispatchTracker3D';
import Vehicle3DPreview from './components/Vehicle3DPreview';
import { Floating3DGear, Floating3DPiston } from './components/Floating3DToolBadge';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('wrenchly_token');
  const response = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

// Comprehensive Vehicle Database for Booking
const VEHICLE_CATALOG = {
  'Hyundai': ['Creta', 'Venue', 'i20', 'Verna', 'Grand i10 Nios', 'Tucson', 'Alcazar', 'Exter', 'Ioniq 5 (EV)', 'Kona (EV)'],
  'Tata': ['Nexon', 'Punch', 'Harrier', 'Safari', 'Altroz', 'Tiago', 'Tigor', 'Curvv', 'Nexon EV', 'Punch EV', 'Tiago EV'],
  'Maruti Suzuki': ['Swift', 'Baleno', 'Brezza', 'Grand Vitara', 'Dzire', 'Fronx', 'WagonR', 'Ertiga', 'Jimny', 'Alto K10', 'Ciaz', 'XL6', 'Invicto'],
  'Mahindra': ['Thar', 'Scorpio-N', 'Scorpio Classic', 'XUV700', 'XUV3X0', 'Bolero', 'Bolero Neo', 'XUV400 (EV)'],
  'Toyota': ['Innova Crysta', 'Innova Hycross', 'Fortuner', 'Urban Cruiser Hyryder', 'Glanza', 'Hilux', 'Camry Hybrid', 'Vellfire'],
  'Kia': ['Seltos', 'Sonet', 'Carens', 'EV6', 'Carnival'],
  'Honda': ['City', 'Amaze', 'Elevate'],
  'Volkswagen': ['Virtus', 'Taigun', 'Tiguan'],
  'Skoda': ['Slavia', 'Kushaq', 'Kodiaq', 'Superb'],
  'MG Motor': ['Hector', 'ZS EV', 'Astor', 'Comet EV', 'Gloster'],
  'Renault': ['Kwid', 'Triber', 'Kiger'],
  'Nissan': ['Magnite', 'X-Trail'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'i4 (EV)', 'iX (EV)'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'EQE'],
  'Audi': ['A4', 'A6', 'Q3', 'Q5', 'Q7', 'e-tron (EV)'],
  'Volvo': ['XC40 Recharge', 'XC60', 'XC90', 'EX40'],
  'BYD': ['Atto 3', 'Seal', 'eMAX 7'],
  'Other / Custom': ['Custom Model']
};

const POPULAR_CARS = [
  { make: 'Hyundai', model: 'Creta' },
  { make: 'Tata', model: 'Nexon' },
  { make: 'Maruti Suzuki', model: 'Brezza' },
  { make: 'Toyota', model: 'Innova' },
  { make: 'Mahindra', model: 'Thar' },
  { make: 'Kia', model: 'Seltos' },
  { make: 'Honda', model: 'City' },
  { make: 'BMW', model: '3 Series' }
];

const fallbackMechanics = [
  { id: 'm1', name: 'Indiranagar Auto Care', initials: 'IA', verified: true, rating: 4.9, reviews: 184, distance: '0.8 km', minutes: 8, price: 'From ₹850', specialty: 'Engine & diagnostics', services: ['Oil change', 'Brake service', 'Diagnostics'], open: true, address: '12th Main Road, Indiranagar, Bengaluru', color: '#e5f5ef', accent: '#088061', image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=800&q=80', location: { type: 'Point', coordinates: [77.641, 12.9719] } },
  { id: 'm2', name: 'Bengaluru Mobile Mechanics', initials: 'BM', verified: true, rating: 4.8, reviews: 96, distance: '1.4 km', minutes: 12, price: 'From ₹700', specialty: 'At-home roadside service', services: ['Battery & electrical', 'Tire service', 'Oil change'], open: true, address: 'Available across Bengaluru', color: '#fff1d6', accent: '#c57908', image: 'https://images.unsplash.com/photo-1632823469850-1f77d9deabdf?auto=format&fit=crop&w=800&q=80', location: { type: 'Point', coordinates: [77.5946, 12.9716] } },
  { id: 'm3', name: 'Greenline EV Garage', initials: 'GE', verified: true, rating: 4.7, reviews: 213, distance: '2.1 km', minutes: 18, price: 'From ₹950', specialty: 'EV & hybrid certified', services: ['EV diagnostics', 'AC & heating', 'Brake service'], open: true, address: 'Koramangala, Bengaluru', color: '#e8efff', accent: '#4169c8', image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=800&q=80', location: { type: 'Point', coordinates: [77.6101, 12.9352] } },
  { id: 'm4', name: 'Koramangala Service Co.', initials: 'KS', verified: false, rating: 4.6, reviews: 71, distance: '3.7 km', minutes: 28, price: 'From ₹650', specialty: 'General repair', services: ['Oil change', 'Wheel alignment', 'Inspection'], open: false, address: '80 Feet Road, Koramangala, Bengaluru', color: '#f3eafd', accent: '#8757b8', image: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=800&q=80', location: { type: 'Point', coordinates: [77.6245, 12.9352] } }
];

const serviceCatalog = [
  { id: 'diagnostics', title: 'Diagnostics & Electrical', desc: 'Complete OBD-II computer diagnostic scan, sensor test, and error analysis.', price: 'From ₹850', icon: Search, tags: ['Check Engine', 'Battery Light', 'Sensors'] },
  { id: 'battery', title: 'Battery & Jumpstart', desc: 'Rapid at-location battery jumpstarts, health testing, and doorstep replacement.', price: 'From ₹650', icon: Zap, tags: ['Jumpstart', 'Alternator', 'Testing'] },
  { id: 'brakes', title: 'Brakes & Suspension', desc: 'Brake pads, discs, caliper inspection, hydraulic bleeding, and steering alignments.', price: 'From ₹900', icon: Gauge, tags: ['Pads', 'Discs', 'Suspension'] },
  { id: 'tires', title: 'Flat Tyre & Wheel Service', desc: 'Puncture repair, spare tire change, wheel balancing, and tire rotation.', price: 'From ₹600', icon: CarFront, tags: ['Puncture', 'Rotation', 'Replacement'] },
  { id: 'oil-change', title: 'Engine & Oil Service', desc: 'Synthetic lube, oil filter replacement, coolant top-up, and 25-point health check.', price: 'From ₹1,200', icon: Fuel, tags: ['Synthetic', 'Filter', 'Inspection'] },
  { id: 'ev', title: 'EV & Hybrid Care', desc: 'High-voltage battery diagnostics, regenerative braking, inverter, and thermal checks.', price: 'From ₹1,400', icon: BatteryCharging, tags: ['High Voltage', 'Battery Pack', 'Thermal'] }
];

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('wrenchly_user') || 'null'));
  const [mechanics, setMechanics] = useState(fallbackMechanics);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [modal, setModal] = useState(null);
  const [checkerOpen, setCheckerOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('wrenchly_theme') || 'light');

  const locateUser = (silent = false) => {
    if (!navigator.geolocation) { setLocationStatus('unsupported'); return; }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      position => {
        setUserLocation([position.coords.longitude, position.coords.latitude]);
        setLocationStatus('ready');
      },
      () => {
        setLocationStatus('denied');
        if (!silent) setToast('Location access not granted. Showing mechanics near Bengaluru.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 }
    );
  };

  const loadMechanics = async () => {
    const lng = userLocation?.[0] ?? 77.5946;
    const lat = userLocation?.[1] ?? 12.9716;
    try {
      const data = await request(`/mechanics?lng=${lng}&lat=${lat}&radius=50&unit=km&all=true`);
      if (Array.isArray(data) && data.length > 0) setMechanics(data);
    } catch {
      setMechanics(fallbackMechanics);
    }
  };

  useEffect(() => { locateUser(true); }, []);
  useEffect(() => { loadMechanics(); }, [userLocation]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('wrenchly_theme', theme);
  }, [theme]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const login = payload => {
    localStorage.setItem('wrenchly_token', payload.token);
    localStorage.setItem('wrenchly_user', JSON.stringify(payload.user));
    setUser(payload.user);
    setModal(null);
    setToast(`Welcome back, ${payload.user.name.split(' ')[0]}.`);
    if (payload.user.role === 'admin') navigate('/admin');
    else if (payload.user.role === 'mechanic') navigate('/mechanic');
  };

  const logout = () => {
    localStorage.removeItem('wrenchly_token');
    localStorage.removeItem('wrenchly_user');
    setUser(null);
    navigate('/');
    setToast('You have been signed out.');
  };

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMechanicRoute = location.pathname === '/mechanic';

  if (isAdminRoute && user?.role === 'admin') {
    return <AdminPanel user={user} onLogout={logout} toast={toast} setToast={setToast} />;
  }
  if (isMechanicRoute && user?.role === 'mechanic') {
    return <MechanicDashboardView user={user} onLogout={logout} onToast={setToast} />;
  }

  return (
    <div className="app-shell">
      <TopNoticeBar />
      <Header
        user={user}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        onCheckCar={() => setCheckerOpen(true)}
        onLogin={() => setModal({ type: 'auth', mode: 'login' })}
        onLogout={logout}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              mechanics={mechanics}
              userLocation={userLocation}
              locationStatus={locationStatus}
              locateUser={locateUser}
              onCheckCar={() => setCheckerOpen(true)}
              onBook={mechanic => setModal({ type: 'booking', mechanic })}
              onSOS={() => setModal({ type: 'sos' })}
            />
          }
        />
        <Route
          path="/booking"
          element={
            <BookingPage
              user={user}
              mechanics={mechanics}
              onLogin={() => setModal({ type: 'auth', mode: 'login' })}
              onPayment={req => setModal({ type: 'payment', request: req })}
            />
          }
        />
        <Route path="/booking-confirmation" element={<BookingConfirmationPage mechanics={mechanics} />} />
        <Route
          path="/services"
          element={
            <ServicesPage
              onBookService={service => {
                navigate(`/booking?service=${encodeURIComponent(service.title)}`);
              }}
            />
          }
        />
        <Route path="/how-it-works" element={<HowItWorksPage onCheckCar={() => setCheckerOpen(true)} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage setToast={setToast} />} />
        <Route
          path="/appointments"
          element={
            <AppointmentsPage
              user={user}
              onLogin={() => setModal({ type: 'auth', mode: 'login' })}
              onFind={() => navigate('/')}
              onRate={booking => setModal({ type: 'rate', booking })}
            />
          }
        />
        <Route
          path="/mechanics/:id"
          element={
            <MechanicProfilePage
              mechanics={mechanics}
              onBook={mechanic => setModal({ type: 'booking', mechanic })}
            />
          }
        />
        <Route
          path="/admin/*"
          element={
            user?.role === 'admin' ? (
              <AdminPanel user={user} onLogout={logout} toast={toast} setToast={setToast} />
            ) : (
              <div className="vp-page-container text-center">
                <h2>Admin Login Required</h2>
                <p>Please log in with administrator credentials to access this workspace.</p>
                <button className="vp-btn" onClick={() => setModal({ type: 'auth', mode: 'login' })}>
                  Admin Sign In
                </button>
              </div>
            )
          }
        />
        <Route
          path="/mechanic"
          element={
            user?.role === 'mechanic' ? (
              <MechanicDashboardView user={user} onLogout={logout} onToast={setToast} />
            ) : (
              <div className="vp-page-container text-center">
                <h2>Mechanic Partner Access</h2>
                <p>Please log in with your mechanic partner account to view your live queue.</p>
                <button className="vp-btn" onClick={() => setModal({ type: 'auth', mode: 'login' })}>
                  Partner Sign In
                </button>
              </div>
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer onAdminAccess={() => (user?.role === 'admin' ? navigate('/admin') : setModal({ type: 'auth', mode: 'login' }))} />

      <MobileAppNav />

      {/* Modals */}
      {modal?.type === 'auth' && (
        <AuthModal
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSuccess={login}
          onMode={mode => setModal({ type: 'auth', mode })}
        />
      )}
      {modal?.type === 'booking' && (
        <BookingModal
          mechanic={modal.mechanic}
          user={user}
          onClose={() => setModal(null)}
          onLogin={() => setModal({ type: 'auth', mode: 'login' })}
          onBooked={requestData => {
            setModal({ type: 'payment', request: requestData });
            setToast('Booking request received. Please finalize payment.');
          }}
        />
      )}
      {modal?.type === 'payment' && (
        <PaymentModal
          serviceRequest={modal.request}
          onClose={() => setModal(null)}
          onPaid={paidRequest => {
            setModal(null);
            setToast('Payment confirmed! Your mechanic has been alerted.');
            navigate('/booking-confirmation', { state: { booking: paidRequest || modal.request } });
          }}
        />
      )}
      {modal?.type === 'rate' && (
        <ReviewModal
          booking={modal.booking}
          onClose={() => setModal(null)}
          onReviewed={review => {
            setModal(null);
            setToast(`Thank you! Review of ${review.rating}★ submitted.`);
          }}
        />
      )}
      {checkerOpen && (
        <FaultCheckerModal
          onClose={() => setCheckerOpen(false)}
          onBook={serviceType => {
            setCheckerOpen(false);
            navigate(`/booking?service=${encodeURIComponent(serviceType || 'Diagnostics')}`);
          }}
        />
      )}
      <InstallAppPrompt />
      {toast && (
        <div className="toast">
          <Check size={17} /> {toast}
        </div>
      )}
    </div>
  );
}

// Top Announcement Notice Bar - Valencia Pickup Style
function TopNoticeBar() {
  return (
    <aside className="vp-top-notice">
      <span>
        <ShieldCheck size={14} /> 24/7 Roadside Assistance & Verified Mechanic Network Across Bengaluru
      </span>
      <div className="vp-top-notice-right">
        <a href="tel:+919876543210">
          <Phone size={13} /> Call Us: +91 98765 43210
        </a>
        <span className="vp-top-notice-badge">Instant Dispatch</span>
      </div>
    </aside>
  );
}

// Header - Valencia Pickup Style
function Header({ user, theme, onToggleTheme, onCheckCar, onLogin, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollTo = (id) => {
    if (location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <header className="vp-header">
      <Link to="/" className="vp-brand">
        <span className="vp-brand-mark">
          <Wrench size={20} />
        </span>
        <span>Wrenchly</span>
      </Link>
      <nav className="vp-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Home
        </NavLink>
        <button type="button" onClick={() => handleScrollTo('how-it-works')}>
          How it works
        </button>
        <button type="button" onClick={() => handleScrollTo('features')}>
          What you get
        </button>
        <button type="button" onClick={() => handleScrollTo('mechanics-directory')}>
          Find Mechanics
        </button>
        <button type="button" onClick={() => handleScrollTo('reviews')}>
          What people say
        </button>
        <NavLink to="/booking" className={({ isActive }) => (isActive ? 'active' : '')}>
          Book a Repair
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => (isActive ? 'active' : '')}>
          My Garage
        </NavLink>
      </nav>
      <div className="vp-header-actions">
        <EmergencySOSButton
          user={user}
          onLogin={onLogin}
          onCreated={() => alert('Emergency SOS broadcast to all nearby mechanics.')}
        />
        <button className="icon-button theme-toggle" onClick={onToggleTheme} title="Toggle Dark/Light Mode">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {user ? (
          <div className="profile-menu">
            <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
            <span>{user.name.split(' ')[0]}</span>
            <ChevronDown size={14} />
            <div className="profile-dropdown">
              {user.role === 'admin' && (
                <button onClick={() => navigate('/admin')}>
                  <LayoutDashboard size={14} /> Admin Workspace
                </button>
              )}
              {user.role === 'mechanic' && (
                <button onClick={() => navigate('/mechanic')}>
                  <Wrench size={14} /> Partner Cockpit
                </button>
              )}
              <button onClick={() => navigate('/appointments')}>
                <CalendarDays size={14} /> My Appointments
              </button>
              <button onClick={onLogout}>
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        ) : (
          <>
            <button className="login-link" onClick={onLogin}>
              Sign in
            </button>
            <button className="btn btn-primary" onClick={onCheckCar}>
              Get Free Report <ArrowRight size={14} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

// Reusable Rich Vehicle Selector Component
function VehicleSelector({ value, onChange }) {
  const currentBrand = value?.make || 'Hyundai';
  const currentModel = value?.model || 'Creta';
  const currentYear = value?.year || 2022;
  const currentFuel = value?.fuel || 'Petrol';
  const currentPlate = value?.plate || '';

  const availableModels = VEHICLE_CATALOG[currentBrand] || ['Standard Model'];

  const handleBrandChange = brand => {
    const models = VEHICLE_CATALOG[brand] || [];
    onChange({
      ...value,
      make: brand,
      model: models[0] || 'Standard Model'
    });
  };

  const handleQuickSelect = (make, model) => {
    onChange({
      ...value,
      make,
      model
    });
  };

  return (
    <div className="vehicle-selector-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--vp-muted)' }}>
          Popular Vehicles in Bengaluru
        </label>
        <span style={{ fontSize: 11, color: '#004f9c', fontWeight: 600 }}>Quick 1-Click Pick</span>
      </div>
      <div className="popular-car-chips">
        {POPULAR_CARS.map(car => {
          const isSelected = currentBrand === car.make && currentModel.includes(car.model);
          return (
            <button
              type="button"
              key={`${car.make}-${car.model}`}
              className={`popular-car-chip ${isSelected ? 'active' : ''}`}
              onClick={() => handleQuickSelect(car.make, car.model)}
            >
              <CarFront size={12} /> {car.make} {car.model}
            </button>
          );
        })}
      </div>

      <div className="vehicle-grid-inputs">
        <div className="vp-field">
          <label>Brand / Make</label>
          <select value={currentBrand} onChange={e => handleBrandChange(e.target.value)}>
            {Object.keys(VEHICLE_CATALOG).map(brand => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div className="vp-field">
          <label>Car Model</label>
          <select value={currentModel} onChange={e => onChange({ ...value, model: e.target.value })}>
            {availableModels.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="vp-field">
          <label>Fuel / Engine</label>
          <select value={currentFuel} onChange={e => onChange({ ...value, fuel: e.target.value })}>
            <option>Petrol</option>
            <option>Diesel</option>
            <option>CNG</option>
            <option>Electric (EV)</option>
            <option>Hybrid</option>
          </select>
        </div>

        <div className="vp-field">
          <label>Year</label>
          <select value={currentYear} onChange={e => onChange({ ...value, year: Number(e.target.value) })}>
            {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2012].map(yr => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="vp-field" style={{ marginTop: 12 }}>
        <label>Registration / Number Plate (Optional)</label>
        <input
          value={currentPlate}
          onChange={e => onChange({ ...value, plate: e.target.value.toUpperCase() })}
          placeholder="e.g. KA 03 MX 4821"
        />
      </div>
    </div>
  );
}

// Home Page — Authentic Wrenchly.co.uk Experience
function HomePage({ user, mechanics, userLocation, locationStatus, locateUser, onCheckCar, onBook, onSOS }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All services');
  const [selectedUrgency, setSelectedUrgency] = useState('scheduled');
  const [radius, setRadius] = useState('15');
  const [openOnly, setOpenOnly] = useState(false);
  const [showAllMechanics, setShowAllMechanics] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const driverReviews = [
    {
      stars: '★★★★★',
      text: 'My car was making a loud whining noise from the engine whenever accelerating. Wrenchly identified the alternator bearing in 40 seconds. The mobile mechanic came to Indiranagar and replaced it at the exact price quoted.',
      name: 'Priya Sharma',
      location: 'Indiranagar, Bengaluru · Hyundai Creta'
    },
    {
      stars: '★★★★★',
      text: 'Avoided a ₹12,000 scam quote from an unauthorized garage. Wrenchly diagnosed a simple blown fuse rather than an entire steering module failure. Booked Indiranagar Auto Care and paid just ₹750.',
      name: 'Rahul Menon',
      location: 'Koramangala, Bengaluru · Tata Nexon'
    },
    {
      stars: '★★★★★',
      text: 'The 3D vehicle inspector is mind-blowing. Tapping on the front brake pads gave me instant warning symptoms and allowed me to order ceramic replacement pads doorstep in Whitefield.',
      name: 'Ananya Kulkarni',
      location: 'Whitefield, Bengaluru · Maruti Brezza'
    },
    {
      stars: '★★★★★',
      text: 'Battery died completely on the Outer Ring Road. Used Emergency SOS, verified the fault cause on my phone, and technician arrived in 14 minutes with jumpstart gear.',
      name: 'Karthik Rao',
      location: 'Bellandur, Bengaluru · Mahindra XUV700'
    }
  ];

  const filteredMechanics = useMemo(() => {
    return mechanics.filter(m => {
      const matchQuery = `${m.name} ${m.specialty} ${m.services.join(' ')}`.toLowerCase().includes(query.toLowerCase());
      const matchService = selectedService === 'All services' || m.services.includes(selectedService);
      const matchOpen = !openOnly || m.open;
      return matchQuery && matchService && matchOpen;
    });
  }, [mechanics, query, selectedService, openOnly]);

  return (
    <main>
      {/* 1. Authentic Wrenchly.co.uk Hero Section */}
      <section className="wrenchly-hero">
        <div className="hero-inner">
          <div className="hero-pill">
            <Sparkles size={14} className="accent-pulse" /> Free AI Car Fault Diagnosis & AI Mechanic
          </div>
          <h1>
            Know what's wrong with your car <br />
            <span className="teal">before you book a repair.</span>
          </h1>
          <p className="hero-sub">
            A free AI mechanic for drivers. Answer guided questions and get an AI car diagnosis report with ranked
            likely causes, urgency and fair repair costs. No account needed.
          </p>
          <div className="hero-btns">
            <button className="btn btn-primary btn-xl" onClick={onCheckCar}>
              Get Free Diagnostic Report <ArrowRight size={16} />
            </button>
            <button className="btn btn-dark btn-xl" onClick={() => navigate('/booking')}>
              Book a Vetted Mechanic <Wrench size={16} />
            </button>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <div className="trust-icon">
                <ShieldCheck size={16} />
              </div>
              <span>Free and instant</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <LockKeyhole size={16} />
              </div>
              <span>No card required</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>Over 4,000 drivers helped</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <Award size={16} />
              </div>
              <span>Vetted local mechanics</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Flagship Interactive 3D Vehicle Diagnostics Lab */}
      <section className="vp-3d-showroom-section">
        <div className="steps-container">
          <div className="steps-head">
            <span className="sec-label">INTERACTIVE 3D AUTO LAB</span>
            <h2 className="sec-title">Explore Your Vehicle in 360° 3D</h2>
            <p className="sec-sub">
              Rotate 360°, inspect internal parts with X-Ray Diagnostics, and tap glowing hotspots to identify issues
              and book repairs directly.
            </p>
          </div>
          <CarShowroom3D
            onSelectService={serviceTitle => {
              navigate(`/booking?service=${encodeURIComponent(serviceTitle)}`);
            }}
            onCheckCar={onCheckCar}
          />
        </div>
      </section>

      {/* 3. Authentic How It Works Section (Wrenchly.co.uk Style) */}
      <section id="how-it-works" className="steps-section">
        <div className="steps-container">
          <div className="steps-head">
            <span className="sec-label">HOW IT WORKS</span>
            <h2 className="sec-title">From strange noise to fixed car in three simple steps.</h2>
            <p className="sec-sub">
              Simple, accurate, and completely free to use before you set foot in a garage.
            </p>
          </div>
          <div className="steps-grid">
            <Tilt3DCard maxTilt={8} scale={1.02}>
              <div className="step-card" data-num="01">
                <div className="step-num">STEP 01</div>
                <div className="step-icon">
                  <MessageCircle size={22} />
                </div>
                <h3>Answer guided questions</h3>
                <p>
                  Describe what you're noticing — strange noises, warning lights, smoke or starting issues. Our AI asks
                  the exact questions an experienced mechanic would ask.
                </p>
              </div>
            </Tilt3DCard>
            <Tilt3DCard maxTilt={8} scale={1.02}>
              <div className="step-card" data-num="02">
                <div className="step-num">STEP 02</div>
                <div className="step-icon">
                  <Activity size={22} />
                </div>
                <h3>Get your instant AI report</h3>
                <p>
                  Receive an immediate breakdown with ranked likely causes, severity ratings, safe driving advice, and
                  fair parts and labour cost estimates.
                </p>
              </div>
            </Tilt3DCard>
            <Tilt3DCard maxTilt={8} scale={1.02}>
              <div className="step-card" data-num="03">
                <div className="step-num">STEP 03</div>
                <div className="step-icon">
                  <ShieldCheck size={22} />
                </div>
                <h3>Book with total confidence</h3>
                <p>
                  Choose an upfront-priced mobile mechanic or verified partner garage to fix the exact issue without
                  surprise quotes or unnecessary upsells.
                </p>
              </div>
            </Tilt3DCard>
          </div>
        </div>
      </section>

      {/* 4. Authentic Features & Live Mock Report Split Section (Wrenchly.co.uk Style) */}
      <section id="features" className="features-section">
        <div className="steps-container">
          <div className="steps-head" style={{ textAlign: 'left', marginBottom: 20 }}>
            <span className="sec-label">WHAT YOU GET</span>
            <h2 className="sec-title">Everything you need to know before visiting a mechanic.</h2>
            <p className="sec-sub">
              Clear, structured answers without automotive jargon or guesswork.
            </p>
          </div>
          <div className="features-split">
            <div className="feature-list">
              <div className="feature-row">
                <div className="feature-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4>Ranked likely causes</h4>
                  <p>
                    Not just one wild guess. You get a ranked probability list of what is actually causing the symptom
                    based on your vehicle make and model.
                  </p>
                </div>
              </div>
              <div className="feature-row">
                <div className="feature-icon">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4>Urgency & safety rating</h4>
                  <p>
                    Know immediately whether your vehicle is safe to drive home, safe for short trips, or requires
                    immediate engine shutdown and roadside assistance.
                  </p>
                </div>
              </div>
              <div className="feature-row">
                <div className="feature-icon">
                  <Award size={20} />
                </div>
                <div>
                  <h4>Realistic repair cost benchmarks</h4>
                  <p>
                    Clear parts and labour estimates so you know exactly what a fair price looks like before talking to
                    any mechanic.
                  </p>
                </div>
              </div>
              <div className="feature-row">
                <div className="feature-icon">
                  <Wrench size={20} />
                </div>
                <div>
                  <h4>One-click verified booking</h4>
                  <p>
                    Connect with vetted mobile mechanics across Bengaluru who arrive with the right diagnostic tools and
                    replacement parts ready.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Mock Report Card */}
            <Tilt3DCard maxTilt={6} scale={1.02}>
              <div className="mock-report">
                <div className="mock-bar">
                  <span className="mock-bar-dot" style={{ background: '#ef4444' }} />
                  <span className="mock-bar-dot" style={{ background: '#f59e0b' }} />
                  <span className="mock-bar-dot" style={{ background: '#10b981' }} />
                  <span className="mock-bar-title">WRENCHLY AI DIAGNOSTIC REPORT · 2022 CRETA</span>
                </div>
                <div className="mock-content">
                  <div className="mock-cause">
                    <span className="mock-cause-num">1</span>
                    <span className="mock-cause-name">Alternator or Drive Belt Tensioner</span>
                    <div className="mock-cause-pct">
                      <span className="mock-cause-pct-lbl">PROBABILITY</span>
                      82%
                    </div>
                  </div>
                  <div className="mock-cause">
                    <span className="mock-cause-num">2</span>
                    <span className="mock-cause-name">12V Battery Terminal Oxidation</span>
                    <div className="mock-cause-pct">
                      <span className="mock-cause-pct-lbl">PROBABILITY</span>
                      14%
                    </div>
                  </div>
                  <div className="mock-cause">
                    <span className="mock-cause-num">3</span>
                    <span className="mock-cause-name">Starter Solenoid Fuse Link</span>
                    <div className="mock-cause-pct">
                      <span className="mock-cause-pct-lbl">PROBABILITY</span>
                      4%
                    </div>
                  </div>

                  <div className="mock-row">
                    <span className="lbl">Urgency Assessment</span>
                    <span className="mock-badge badge-amber">
                      <AlertTriangle size={12} /> Inspect within 24–48 hrs
                    </span>
                  </div>
                  <div className="mock-row">
                    <span className="lbl">Can I still drive it?</span>
                    <span className="val" style={{ color: '#15803d' }}>Yes, safe for local short trips</span>
                  </div>

                  <div className="mock-box">
                    <div className="mock-box-label">EXPERT ADVICE</div>
                    <p>
                      Avoid multiple jumpstarts if you hear an alternator whining noise. Driving with low charging voltage
                      can deep-drain your battery cells.
                    </p>
                  </div>

                  <div className="mock-cost">
                    <div>
                      <span className="lbl" style={{ display: 'block', fontSize: 11 }}>ESTIMATED REPAIR BENCHMARK</span>
                      <span className="price">₹650 – ₹1,800</span>
                    </div>
                    <span className="tag">Visit & Diagnosis Included</span>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 14 }}
                    onClick={() => navigate('/booking?service=Diagnostics%20%26%20Electrical')}
                  >
                    Fix This Issue Now <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </Tilt3DCard>
          </div>
        </div>
      </section>

      {/* 5. Navy Band with High-Impact Metrics */}
      <section className="navy-band">
        <div className="steps-container">
          <div style={{ textAlign: 'center' }}>
            <span className="sec-label">WHY DRIVERS TRUST WRENCHLY</span>
            <h2 className="sec-title" style={{ color: '#fff' }}>
              Built for drivers who want truth, transparency, and speed.
            </h2>
          </div>
          <div className="navy-stats">
            <div className="navy-stat">
              <div className="num">40+</div>
              <div className="lbl">Diagnostic Checkpoints Checked</div>
            </div>
            <div className="navy-stat">
              <div className="num">60s</div>
              <div className="lbl">Average Triage Report Speed</div>
            </div>
            <div className="navy-stat">
              <div className="num">4.9★</div>
              <div className="lbl">Driver Satisfaction Rating</div>
            </div>
            <div className="navy-stat">
              <div className="num">100%</div>
              <div className="lbl">Vetted & Identity Verified Pros</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Authentic Comparison: Chatbots vs Wrenchly */}
      <section className="ai-compare-section">
        <div className="steps-container">
          <div className="steps-head">
            <span className="sec-label">AI TAILORED FOR VEHICLES</span>
            <h2 className="sec-title">Stop guessing with chatbots. Start solving with Wrenchly.</h2>
            <p className="sec-sub">
              Generic chatbots guess and give unstructured paragraphs. Wrenchly delivers structured automotive decision trees.
            </p>
          </div>
          <div className="ai-compare-table">
            <div className="ai-compare-header">
              <div>DIAGNOSTIC CAPABILITY</div>
              <div>GENERIC AI CHATBOTS</div>
              <div className="col-wrenchly">WRENCHLY AI MECHANIC</div>
            </div>
            <div className="ai-compare-row">
              <div className="ai-feature-name">Symptom Interview</div>
              <div className="ai-chatbot-col">
                <X size={15} color="#ef4444" /> Unstructured free-text guessing
              </div>
              <div className="ai-wrenchly-col">
                <Check size={16} color="#30A5BF" /> Adaptive automotive decision tree
              </div>
            </div>
            <div className="ai-compare-row">
              <div className="ai-feature-name">Fault Code & Sensor Mapping</div>
              <div className="ai-chatbot-col">
                <X size={15} color="#ef4444" /> Hallucinates false OBD-II codes
              </div>
              <div className="ai-wrenchly-col">
                <Check size={16} color="#30A5BF" /> Real ECU sensor benchmark library
              </div>
            </div>
            <div className="ai-compare-row">
              <div className="ai-feature-name">Upfront Price Transparency</div>
              <div className="ai-chatbot-col">
                <X size={15} color="#ef4444" /> No local price intelligence
              </div>
              <div className="ai-wrenchly-col">
                <Check size={16} color="#30A5BF" /> Verified parts & labour price guides
              </div>
            </div>
            <div className="ai-compare-row">
              <div className="ai-feature-name">Mechanic Dispatch</div>
              <div className="ai-chatbot-col">
                <X size={15} color="#ef4444" /> Cannot dispatch help
              </div>
              <div className="ai-wrenchly-col">
                <Check size={16} color="#30A5BF" /> 1-Click doorstep mobile mechanic dispatch
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Search & Directory of Verified Mechanics */}
      <section id="mechanics-directory" className="vp-search-wrapper" style={{ padding: '60px 0 20px' }}>
        <div className="steps-container">
          <div className="steps-head" style={{ textAlign: 'left', marginBottom: 24 }}>
            <span className="sec-label">FIND YOUR MECHANIC</span>
            <h2 className="sec-title">Book Top-Rated Mechanics in Bengaluru</h2>
            <p className="sec-sub">
              Search vetted garages and mobile technicians near your area with live GPS tracking.
            </p>
          </div>

          <div className="vp-search-panel" style={{ marginTop: 0 }}>
            <div className="vp-search-grid">
              <div className="vp-field">
                <label>
                  <MapPin size={13} /> Your Location
                </label>
                <div className="vp-input-wrap">
                  <MapPin size={16} />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Enter area (e.g. Indiranagar, Koramangala)"
                  />
                </div>
              </div>
              <div className="vp-field">
                <label>
                  <Wrench size={13} /> Service Needed
                </label>
                <select value={selectedService} onChange={e => setSelectedService(e.target.value)}>
                  <option>All services</option>
                  <option>Diagnostics</option>
                  <option>Oil change</option>
                  <option>Brake service</option>
                  <option>Battery & electrical</option>
                  <option>Tire service</option>
                  <option>EV diagnostics</option>
                </select>
              </div>
              <div className="vp-field">
                <label>
                  <Clock3 size={13} /> Urgency
                </label>
                <select value={selectedUrgency} onChange={e => setSelectedUrgency(e.target.value)}>
                  <option value="scheduled">Scheduled visit</option>
                  <option value="urgent">Urgent (within 1 hr)</option>
                  <option value="emergency">Emergency Roadside SOS</option>
                </select>
              </div>
              <div className="vp-field">
                <label>
                  <Navigation size={13} /> Search Radius
                </label>
                <select value={radius} onChange={e => setRadius(e.target.value)}>
                  <option value="5">Within 5 km</option>
                  <option value="15">Within 15 km</option>
                  <option value="30">Within 30 km</option>
                  <option value="50">Entire Bengaluru (50 km)</option>
                </select>
              </div>
              <button
                className="btn btn-primary"
                onClick={() =>
                  document.getElementById('mechanics-directory')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Search <Search size={15} />
              </button>
            </div>

            <div className="vp-search-filter-row">
              <div className="vp-filter-toggles">
                <button
                  className={`vp-toggle-btn ${openOnly ? 'active' : ''}`}
                  onClick={() => setOpenOnly(!openOnly)}
                >
                  <Check size={13} /> Open Now Only
                </button>
                <button
                  className={`vp-toggle-btn ${showAllMechanics ? 'active' : ''}`}
                  onClick={() => setShowAllMechanics(!showAllMechanics)}
                >
                  <MapPin size={13} /> Show All Partner Garages
                </button>
                <button className="vp-toggle-btn" onClick={() => locateUser(false)}>
                  <Navigation size={13} /> {locationStatus === 'loading' ? 'Locating...' : 'Use My GPS'}
                </button>
              </div>
              <span className="vp-results-count">
                Showing <strong>{filteredMechanics.length}</strong> verified mechanics
              </span>
            </div>
          </div>

          <div className="vp-directory-grid" style={{ marginTop: 28 }}>
            <div className="vp-mechanic-list">
              {filteredMechanics.map(m => (
                <Tilt3DCard key={m.id} className="vp-mechanic-card-3d-wrapper" maxTilt={6} scale={1.015}>
                  <article className="vp-mechanic-card">
                    <div className="vp-mechanic-photo-wrap">
                      <img src={m.image} alt={m.name} />
                      <span className={`vp-mechanic-status ${m.open ? 'online' : 'offline'}`}>
                        <i /> {m.open ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                    <div className="vp-mechanic-body">
                      <div className="vp-mechanic-title-row">
                        <h3>
                          {m.name} {m.verified && <ShieldCheck size={16} color="#30A5BF" />}
                        </h3>
                        <div className="vp-rating">
                          <Star size={13} fill="currentColor" /> {m.rating} <span>({m.reviews})</span>
                        </div>
                      </div>
                      <p className="vp-mechanic-specialty">{m.specialty} · {m.address}</p>
                      <div className="vp-mechanic-meta">
                        <span><MapPin size={13} /> {m.distance}</span>
                        <span><Clock3 size={13} /> {m.minutes} mins away</span>
                        <strong style={{ color: 'var(--teal)' }}>{m.price}</strong>
                      </div>
                      <div className="vp-mechanic-services">
                        {m.services.map(s => (
                          <span key={s}>{s}</span>
                        ))}
                      </div>
                      <div className="vp-mechanic-actions">
                        <Link to={`/mechanics/${m.id}`} className="btn btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }}>
                          View profile <ArrowRight size={13} />
                        </Link>
                        <button className="btn btn-primary" style={{ fontSize: 12, padding: '7px 16px' }} onClick={() => onBook(m)}>
                          Book Mechanic
                        </button>
                      </div>
                    </div>
                  </article>
                </Tilt3DCard>
              ))}
            </div>
            <div className="vp-map-container">
              <NearbyMechanicsMap mechanics={filteredMechanics} userLocation={userLocation} onRequestAssistance={onBook} />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Comprehensive Services Catalog */}
      <section className="vp-services-section">
        <div className="steps-container">
          <div className="steps-head">
            <span className="sec-label">WHAT WE OFFER</span>
            <h2 className="sec-title">Comprehensive Automotive Care</h2>
            <p className="sec-sub">
              From roadside emergency assistance to engine diagnostics, enjoy dependable automotive care.
            </p>
          </div>
          <div className="vp-services-grid">
            {serviceCatalog.map(service => {
              const Icon = service.icon;
              return (
                <Tilt3DCard key={service.id} className="vp-service-card-3d-wrapper" maxTilt={10} scale={1.02}>
                  <div className="vp-service-card">
                    <div className="vp-service-card-top">
                      <div className="vp-service-icon">
                        <Icon size={24} />
                      </div>
                      <span className="vp-service-price">{service.price}</span>
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.desc}</p>
                    <div className="vp-service-tags">
                      {service.tags.map(tag => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 'auto' }}
                      onClick={() => navigate(`/booking?service=${encodeURIComponent(service.title)}`)}
                    >
                      Book Service <ArrowRight size={14} />
                    </button>
                  </div>
                </Tilt3DCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Authentic Reviews Carousel (Wrenchly.co.uk Style) */}
      <section id="reviews" className="carousel-section">
        <div className="steps-container">
          <div style={{ textAlign: 'center' }}>
            <span className="sec-label">WHAT DRIVERS SAY</span>
            <h2 className="sec-title" style={{ color: '#fff' }}>
              Real Drivers. Real Peace of Mind.
            </h2>
            <p className="sec-sub" style={{ color: 'rgba(255,255,255,0.6)', margin: '0 auto' }}>
              Trusted by over 4,000+ vehicle owners in Bengaluru every month.
            </p>
          </div>

          <div className="carousel-outer">
            <div className="carousel-track-wrap">
              <div
                className="carousel-track"
                style={{
                  transform: `translateX(-${reviewIndex * 33.333}%)`
                }}
              >
                {driverReviews.map((rev, i) => (
                  <div key={i} className="review-card">
                    <div className="stars">{rev.stars}</div>
                    <blockquote>“{rev.text}”</blockquote>
                    <div className="reviewer">
                      <div className="avatar">{rev.name.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div className="reviewer-name">{rev.name}</div>
                        <div className="reviewer-loc">{rev.location}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="carousel-controls">
              <button
                type="button"
                className="carousel-btn"
                disabled={reviewIndex === 0}
                onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
              >
                ←
              </button>
              <div className="carousel-dots">
                {driverReviews.slice(0, 2).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`carousel-dot ${reviewIndex === i ? 'active' : ''}`}
                    onClick={() => setReviewIndex(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="carousel-btn"
                disabled={reviewIndex >= 1}
                onClick={() => setReviewIndex(Math.min(1, reviewIndex + 1))}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Authentic Final CTA Banner (Wrenchly.co.uk Style) */}
      <section className="cta-section">
        <div className="steps-container">
          <div className="cta-box">
            <h2>Stop guessing. Start knowing.</h2>
            <p>
              Answer guided questions about your vehicle symptoms and get your free AI diagnosis report in under 60 seconds.
            </p>
            <div className="cta-btns">
              <button className="btn btn-primary btn-xl" onClick={onCheckCar}>
                Get Free Diagnostic Report <ArrowRight size={16} />
              </button>
              <button className="btn btn-dark btn-xl" onClick={() => navigate('/booking')}>
                Book a Verified Mechanic <Wrench size={16} />
              </button>
            </div>
            <div className="cta-note">
              100% Free · <span>No credit card required</span> · Instant Triage Results
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Dedicated Booking Page - With Full Vehicle Database
function BookingPage({ user, mechanics, onLogin, onPayment }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialService = queryParams.get('service') || 'Diagnostics & Electrical';

  const [vehicle, setVehicle] = useState({
    make: 'Hyundai',
    model: 'Creta',
    year: 2022,
    fuel: 'Petrol',
    plate: ''
  });

  const [form, setForm] = useState({
    mechanicId: mechanics[0]?.id || 'm1',
    service: initialService,
    issueType: 'unknown',
    issueDescription: '',
    urgency: 'scheduled',
    date: new Date().toISOString().split('T')[0],
    time: '10:30 AM',
    notes: '',
    photo: null
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedMechanic = mechanics.find(m => m.id === form.mechanicId) || mechanics[0];
  const visitEstimate = 750;
  const platformFee = 90;
  const total = visitEstimate + platformFee;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) return onLogin();
    setSaving(true);
    setError('');
    try {
      let photos = [];
      if (form.photo) {
        const uploadData = new FormData();
        uploadData.append('file', form.photo);
        const res = await fetch(`${API}/uploads`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('wrenchly_token')}` },
          body: uploadData
        });
        const upl = await res.json();
        if (res.ok) photos = [{ url: upl.url, publicId: upl.publicId, kind: 'damage-photo' }];
      }

      const bookingPayload = {
        mechanicId: form.mechanicId,
        service: form.service,
        issueType: form.issueType,
        issueDescription: form.issueDescription,
        urgency: form.urgency,
        vehicle: {
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          description: `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.fuel})${vehicle.plate ? ` • ${vehicle.plate}` : ''}`
        },
        date: form.date,
        time: form.time,
        notes: form.notes,
        photos
      };

      const created = await request('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingPayload)
      });
      onPayment(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vp-page-container">
      <div className="vp-page-hero">
        <span className="vp-kicker">INSTANT RESERVATION</span>
        <h1>Book Your Auto Repair & Service</h1>
        <p>Complete the form below to connect with a certified mechanic in Bengaluru.</p>
      </div>

      <div className="vp-booking-layout">
        <form className="vp-booking-card" onSubmit={handleSubmit}>
          <h2>1. Select Your Vehicle</h2>
          <p className="vp-sub">Choose from 100+ popular car models in Bengaluru.</p>
          <VehicleSelector value={vehicle} onChange={setVehicle} />

          <Vehicle3DPreview
            vehicle={vehicle}
            selectedIssue={form.issueType}
            onSelectIssue={issue => setForm(prev => ({ ...prev, issueType: issue }))}
          />

          <h2>2. Service & Problem Details</h2>
          <p className="vp-sub">Tell us what your vehicle needs.</p>

          <div className="vp-field" style={{ marginBottom: 16 }}>
            <label>Service Category</label>
            <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
              {serviceCatalog.map(s => (
                <option key={s.id} value={s.title}>
                  {s.title} ({s.price})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="vp-field">
              <label>Issue Symptom</label>
              <select value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value })}>
                <option value="unknown">Not sure / Diagnostic</option>
                <option value="engine">Engine won't start</option>
                <option value="battery">Dead battery</option>
                <option value="flat-tire">Flat tyre / Puncture</option>
                <option value="overheating">Overheating / Coolant</option>
                <option value="brakes">Brake noise or failure</option>
                <option value="electrical">Electrical or light issue</option>
              </select>
            </div>
            <div className="vp-field">
              <label>Urgency Level</label>
              <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                <option value="scheduled">Scheduled appointment</option>
                <option value="urgent">Urgent (Within 1 hour)</option>
                <option value="emergency">Emergency Roadside SOS</option>
              </select>
            </div>
          </div>

          <div className="vp-field" style={{ marginBottom: 24 }}>
            <label>Describe What Happened</label>
            <textarea
              rows={3}
              required
              value={form.issueDescription}
              onChange={e => setForm({ ...form, issueDescription: e.target.value })}
              placeholder="e.g. Engine makes clicking noise when turning key. Parked at home in Koramangala."
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--vp-line)' }}
            />
          </div>

          <h2>3. Preferred Mechanic Partner</h2>
          <p className="vp-sub">Select your provider.</p>
          <div className="vp-field" style={{ marginBottom: 24 }}>
            <label>Mechanic Garage</label>
            <select value={form.mechanicId} onChange={e => setForm({ ...form, mechanicId: e.target.value })}>
              {mechanics.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.address} ({m.rating}★ · {m.distance})
                </option>
              ))}
            </select>
          </div>

          <h2>4. Schedule Appointment</h2>
          <p className="vp-sub">When should the mechanic arrive?</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="vp-field">
              <label>Preferred Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="vp-field">
              <label>Preferred Time Slot</label>
              <select value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}>
                <option>9:00 AM</option>
                <option>10:30 AM</option>
                <option>12:00 PM</option>
                <option>2:30 PM</option>
                <option>4:00 PM</option>
                <option>5:30 PM</option>
              </select>
            </div>
          </div>

          <div className="vp-field" style={{ marginBottom: 16 }}>
            <label>Upload Damage / Engine Photo (Optional)</label>
            <input type="file" accept="image/*" onChange={e => setForm({ ...form, photo: e.target.files?.[0] || null })} />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <button className="vp-btn" style={{ width: '100%', padding: '14px' }} disabled={saving}>
            {saving ? 'Creating Reservation...' : user ? 'Proceed to Secure Payment' : 'Sign In & Reserve'} <ArrowRight size={16} />
          </button>
        </form>

        <aside className="vp-booking-summary-card">
          <h2>Booking Summary</h2>
          <div className="vp-summary-row">
            <span>Selected Vehicle</span>
            <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong>
          </div>
          <div className="vp-summary-row">
            <span>Fuel Type</span>
            <span>{vehicle.fuel}</span>
          </div>
          <div className="vp-summary-row">
            <span>Service</span>
            <strong>{form.service}</strong>
          </div>
          <div className="vp-summary-row">
            <span>Assigned Partner</span>
            <strong>{selectedMechanic?.name || 'Assigned Partner'}</strong>
          </div>
          <div className="vp-summary-row">
            <span>Date & Time</span>
            <strong>{form.date} at {form.time}</strong>
          </div>
          <div className="vp-summary-row">
            <span>Visit Inspection Deposit</span>
            <span>₹{visitEstimate}</span>
          </div>
          <div className="vp-summary-row">
            <span>Platform Assurance Fee</span>
            <span>₹{platformFee}</span>
          </div>
          <div className="vp-summary-row total">
            <span>Total Payable</span>
            <strong>₹{total}</strong>
          </div>
          <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: 10, marginTop: 20, fontSize: 12, color: '#166534' }}>
            <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Transparent upfront pricing. Exact parts cost provided post physical inspection.
          </div>
        </aside>
      </div>
    </div>
  );
}

// Dedicated Booking Confirmation Page - Valencia Pickup Style
function BookingConfirmationPage({ mechanics }) {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking || {
    id: `req_${Date.now()}`,
    service: 'Diagnostics & Electrical',
    mechanicName: 'Indiranagar Auto Care',
    vehicle: '2022 Hyundai Creta (Petrol)',
    date: new Date().toISOString().split('T')[0],
    time: '10:30 AM',
    total: 840,
    status: 'paid'
  };

  const bookingRef = `#WRN-${String(booking.id || Date.now()).slice(-6).toUpperCase()}`;

  return (
    <div className="confirmation-container">
      <div className="confirmation-header">
        <div className="confirmation-check-icon">
          <Check size={40} />
        </div>
        <h1>Booking Confirmed!</h1>
        <p>Your mechanic reservation has been registered and dispatched to our partner network.</p>
        <span className="confirmation-ref-badge">
          <FileText size={14} /> Booking Reference: {bookingRef}
        </span>
      </div>

      {/* 3D Real-Time GPS Dispatch Radar */}
      <DispatchTracker3D
        mechanicName={booking.mechanicName || 'Indiranagar Auto Care'}
        etaMinutes={12}
        distanceKm="1.4 km"
        statusText="Mechanic En Route to Your Location"
        onCallMechanic={() => window.open('tel:+919876543210')}
      />

      <div className="confirmation-card">
        <h2><CalendarDays size={20} color="#004f9c" /> Reservation Overview</h2>
        <div className="confirmation-grid">
          <div className="confirmation-info-item">
            <span>Service Ordered</span>
            <strong>{booking.service || 'Mechanic Diagnostic & Repair'}</strong>
            <small>{booking.issueDescription || 'Vehicle diagnostic and inspection'}</small>
          </div>
          <div className="confirmation-info-item">
            <span>Assigned Partner Garage</span>
            <strong>{booking.mechanicName || 'Indiranagar Auto Care'}</strong>
            <small>Bengaluru Partner Network · 4.9★ Rated</small>
          </div>
          <div className="confirmation-info-item">
            <span>Date & Time</span>
            <strong>{booking.date} at {booking.time}</strong>
            <small>Estimated arrival window ±15 mins</small>
          </div>
          <div className="confirmation-info-item">
            <span>Vehicle Registered</span>
            <strong>
              {typeof booking.vehicle === 'string'
                ? booking.vehicle
                : `${booking.vehicle?.year || ''} ${booking.vehicle?.make || ''} ${booking.vehicle?.model || ''}`}
            </strong>
            <small>Technician dispatched with matching diagnostic tools</small>
          </div>
          <div className="confirmation-info-item">
            <span>Payment Status</span>
            <strong style={{ color: '#16a34a' }}>✓ Paid & Verified (₹{booking.total || 840})</strong>
            <small>Encrypted Razorpay Checkout Receipt</small>
          </div>
          <div className="confirmation-info-item">
            <span>Emergency Dispatch Support</span>
            <strong style={{ color: '#004f9c' }}>+91 98765 43210</strong>
            <small>Helpline available 24 hours a day</small>
          </div>
        </div>
      </div>

      <div className="confirmation-card">
        <h2><Clock3 size={20} color="#004f9c" /> What Happens Next?</h2>
        <div className="confirmation-timeline">
          <div className="confirmation-timeline-step done">
            <strong>1. Request Received & Verified</strong>
            <p>Your booking details and issue symptoms are logged on our dispatch exchange.</p>
          </div>
          <div className="confirmation-timeline-step done">
            <strong>2. Mechanic Partner Dispatched</strong>
            <p>Your mechanic is notified and prepares the necessary diagnostic scanner and tools.</p>
          </div>
          <div className="confirmation-timeline-step">
            <strong>3. Real-Time Tracking in Your Garage</strong>
            <p>Track the 7-step service lifecycle live in "My Appointments".</p>
          </div>
          <div className="confirmation-timeline-step">
            <strong>4. On-Site Inspection & Service</strong>
            <p>Physical inspection, error code clearance, or roadside assistance at your location.</p>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button className="vp-btn" onClick={() => navigate('/appointments')}>
          <CalendarDays size={16} /> Track in My Garage
        </button>
        <button className="vp-btn-secondary" onClick={() => window.print()}>
          <Printer size={16} /> Print Confirmation Slip
        </button>
        <a
          href={`https://wa.me/919876543210?text=Hi%2C%20I%20have%20confirmed%20booking%20${encodeURIComponent(bookingRef)}%20for%20my%20car.`}
          target="_blank"
          rel="noreferrer"
          className="vp-whatsapp-btn"
        >
          <MessageCircle size={16} /> WhatsApp Dispatch Team
        </a>
      </div>
    </div>
  );
}

// Driver Appointments & Rating Page
function AppointmentsPage({ user, onLogin, onFind, onRate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const loadBookings = () => {
    if (user) {
      request('/bookings')
        .then(setBookings)
        .catch(() => { })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, [user]);

  if (!user) {
    return (
      <div className="vp-page-container text-center">
        <div className="guest-icon" style={{ margin: '40px auto 20px' }}>
          <CalendarDays size={36} color="#004f9c" />
        </div>
        <h1>My Appointments</h1>
        <p>Please sign in to view your upcoming bookings, live service trackers, and submit reviews.</p>
        <button className="vp-btn" onClick={onLogin}>
          Sign in to see appointments <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="vp-page-container">
      <div className="page-intro">
        <div>
          <span className="vp-kicker">YOUR GARAGE</span>
          <h1>My Appointments</h1>
          <p>Track ongoing repairs, view completed receipts, and rate your mechanic.</p>
        </div>
        <button className="vp-btn-sm" onClick={onFind}>
          <Plus size={14} /> Book a New Service
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading your appointments...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state large">
          <CalendarDays size={32} />
          <h3>No appointments found</h3>
          <p>Book a certified mechanic whenever your car needs attention.</p>
          <button className="vp-btn-sm" onClick={onFind} style={{ marginTop: 14 }}>
            Find a mechanic
          </button>
        </div>
      ) : (
        <div className="appointments-list">
          {bookings.map(b => {
            const isCompleted = ['completed', 'paid'].includes(b.status);
            return (
              <div className={`appointment-wrap ${selected?.id === b.id ? 'expanded' : ''}`} key={b.id}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    className="appointment-row"
                    onClick={() => setSelected(selected?.id === b.id ? null : b)}
                  >
                    <div className="appointment-date">
                      <b>{new Date(b.date || Date.now()).toLocaleDateString('en-US', { day: '2-digit' })}</b>
                      <span>{new Date(b.date || Date.now()).toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                    <div className="appointment-main">
                      <h3>{b.service}</h3>
                      <p>
                        {b.mechanicName} · {typeof b.vehicle === 'string' ? b.vehicle : b.vehicle?.description || `${b.vehicle?.year || ''} ${b.vehicle?.make || ''} ${b.vehicle?.model || ''}`}
                      </p>
                      <span>
                        <Clock3 size={13} /> {b.time || 'Dispatch active'}
                      </span>
                    </div>
                    <div className={`status ${b.status}`}>
                      <i /> {b.status}
                    </div>
                  </button>

                  {/* Rating / Review Action */}
                  <div style={{ padding: '0 20px', flexShrink: 0 }}>
                    {isCompleted ? (
                      b.reviewed || b.review ? (
                        <span className="reviewed-badge">
                          <Star size={13} fill="currentColor" /> Rated {b.review?.rating || 5}★
                        </span>
                      ) : (
                        <button
                          className="vp-btn-sm"
                          style={{ background: '#f59e0b', color: '#fff' }}
                          onClick={() => onRate(b)}
                        >
                          <Star size={14} fill="currentColor" /> Rate Mechanic
                        </button>
                      )
                    ) : (
                      <MoreHorizontal size={18} className="more-button" />
                    )}
                  </div>
                </div>

                {selected?.id === b.id && <ServiceTracker booking={b} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Interactive Review Modal - User Can Rate The Mechanic
function ReviewModal({ booking, onClose, onReviewed }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedCompliments, setSelectedCompliments] = useState(['Punctual Arrival', 'Transparent Pricing']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const COMPLIMENTS = [
    '⚡ Punctual Arrival',
    '🔧 Clean Work',
    '💬 Great Communication',
    '💰 Transparent Pricing',
    '🚗 Smooth Drive Now',
    '⭐ Professional Tools'
  ];

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Outstanding!'];

  const toggleCompliment = item => {
    setSelectedCompliments(prev =>
      prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]
    );
  };

  const submitReview = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const reviewPayload = {
        rating,
        comment,
        compliments: selectedCompliments
      };
      const res = await request(`/requests/${booking.id || booking._id}/review`, {
        method: 'POST',
        body: JSON.stringify(reviewPayload)
      });
      booking.reviewed = true;
      booking.review = res;
      onReviewed(res);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal review-modal">
        <button className="modal-close" onClick={onClose}><X size={19} /></button>
        <div className="modal-kicker"><Award size={16} /> VERIFIED DRIVER FEEDBACK</div>
        <h2>Rate {booking.mechanicName || 'Your Mechanic'}</h2>
        <p className="modal-sub">How was your service for {booking.service}?</p>

        <form onSubmit={submitReview}>
          <div className="star-rating-row">
            {[1, 2, 3, 4, 5].map(star => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  className={`star-rating-btn ${active ? 'active' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star size={34} fill={active ? 'currentColor' : 'none'} />
                </button>
              );
            })}
          </div>
          <div className="star-rating-label">{ratingLabels[hoverRating || rating]} ({rating} of 5 Stars)</div>

          <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--vp-muted)' }}>
            What went well?
          </label>
          <div className="compliment-chips">
            {COMPLIMENTS.map(item => (
              <button
                type="button"
                key={item}
                className={`compliment-chip ${selectedCompliments.includes(item) ? 'selected' : ''}`}
                onClick={() => toggleCompliment(item)}
              >
                {selectedCompliments.includes(item) && <Check size={12} style={{ marginRight: 4 }} />}
                {item}
              </button>
            ))}
          </div>

          <label>Your Review & Comments
            <textarea
              rows={3}
              required
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell other drivers about the mechanic's punctuality, repair quality, and transparency..."
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--vp-line)' }}
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="vp-btn" style={{ width: '100%', padding: '14px' }} disabled={submitting}>
            {submitting ? 'Submitting Review...' : 'Submit Verified Review'} <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

// Dedicated Services Page
function ServicesPage({ onBookService }) {
  return (
    <div className="vp-page-container">
      <div className="vp-page-hero">
        <span className="vp-kicker">WHAT WE OFFER</span>
        <h1>Comprehensive Automotive Services</h1>
        <p>Explore our transparent, on-demand mechanic services delivered right to your location in Bengaluru.</p>
      </div>
      <div className="vp-services-grid">
        {serviceCatalog.map(service => {
          const Icon = service.icon;
          return (
            <div className="vp-service-card" key={service.id}>
              <div className="vp-service-card-top">
                <div className="vp-service-icon"><Icon size={26} /></div>
                <span className="vp-service-price">{service.price}</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <div className="vp-service-tags">
                {service.tags.map(t => <span key={t}>{t}</span>)}
              </div>
              <button className="vp-btn" onClick={() => onBookService(service)}>
                Book This Service <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Dedicated How It Works Page
function HowItWorksPage({ onCheckCar }) {
  const navigate = useNavigate();
  return (
    <div className="vp-page-container">
      <div className="vp-page-hero">
        <span className="vp-kicker">STEP BY STEP GUIDE</span>
        <h1>How Wrenchly Works</h1>
        <p>Turning car trouble into a seamless, dependable experience from start to finish.</p>
      </div>
      <div className="vp-how-grid" style={{ marginBottom: 50 }}>
        <div className="vp-how-card">
          <div className="vp-how-card-num">01</div>
          <h3>Identify the Issue</h3>
          <p>Use our free guided fault checker or choose a known service category. Pinpoint your location with GPS.</p>
        </div>
        <div className="vp-how-card">
          <div className="vp-how-card-num">02</div>
          <h3>Select Your Partner</h3>
          <p>Browse nearby certified mechanics, transparent reviews, and upfront pricing before committing.</p>
        </div>
        <div className="vp-how-card">
          <div className="vp-how-card-num">03</div>
          <h3>Track Live & Pay</h3>
          <p>Follow your mechanic through 7 milestone stages and complete payments through encrypted Razorpay gateways.</p>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <button className="vp-btn" onClick={() => navigate('/booking')}>
          Start Booking Now <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Dedicated About Us Page
function AboutPage() {
  return (
    <div className="vp-page-container">
      <div className="vp-page-hero">
        <span className="vp-kicker">OUR MISSION</span>
        <h1>About Wrenchly</h1>
        <p>Built to bring trust, clarity, and rapid response to vehicle owners everywhere.</p>
      </div>
      <div className="vp-trust-grid" style={{ marginBottom: 40 }}>
        <div className="vp-trust-card">
          <h3>100% Vetted Network</h3>
          <p>Every mechanic and garage undergoes strict credential, license, and background verification.</p>
        </div>
        <div className="vp-trust-card">
          <h3>No Hidden Charges</h3>
          <p>Upfront transparent inspection rates ensure you never encounter surprise garage bills.</p>
        </div>
        <div className="vp-trust-card">
          <h3>Sub-15 Min Emergency SOS</h3>
          <p>Geospatial clustering allows instant alert dispatch to the closest available pros.</p>
        </div>
        <div className="vp-trust-card">
          <h3>PWA Mobile Optimized</h3>
          <p>Installable directly from your mobile browser for immediate roadside access.</p>
        </div>
      </div>
    </div>
  );
}

// Dedicated Contact Page
function ContactPage({ setToast }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setSent(true);
    setToast('Thank you! Your inquiry has been sent to our dispatch team.');
  };

  return (
    <div className="vp-page-container">
      <div className="vp-page-hero">
        <span className="vp-kicker">GET IN TOUCH</span>
        <h1>We Are Open for Your Questions!</h1>
        <p>Have an emergency or a question about our network? Reach out anytime.</p>
      </div>
      <div className="vp-booking-layout">
        <form className="vp-booking-card" onSubmit={handleSubmit}>
          <h2>Send Us a Message</h2>
          <p className="vp-sub">We usually respond within 15 minutes.</p>
          <div className="vp-field" style={{ marginBottom: 14 }}>
            <label>Your Name</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="vp-field" style={{ marginBottom: 14 }}>
            <label>Email Address</label>
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="vp-field" style={{ marginBottom: 14 }}>
            <label>Phone Number</label>
            <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="vp-field" style={{ marginBottom: 18 }}>
            <label>Message</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--vp-line)' }}
            />
          </div>
          <button className="vp-btn" style={{ width: '100%' }}>
            {sent ? 'Message Sent ✓' : 'Send Message'} <ArrowRight size={15} />
          </button>
        </form>

        <aside className="vp-booking-summary-card">
          <h2>Direct Contact</h2>
          <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
            <div>
              <strong>Emergency Helpline:</strong>
              <p style={{ margin: '4px 0 0', color: '#004f9c', fontWeight: 700 }}>+91 98765 43210</p>
            </div>
            <div>
              <strong>WhatsApp Support:</strong>
              <p style={{ margin: '4px 0 0', color: '#16a34a', fontWeight: 700 }}>Available 24/7</p>
            </div>
            <div>
              <strong>Headquarters:</strong>
              <p style={{ margin: '4px 0 0', color: 'var(--vp-muted)' }}>12th Main Road, Indiranagar, Bengaluru, KA 560038</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// 7-Step Service Lifecycle Tracker
function ServiceTracker({ booking }) {
  const steps = ['pending', 'accepted', 'in-route', 'diagnosing', 'in-progress', 'completed', 'paid'];
  const current = Math.max(0, steps.indexOf(booking.status));
  return (
    <div className="service-tracker">
      <div>
        <p className="overline">LIVE SERVICE TRACKER</p>
        <h3>
          {booking.status === 'paid'
            ? 'Service Completed & Paid'
            : `Your mechanic is ${booking.status === 'pending' ? 'reviewing the request' : booking.status.replace('-', ' ')}`}
        </h3>
        <p>{booking.issueDescription || 'Mechanic dispatched with tools for your vehicle.'}</p>
      </div>
      <div className="tracker-steps">
        {steps.map((step, index) => (
          <div className={index <= current ? 'done' : ''} key={step}>
            <span>{index < current ? <Check size={12} /> : index + 1}</span>
            <small>{step.replace('-', ' ')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mechanic Partner Profile Page - With Customer Reviews Showcase
function MechanicProfilePage({ mechanics, onBook }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mechanic, setMechanic] = useState(() => mechanics.find(m => m.id === id) || null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (id) {
      request(`/mechanics/${id}`)
        .then(setMechanic)
        .catch(() => setMechanic(mechanics.find(m => m.id === id) || null));
      request(`/mechanics/${id}/reviews`)
        .then(setReviews)
        .catch(() => { });
    }
  }, [id, mechanics]);

  if (!mechanic) {
    return <div className="vp-page-container text-center">Loading partner profile...</div>;
  }

  return (
    <div className="profile-page">
      <button className="vp-ghost-btn" onClick={() => navigate(-1)} style={{ marginBottom: 18 }}>
        ← Back to all mechanics
      </button>
      <div className="profile-hero">
        <img src={mechanic.image} alt={mechanic.name} />
        <div>
          <div className="eyebrow profile-eyebrow">
            {mechanic.verified ? 'VERIFIED PARTNER' : 'MECHANIC PARTNER'}
          </div>
          <h1>{mechanic.name}</h1>
          <p>{mechanic.specialty} · {mechanic.address}</p>
          <div className="profile-rating">
            <Star size={15} fill="currentColor" /> <b>{mechanic.rating}</b> <span>({mechanic.reviews} reviews)</span>
          </div>
        </div>
        <button className="vp-btn profile-book" onClick={() => onBook(mechanic)}>
          Book This Mechanic <ArrowRight size={15} />
        </button>
      </div>

      <div className="profile-columns">
        <section className="profile-panel">
          <h2>Services & Specialties</h2>
          <div className="profile-tags">
            {(mechanic.services || mechanic.specialties || []).map(s => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <h2>About this partner</h2>
          <p>
            Certified local mechanic partner verified by Wrenchly. Equipped with professional diagnostic scanners, mobile jumpstart kits, and certified repair equipment.
          </p>

          {/* Customer Reviews Section */}
          <div className="mechanic-reviews-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Customer Ratings & Reviews</h2>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>
                <Star size={14} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {mechanic.rating} / 5.0 ({reviews.length || mechanic.reviews} verified reviews)
              </span>
            </div>

            <div className="review-list">
              {reviews.length > 0 ? (
                reviews.map(r => (
                  <div className="review-card-item" key={r.id || r._id}>
                    <div className="review-card-top">
                      <strong>{r.userName || r.user?.name || 'Verified Driver'}</strong>
                      <small>{new Date(r.createdAt || Date.now()).toLocaleDateString()}</small>
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: 12, marginBottom: 4 }}>
                      {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                    </div>
                    <p className="review-card-comment">"{r.comment}"</p>
                    {r.compliments && r.compliments.length > 0 && (
                      <div className="review-card-compliments">
                        {r.compliments.map(c => <span key={c}>{c}</span>)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', color: 'var(--vp-muted)', fontSize: 13 }}>
                  No written reviews yet for this partner. Book and be the first to rate!
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="profile-panel profile-side">
          <div>
            <MapPin size={18} />
            <span>
              <b>{mechanic.distance}</b>
              <small>from your current location</small>
            </span>
          </div>
          <div>
            <Clock3 size={18} />
            <span>
              <b>{mechanic.open ? 'Open Now' : 'Currently Closed'}</b>
              <small>{mechanic.minutes} mins arrival estimate</small>
            </span>
          </div>
          <div>
            <ShieldCheck size={18} />
            <span>
              <b>Wrenchly Verified</b>
              <small>Identity & background vetted</small>
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Super Admin Console
function AdminPanel({ user, onLogout, toast, setToast }) {
  const adminLocation = useLocation();
  const adminNavigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const tab = adminLocation.pathname.includes('/bookings')
    ? 'bookings'
    : adminLocation.pathname.includes('/mechanics')
      ? 'mechanics'
      : adminLocation.pathname.includes('/verification')
        ? 'verification'
        : adminLocation.pathname.includes('/customers')
          ? 'customers'
          : adminLocation.pathname.includes('/settings')
            ? 'settings'
            : 'overview';

  const setTab = next => adminNavigate(next === 'overview' ? '/admin' : `/admin/${next}`);

  const refresh = () =>
    Promise.all([request('/admin/stats'), request('/bookings'), request('/mechanics')])
      .then(([s, b, m]) => {
        setStats(s);
        setBookings(b);
        setMechanics(m);
      })
      .catch(() => { });

  useEffect(() => { refresh(); }, []);

  const update = async (id, status) => {
    await request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    setToast(`Booking marked ${status}.`);
    refresh();
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="brand" onClick={() => adminNavigate('/')}>
          <span className="brand-mark"><Wrench size={19} /></span>
          <span>Wrenchly</span>
        </a>
        <div className="admin-label">WORKSPACE</div>
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
          <LayoutDashboard size={18} /> Overview
        </button>
        <button className={tab === 'bookings' ? 'active' : ''} onClick={() => setTab('bookings')}>
          <CalendarDays size={18} /> Bookings <b>{stats?.pending || 0}</b>
        </button>
        <button className={tab === 'mechanics' ? 'active' : ''} onClick={() => setTab('mechanics')}>
          <PenTool size={18} /> Mechanics
        </button>
        <button className={tab === 'verification' ? 'active' : ''} onClick={() => setTab('verification')}>
          <ShieldCheck size={18} /> Verification
        </button>
        <button className={tab === 'customers' ? 'active' : ''} onClick={() => setTab('customers')}>
          <Users size={18} /> Customers
        </button>
        <div className="sidebar-bottom">
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
            <Settings size={18} /> Settings
          </button>
          <div className="admin-user">
            <div className="avatar">WM</div>
            <div>
              <b>{user.name}</b>
              <small>Administrator</small>
            </div>
            <button onClick={onLogout}><LogOut size={15} /></button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <span>Workspace</span>
            <ChevronDown size={14} />
            <b>{tab[0].toUpperCase() + tab.slice(1)}</b>
          </div>
          <div>
            <button className="icon-button" onClick={() => adminNavigate('/')} title="Go to Website">
              <Navigation size={18} />
            </button>
          </div>
        </header>

        {tab === 'overview' && <AdminOverview stats={stats} bookings={bookings} onUpdate={update} setTab={setTab} />}
        {tab === 'bookings' && <AdminBookings bookings={bookings} onUpdate={update} />}
        {tab === 'mechanics' && <AdminMechanics mechanics={mechanics} onAdd={() => setShowAdd(true)} />}
        {tab === 'verification' && (
          <div className="admin-content">
            <AdminDashboardView onToast={setToast} />
          </div>
        )}
        {tab === 'customers' && <AdminCustomers />}
        {tab === 'settings' && <AdminSettings onToast={setToast} />}
      </main>

      {showAdd && (
        <AddMechanic
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            refresh();
            setToast('Mechanic added to network.');
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <Check size={17} /> {toast}
        </div>
      )}
    </div>
  );
}

function AdminOverview({ stats, bookings, onUpdate, setTab }) {
  return (
    <div className="admin-content">
      <div className="admin-heading">
        <div>
          <p className="overline">OPERATIONS DASHBOARD</p>
          <h1>Marketplace Overview</h1>
          <p>Real-time booking and dispatch volume across Bengaluru.</p>
        </div>
        <button className="export-button" onClick={() => alert('Report exported.')}>
          <ArrowRight size={15} /> Export Report
        </button>
      </div>
      <div className="stat-grid">
        <Stat icon={<Users />} label="Active Mechanics" value={stats?.activeMechanics ?? '—'} note={`of ${stats?.totalMechanics ?? '—'} total`} color="blue" />
        <Stat icon={<CalendarDays />} label="Total Bookings" value={stats?.bookings ?? '—'} note="↑ 14% this month" color="mint" />
        <Stat icon={<Clock3 />} label="Pending Attention" value={stats?.pending ?? '—'} note="awaiting action" color="orange" />
        <Stat icon={<Gauge />} label="Platform Revenue" value={stats ? `₹${(stats.revenue || 0).toLocaleString()}` : '—'} note="verified" color="purple" />
      </div>
      <div className="admin-columns">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent Bookings</h2>
              <p>Latest driver requests.</p>
            </div>
            <button className="text-button" onClick={() => setTab('bookings')}>
              View all <ArrowRight size={15} />
            </button>
          </div>
          <BookingsTable bookings={bookings.slice(0, 5)} onUpdate={onUpdate} />
        </div>
        <div className="panel activity-panel">
          <div className="panel-header">
            <div>
              <h2>Marketplace Activity</h2>
              <p>Last 30 days trends</p>
            </div>
          </div>
          <div className="chart">
            <div className="chart-labels">
              <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
            </div>
            <div className="chart-area">
              <div className="chart-line" />
              <div className="chart-tooltip">
                <b>428</b>
                <small>completed jobs</small>
              </div>
              <div className="chart-dot" />
            </div>
          </div>
          <div className="chart-legend">
            <span><i className="blue-dot" /> Bookings</span>
            <span><i className="orange-dot" /> Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, note, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small className={note.includes('↑') ? 'positive' : ''}>{note}</small>
      </div>
    </div>
  );
}

function AdminBookings({ bookings, onUpdate }) {
  return (
    <div className="admin-content">
      <div className="admin-heading compact">
        <div>
          <p className="overline">OPERATIONS</p>
          <h1>Bookings Directory</h1>
          <p>Review, dispatch, and track customer orders.</p>
        </div>
      </div>
      <div className="panel full-panel">
        <BookingsTable bookings={bookings} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

function BookingsTable({ bookings, onUpdate }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Mechanic</th>
            <th>Service</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>
                <div className="table-person">
                  <div className="tiny-avatar">{b.customerName?.slice(0, 2).toUpperCase() || 'CU'}</div>
                  <div>
                    <b>{b.customerName || 'Customer'}</b>
                    <small>{typeof b.vehicle === 'string' ? b.vehicle : b.vehicle?.description || b.vehicle?.make || 'Vehicle'}</small>
                  </div>
                </div>
              </td>
              <td>{b.mechanicName || 'Assigned Mechanic'}</td>
              <td>{b.service}</td>
              <td>
                {new Date(b.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                <small>{b.time}</small>
              </td>
              <td>
                <span className={`status ${b.status}`}><i />{b.status}</span>
              </td>
              <td>
                {b.status === 'pending' ? (
                  <button className="vp-btn-sm" onClick={() => onUpdate(b.id, 'accepted')}>
                    Accept
                  </button>
                ) : (
                  <button className="vp-ghost-btn" onClick={() => onUpdate(b.id, 'completed')}>
                    Advance
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!bookings.length && <div className="table-empty">No active bookings.</div>}
    </div>
  );
}

function AdminMechanics({ mechanics, onAdd }) {
  return (
    <div className="admin-content">
      <div className="admin-heading compact">
        <div>
          <p className="overline">NETWORK</p>
          <h1>Mechanics Network</h1>
          <p>Manage the verified pros on your marketplace.</p>
        </div>
        <button className="vp-btn-sm" onClick={onAdd}>
          <Plus size={15} /> Add Mechanic
        </button>
      </div>
      <div className="panel full-panel">
        <div className="mechanic-admin-grid">
          {mechanics.map(m => (
            <div className="mechanic-admin-card" key={m.id}>
              <div className="admin-mechanic-top">
                <div className="mechanic-initials" style={{ background: m.color, color: m.accent }}>{m.initials}</div>
                <span className={`availability ${m.open ? '' : 'closed'}`}>
                  <i /> {m.open ? 'Active' : 'Offline'}
                </span>
              </div>
              <h3>{m.name}</h3>
              <p>{m.specialty}</p>
              <div className="admin-rating">
                <Star size={14} fill="currentColor" /> {m.rating} <span>({m.reviews} reviews)</span>
              </div>
              <div className="admin-card-footer">
                <span>{m.distance} away</span>
                <span style={{ fontWeight: 700, color: '#004f9c' }}>{m.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  useEffect(() => { request('/admin/customers').then(setCustomers).catch(() => { }); }, []);
  return (
    <div className="admin-content">
      <div className="admin-heading compact">
        <div>
          <p className="overline">RELATIONSHIPS</p>
          <h1>Registered Customers</h1>
          <p>Driver accounts registered across Wrenchly.</p>
        </div>
      </div>
      <div className="panel full-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Vehicles</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id || c._id}>
                  <td>
                    <div className="table-person">
                      <div className="tiny-avatar">{c.name.slice(0, 2).toUpperCase()}</div>
                      <b>{c.name}</b>
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.vehicles?.length || 1} vehicle(s)</td>
                  <td>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td><span className="status confirmed"><i /> Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <div className="table-empty">No customers found.</div>}
        </div>
      </div>
    </div>
  );
}

function AdminSettings({ onToast }) {
  const [form, setForm] = useState({ commissionRate: 12, platformFee: 90, emergencyRadiusKm: 15 });
  const [saving, setSaving] = useState(false);
  useEffect(() => { request('/admin/settings').then(setForm).catch(() => { }); }, []);

  const save = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await request('/admin/settings', { method: 'PATCH', body: JSON.stringify(form) });
      onToast('Platform settings saved successfully.');
    } catch { } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-heading compact">
        <div>
          <p className="overline">PLATFORM CONTROLS</p>
          <h1>Marketplace Settings</h1>
          <p>Configure fee structures and emergency broadcast radius.</p>
        </div>
      </div>
      <form className="settings-panel" onSubmit={save}>
        <div className="settings-field">
          <label>Commission Rate <span>Percentage taken from completed jobs</span></label>
          <div>
            <input type="number" min="0" max="100" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: e.target.value })} />
            <b>%</b>
          </div>
        </div>
        <div className="settings-field">
          <label>Platform Fee <span>Flat driver assurance fee per booking</span></label>
          <div>
            <input type="number" min="0" value={form.platformFee} onChange={e => setForm({ ...form, platformFee: e.target.value })} />
            <b>₹</b>
          </div>
        </div>
        <div className="settings-field">
          <label>Emergency Dispatch Radius <span>Maximum SOS broadcast distance</span></label>
          <div>
            <input type="number" min="1" max="100" value={form.emergencyRadiusKm} onChange={e => setForm({ ...form, emergencyRadiusKm: e.target.value })} />
            <b>km</b>
          </div>
        </div>
        <button className="vp-btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'} <Check size={15} />
        </button>
      </form>
    </div>
  );
}

function AddMechanic({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const submit = async e => {
    e.preventDefault();
    try {
      await request('/admin/mechanics', { method: 'POST', body: JSON.stringify({ name, address }) });
      onAdded();
    } catch { }
  };
  return (
    <div className="modal-backdrop">
      <div className="modal auth-modal">
        <button className="modal-close" onClick={onClose}><X size={19} /></button>
        <div className="modal-kicker"><PenTool size={16} /> NETWORK ONBOARDING</div>
        <h2>Add Mechanic Partner</h2>
        <p className="modal-sub">Add a verified garage partner to the marketplace.</p>
        <form onSubmit={submit}>
          <label>Business Name
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Indiranagar Precision Auto" />
          </label>
          <label>Address
            <input required value={address} onChange={e => setAddress(e.target.value)} placeholder="100 Feet Rd, Indiranagar, Bengaluru" />
          </label>
          <button className="vp-btn" style={{ width: '100%', marginTop: 12 }}>
            Add Partner <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

// Fault Checker Modal - Free Guided Car Diagnostic Check
function FaultCheckerModal({ onClose, onBook }) {
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState('2022 Hyundai Creta');
  const [symptom, setSymptom] = useState('not-starting');
  const reports = {
    'not-starting': {
      title: 'Starting or Battery System Fault',
      causes: ['Battery discharge or terminal corrosion', 'Starter motor failure or ignition fuse'],
      urgency: 'Check soon — Mobile mechanic recommended',
      text: 'Avoid continuous cranking if you smell fuel or hear only clicking. A mobile mechanic can jumpstart and test your alternator right at your location.'
    },
    'warning-light': {
      title: 'Check Engine or Warning Light Diagnosis',
      causes: ['Oxygen sensor or catalytic converter code', 'Charging system or battery sensor fault'],
      urgency: 'Inspect with OBD-II scan',
      text: 'Note the light color. If blinking red, pull over safely. An OBD-II diagnostic scan identifies the exact sensor code.'
    },
    'strange-noise': {
      title: 'Chassis, Suspension or Brake Noise',
      causes: ['Worn brake pad lining', 'Worn suspension ball joint or wheel bearing'],
      urgency: 'Inspect soon',
      text: 'Take note whether the sound occurs while braking, steering, or turning. Mobile mechanics carry replacement pads.'
    },
    'flat-tyre': {
      title: 'Tyre Puncture or Pressure Loss',
      causes: ['Nail puncture or valve leakage', 'Sidewall damage or rim misalignment'],
      urgency: 'Roadside help recommended',
      text: 'Do not drive on a completely deflated tyre. Request mobile tyre change or roadside puncture repair.'
    }
  };
  const report = reports[symptom];

  return (
    <div className="modal-backdrop">
      <div className="modal fault-checker-modal">
        <button className="modal-close" onClick={onClose}><X size={19} /></button>
        {step < 3 ? (
          <>
            <div className="modal-kicker"><Search size={16} /> FREE GUIDED CAR DIAGNOSTIC</div>
            <div className="checker-progress">
              <span className={step >= 1 ? 'active' : ''} />
              <span className={step >= 2 ? 'active' : ''} />
              <span />
            </div>
            <h2>{step === 1 ? 'Which car are you checking?' : 'What symptom are you noticing?'}</h2>
            <p className="modal-sub">Fast, free diagnosis before speaking to a mechanic.</p>
            {step === 1 ? (
              <label>Vehicle Make & Model
                <input value={vehicle} onChange={e => setVehicle(e.target.value)} placeholder="e.g. 2022 Hyundai Creta" />
              </label>
            ) : (
              <div className="symptom-options">
                {[
                  ['not-starting', 'It won’t start / dead battery'],
                  ['warning-light', 'Check engine or battery light is on'],
                  ['strange-noise', 'Strange squealing or grinding noise'],
                  ['flat-tyre', 'Flat tyre or sudden air pressure loss']
                ].map(([val, label]) => (
                  <button className={symptom === val ? 'selected' : ''} key={val} onClick={() => setSymptom(val)}>
                    <span>{symptom === val ? <Check size={14} /> : <span className="option-dot" />}</span>
                    {label}
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            )}
            <button className="vp-btn" style={{ width: '100%', marginTop: 16 }} onClick={() => setStep(step + 1)}>
              {step === 1 ? 'Next Step' : 'View Diagnostic Report'} <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="report-kicker">
              <span className="report-status"><i /> DIAGNOSIS COMPLETE</span> · <span>{vehicle}</span>
            </div>
            <h2>{report.title}</h2>
            <p className="modal-sub">Practical triage assessment for your vehicle.</p>
            <div className="checker-urgency">
              <span>Recommended Urgency:</span>
              <strong>{report.urgency}</strong>
            </div>
            <div className="likely-causes">
              <p className="overline">LIKELY PROBLEM AREAS</p>
              {report.causes.map((c, i) => (
                <div key={c}>
                  <b>{i + 1}</b>
                  <span>{c}</span>
                  <small>{i === 0 ? 'Primary Cause' : 'Secondary Cause'}</small>
                </div>
              ))}
            </div>
            <p className="checker-guidance">{report.text}</p>
            <button className="vp-btn" style={{ width: '100%' }} onClick={() => onBook(report.title)}>
              Book Mechanic for This Issue <ArrowRight size={16} />
            </button>
            <button className="checker-back" onClick={() => setStep(2)}>
              Change symptoms
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Payment Modal - Razorpay & Demo Checkout
function PaymentModal({ serviceRequest, onClose, onPaid }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const amount = serviceRequest.total || serviceRequest.pricing?.estimateCents / 100 || 840;

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const order = await request('/payments/order', {
        method: 'POST',
        body: JSON.stringify({ requestId: serviceRequest.id || serviceRequest._id })
      });

      if (order.provider === 'razorpay' && window.Razorpay) {
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Wrenchly Auto Care',
          description: serviceRequest.service || 'Mechanic Visit',
          order_id: order.orderId,
          handler: async response => {
            const verifyRes = await request('/payments/verify', {
              method: 'POST',
              body: JSON.stringify({
                requestId: serviceRequest.id || serviceRequest._id,
                amount: order.amount,
                ...response
              })
            });
            onPaid(verifyRes?.request || serviceRequest);
          },
          modal: { ondismiss: () => setBusy(false) }
        });
        checkout.open();
        return;
      }

      const verifyRes = await request('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: serviceRequest.id || serviceRequest._id,
          amount: order.amount
        })
      });
      onPaid(verifyRes?.request || serviceRequest);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal payment-modal">
        <button className="modal-close" onClick={onClose}><X size={19} /></button>
        <div className="modal-kicker"><LockKeyhole size={16} /> SECURE CHECKOUT</div>
        <h2>Confirm Your Service</h2>
        <p className="modal-sub">Pay the visit deposit to confirm mechanic dispatch.</p>
        <div className="payment-summary">
          <span>{serviceRequest.mechanicName || 'Verified Partner'}</span>
          <b>{serviceRequest.service || 'Mechanic Inspection'}</b>
          <strong>₹{amount}</strong>
        </div>
        <div className="payment-provider">
          <ShieldCheck size={16} /> Razorpay Secure Payments (Demo / Live Verified)
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="vp-btn" style={{ width: '100%', padding: '14px' }} onClick={pay} disabled={busy}>
          {busy ? 'Processing Payment...' : `Pay ₹${amount} Now`} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Auth Modal
function AuthModal({ mode, onClose, onSuccess, onMode }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = await request(`/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal auth-modal">
        <button className="modal-close" onClick={onClose}><X size={19} /></button>
        <div className="auth-brand">
          <span className="brand-mark"><Wrench size={18} /></span>
          <span>Wrenchly</span>
        </div>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="modal-sub">
          {mode === 'login' ? 'Sign in to manage appointments & roadside SOS.' : 'Join drivers caring for their cars smarter.'}
        </p>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <label>Full Name
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" />
            </label>
          )}
          <label>Email Address
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="alex@example.com" />
          </label>
          <label>Password
            <input required minLength={8} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="vp-btn" style={{ width: '100%', marginTop: 12 }} disabled={saving}>
            {saving ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>
        <div className="auth-switch">
          {mode === 'login' ? 'New to Wrenchly?' : 'Already have an account?'}{' '}
          <button onClick={() => onMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </div>
        {mode === 'login' && (
          <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
            <button className="admin-demo-link" onClick={() => setForm({ name: '', email: 'admin@wrenchly.com', password: 'admin123' })}>
              Fill Admin Demo Credentials
            </button>
            <button className="admin-demo-link" onClick={() => setForm({ name: '', email: 'mechanic@example.com', password: 'mechanic123' })}>
              Fill Mechanic Demo Credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Quick Booking Modal for Mechanic Cards - Also with Vehicle Selector
function BookingModal({ mechanic, user, onClose, onLogin, onBooked }) {
  const [vehicle, setVehicle] = useState({
    make: 'Hyundai',
    model: 'Creta',
    year: 2022,
    fuel: 'Petrol',
    plate: ''
  });

  const [form, setForm] = useState({
    service: mechanic.services[0] || 'Diagnostics',
    issueType: 'unknown',
    issueDescription: '',
    urgency: 'scheduled',
    date: new Date().toISOString().split('T')[0],
    time: '10:30 AM',
    notes: '',
    photo: null
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!user) return onLogin();
    setSaving(true);
    setError('');
    try {
      const created = await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          mechanicId: mechanic.id,
          ...form,
          vehicle: {
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            description: `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.fuel})${vehicle.plate ? ` • ${vehicle.plate}` : ''}`
          }
        })
      });
      onBooked(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal booking-modal">
        <button className="modal-close" onClick={onClose}><X size={19} /></button>
        <div className="modal-kicker"><CalendarDays size={16} /> HIRE MECHANIC</div>
        <h2>Hire {mechanic.name}</h2>
        <p className="modal-sub">Explain the situation so the partner arrives prepared.</p>
        <form onSubmit={submit}>
          <VehicleSelector value={vehicle} onChange={setVehicle} />

          <label>Service Needed
            <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
              {mechanic.services.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div className="form-row">
            <label>Urgency
              <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                <option value="scheduled">Scheduled</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Roadside SOS</option>
              </select>
            </label>
            <label>Preferred Time
              <select value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}>
                <option>9:00 AM</option>
                <option>10:30 AM</option>
                <option>12:00 PM</option>
                <option>2:30 PM</option>
                <option>4:30 PM</option>
              </select>
            </label>
          </div>
          <label>Problem Description
            <textarea
              required
              rows={2}
              value={form.issueDescription}
              onChange={e => setForm({ ...form, issueDescription: e.target.value })}
              placeholder="e.g. Battery flat, need quick jumpstart or battery test."
            />
          </label>
          <label>Date
            <input type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="vp-btn" style={{ width: '100%', marginTop: 12 }} disabled={saving}>
            {saving ? 'Booking...' : user ? 'Confirm & Continue to Payment' : 'Sign in to Hire'} <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

// Multi-Column Footer - Matching Valencia Pickup
function Footer({ onAdminAccess }) {
  return (
    <footer className="vp-footer">
      <div className="vp-footer-grid">
        <div className="vp-footer-brand">
          <h4>
            <span className="vp-brand-mark" style={{ width: 32, height: 32 }}><Wrench size={17} /></span>
            Wrenchly
          </h4>
          <p>
            Wrenchly — Free AI car fault diagnosis and verified mechanic network. Connecting drivers with instant triage,
            transparent repair benchmarks, and rapid roadside dispatch.
          </p>
          <p style={{ color: '#64748b', fontSize: 12 }}>
            Helpline: +91 98765 43210<br />
            Email: support@wrenchly.co.uk<br />
            Indiranagar & Across Bengaluru
          </p>
        </div>
        <div className="vp-footer-col">
          <h5>Navigation</h5>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="/#how-it-works">How It Works</a></li>
            <li><a href="/#features">What You Get</a></li>
            <li><Link to="/booking">Book a Mechanic</Link></li>
            <li><a href="/#reviews">Driver Reviews</a></li>
            <li><Link to="/appointments">My Garage</Link></li>
          </ul>
        </div>
        <div className="vp-footer-col">
          <h5>Diagnosis & Care</h5>
          <ul>
            <li><Link to="/booking?service=Diagnostics%20%26%20Electrical">OBD-II Diagnostics</Link></li>
            <li><Link to="/booking?service=Battery%20%26%20Jumpstart">Battery & Jumpstart</Link></li>
            <li><Link to="/booking?service=Brakes%20%26%20Suspension">Brakes & Suspension</Link></li>
            <li><Link to="/booking?service=Flat%20Tyre%20%26%20Wheel%20Service">Tyre & Punctures</Link></li>
            <li><Link to="/booking?service=Engine%20%26%20Oil%20Service">Engine & Fluids</Link></li>
            <li><Link to="/booking?service=EV%20%26%20Hybrid%20Care">EV & Hybrid Care</Link></li>
          </ul>
        </div>
        <div className="vp-footer-col">
          <h5>Partners & Admin</h5>
          <ul>
            <li><Link to="/mechanic">Mechanic Partner Cockpit</Link></li>
            <li><button onClick={onAdminAccess} style={{ textAlign: 'left', padding: 0 }}>Admin Portal</button></li>
            <li><Link to="/appointments">My Appointments</Link></li>
            <li><a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">WhatsApp Help</a></li>
          </ul>
        </div>
        <div className="vp-footer-col">
          <h5>Trust & Safety</h5>
          <ul>
            <li><Link to="/about">Diagnostic Accuracy Guarantee</Link></li>
            <li><Link to="/about">Privacy Policy</Link></li>
            <li><Link to="/about">Terms of Service</Link></li>
            <li><Link to="/about">Vetted Mechanic Standards</Link></li>
          </ul>
        </div>
      </div>
      <div className="vp-footer-bottom">
        <span>© 2026 Wrenchly. Free AI Car Fault Diagnosis & On-Demand Mechanic Network.</span>
        <span>24/7 Roadside Assistance & Garage Network</span>
      </div>
    </footer>
  );
}

// Mobile Bottom App Navigation
function MobileAppNav() {
  return (
    <nav className="mobile-app-nav">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
        <MapPin size={18} />
        <span>Find Help</span>
      </NavLink>
      <NavLink to="/booking" className={({ isActive }) => (isActive ? 'active' : '')}>
        <Plus size={18} />
        <span>Book</span>
      </NavLink>
      <NavLink to="/appointments" className={({ isActive }) => (isActive ? 'active' : '')}>
        <CalendarDays size={18} />
        <span>Garage</span>
      </NavLink>
      <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
        <CircleHelp size={18} />
        <span>Support</span>
      </NavLink>
    </nav>
  );
}

// PWA Install Prompt
function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(
    () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  );

  useEffect(() => {
    const onInstallAvailable = event => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onInstallAvailable);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallAvailable);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || !installEvent) return null;

  const install = async () => {
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  return (
    <div className="install-prompt">
      <div className="install-prompt-icon"><Wrench size={17} /></div>
      <div>
        <strong>Get the Wrenchly App</strong>
        <small>Install on your home screen for quick SOS access</small>
      </div>
      <button onClick={install}><Download size={14} /> Install</button>
      <button className="install-dismiss" onClick={() => setInstallEvent(null)}>
        <X size={14} />
      </button>
    </div>
  );
}
