import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Modal } from './Modal';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet default icon issue
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

interface AddressAutocompleteProps {
  defaultValue?: string;
  defaultLat?: number | string;
  defaultLng?: number | string;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
  defaultValue = '',
  defaultLat = '',
  defaultLng = ''
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [lat, setLat] = useState<number | string>(defaultLat);
  const [lng, setLng] = useState<number | string>(defaultLng);
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const mapCenter: [number, number] = lat && lng ? [Number(lat), Number(lng)] : [50.0755, 14.4378]; // Default to Prague

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchAddresses, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div ref={wrapperRef} className="space-y-2">
      <div className="relative w-full">
        <label className="block text-[10px] font-bold uppercase mb-0.5">Адрес</label>
        <input
          name="address"
          required
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="w-full border border-black p-1 bg-transparent text-xs"
          placeholder="Начните вводить адрес..."
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-2 top-6 text-[10px] text-gray-500 font-bold uppercase">Загрузка...</div>
        )}
        {isOpen && results.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-black mt-1 max-h-48 overflow-y-auto">
            {results.map((result, index) => (
              <li
                key={index}
                className="p-2 text-xs hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                onClick={() => {
                  setQuery(result.display_name);
                  setLat(parseFloat(result.lat));
                  setLng(parseFloat(result.lon));
                  setIsOpen(false);
                }}
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="space-y-1">
        <label className="block text-[10px] font-bold uppercase">Координаты</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsMapPickerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-black p-2 bg-white hover:bg-gray-50 transition-all text-[10px] font-black uppercase active:translate-x-[1px] active:translate-y-[1px]"
          >
            <MapPin size={14} />
            {lat && lng ? `Выбрано: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` : 'Указать на карте'}
          </button>
          <input type="hidden" name="lat" value={lat} />
          <input type="hidden" name="lng" value={lng} />
        </div>
        <p className="text-[8px] font-bold opacity-40 uppercase">Координаты заполняются автоматически при выборе адреса или вручную на карте</p>
      </div>

      <Modal isOpen={isMapPickerOpen} onClose={() => setIsMapPickerOpen(false)} title="Выберите место на карте">
        <div className="h-[400px] w-full border-2 border-black relative">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents onMapClick={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
            }} />
            <ChangeView center={mapCenter} />
            {lat && lng && (
              <Marker position={[Number(lat), Number(lng)]} icon={DefaultIcon} />
            )}
          </MapContainer>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-full px-4">
            <button
              type="button"
              onClick={() => setIsMapPickerOpen(false)}
              className="w-full bg-black text-white border-2 border-black p-2 text-[10px] font-black uppercase hover:bg-gray-800"
            >
              Подтвердить координаты
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
