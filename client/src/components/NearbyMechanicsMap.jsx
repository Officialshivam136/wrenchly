import React, { useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useLoadScript } from '@react-google-maps/api';
import { ArrowRight, MapPin, Plus, Star } from 'lucide-react';

const token = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const fallbackCenter = { longitude: 77.5946, latitude: 12.9716 };
const mapContainerStyle = { width: '100%', height: '100%', minHeight: '457px' };

export default function NearbyMechanicsMap({ mechanics = [], userLocation, onRequestAssistance }) {
  const [selected, setSelected] = useState(null);
  const center = userLocation ? { longitude: userLocation[0], latitude: userLocation[1] } : fallbackCenter;
  if (!token) return <FallbackMap mechanics={mechanics} userLocation={userLocation} onRequestAssistance={onRequestAssistance} />;
  return <GoogleMapView mechanics={mechanics} center={center} selected={selected} setSelected={setSelected} onRequestAssistance={onRequestAssistance} />;
}

function GoogleMapView({ mechanics, center, selected, setSelected, onRequestAssistance }) {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: token });
  if (loadError) return <FallbackMap mechanics={mechanics} userLocation={[center.longitude, center.latitude]} onRequestAssistance={onRequestAssistance} />;
  if (!isLoaded) return <div className="map-preview live-map map-loading">Loading Google Maps…</div>;
  return <div className="map-preview live-map"><GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat: center.latitude, lng: center.longitude }} zoom={12} options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}>
    <MarkerF position={{ lat: center.latitude, lng: center.longitude }} icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4876dc', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 }} />
    {mechanics.map((mechanic, index) => { const coordinates = mechanic.location?.coordinates || [fallbackCenter.longitude, fallbackCenter.latitude]; return <MarkerF key={mechanic.id} position={{ lat: coordinates[1], lng: coordinates[0] }} label={{ text: String(index + 1), color: '#fff', fontWeight: '700' }} onClick={() => setSelected(mechanic)} />; })}
    {selected && <InfoWindowF position={{ lat: selected.location.coordinates[1], lng: selected.location.coordinates[0] }} onCloseClick={() => setSelected(null)}><div className="map-popup"><strong>{selected.name}</strong><span><Star size={12} fill="currentColor" /> {selected.rating} · {selected.distance}</span><button onClick={() => onRequestAssistance(selected)}>Hire this mechanic <ArrowRight size={12} /></button></div></InfoWindowF>}
  </GoogleMap><MapLegend provider="Google Maps" /></div>;
}

function FallbackMap({ mechanics, userLocation, onRequestAssistance }) { const [zoom, setZoom] = useState(1); return <div className="map-preview live-map"><div className="map-toolbar"><span><MapPin size={14} /> {userLocation ? 'Your location' : 'Bengaluru, India'}</span><button onClick={() => setZoom(value => Math.min(1.25, value + .1))}><Plus size={14} /></button><button onClick={() => setZoom(value => Math.max(.85, value - .1))}><span className="minus">−</span></button></div><div className="map-grid" style={{ transform: `scale(${zoom})` }}>{userLocation && <div className="fallback-user-pin" />}{mechanics.slice(0, 6).map((mechanic, index) => <button className={`map-pin pin-${(index % 4) + 1}`} key={mechanic.id} onClick={() => onRequestAssistance(mechanic)}><span>{index + 1}</span></button>)}</div><MapLegend /></div>; }
function MapLegend({ provider = 'Google Maps / local fallback' }) { return <div className="map-legend"><span><i className="legend-dot" /> Available now</span><span className="map-provider">{provider}</span></div>; }
