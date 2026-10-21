import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CATEGORIES, PROPERTY_TYPES } from './constants';
import { ListingCard } from './components/ListingCard';
import { ListingDetail } from './components/ListingDetail';
import { VotingSection } from './components/VotingSection';
import { PollCard } from './components/PollCard';
import { SearchIcon, ShieldCheck, MapPin, Globe, Building, Info, ArrowLeft, ArrowRight, Search, LayoutGrid, Map as MapIcon, ArrowUpDown, Home, LogOut, LogIn, Building2, ChevronLeft, ChevronRight, X, Users, Plus, Settings, ChevronDown, Eye, EyeOff, UserPlus, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle2, Key, Vote } from 'lucide-react';
import { ReviewModal } from './components/ReviewModal';
import AdminRepresentativeDashboard from './components/AdminRepresentativeDashboard';
import UserProfileCabinet from './components/UserProfileCabinet';
import { Modal } from './components/Modal';
import { LargeModal } from './components/LargeModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AddressAutocomplete } from './components/AddressAutocomplete';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, formatAuthErrorMessage } from './utils';
import { Comparison, Poll, Listing, Review } from './types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for map markers
const ownerIcon = new L.DivIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 2px solid black; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const realtorIcon = new L.DivIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; border: 2px solid black; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const znavalIcon = new L.DivIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: #f59e0b; width: 32px; height: 32px; border-radius: 50%; border: 2px solid black; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

import { useTranslation } from 'react-i18next';

import { useFirebase } from './components/FirebaseProvider';
import { auth, db, storage, handleFirestoreError, OperationType, addProperty, getProperties } from './lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocFromServer, collection, getDocs, writeBatch, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Example Usage of Firebase helpers from src/lib/firebase.ts:
 * 
 * const handleAddProperty = async () => {
 *   try {
 *     const docRef = await addProperty({ title: 'New Property', price: 1000000 });
 *     console.log('Property added with ID:', docRef.id);
 *   } catch (error) {
 *     console.error('Failed to add property');
 *   }
 * };
 */

import { Routes, Route, Link, NavLink, useNavigate, useParams, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfUse } from './components/TermsOfUse';
import { Contacts } from './components/Contacts';
import { NotFoundPage } from './components/NotFoundPage';
import { ListingDetailPage } from './components/ListingDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cs" replace />} />
      <Route path="/:lang/*" element={<AppContent />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function AppContent() {
  const { lang } = useParams<{ lang: string }>();
  const { t, i18n } = useTranslation();
  const { user, isAuthReady } = useFirebase();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Validate supported language
  const supportedLangs = ['cs', 'ru', 'en'];
  if (!lang || !supportedLangs.includes(lang)) {
    return <NotFoundPage />;
  }

  useEffect(() => {
    if (lang && supportedLangs.includes(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);
  
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const changeLanguage = (newLang: string) => {
    const langs = ['en', 'cs', 'ru'];
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && langs.includes(pathParts[0])) {
      pathParts[0] = newLang;
    } else {
      pathParts.unshift(newLang);
    }
    
    navigate('/' + pathParts.join('/') + location.search);
    setIsLangMenuOpen(false);
  };
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState(true);

  // Helper to update query params cleanly
  const updateFilterParam = (key: string, value: string | number | string[] | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'Все' || value === 'all' || (Array.isArray(value) && value.length === 0)) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.set(key, value.join(','));
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams, { replace: true });
  };

  // Calculate price bounds from listings
  const priceBounds = useMemo(() => {
    if (!listings || listings.length === 0) return [0, 1000000000];
    const prices = listings.map(l => l.price).filter(p => p > 0);
    if (prices.length === 0) return [0, 1000000000];
    return [Math.min(...prices), Math.max(...prices)];
  }, [listings]);

  // Filters read directly from URL query parameters
  const transactionQuery = searchParams.get('transaction');
  const transactionTypeFilter: 'Все' | 'Аренда' | 'Покупка' = useMemo(() => {
    if (!transactionQuery) return 'Все';
    const q = transactionQuery.toLowerCase();
    if (q === 'rent' || q === 'аренда') return 'Аренда';
    if (q === 'sale' || q === 'buy' || q === 'покупка') return 'Покупка';
    return 'Все';
  }, [transactionQuery]);

  const countryFilter = searchParams.get('country') || '';
  const cityFilter = searchParams.get('city') || '';
  const streetFilter = searchParams.get('street') || '';
  const houseFilter = searchParams.get('house') || '';
  const searchQuery = searchParams.get('q') || searchParams.get('search') || '';

  const categoryQuery = searchParams.get('category');
  const selectedCategory = categoryQuery || '';
  const setSelectedCategory = (val: string) => {
    updateFilterParam('category', val || null);
  };
  const setStreetFilter = (val: string) => {
    updateFilterParam('street', val || null);
  };
  const setHouseFilter = (val: string) => {
    updateFilterParam('house', val || null);
  };

  const sellerParam = searchParams.get('seller');
  const sellerTypeFilters = useMemo<string[]>(() => {
    if (!sellerParam) return [];
    const map: Record<string, string> = {
      owner: 'Владелец',
      realtor: 'Риелтор',
      developer: 'Застройщик',
      resident: 'Резидент'
    };
    return sellerParam.split(',').map(s => map[s.toLowerCase()] || s).filter(Boolean);
  }, [sellerParam]);

  const typeParam = searchParams.get('type') || searchParams.get('propertyType');
  const selectedSubCategories = useMemo<string[]>(() => {
    if (!typeParam) return [];
    const map: Record<string, string> = {
      apartments: 'Квартиры',
      houses: 'Дома',
      rooms: 'Комнаты',
      land: 'Участки',
      commercial: 'Коммерция'
    };
    return typeParam.split(',').map(t => map[t.toLowerCase()] || t).filter(Boolean);
  }, [typeParam]);

  const dispParam = searchParams.get('dispozice') || searchParams.get('layout');
  const dispoziceFilters = useMemo<string[]>(() => {
    if (!dispParam) return [];
    return dispParam.split(',').map(d => d.trim()).filter(Boolean);
  }, [dispParam]);

  const sortParam = searchParams.get('sort') || searchParams.get('sortBy');
  const sortBy: 'newest' | 'price-asc' | 'price-desc' = (sortParam === 'price-asc' || sortParam === 'price-desc') ? sortParam : 'newest';

  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const priceRange = useMemo<[number, number]>(() => {
    const min = minPriceParam ? Number(minPriceParam) : priceBounds[0];
    const max = maxPriceParam ? Number(maxPriceParam) : priceBounds[1];
    return [isNaN(min) ? priceBounds[0] : min, isNaN(max) ? priceBounds[1] : max];
  }, [minPriceParam, maxPriceParam, priceBounds]);

  // Filter setters that sync to URL query params
  const setCountryFilter = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set('country', val);
    else newParams.delete('country');
    newParams.delete('city');
    setSearchParams(newParams, { replace: true });
  };

  const setCityFilter = (val: string) => {
    updateFilterParam('city', val || null);
  };

  const setTransactionTypeFilter = (val: 'Все' | 'Аренда' | 'Покупка') => {
    updateFilterParam('transaction', val === 'Аренда' ? 'rent' : val === 'Покупка' ? 'sale' : null);
  };

  const setSellerTypeFilters = (updater: string[] | ((prev: string[]) => string[])) => {
    const next = typeof updater === 'function' ? updater(sellerTypeFilters) : updater;
    const mapReverse: Record<string, string> = {
      'Владелец': 'owner',
      'Риелтор': 'realtor',
      'Застройщик': 'developer',
      'Резидент': 'resident'
    };
    updateFilterParam('seller', next.length > 0 ? next.map(t => mapReverse[t] || t.toLowerCase()) : null);
  };

  const setSelectedSubCategories = (updater: string[] | ((prev: string[]) => string[])) => {
    const next = typeof updater === 'function' ? updater(selectedSubCategories) : updater;
    const mapReverse: Record<string, string> = {
      'Квартиры': 'apartments',
      'Дома': 'houses',
      'Комнаты': 'rooms',
      'Участки': 'land',
      'Коммерция': 'commercial'
    };
    updateFilterParam('type', next.length > 0 ? next.map(t => mapReverse[t] || t.toLowerCase()) : null);
  };

  const setDispoziceFilters = (updater: string[] | ((prev: string[]) => string[])) => {
    const next = typeof updater === 'function' ? updater(dispoziceFilters) : updater;
    updateFilterParam('dispozice', next.length > 0 ? next : null);
  };

  const setPriceRange = (val: [number, number]) => {
    const newParams = new URLSearchParams(searchParams);
    if (val[0] > priceBounds[0]) newParams.set('minPrice', String(val[0]));
    else newParams.delete('minPrice');
    if (val[1] < priceBounds[1]) newParams.set('maxPrice', String(val[1]));
    else newParams.delete('maxPrice');
    setSearchParams(newParams, { replace: true });
  };

  const setSortBy = (val: 'newest' | 'price-asc' | 'price-desc') => {
    updateFilterParam('sort', val === 'newest' ? null : val);
  };

  const setSearchQuery = (val: string) => {
    updateFilterParam('q', val || null);
  };

  const resetAllFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    listings.forEach(l => {
      const parts = l.address.split(',').map(p => p.trim());
      if (parts.length >= 2) cities.add(parts[1]);
    });
    return Array.from(cities).sort();
  }, [listings]);

  const citiesToDisplay = useMemo(() => {
    const czechCities = [
      'Прага',
      'Брно',
      'Острава',
      'Пльзень',
      'Либерец',
      'Оломоуц',
      'Ческе-Будеёвице',
      'Градец-Кралове',
      'Усти-над-Лабем',
      'Пардубице',
      'Карловы Вары',
      'Теплице',
      'Дечин',
      'Мост'
    ];
    const slovakiaCities = [
      'Братислава',
      'Кошице',
      'Прешов',
      'Жилина',
      'Нитра'
    ];

    if (countryFilter === 'Чехия') {
      const set = new Set<string>(czechCities);
      listings.forEach(l => {
        const parts = l.address.split(',').map(p => p.trim());
        if (parts.length >= 2 && l.address.includes('Чехия')) {
          set.add(parts[1]);
        }
      });
      return Array.from(set).sort();
    } else if (countryFilter === 'Словакия') {
      const set = new Set<string>(slovakiaCities);
      listings.forEach(l => {
        const parts = l.address.split(',').map(p => p.trim());
        if (parts.length >= 2 && l.address.includes('Словакия')) {
          set.add(parts[1]);
        }
      });
      return Array.from(set).sort();
    } else {
      const set = new Set<string>([...czechCities, ...slovakiaCities, ...uniqueCities]);
      return Array.from(set).sort();
    }
  }, [countryFilter, uniqueCities, listings]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Dynamic map position in line with user's selection
  const [mapCenter, setMapCenter] = useState<[number, number]>([49.8175, 15.4730]);
  const [mapZoom, setMapZoom] = useState<number>(4);

  useEffect(() => {
    const europeCenter: [number, number] = [49.8175, 15.4730];
    const defaultZoom = 4;

    const positionMap: Record<string, { coords: [number, number]; zoom: number }> = {
      'Чехия': { coords: [49.8175, 15.4730], zoom: 7 },
      'Словакия': { coords: [48.6690, 19.6990], zoom: 8 },
      
      'Прага': { coords: [50.0755, 14.4378], zoom: 11 },
      'Prague': { coords: [50.0755, 14.4378], zoom: 11 },
      'Брно': { coords: [49.1951, 16.6068], zoom: 11 },
      'Brno': { coords: [49.1951, 16.6068], zoom: 11 },
      'Острава': { coords: [49.8209, 18.2625], zoom: 11 },
      'Пльзень': { coords: [49.7384, 13.3736], zoom: 11 },
      'Либерец': { coords: [50.7663, 15.0543], zoom: 11 },
      'Оломоуц': { coords: [49.5938, 17.2509], zoom: 11 },
      'Ческе-Будеёвице': { coords: [48.9745, 14.4743], zoom: 11 },
      'Градец-Кралове': { coords: [50.2104, 15.8252], zoom: 11 },
      'Усти-над-Лабем': { coords: [50.6607, 14.0389], zoom: 11 },
      'Пардубице': { coords: [50.0343, 15.7766], zoom: 11 },
      'Карловы Вары': { coords: [50.2292, 12.8715], zoom: 11 },
      'Теплице': { coords: [50.6403, 13.8244], zoom: 11 },
      'Дечин': { coords: [50.7711, 14.2141], zoom: 11 },
      'Мост': { coords: [50.5030, 13.6361], zoom: 11 },
      'Ржичаны': { coords: [49.9918, 14.6543], zoom: 12 },
      'Есенице': { coords: [49.9682, 14.5126], zoom: 12 },

      'Братислава': { coords: [48.1486, 17.1077], zoom: 11 },
      'Кошице': { coords: [48.7164, 21.2611], zoom: 11 },
      'Прешов': { coords: [48.9984, 21.2408], zoom: 11 },
      'Жилина': { coords: [49.2231, 18.7397], zoom: 11 },
      'Нитра': { coords: [48.3106, 18.0811], zoom: 11 },
    };

    if (cityFilter && positionMap[cityFilter]) {
      setMapCenter(positionMap[cityFilter].coords);
      setMapZoom(positionMap[cityFilter].zoom);
    } else if (countryFilter && positionMap[countryFilter]) {
      setMapCenter(positionMap[countryFilter].coords);
      setMapZoom(positionMap[countryFilter].zoom);
    } else {
      setMapCenter(europeCenter);
      setMapZoom(defaultZoom);
    }
  }, [countryFilter, cityFilter]);

  // Helper to generate consistent mock coordinates from string ID and optional address
  const getMockCoords = (id: string, address?: string): [number, number] => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const addr = (address || '').toLowerCase();
    
    if (addr.includes('брно') || addr.includes('brno')) {
      const lat = (Math.sin(hash) * 0.05) + 49.1951;
      const lng = (Math.cos(hash) * 0.05) + 16.6068;
      return [lat, lng];
    }
    if (addr.includes('острава') || addr.includes('ostrava')) {
      const lat = (Math.sin(hash) * 0.05) + 49.8209;
      const lng = (Math.cos(hash) * 0.05) + 18.2625;
      return [lat, lng];
    }
    if (addr.includes('братислава') || addr.includes('bratislava')) {
      const lat = (Math.sin(hash) * 0.05) + 48.1486;
      const lng = (Math.cos(hash) * 0.05) + 17.1077;
      return [lat, lng];
    }
    if (addr.includes('кошице') || addr.includes('kosice')) {
      const lat = (Math.sin(hash) * 0.05) + 48.7164;
      const lng = (Math.cos(hash) * 0.05) + 21.2611;
      return [lat, lng];
    }
    if (addr.includes('праг') || addr.includes('prag') || addr.includes('чехия') || addr.includes('czech')) {
      const lat = (Math.sin(hash) * 0.08) + 50.0755;
      const lng = (Math.cos(hash) * 0.08) + 14.4378;
      return [lat, lng];
    }
    
    // Default fallback near Prague
    const lat = (Math.sin(hash) * 0.1) + 40.0 + (Math.sin(hash) * 10);
    const lng = (Math.cos(hash) * 0.1) + 14.0 + (Math.cos(hash) * 10);
    return [50.0755 + (Math.sin(hash) * 0.1), 14.4378 + (Math.cos(hash) * 0.1)];
  };

  const toggleSubCategory = (type: string) => {
    if (type === 'Все типы') {
      setSelectedSubCategories([]);
      return;
    }
    setSelectedSubCategories(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ type: 'listing' | 'estate', id: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authInlineError, setAuthInlineError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isRepresentativeModalOpen, setIsRepresentativeModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isCabinetOpen, setIsCabinetOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [comparisons, setComparisons] = useState<string[]>([]); // Array of listing IDs
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isAddingListing, setIsAddingListing] = useState(false);
  const [formSellerType, setFormSellerType] = useState<string>('Владелец');
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [selectedImagesCount, setSelectedImagesCount] = useState<number>(0);
  const [selectedPresentationName, setSelectedPresentationName] = useState<string>('');
  const isSeedingRef = React.useRef(false);

  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Listener removed

  const computePollVotes = (poll: any): Poll => {
    if (!poll.votes) return poll as Poll;
    const votesMap = poll.votes as Record<string, string>;
    const additionalVotes: Record<string, number> = {};
    
    Object.values(votesMap).forEach((optionId) => {
      additionalVotes[optionId] = (additionalVotes[optionId] || 0) + 1;
    });

    const baseOptions = poll.options || [];
    const updatedOptions = baseOptions.map((opt: any) => ({
      ...opt,
      votes: (opt.votes || 0) + (additionalVotes[opt.id] || 0)
    }));

    const totalVotes = updatedOptions.reduce((sum: number, opt: any) => sum + opt.votes, 0);

    return {
      ...poll,
      options: updatedOptions,
      totalVotes: totalVotes
    } as Poll;
  };

  // Data initialization
  useEffect(() => {
    const fetchData = async () => {
      if (!db) {
        const { MOCK_LISTINGS, MOCK_POLLS } = await import('./constants');
        setListings(MOCK_LISTINGS);
        setPolls(MOCK_POLLS);
        return;
      }
      try {
        const listingsSnapshot = await getDocs(collection(db, 'listings'));
        const pollsSnapshot = await getDocs(collection(db, 'polls'));
        
        const { MOCK_LISTINGS } = await import('./constants');
        let finalListings = [...MOCK_LISTINGS];
        if (!listingsSnapshot.empty) {
          const dbListings = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
          dbListings.forEach(dbListing => {
            const existingIndex = finalListings.findIndex(l => l.id === dbListing.id);
            if (existingIndex !== -1) {
              finalListings[existingIndex] = {
                ...finalListings[existingIndex],
                ...dbListing
              };
            } else {
              finalListings.push(dbListing);
            }
          });
        }
        setListings(finalListings);

        const { MOCK_POLLS } = await import('./constants');
        let finalPolls = [...MOCK_POLLS];
        if (!pollsSnapshot.empty) {
          const dbPolls = pollsSnapshot.docs.map(doc => {
            const data = doc.data();
            return computePollVotes({ id: doc.id, ...data });
          });
          dbPolls.forEach(dbPoll => {
            const existingIndex = finalPolls.findIndex(p => p.id === dbPoll.id);
            if (existingIndex !== -1) {
              finalPolls[existingIndex] = {
                ...finalPolls[existingIndex],
                ...dbPoll
              };
            } else {
              finalPolls.push(dbPoll);
            }
          });
        }
        setPolls(finalPolls);
      } catch (error: any) {
        console.error("Error fetching from Firestore, using mock data:", error);
        if (error.code === 'permission-denied') {
          console.warn("Firestore Permission Denied: Please ensure your security rules are correctly deployed to your Firebase project.");
        }
        const { MOCK_LISTINGS, MOCK_POLLS } = await import('./constants');
        setListings(MOCK_LISTINGS);
        setPolls(MOCK_POLLS);
      } finally {
        setIsListingsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const syncDataToFirestore = async () => {
    if (!db || !user || user.email?.toLowerCase() !== 'ologast@gmail.com') {
      addToast(db ? 'Доступ запрещен' : 'Firebase не инициализирован', 'error');
      return;
    }

    setIsAuthLoading(true);
    try {
      const { MOCK_LISTINGS, MOCK_POLLS } = await import('./constants');
      const batch = writeBatch(db);

      MOCK_LISTINGS.forEach(listing => {
        const docRef = doc(collection(db, 'listings'), listing.id);
        batch.set(docRef, { ...listing, authorUid: user.uid, createdAt: new Date().toISOString() });
      });

      MOCK_POLLS.forEach(poll => {
        const docRef = doc(collection(db, 'polls'), poll.id);
        batch.set(docRef, { ...poll, createdAt: new Date().toISOString() });
      });

      await batch.commit();
      addToast('Данные успешно синхронизированы с Firestore!');
      
      // Refresh data
      const listingsSnapshot = await getDocs(collection(db, 'listings'));
      const pollsSnapshot = await getDocs(collection(db, 'polls'));
      setListings(listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing)));
      setPolls(pollsSnapshot.docs.map(doc => {
        const data = doc.data();
        return computePollVotes({ id: doc.id, ...data });
      }));
    } catch (error: any) {
      addToast(`Ошибка синхронизации: ${error.message}`, 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      if (!db) return;
      const path = 'test/connection';
      try {
        await getDocFromServer(doc(db, path));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
        // Skip logging for other errors, as this is simply a connection test.
      }
    }
    testConnection();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      addToast('Firebase Auth не инициализирован', 'error');
      return;
    }

    const trimmedEmail = authEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      addToast('Введите email адрес', 'error');
      setAuthInlineError('Пожалуйста, введите email адрес');
      return;
    }
    if (!authPassword) {
      addToast('Введите пароль', 'error');
      setAuthInlineError('Пожалуйста, введите пароль');
      return;
    }

    setAuthInlineError(null);
    setIsAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, authPassword);
      addToast(t('login_success', 'Успешный вход!'));
      setIsLoginModalOpen(false);
      setIsCabinetOpen(true);
      setAuthPassword('');
      setAuthConfirmPassword('');
      setAuthInlineError(null);
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = formatAuthErrorMessage(error, i18n.language);
      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential') {
        setAuthInlineError('Пользователь не найден или пароль неверен. Если у вас ещё нет аккаунта, перейдите во вкладку «Регистрация».');
      } else {
        setAuthInlineError(msg);
      }
      addToast(msg, 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      addToast('Firebase Auth не инициализирован', 'error');
      return;
    }

    const trimmedEmail = authEmail.trim().toLowerCase();
    const trimmedDisplayName = authDisplayName.trim() || 'Пользователь';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      const err = 'Введите корректный email адрес (например, user@example.com)';
      addToast(err, 'error');
      setAuthInlineError(err);
      return;
    }

    // Password validation
    if (authPassword.length < 6) {
      const err = 'Пароль должен содержать минимум 6 символов';
      addToast(err, 'error');
      setAuthInlineError(err);
      return;
    }

    // Password confirmation match
    if (authPassword !== authConfirmPassword) {
      const err = 'Введенные пароли не совпадают. Пожалуйста, проверьте ввод.';
      addToast(err, 'error');
      setAuthInlineError(err);
      return;
    }

    setAuthInlineError(null);
    setIsAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, authPassword);
      
      // Update Firebase Auth profile
      if (trimmedDisplayName) {
        try {
          await updateProfile(userCredential.user, { displayName: trimmedDisplayName });
        } catch (profileErr) {
          console.warn('Failed to update displayName in Auth profile:', profileErr);
        }
      }
      
      // Create user document in Firestore users collection
      if (db) {
        const userPath = `users/${userCredential.user.uid}`;
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: trimmedEmail,
            displayName: trimmedDisplayName,
            role: 'user',
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          console.warn('Failed to create users doc in Firestore (non-blocking for registration):', error);
        }
      }

      addToast(t('register_success', 'Регистрация успешна! Добро пожаловать!'));
      setIsLoginModalOpen(false);
      setIsCabinetOpen(true);
      setAuthPassword('');
      setAuthConfirmPassword('');
      setAuthInlineError(null);
    } catch (error: any) {
      console.error('Registration error:', error);
      const msg = formatAuthErrorMessage(error, i18n.language);
      if (error?.code === 'auth/email-already-in-use') {
        setAuthInlineError('Этот email уже зарегистрирован. Нажмите вкладку «Вход», чтобы авторизоваться.');
      } else {
        setAuthInlineError(msg);
      }
      addToast(msg, 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auth) {
      addToast('Firebase Auth не инициализирован', 'error');
      return;
    }

    const trimmedEmail = authEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      const err = 'Пожалуйста, введите корректный email адрес (например, name@example.com)';
      addToast(err, 'error');
      setAuthInlineError(err);
      return;
    }

    setAuthInlineError(null);
    setIsAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setResetEmailSent(true);
      addToast(t('reset_link_sent', 'Ссылка для сброса пароля отправлена на ваш email!'), 'success');
    } catch (error: any) {
      console.error('Password reset error:', error);
      const msg = formatAuthErrorMessage(error, i18n.language);
      if (error?.code === 'auth/user-not-found') {
        setAuthInlineError('Пользователь с таким email не найден. Проверьте правильность адреса или зарегистрируйтесь.');
      } else {
        setAuthInlineError(msg);
      }
      addToast(msg, 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      addToast(t('logout_success', 'Вы вышли из системы'));
    } catch (error: any) {
      addToast(error.message, 'error');
    }
  };

  const filteredListings = useMemo(() => {
    const filtered = (listings || []).filter(listing => {
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          listing.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCity = !cityFilter || listing.address.toLowerCase().includes(cityFilter.toLowerCase());
      const matchesCountry = !countryFilter || listing.address.toLowerCase().includes(countryFilter.toLowerCase());
      const matchesStreet = !streetFilter || listing.address.toLowerCase().includes(streetFilter.toLowerCase());
      const matchesHouse = !houseFilter || listing.address.toLowerCase().includes(houseFilter.toLowerCase());
      
      // Real Estate meta-category logic
      const isRealEstate = PROPERTY_TYPES.includes(listing.category);
      const matchesCategory = !selectedCategory || 
                             (selectedCategory === 'Недвижимость' && isRealEstate) ||
                             (selectedCategory === 'Резидент' && listing.sellerType === 'Резидент') ||
                             listing.category === selectedCategory;
      
      const matchesSubCategory = (selectedSubCategories || []).length === 0 || (selectedSubCategories || []).includes(listing.category);
      const matchesTransactionType = transactionTypeFilter === 'Все' || listing.transactionType === transactionTypeFilter;
      const matchesDispozice = dispoziceFilters.length === 0 || dispoziceFilters.includes(listing.dispozice);
      const matchesSellerType = sellerTypeFilters.length === 0 || sellerTypeFilters.includes(listing.sellerType);
      const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];

      return matchesSearch && matchesCity && matchesCountry && matchesStreet && matchesHouse && matchesCategory && matchesSubCategory && matchesTransactionType && matchesDispozice && matchesSellerType && matchesPrice;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      // Default to newest
      const dateA = a.createdAt ? (typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) : 0;
      const dateB = b.createdAt ? (typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()) : 0;
      return dateB - dateA;
    });
  }, [listings, searchQuery, cityFilter, countryFilter, streetFilter, houseFilter, selectedCategory, selectedSubCategories, transactionTypeFilter, dispoziceFilters, sellerTypeFilters, priceRange, sortBy]);

  const mixedFeed = useMemo(() => {
    if (selectedCategory === 'Голосование') return [];
    
    const items: any[] = [...(filteredListings || [])];
    // Interleave polls every 4 listings
    (polls || []).forEach((poll, index) => {
      const position = (index + 1) * 4 + index;
      if (position <= items.length) {
        items.splice(position, 0, { ...poll, isPoll: true });
      } else {
        items.push({ ...poll, isPoll: true });
      }
    });
    return items;
  }, [filteredListings, polls, selectedCategory]);

  const handleNextListing = () => {
    if (!selectedListing) return;
    const currentIndex = filteredListings.findIndex(l => l.id === selectedListing.id);
    if (currentIndex !== -1 && currentIndex < filteredListings.length - 1) {
      setSelectedListing(filteredListings[currentIndex + 1]);
    }
  };

  const handlePrevListing = () => {
    if (!selectedListing) return;
    const currentIndex = filteredListings.findIndex(l => l.id === selectedListing.id);
    if (currentIndex > 0) {
      setSelectedListing(filteredListings[currentIndex - 1]);
    }
  };

  const isAdmin = user?.email?.toLowerCase() === 'ologast@gmail.com';

  const handleVerifyReview = async (listingId: string, reviewId: string) => {
    if (!isAdmin) return;
    
    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        return {
          ...l,
          reviews: l.reviews?.map(r => r.id === reviewId ? { ...r, isVerified: true } : r)
        };
      }
      return l;
    }));
    addToast('Отзыв верифицирован (демо-режим)');
  };

  const hasNextListing = useMemo(() => {
    if (!selectedListing) return false;
    const currentIndex = filteredListings.findIndex(l => l.id === selectedListing.id);
    return currentIndex !== -1 && currentIndex < filteredListings.length - 1;
  }, [selectedListing, filteredListings]);

  const hasPrevListing = useMemo(() => {
    if (!selectedListing) return false;
    const currentIndex = filteredListings.findIndex(l => l.id === selectedListing.id);
    return currentIndex > 0;
  }, [selectedListing, filteredListings]);

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      addToast('Firebase не инициализирован', 'error');
      return;
    }
    if (!user) {
      addToast('Войдите, чтобы добавить объект', 'error');
      setIsLoginModalOpen(true);
      return;
    }

    setIsAddingListing(true);
    try {
      const formEl = e.currentTarget as HTMLFormElement;
      const formData = new FormData(formEl);
      
      const title = formData.get('title') as string;
      const category = formData.get('category') as string;
      const transactionType = formData.get('transactionType') as string;
      const dispozice = formData.get('dispozice') as string || '';
      const area = Number(formData.get('area') || '0');
      const price = Number(formData.get('price'));
      const sellerType = formData.get('sellerType') as string;
      const stayDuration = formData.get('stayDuration') as string || '';
      const commission = Number(formData.get('commission') || '0');
      const floor = Number(formData.get('floor') || '0');
      const totalFloors = Number(formData.get('totalFloors') || '0');
      const hasElevator = formData.get('hasElevator') === 'yes';
      
      const propertyTypeSelect = formData.get('propertyType') as string;
      const propertyTypeCustom = formData.get('propertyTypeCustom') as string;
      const propertyType = propertyTypeSelect === 'custom' ? propertyTypeCustom : propertyTypeSelect;

      const materialSelect = formData.get('material') as string;
      const materialCustom = formData.get('materialCustom') as string;
      const material = materialSelect === 'custom' ? materialCustom : materialSelect;

      const landTypeSelect = formData.get('landType') as string;
      const landTypeCustom = formData.get('landTypeCustom') as string;
      const landType = landTypeSelect === 'custom' ? landTypeCustom : landTypeSelect;

      const description = formData.get('description') as string;
      const cadastreUrl = formData.get('cadastreUrl') as string || '';
      const address = formData.get('address') as string;
      const lat = formData.get('lat') ? Number(formData.get('lat')) : 50.0755;
      const lng = formData.get('lng') ? Number(formData.get('lng')) : 14.4378;

      const listingId = `list-${Date.now()}`;

      let imageUrl = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800';
      const galleryUrls: string[] = [];
      const imageFiles = formData.getAll('imageFile') as File[];
      if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
        try {
          if (storage) {
            for (let i = 0; i < imageFiles.length; i++) {
              const file = imageFiles[i];
              if (file.size > 0) {
                const storageRef = ref(storage, `listings/${listingId}/image_${i}_${Date.now()}`);
                await uploadBytes(storageRef, file);
                const downloadUrl = await getDownloadURL(storageRef);
                galleryUrls.push(downloadUrl);
                if (i === 0) {
                  imageUrl = downloadUrl;
                }
              }
            }
          }
        } catch (storageError) {
          console.warn("Storage upload failed, falling back to random placeholder image:", storageError);
          imageUrl = `https://images.unsplash.com/photo-${1564013799919 + Math.floor(Math.random() * 10000)}-ab600027ffc6?auto=format&fit=crop&q=80&w=800`;
          galleryUrls.push(imageUrl);
        }
      }

      let presentationUrl = '';
      const presentationFile = formData.get('presentationFile') as File;
      if (presentationFile && presentationFile.size > 0) {
        try {
          if (storage) {
            const storageRef = ref(storage, `listings/${listingId}/presentation.pdf`);
            await uploadBytes(storageRef, presentationFile);
            presentationUrl = await getDownloadURL(storageRef);
          }
        } catch (storageError) {
          console.warn("Storage upload failed for presentation PDF:", storageError);
        }
      }

      const cleanListingPayload = {
        id: listingId,
        title,
        category,
        transactionType,
        dispozice,
        area,
        price,
        sellerType,
        stayDuration,
        commission,
        floor,
        totalFloors,
        propertyType,
        material,
        landType,
        description,
        cadastreUrl,
        address,
        coordinates: { lat, lng },
        imageUrl,
        verified: false,
        trustScore: 50,
        rating: 0,
        reviewsCount: 0,
        proofs: [],
        reviews: [],
        authorUid: user.uid,
        createdAt: new Date().toISOString(),
        hasElevator,
        presentationUrl,
        galleryUrls
      };

      await setDoc(doc(db, 'listings', listingId), cleanListingPayload);
      
      addToast('Объект успешно добавлен в цифровой архив!');
      setIsAddModalOpen(false);
      setSelectedImageName('');
      setSelectedImagesCount(0);
      setSelectedPresentationName('');
      formEl.reset();
      
      // Refresh listings state
      const listingsSnapshot = await getDocs(collection(db, 'listings'));
      if (!listingsSnapshot.empty) {
        setListings(listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing)));
      }
    } catch (error: any) {
      addToast(`Ошибка сохранения: ${error.message}`, 'error');
      try {
        handleFirestoreError(error, OperationType.WRITE, `listings`);
      } catch (err) {
        // Logged already
      }
    } finally {
      setIsAddingListing(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!db) {
      addToast('Firebase не инициализирован', 'error');
      return;
    }
    if (!user) {
      addToast('Войдите, чтобы проголосовать', 'error');
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const pollRef = doc(db, 'polls', pollId);
      const pollSnap = await getDoc(pollRef);

      if (!pollSnap.exists()) {
        const localPoll = polls.find(p => p.id === pollId);
        if (localPoll) {
          const newDocData = {
            question: localPoll.question,
            category: localPoll.category,
            options: localPoll.options.map((o: any) => ({
              id: o.id,
              label: o.label,
              votes: o.votes || 0,
              ...(o.imageUrl ? { imageUrl: o.imageUrl } : {})
            })),
            createdAt: localPoll.createdAt || new Date().toISOString(),
            votes: {
              [user.uid]: optionId
            }
          };
          await setDoc(pollRef, newDocData);
        } else {
          await setDoc(pollRef, {
            votes: { [user.uid]: optionId }
          });
        }
      } else {
        await updateDoc(pollRef, {
          [`votes.${user.uid}`]: optionId
        });
      }

      addToast('Ваш голос успешно учтен!');

      // Refresh polls state from Firestore
      const pollsSnapshot = await getDocs(collection(db, 'polls'));
      if (!pollsSnapshot.empty) {
        setPolls(pollsSnapshot.docs.map(doc => {
          const data = doc.data();
          return computePollVotes({ id: doc.id, ...data });
        }));
      }
    } catch (error: any) {
      addToast('Ошибка при голосовании: Недостаточно прав.', 'error');
      try {
        handleFirestoreError(error, OperationType.UPDATE, `polls/${pollId}`);
      } catch (err) {
        // Safe catch-and-throw if needed, or already printed to console
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    if (isResettingPassword) {
      await handleResetPassword(e);
    } else if (isRegistering) {
      await handleRegister(e);
    } else {
      await handleLogin(e);
    }
  };

  const toggleComparison = (id: string) => {
    setComparisons(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    addToast(comparisons.includes(id) ? 'Удалено из сравнения' : 'Добавлено в сравнение');
  };

  const handleLeaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('Войдите, чтобы оставить отзыв', 'error');
      setIsLoginModalOpen(true);
      return;
    }
    addToast('Отзыв отправлен на модерацию (демо-режим)');
    setIsReviewModalOpen(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto bg-paper-light min-h-screen border-x border-black relative flex flex-col">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Top Header - Compact Style */}
      <header className="px-4 py-3 flex items-center justify-between gap-4 border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/${lang}`)}>
              <motion.div 
                animate={{ backgroundColor: ["#000000", "#7a1b1b", "#000000"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="p-1.5"
              >
                <ShieldCheck className="text-white" size={24} />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter uppercase leading-none">ZNAVAL</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-50">{t('app_subtitle')}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => window.history.back()}
                title="Назад"
                className="p-1 border border-black btn-newspaper-hover transition-all active:translate-x-[1px] active:translate-y-[1px]"
              >
                <ArrowLeft size={12} />
              </button>
              <button 
                onClick={() => window.history.forward()}
                title="Вперед"
                className="p-1 border border-black btn-newspaper-hover transition-all active:translate-x-[1px] active:translate-y-[1px]"
              >
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-xl hidden md:flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 border-2 border-black px-3 py-1.5 bg-gray-50">
            <Search size={16} className="opacity-30" />
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
              className="bg-transparent border-none outline-none text-[10px] font-bold w-full uppercase tracking-widest"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="opacity-40 hover:opacity-100 transition-opacity"
                title="Очистить поиск"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border-2 border-black p-1 bg-gray-50">
            <NavLink 
              to={`/${lang}${location.search}`}
              end
              className={({ isActive }) => `p-1.5 flex items-center gap-1 transition-all ${isActive ? 'bg-[#7a1b1b] text-white' : 'text-black hover:text-[#7a1b1b]'}`}
              title={t('list', 'Список')}
            >
              <LayoutGrid size={16} />
              <span className="text-[10px] font-black uppercase hidden md:inline">{t('list', 'Список')}</span>
            </NavLink>
            <NavLink 
              to={`/${lang}/map${location.search}`}
              end
              className={({ isActive }) => `p-1.5 flex items-center gap-1 transition-all ${isActive ? 'bg-[#7a1b1b] text-white' : 'text-black hover:text-[#7a1b1b]'}`}
              title={t('map', 'Карта')}
            >
              <MapIcon size={16} />
              <span className="text-[10px] font-black uppercase hidden md:inline">{t('map', 'Карта')}</span>
            </NavLink>
          </div>

            <button 
              onClick={() => setIsAddModalOpen(true)} 
              className="bg-red-600 text-white border-2 border-black px-3 sm:px-4 py-1.5 text-[10px] font-black uppercase tracking-wider hover:bg-[#7a1b1b] transition-all active:translate-x-[1px] active:translate-y-[1px] shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {t('add_listing')}
            </button>

            {user ? (
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => setIsCabinetOpen(true)}
                  className="flex items-center gap-2 bg-white text-black border-2 border-black px-2.5 sm:px-3 py-1 hover:bg-[#7a1b1b] hover:text-white hover:border-[#7a1b1b] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] group cursor-pointer shrink-0"
                  title={t('my_cabinet', 'Личный кабинет')}
                >
                  <div className="relative shrink-0 w-8 h-8 min-w-[32px] min-h-[32px] border-2 border-black overflow-hidden bg-[#7a1b1b] flex items-center justify-center">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        className="w-full h-full object-cover shrink-0" 
                      />
                    ) : (
                      <span className="text-white text-xs font-black uppercase leading-none select-none">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </span>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white" title="Онлайн" />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-tight max-w-[100px] sm:max-w-[130px] truncate">
                      {user.displayName || user.email?.split('@')[0] || t('znaval', 'Резидент')}
                    </span>
                    <UserIcon size={9} className="shrink-0 text-[#7a1b1b] group-hover:text-white transition-colors" />
                  </div>
                </button>

                {/* Column: Logout on top, Language switcher underneath */}
                <div className="flex flex-col gap-1 relative shrink-0 min-w-[70px]" ref={langMenuRef}>
                  <button 
                    onClick={handleLogout} 
                    title={t('logout', 'Выйти')} 
                    className="border-2 border-black bg-white hover:bg-black hover:text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:translate-x-[1px] active:translate-y-[1px] shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <LogOut size={11} className="shrink-0" />
                    <span>{t('logout', 'Выйти')}</span>
                  </button>

                  <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className={`w-full px-1.5 py-0.5 border border-black text-[9px] font-black uppercase transition-all flex items-center justify-between gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] ${
                      isLangMenuOpen ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                    title="Изменить язык / Change language"
                  >
                    <span className="flex items-center gap-1">
                      <Globe size={10} className="shrink-0 text-[#7a1b1b]" />
                      <span>{i18n.language.split('-')[0].toUpperCase()}</span>
                    </span>
                    <ChevronDown size={10} className={`shrink-0 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isLangMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                        className="absolute top-full right-0 mt-1 bg-white border-2 border-black z-50 min-w-[125px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                      >
                        {[
                          { code: 'en', label: 'English' },
                          { code: 'cs', label: 'Čeština' },
                          { code: 'ru', label: 'Русский' }
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full px-3 py-1.5 text-[9px] font-black uppercase text-left flex items-center justify-between transition-all group ${
                              i18n.language.startsWith(lang.code) 
                                ? 'bg-black text-white' 
                                : 'bg-white text-black hover:bg-[#7a1b1b] hover:text-white'
                            }`}
                          >
                            <span>{lang.label}</span>
                            {i18n.language.startsWith(lang.code) && (
                              <div className="w-1.5 h-1.5 bg-[#7a1b1b] rounded-full shrink-0" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                {/* Column: Login on top, Language switcher underneath */}
                <div className="flex flex-col gap-1 relative shrink-0 min-w-[70px]" ref={langMenuRef}>
                  <button 
                    onClick={() => {
                      setIsRegistering(false);
                      setAuthInlineError(null);
                      setIsLoginModalOpen(true);
                    }} 
                    className="bg-white text-black border-2 border-black px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider hover:text-[#7a1b1b] hover:border-[#7a1b1b] transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] shrink-0 text-center"
                  >
                    {t('login_email', 'Войти')}
                  </button>

                  <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className={`w-full px-1.5 py-0.5 border border-black text-[9px] font-black uppercase transition-all flex items-center justify-between gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] ${
                      isLangMenuOpen ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                    title="Изменить язык / Change language"
                  >
                    <span className="flex items-center gap-1">
                      <Globe size={10} className="shrink-0 text-[#7a1b1b]" />
                      <span>{i18n.language.split('-')[0].toUpperCase()}</span>
                    </span>
                    <ChevronDown size={10} className={`shrink-0 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isLangMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                        className="absolute top-full right-0 mt-1 bg-white border-2 border-black z-50 min-w-[125px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                      >
                        {[
                          { code: 'en', label: 'English' },
                          { code: 'cs', label: 'Čeština' },
                          { code: 'ru', label: 'Русский' }
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full px-3 py-1.5 text-[9px] font-black uppercase text-left flex items-center justify-between transition-all group ${
                              i18n.language.startsWith(lang.code) 
                                ? 'bg-black text-white' 
                                : 'bg-white text-black hover:bg-[#7a1b1b] hover:text-white'
                            }`}
                          >
                            <span>{lang.label}</span>
                            {i18n.language.startsWith(lang.code) && (
                              <div className="w-1.5 h-1.5 bg-[#7a1b1b] rounded-full shrink-0" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => {
                    setIsRegistering(true);
                    setAuthInlineError(null);
                    setIsLoginModalOpen(true);
                  }} 
                  className="bg-[#7a1b1b] text-white border-2 border-black px-2.5 sm:px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus size={13} />
                  <span>{t('register', 'Регистрация')}</span>
                </button>
              </div>
            )}
          </div>
      </header>

      {/* Categories Bar */}
      <div className="px-4 py-2 border-b border-black bg-white overflow-x-auto scrollbar-hide flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {CATEGORIES.map(cat => {
            const isVoting = cat.label === 'Голосование';
            const isActive = selectedCategory === cat.label;
            return (
              <button 
                key={cat.id}
                onClick={() => {
                  const nextCategory = isActive ? null : cat.label;
                  setSelectedCategory(nextCategory);
                  if (nextCategory === 'Резидент') {
                    setSelectedSubCategories([]);
                    setSellerTypeFilters([]);
                    setDispoziceFilters([]);
                    setTransactionTypeFilter('Все');
                    setPriceRange([0, 1000000000]);
                    setSearchQuery('');
                    setCityFilter('');
                    setCountryFilter('');
                    setStreetFilter('');
                    setHouseFilter('');
                  }
                  if (!isVoting) setViewMode('list');
                  navigate(`/${i18n.language}/`);
                }}
                className={`flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive 
                    ? 'text-[#7a1b1b] scale-105 opacity-100 font-black' 
                    : 'text-black opacity-60 hover:text-[#7a1b1b] hover:opacity-100'
                } text-[12px]`}
              >
                <cat.icon size={16} />
                <span className="font-black uppercase tracking-tighter">{t(cat.id)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-grow">
        <Routes>
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/" element={
            <>
          {/* Sub-header / Filters */}
          {selectedCategory !== 'Голосование' && (
        <div className="px-4 py-1.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 bg-paper-light border-b-2 border-black">
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-black uppercase opacity-60">{t('filters', 'Фильтр')}</label>
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 border border-black p-1 bg-white">
                  <select 
                    className="bg-transparent text-[10px] font-bold uppercase w-full outline-none"
                    value={countryFilter}
                    onChange={(e) => {
                      setCountryFilter(e.target.value);
                      setCityFilter('');
                    }}
                  >
                    <option value="">{t('all_countries', 'Все страны')}</option>
                    <option value="Чехия">{t('czech_republic', 'Чехия')}</option>
                    <option value="Словакия">{t('slovakia', 'Словакия')}</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 border border-black p-1 bg-white">
                  <select 
                    className="bg-transparent text-[10px] font-bold uppercase w-full outline-none"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  >
                    <option value="">{t('all_cities', 'Все города')}</option>
                    {citiesToDisplay.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-black uppercase opacity-60">{t('source', 'Источник')}</label>
            <div className="flex flex-wrap gap-1">
              <button 
                onClick={() => setSellerTypeFilters([])}
                className={`px-3 py-1 text-[10px] font-black uppercase transition-all border border-black ${
                  sellerTypeFilters.length === 0 
                    ? 'bg-[#7a1b1b] text-white' 
                    : 'bg-white text-black hover:text-[#7a1b1b]'
                }`}
              >
                {t('all', 'Все')}
              </button>
              {['Владелец', 'Риелтор', 'Застройщик', 'Резидент'].map(type => {
                const isSelected = sellerTypeFilters.includes(type);
                const typeMap: Record<string, string> = {
                  'Владелец': 'owner',
                  'Риелтор': 'realtor',
                  'Застройщик': 'developer',
                  'Резидент': 'resident'
                };
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setSellerTypeFilters(prev => 
                        prev.includes(type) 
                          ? prev.filter(t => t !== type) 
                          : [...prev, type]
                      );
                    }}
                    className={`px-3 py-1 text-[10px] font-black uppercase transition-all border border-black ${
                      isSelected 
                        ? 'bg-[#7a1b1b] text-white' 
                        : 'bg-white text-black hover:text-[#7a1b1b]'
                    }`}
                  >
                    {t(typeMap[type] || type)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-black uppercase opacity-60">{t('transaction', 'Сделка')}</label>
            <div className="flex flex-wrap gap-1">
              {['Все', 'Аренда', 'Покупка'].map(type => {
                const typeMap: Record<string, string> = {
                  'Все': 'all',
                  'Аренда': 'rent',
                  'Покупка': 'sale'
                };
                return (
                <button
                  key={type}
                  onClick={() => setTransactionTypeFilter(type as any)}
                  className={`px-3 py-1 text-[10px] font-black uppercase transition-all border border-black ${
                    transactionTypeFilter === type 
                      ? 'bg-[#7a1b1b] text-white' 
                      : 'bg-white text-black hover:text-[#7a1b1b]'
                  }`}
                >
                  {t(typeMap[type] || type)}
                </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-black uppercase opacity-60">{t('property_type', 'Тип недвижимости')}</label>
            <div className="flex flex-wrap gap-1">
              <button 
                onClick={() => setSelectedSubCategories([])}
                className={`px-3 py-1 text-[10px] font-black uppercase transition-all border border-black ${
                  selectedSubCategories.length === 0 
                    ? 'bg-[#7a1b1b] text-white' 
                    : 'bg-white text-black hover:text-[#7a1b1b]'
                }`}
              >
                {t('all', 'Все')}
              </button>
              {PROPERTY_TYPES.filter(t => t !== 'Все типы').map(type => {
                const isChecked = selectedSubCategories.includes(type);
                const typeMap: Record<string, string> = {
                  'Квартиры': 'apartments',
                  'Дома': 'houses',
                  'Комнаты': 'rooms',
                  'Участки': 'land',
                  'Коммерция': 'commercial'
                };
                return (
                  <button
                    key={type}
                    onClick={() => toggleSubCategory(type)}
                    className={`px-3 py-1 text-[10px] font-black uppercase transition-all border border-black ${
                      isChecked 
                        ? 'bg-[#7a1b1b] text-white' 
                        : 'bg-white text-black hover:text-[#7a1b1b]'
                    }`}
                  >
                    {t(typeMap[type] || type)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-black uppercase opacity-60">{t('rooms', 'Комнаты')}</label>
            <div className="flex flex-wrap gap-1">
              <button 
                onClick={() => setDispoziceFilters([])}
                className={`px-2 py-1 text-[10px] font-black uppercase transition-all border border-black ${
                  dispoziceFilters.length === 0 
                    ? 'bg-[#7a1b1b] text-white' 
                    : 'bg-white text-black hover:text-[#7a1b1b]'
                }`}
              >
                {t('all', 'Все')}
              </button>
              {['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', '6+'].map(type => {
                const isSelected = dispoziceFilters.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setDispoziceFilters(prev => 
                        prev.includes(type) 
                          ? prev.filter(t => t !== type) 
                          : [...prev, type]
                      );
                    }}
                    className={`px-2 py-1 text-[10px] font-black uppercase transition-all border border-black ${
                      isSelected 
                        ? 'bg-[#7a1b1b] text-white' 
                        : 'bg-white text-black hover:text-[#7a1b1b]'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-black uppercase opacity-60">{t('price', 'Цена')}: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</label>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full p-0.5 border border-black text-[10px] font-bold uppercase"
                  />
                  <span className="text-[10px] font-black">/</span>
                  <input 
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full p-0.5 border border-black text-[10px] font-bold uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <input 
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full h-1 bg-black appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <input 
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full h-1 bg-black appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-black uppercase opacity-60">{t('sort', 'Сортировка')}</label>
              <div className="flex items-center gap-2 border border-black p-0.5 bg-white">
                <ArrowUpDown size={12} className="opacity-30" />
                <select 
                  className="bg-transparent text-[10px] font-bold uppercase w-full outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest">{t('newest', 'Новые')}</option>
                  <option value="price-asc">{t('price_asc', 'Цена: по возрастанию')}</option>
                  <option value="price-desc">{t('price_desc', 'Цена: по убыванию')}</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setSellerTypeFilters([]);
                setTransactionTypeFilter('Все');
                setSelectedSubCategories([]);
                setPriceRange(priceBounds as [number, number]);
                setCityFilter('');
                setCountryFilter('');
                setSortBy('newest');
                setDispoziceFilters([]);
              }}
              className="w-full px-3 py-1 text-[10px] font-black uppercase transition-all border border-black bg-black text-white hover:bg-[#7a1b1b]"
            >
              {t('reset_all', 'Сбросить все')}
            </button>
          </div>
        </div>
      )}

      <div className="newspaper-line-double mx-4" />

      {/* Main Content Area */}
      <div className="px-4 pb-12">
        {selectedCategory === 'Голосование' ? (
          <VotingSection 
            user={user}
            onLeaveReview={(estateId) => {
              setReviewTarget({ type: 'estate', id: estateId });
              setIsReviewModalOpen(true);
            }}
            setIsLoginModalOpen={setIsLoginModalOpen}
          />
        ) : (
          <>
            <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2">
              <div>
                <h2 className="text-[18px] font-black uppercase tracking-tighter">
                  {selectedCategory ? t(CATEGORIES.find(c => c.label === selectedCategory)?.id || '') : t('all_records', 'Все записи')}
                </h2>
                <p className="text-[10px] font-bold uppercase opacity-50 tracking-widest">
                  {t('found_in_archive', 'Найдено в архиве:')} {(filteredListings || []).length}
                </p>
              </div>
              
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-[10px] font-black uppercase underline btn-newspaper-hover px-2"
                >
                  {t('reset_category', 'Сбросить категорию')}
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory || 'all'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {viewMode === 'list' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(mixedFeed || []).map((item, idx) => {
                      if ('options' in item) {
                        return (
                          <PollCard 
                            key={`poll-${item.id}-${idx}`} 
                            poll={item} 
                            onVote={handleVote}
                            onAction={(msg) => addToast(msg)}
                          />
                        );
                      }
                      return (
                        <ListingCard 
                          key={`listing-${item.id}-${idx}`} 
                          listing={item} 
                          onAction={(msg) => addToast(msg)} 
                          onClick={(l) => setSelectedListing(l)}
                          onToggleComparison={toggleComparison}
                          isInComparison={(comparisons || []).includes(item.id)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-[#e5e7eb] border-4 border-black relative overflow-hidden z-0">
                    <MapContainer
                      key={viewMode}
                      center={mapCenter}
                      zoom={mapZoom}
                      style={{width: '100%', height: '100%'}}
                      zoomControl={false} // We have custom zoom controls
                    >
                      <MapController center={mapCenter} zoom={mapZoom} />
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {(filteredListings || []).slice(0, 50).map((listing) => {
                        const [mockLat, mockLng] = getMockCoords(listing.id, listing.address);
                        const lat = (typeof listing.coordinates?.lat === 'number' && !isNaN(listing.coordinates.lat)) ? listing.coordinates.lat : mockLat;
                        const lng = (typeof listing.coordinates?.lng === 'number' && !isNaN(listing.coordinates.lng)) ? listing.coordinates.lng : mockLng;
                        
                        // Final safety check
                        if (typeof lat !== 'number' || isNaN(lat) || typeof lng !== 'number' || isNaN(lng)) return null;

                        return (
                          <Marker
                            key={`marker-${listing.id}`}
                            position={[lat, lng]}
                            icon={listing.sellerType === 'Владелец' ? ownerIcon : listing.sellerType === 'Резидент' ? znavalIcon : realtorIcon}
                            eventHandlers={{
                              click: () => setSelectedListing(listing),
                            }}
                          >
                            <Popup className="custom-popup">
                              <div className="w-48 bg-white p-1">
                                <img 
                                  src={listing.imageUrl || (listing as any).avatarUrl} 
                                  alt={listing.title}
                                  className="w-full aspect-video object-cover mb-2 border border-black" 
                                />
                                <p className="text-[10px] font-black uppercase truncate">{listing.title}</p>
                                <p className="text-xs font-black mt-1">
                                  {formatPrice(listing.price, listing.transactionType === 'Аренда' ? t('kc_month', 'Kč/мес') : 'Kč')}
                                  {(listing.dispozice || listing.area) && (
                                    <span className="ml-2 text-[8px] font-black text-[#7a1b1b]">
                                      {listing.dispozice}{listing.dispozice && listing.area ? ' / ' : ''}{listing.area ? `${listing.area} ${t('sqm', 'м²')}` : ''}
                                    </span>
                                  )}
                                </p>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/10">
                                  <span className="text-[8px] font-bold uppercase">{t(listing.sellerType === 'Владелец' ? 'owner' : listing.sellerType === 'Риелтор' ? 'realtor' : listing.sellerType === 'Застройщик' ? 'developer' : 'resident', listing.sellerType)}</span>
                                  <span className="text-[8px] font-mono bg-black text-white px-1">ID: {listing.id}</span>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedListing(listing);
                                  }}
                                  className="w-full mt-2 bg-black text-white text-[10px] uppercase font-black py-1 hover:bg-gray-800"
                                >
                                  {t('details', 'Подробнее')}
                                </button>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>

                    <div className="absolute top-6 left-6 bg-white border-2 border-black p-4 z-30 max-w-[220px]">
                      <h3 className="text-xs font-black uppercase mb-3 border-b border-black pb-1">{t('archive_legend', 'Легенда архива')}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-emerald-500 border border-black rounded-full" />
                          <span className="text-[10px] font-bold uppercase">{t('owner', 'Владелец')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-archive-blue border border-black rounded-full" />
                          <span className="text-[10px] font-bold uppercase">{t('realtor', 'Риелтор')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-amber-500 border border-black rounded-full" />
                          <span className="text-[10px] font-bold uppercase">{t('resident', 'Резидент')}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-black/10">
                        <p className="text-[9px] italic leading-tight opacity-60">
                          {t('found_objects', 'Найдено {{count}} объектов в текущей области поиска.', { count: (filteredListings || []).length })}
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[400]">
                      <button 
                        onClick={() => setMapZoom(z => Math.min(z + 1, 20))}
                        className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center font-black text-xl btn-newspaper-hover active:translate-x-0.5 active:translate-y-0.5"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => setMapZoom(z => Math.max(z - 1, 1))}
                        className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center font-black text-xl btn-newspaper-hover active:translate-x-0.5 active:translate-y-0.5"
                      >
                        -
                      </button>
                      <a 
                        href="https://www.openstreetmap.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center font-black text-xl btn-newspaper-hover active:translate-x-0.5 active:translate-y-0.5"
                        title={t('open_in_osm', 'Открыть в OpenStreetMap')}
                      >
                        <Globe size={20} />
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            </>
          )}
          </div>
          </>
        } />
        </Routes>
      </div>

  {/* Footer */}
  <footer className="mt-auto py-8 px-4 border-t-2 border-black bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#7a1b1b]" size={20} />
              <span className="text-xs font-black uppercase tracking-widest">ZNAVAL ARCHIVE © 2026</span>
            </div>
            <div className="flex gap-6">
              <Link 
                to={`/${i18n.language}/privacy`}
                className="text-[10px] font-bold uppercase hover:text-[#7a1b1b] transition-all"
              >
                {t('privacy_policy', 'Политика конфиденциальности')}
              </Link>
              <Link 
                to={`/${i18n.language}/terms`}
                className="text-[10px] font-bold uppercase hover:text-[#7a1b1b] transition-all"
              >
                {t('terms_of_use', 'Условия использования')}
              </Link>
              <Link 
                to={`/${i18n.language}/contacts`}
                className="text-[10px] font-bold uppercase hover:text-[#7a1b1b] transition-all"
              >
                {t('contacts', 'Контакты')}
              </Link>
            </div>
          </div>
        </footer>


      {/* Modals */}
      <Modal isOpen={isAddModalOpen} onClose={() => {
        setIsAddModalOpen(false);
        setSelectedImageName('');
        setSelectedImagesCount(0);
        setSelectedPresentationName('');
      }} title={t('new_object', 'Новый объект')}>
        <form onSubmit={handleAddListing} className="space-y-2">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('title', 'Название')}</label>
            <input name="title" required type="text" className="w-full border border-black p-1 bg-transparent text-xs" placeholder={t('title_placeholder', 'напр. 2-комнатная квартира')} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('property_type', 'Тип недвижимости')}</label>
            <select name="category" className="w-full border border-black p-1 bg-transparent text-xs">
              {PROPERTY_TYPES.filter(t => t !== 'Все типы').map(type => {
                const typeMap: Record<string, string> = {
                  'Квартиры': 'apartments',
                  'Дома': 'houses',
                  'Комнаты': 'rooms',
                  'Участки': 'land',
                  'Коммерция': 'commercial'
                };
                return (
                  <option key={type} value={type}>{t(typeMap[type] || type)}</option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('transaction_type', 'Тип сделки')}</label>
            <select name="transactionType" className="w-full border border-black p-1 bg-transparent text-xs">
              <option value="Аренда">{t('rent', 'Аренда')}</option>
              <option value="Покупка">{t('sale', 'Покупка')}</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('rooms_dispozice', 'Количество комнат (Dispozice)')}</label>
            <select name="dispozice" className="w-full border border-black p-1 bg-transparent text-xs">
              <option value="">{t('not_specified', 'Не указано')}</option>
              {['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', '6+'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('area_sqm', 'Площадь (м²)')}</label>
            <input name="area" type="number" className="w-full border border-black p-1 bg-transparent text-xs" placeholder={t('area_placeholder', 'напр. 45')} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('price', 'Цена')}</label>
            <input name="price" required type="number" className="w-full border border-black p-1 bg-transparent text-xs" placeholder={t('price_placeholder', 'Цена в кронах')} />
          </div>
          <AddressAutocomplete />
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('cadastre_url', 'Ссылка на кадастр')}</label>
            <input name="cadastreUrl" type="url" className="w-full border border-black p-1 bg-transparent text-xs" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('source', 'Источник')}</label>
            <select 
              name="sellerType" 
              className="w-full border border-black p-1 bg-transparent text-xs"
              value={formSellerType}
              onChange={(e) => setFormSellerType(e.target.value)}
            >
              <option value="Владелец">{t('owner', 'Владелец')}</option>
              <option value="Риелтор">{t('realtor', 'Риелтор')}</option>
              <option value="Застройщик">{t('developer', 'Застройщик')}</option>
              <option value="Резидент">{t('resident', 'Резидент')}</option>
            </select>
          </div>
          {formSellerType === 'Резидент' && (
            <div>
              <label className="block text-[10px] font-bold uppercase mb-0.5">{t('stay_duration', 'Период проживания')}</label>
              <input name="stayDuration" type="text" className="w-full border border-black p-1 bg-transparent text-xs" placeholder={t('stay_duration_placeholder', 'напр. 2021 - 2023')} />
            </div>
          )}
          {formSellerType === 'Риелтор' && (
            <div>
              <label className="block text-[10px] font-bold uppercase mb-0.5">{t('commission_required', 'Комиссия (обязательно для риелтора)')}</label>
              <input name="commission" required type="number" className="w-full border border-black p-1 bg-transparent text-xs" placeholder={t('commission_placeholder', 'Сумма комиссии')} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-0.5">{t('floor', 'Этаж')}</label>
              <input name="floor" type="number" className="w-full border border-black p-1 bg-transparent text-xs" placeholder={t('floor_placeholder', 'напр. 5')} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-0.5">{t('total_floors', 'Всего этажей')}</label>
              <input name="totalFloors" type="number" className="w-full border border-black p-1 bg-transparent text-xs" placeholder={t('total_floors_placeholder', 'напр. 12')} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('elevator', 'Лифт')}</label>
            <select name="hasElevator" className="w-full border border-black p-1 bg-transparent text-xs">
              <option value="yes">{t('has_elevator', 'Есть лифт')}</option>
              <option value="no">{t('no_elevator', 'Нет лифта')}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('property_ownership', 'Тип собственности')}</label>
            <select name="propertyType" className="w-full border border-black p-1 bg-transparent text-xs">
              <option value="private">{t('private_ownership', 'Частная')}</option>
              <option value="cooperative">{t('cooperative_ownership', 'Кооперативная')}</option>
              <option value="share">{t('share_ownership', 'Долевая')}</option>
              <option value="municipal">{t('municipal_ownership', 'Муниципальная')}</option>
              <option value="custom">{t('other_ownership', 'Другое (указать ниже)')}</option>
            </select>
            <input name="propertyTypeCustom" type="text" className="w-full border border-black p-1 bg-transparent text-xs mt-1" placeholder={t('custom_placeholder', 'Свой вариант...')} />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('material', 'Материал')}</label>
            <select name="material" className="w-full border border-black p-1 bg-transparent text-xs">
              <option value="brick">{t('brick', 'Кирпич')}</option>
              <option value="concrete">{t('concrete', 'Панель/Бетон')}</option>
              <option value="other">{t('other_material', 'Другое (указать ниже)')}</option>
              <option value="custom">{t('custom_material', 'Свой вариант (указать ниже)')}</option>
            </select>
            <input name="materialCustom" type="text" className="w-full border border-black p-1 bg-transparent text-xs mt-1" placeholder={t('custom_placeholder', 'Свой вариант...')} />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('land_type', 'Тип земли (если применимо)')}</label>
            <select name="landType" className="w-full border border-black p-1 bg-transparent text-xs">
              <option value="">{t('not_specified', 'Не указано')}</option>
              <option value="building">{t('building_land', 'Под застройку')}</option>
              <option value="agricultural">{t('agricultural_land', 'Сельхозназначение')}</option>
              <option value="custom">{t('other_land', 'Другое (указать ниже)')}</option>
            </select>
            <input name="landTypeCustom" type="text" className="w-full border border-black p-1 bg-transparent text-xs mt-1" placeholder={t('custom_placeholder', 'Свой вариант...')} />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('description', 'Описание')}</label>
            <textarea name="description" required className="w-full border border-black p-1 bg-transparent text-xs h-16" placeholder={t('description_placeholder', 'Детали для архива...')}></textarea>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('property_photo', 'Фотография объекта')}</label>
            <div className="w-full border border-black p-1 bg-transparent text-xs flex items-center justify-between">
              <span className="truncate text-gray-500 font-mono pr-2">
                {selectedImagesCount > 1 
                  ? `${t('selected_files', 'Выбрано файлов')}: ${selectedImagesCount}` 
                  : (selectedImageName || t('no_file_chosen', 'Файл не выбран'))}
              </span>
              <label className="cursor-pointer bg-black text-white hover:bg-neutral-800 font-bold uppercase text-[9px] px-2 py-0.5 border border-black transition-all select-none flex-shrink-0">
                {t('choose_file', 'Выбрать файл')}
                <input 
                  name="imageFile" 
                  required 
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      setSelectedImagesCount(files.length);
                      if (files.length === 1) {
                        setSelectedImageName(files[0].name);
                      } else {
                        setSelectedImageName('');
                      }
                    } else {
                      setSelectedImagesCount(0);
                      setSelectedImageName('');
                    }
                  }}
                />
              </label>
            </div>
            <p className="text-[8px] font-bold opacity-50 uppercase mt-0.5">{t('photo_helper', 'Выберите главное фото для отображения в архиве')}</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('pdf_presentation', 'PDF Презентация')}</label>
            <div className="w-full border border-black p-1 bg-transparent text-xs flex items-center justify-between">
              <span className="truncate text-gray-500 font-mono pr-2">
                {selectedPresentationName || t('no_file_chosen', 'Файл не выбран')}
              </span>
              <label className="cursor-pointer bg-black text-white hover:bg-neutral-800 font-bold uppercase text-[9px] px-2 py-0.5 border border-black transition-all select-none flex-shrink-0">
                {t('choose_file', 'Выбрать файл')}
                <input 
                  name="presentationFile" 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedPresentationName(e.target.files[0].name);
                    } else {
                      setSelectedPresentationName('');
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <button type="submit" disabled={isAddingListing} className="w-full btn-newspaper btn-red py-2 text-xs btn-newspaper-hover mt-2 disabled:opacity-50">
            {isAddingListing ? t('loading', 'Загрузка...') : t('submit', 'Отправить')}
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isLoginModalOpen} 
        onClose={() => {
          setIsLoginModalOpen(false);
          setIsResettingPassword(false);
          setResetEmailSent(false);
          setAuthPassword('');
          setAuthConfirmPassword('');
          setAuthInlineError(null);
        }} 
        title={
          isResettingPassword 
            ? t('reset_password_title', "Восстановление пароля ZNAVAL")
            : isRegistering 
              ? t('register_archive', "Регистрация в архиве ZNAVAL") 
              : t('login_archive', "Вход в архив ZNAVAL")
        }
      >
        <div className="space-y-4 py-2">
          {isResettingPassword ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setResetEmailSent(false);
                    setAuthInlineError(null);
                  }}
                  className="text-[11px] font-black uppercase tracking-wider text-black hover:text-[#7a1b1b] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>{t('back_to_login', 'Вернуться ко входу')}</span>
                </button>
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                  {t('reset_password', 'Сброс пароля')}
                </span>
              </div>

              {resetEmailSent ? (
                <div className="space-y-4 py-2">
                  <div className="border-2 border-emerald-600 bg-emerald-50 text-emerald-950 p-4 flex items-start gap-3">
                    <CheckCircle2 size={22} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1.5">
                      <p className="font-bold uppercase tracking-wider text-emerald-900 text-xs">
                        {t('reset_link_sent', 'Ссылка для сброса пароля отправлена!')}
                      </p>
                      <p className="leading-relaxed text-neutral-700">
                        Официальная инструкция и защищенная ссылка для создания нового пароля отправлены на почту:
                      </p>
                      <p className="font-mono font-bold bg-white px-2 py-1 border border-emerald-300 inline-block text-emerald-950 break-all">
                        {authEmail}
                      </p>
                      <p className="text-[11px] text-emerald-800 italic pt-1">
                        Перейдите по ссылке из полученного письма для ввода нового пароля. Если письма нет во «Входящих», проверьте папку «Спам».
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResettingPassword(false);
                        setResetEmailSent(false);
                        setAuthInlineError(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-black text-white border-2 border-black p-3 text-xs font-black uppercase tracking-widest hover:bg-[#7a1b1b] transition-all cursor-pointer"
                    >
                      <LogIn size={14} />
                      <span>{t('back_to_login', 'Вернуться ко входу')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResetPassword()}
                      disabled={isAuthLoading}
                      className="w-full text-center text-[10px] font-bold uppercase text-neutral-600 hover:text-black py-1.5 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isAuthLoading ? t('loading', 'Отправка...') : 'Отправить ссылку повторно'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4 py-1">
                  <p className="text-[11px] font-serif italic text-gray-600 leading-relaxed">
                    {t('reset_password_desc', "Введите email адрес учетной записи, и мы вышлем защищенную ссылку для сброса и установки нового пароля.")}
                  </p>

                  {authInlineError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 border-2 border-[#7a1b1b] bg-red-50 text-red-950 text-xs flex items-start gap-2.5"
                    >
                      <AlertCircle size={16} className="text-[#7a1b1b] flex-shrink-0 mt-0.5" />
                      <div className="flex-1 font-bold leading-snug">{authInlineError}</div>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5 text-neutral-800">
                      <Mail size={12} />
                      <span>Email адрес учетной записи</span>
                    </label>
                    <input 
                      type="email" 
                      required 
                      autoFocus
                      value={authEmail}
                      onChange={(e) => {
                        setAuthEmail(e.target.value);
                        if (authInlineError) setAuthInlineError(null);
                      }}
                      className="w-full border-2 border-black p-2 bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black" 
                      placeholder="name@example.com" 
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isAuthLoading || !authEmail.trim()}
                    className="w-full flex items-center justify-center gap-3 bg-[#7a1b1b] text-white border-2 border-black p-3 transition-all hover:bg-red-700 active:translate-x-1 active:translate-y-1 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-2"
                  >
                    <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      {isAuthLoading ? (
                        <>
                          <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('loading', 'Отправка...')}</span>
                        </>
                      ) : (
                        <>
                          <Mail size={16} />
                          <span>{t('send_reset_link', 'Отправить ссылку для сброса')}</span>
                        </>
                      )}
                    </span>
                  </button>

                  <div className="pt-2 text-center">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsResettingPassword(false);
                        setResetEmailSent(false);
                        setAuthInlineError(null);
                      }}
                      className="text-[10px] font-bold uppercase text-neutral-600 hover:text-black hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <ArrowLeft size={11} />
                      <span>{t('back_to_login', 'Вернуться ко входу')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Segmented Mode Selector */}
              <div className="grid grid-cols-2 p-1 bg-neutral-100 border-2 border-black">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setAuthInlineError(null);
                  }}
                  className={`py-2 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    !isRegistering 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-200'
                  }`}
                >
                  <LogIn size={14} />
                  {t('login', 'Вход')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setAuthInlineError(null);
                  }}
                  className={`py-2 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isRegistering 
                      ? 'bg-[#7a1b1b] text-white shadow-sm' 
                      : 'text-neutral-700 hover:text-[#7a1b1b] hover:bg-neutral-200'
                  }`}
                >
                  <UserPlus size={14} />
                  {t('register', 'Регистрация')}
                </button>
              </div>

              <div className="text-center">
                <p className="text-[11px] font-serif italic text-gray-600">
                  {isRegistering 
                    ? t('register_desc', "Создайте личный аккаунт для добавления объектов, верификации и голосований.") 
                    : t('login_desc', "Войдите в личный кабинет резидента для доступа к архиву и управлению записями.")}
                </p>
              </div>

              {/* Contextual Inline Error / Guidance Banner */}
              {authInlineError && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 border-2 border-[#7a1b1b] bg-red-50 text-red-950 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle size={16} className="text-[#7a1b1b] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold leading-snug">{authInlineError}</p>
                    {authInlineError.includes('уже зарегистрирован') && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegistering(false);
                          setAuthInlineError(null);
                        }}
                        className="mt-1 text-[10px] font-black text-[#7a1b1b] uppercase underline hover:opacity-80 block"
                      >
                        Перейти к авторизации (Вход) →
                      </button>
                    )}
                    {authInlineError.includes('не найден') && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegistering(true);
                          setAuthInlineError(null);
                        }}
                        className="mt-1 text-[10px] font-black text-[#7a1b1b] uppercase underline hover:opacity-80 block"
                      >
                        Зарегистрировать этот email прямо сейчас →
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
              
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {isRegistering && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5 text-neutral-800">
                      <UserIcon size={12} />
                      <span>{t('username', 'Имя или псевдоним')}</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={authDisplayName}
                      onChange={(e) => {
                        setAuthDisplayName(e.target.value);
                        if (authInlineError) setAuthInlineError(null);
                      }}
                      className="w-full border-2 border-black p-2 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black" 
                      placeholder={t('your_name', 'Например: Иван Иванов или Архивариус')} 
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5 text-neutral-800">
                    <Mail size={12} />
                    <span>Email адрес</span>
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={authEmail}
                    onChange={(e) => {
                      setAuthEmail(e.target.value);
                      if (authInlineError) setAuthInlineError(null);
                    }}
                    className="w-full border-2 border-black p-2 bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black" 
                    placeholder="name@example.com" 
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold uppercase flex items-center gap-1.5 text-neutral-800">
                      <Lock size={12} />
                      <span>{t('password', 'Пароль')}</span>
                    </label>
                    {isRegistering && (
                      <span className={`text-[9px] font-bold uppercase ${
                        authPassword.length >= 6 ? 'text-emerald-700' : 'text-neutral-500'
                      }`}>
                        {authPassword.length >= 6 ? '✓ Мин. 6 знаков' : 'Мин. 6 символов'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={authPassword}
                      onChange={(e) => {
                        setAuthPassword(e.target.value);
                        if (authInlineError) setAuthInlineError(null);
                      }}
                      className="w-full border-2 border-black p-2 pr-9 bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black" 
                      placeholder="••••••••" 
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black p-1 transition-colors"
                      tabIndex={-1}
                      title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {!isRegistering && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsResettingPassword(true);
                          setResetEmailSent(false);
                          setAuthInlineError(null);
                        }}
                        className="text-[10px] font-bold uppercase text-[#7a1b1b] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Key size={11} />
                        <span>{t('forgot_password', 'Забыли пароль?')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isRegistering && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold uppercase flex items-center gap-1.5 text-neutral-800">
                        <Lock size={12} />
                        <span>Повторите пароль</span>
                      </label>
                      {authConfirmPassword && (
                        <span className={`text-[9px] font-bold uppercase flex items-center gap-1 ${
                          authPassword === authConfirmPassword ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {authPassword === authConfirmPassword ? (
                            <>
                              <CheckCircle2 size={11} />
                              <span>Совпадают</span>
                            </>
                          ) : (
                            <span>Не совпадают</span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        required 
                        value={authConfirmPassword}
                        onChange={(e) => {
                          setAuthConfirmPassword(e.target.value);
                          if (authInlineError) setAuthInlineError(null);
                        }}
                        className={`w-full border-2 p-2 pr-9 bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black ${
                          authConfirmPassword && authPassword !== authConfirmPassword 
                            ? 'border-red-600' 
                            : 'border-black'
                        }`} 
                        placeholder="••••••••" 
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black p-1 transition-colors"
                        tabIndex={-1}
                        title={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isAuthLoading || (isRegistering && (authPassword.length < 6 || (authConfirmPassword && authPassword !== authConfirmPassword)))}
                  className="w-full flex items-center justify-center gap-3 bg-[#7a1b1b] text-white border-2 border-black p-3 transition-all hover:bg-red-700 active:translate-x-1 active:translate-y-1 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-2"
                >
                  <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    {isAuthLoading ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('loading', 'Обработка...')}</span>
                      </>
                    ) : (
                      <>
                        {isRegistering ? <UserPlus size={16} /> : <LogIn size={16} />}
                        <span>{isRegistering ? t('register', 'Зарегистрироваться') : t('login', 'Войти')}</span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="pt-3 border-t border-black/10 flex flex-col items-center gap-1.5 text-center">
                <button 
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setAuthInlineError(null);
                  }}
                  className="text-[10px] font-bold uppercase text-[#7a1b1b] hover:underline cursor-pointer"
                >
                  {isRegistering 
                    ? t('already_have_account', 'Уже есть аккаунт? Войти в систему') 
                    : t('no_account', 'Новый пользователь? Зарегистрироваться')}
                </button>
                <p className="text-[8px] font-bold uppercase opacity-40 mt-1">
                  {t('data_protected', 'Ваши данные защищены протоколами ZNAVAL')}
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>

      <LargeModal 
        isOpen={!!selectedListing} 
        onClose={() => setSelectedListing(null)} 
        title={t('detailed_report', 'Детальный отчет архива')}
        headerActions={
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevListing}
              disabled={!hasPrevListing}
              className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-[9px] font-black uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] ${!hasPrevListing ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-black hover:text-white'}`}
            >
              <ChevronLeft size={14} />
              {t('back', 'Назад')}
            </button>
            <button 
              onClick={handleNextListing}
              disabled={!hasNextListing}
              className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-[9px] font-black uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] ${!hasNextListing ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-black hover:text-white'}`}
            >
              {t('forward', 'Вперед')}
              <ChevronRight size={14} />
            </button>
          </div>
        }
      >
        {selectedListing && (
          <ListingDetail 
            listing={selectedListing} 
            onClose={() => setSelectedListing(null)} 
            onToggleComparison={toggleComparison}
            onFilterCategory={(cat) => {
              if (cat === 'Резидент') {
                setSelectedCategory('Резидент');
                setSelectedSubCategories([]);
              } else if (PROPERTY_TYPES.includes(cat)) {
                setSelectedCategory('Недвижимость');
                setSelectedSubCategories([cat]);
              } else {
                setSelectedCategory(cat);
              }
              setSelectedListing(null);
            }}
            isInComparison={comparisons.includes(selectedListing.id)}
            user={user}
            onLeaveReview={() => {
              setReviewTarget({ type: 'listing', id: selectedListing.id });
              setIsReviewModalOpen(true);
            }}
            setIsLoginModalOpen={setIsLoginModalOpen}
            isAdmin={isAdmin}
            onVerifyReview={handleVerifyReview}
            onNext={handleNextListing}
            onPrev={handlePrevListing}
            hasNext={hasNextListing}
            hasPrev={hasPrevListing}
          />
        )}
      </LargeModal>
      {/* Comparison Modal */}
      <LargeModal isOpen={isComparisonModalOpen} onClose={() => setIsComparisonModalOpen(false)} title={t('compare_objects', 'Сравнение объектов')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.filter(l => comparisons.includes(l.id)).map(listing => (
            <div key={listing.id} className="border-2 border-black p-4 bg-white space-y-4">
              <img src={listing.imageUrl} alt={listing.title} className="w-full aspect-video object-cover border border-black" />
              <h3 className="text-sm font-black uppercase">{listing.title}</h3>
              <div className="space-y-1 text-[10px] font-bold uppercase">
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>{t('price_label', 'Цена:')}</span>
                  <div className="flex flex-col items-end">
                    <span>{formatPrice(listing.price, listing.transactionType === 'Аренда' ? t('czk_month', 'Kč/мес') : 'Kč')}</span>
                    {(listing.dispozice || listing.area) && (
                      <span className="text-[8px] font-black text-[#7a1b1b]">
                        {listing.dispozice}{listing.dispozice && listing.area ? ' / ' : ''}{listing.area ? `${listing.area} ${t('sqm', 'м²')}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>{t('category_label', 'Категория:')}</span>
                  <span>{listing.category}</span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>{t('rating_label', 'Рейтинг:')}</span>
                  <span>{listing.rating} ★</span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>{t('trust_label', 'Доверие:')}</span>
                  <span>{listing.trustScore}%</span>
                </div>
              </div>
              <button 
                onClick={() => toggleComparison(listing.id)}
                className="w-full py-2 bg-[#7a1b1b] text-white text-[10px] font-black uppercase btn-newspaper-hover"
              >
                {t('remove', 'Удалить')}
              </button>
            </div>
          ))}
          {comparisons.length === 0 && (
            <div className="col-span-full py-12 text-center opacity-40">
              <p className="text-xs font-bold uppercase">{t('comparison_empty', 'Список сравнения пуст')}</p>
            </div>
          )}
        </div>
      </LargeModal>

      <AdminRepresentativeDashboard 
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        onSync={syncDataToFirestore}
        isSyncing={isAuthLoading}
      />

      <UserProfileCabinet 
        isOpen={isCabinetOpen}
        onClose={() => setIsCabinetOpen(false)}
        user={user}
        listings={listings}
        onUpdateListings={setListings}
        addToast={addToast}
      />

      {/* Comparison Floating Bar */}
      {(comparisons || []).length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black text-white px-6 py-3 border-2 border-white flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest">{t('comparison_title', 'Сравнение')}</span>
            <span className="text-[8px] font-bold opacity-60 uppercase">{(comparisons || []).length} {t('objects_count', 'объекта(ов)')}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsComparisonModalOpen(true)}
              className="bg-white text-black px-4 py-1 text-[10px] font-black uppercase btn-newspaper-hover transition-all"
            >
              {t('compare_btn', 'Сравнить')}
            </button>
            <button 
              onClick={() => setComparisons([])}
              className="border border-white/30 px-4 py-1 text-[10px] font-black uppercase btn-newspaper-hover transition-all"
            >
              {t('clear_btn', 'Очистить')}
            </button>
          </div>
        </div>
      )}

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onSubmit={async (reviewData) => {
          if (!reviewTarget) return;
          
          const newReview: Review = {
            id: Date.now().toString(),
            userName: reviewData.userName,
            userAvatar: reviewData.isAnonymous ? undefined : (user?.photoURL || undefined),
            authorUid: user?.uid || undefined, // Set author UID for tracking in Cabinet
            date: new Date().toISOString(),
            rating: reviewData.rating,
            comment: reviewData.comment,
            isAnonymous: reviewData.isAnonymous,
            customName: reviewData.customName,
            photos: reviewData.photos,
            contractUrl: reviewData.contractUrl,
            isVerified: reviewData.isVerified,
            livedFrom: reviewData.livedFrom,
            livedTo: reviewData.livedTo,
            planningToLive: reviewData.planningToLive,
            editHistory: []
          };

          if (reviewTarget.type === 'listing') {
            const targetListing = listings.find(l => l.id === reviewTarget.id);
            if (targetListing) {
              const updatedReviews = [...(targetListing.reviews || []), newReview];
              const updatedListing = { 
                ...targetListing, 
                reviews: updatedReviews,
                reviewsCount: updatedReviews.length,
                rating: Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1))
              };

              if (db) {
                try {
                  await setDoc(doc(db, 'listings', reviewTarget.id), updatedListing);
                  addToast('Отзыв успешно сохранен!');
                } catch (err) {
                  console.error('Error saving review to Firestore:', err);
                  handleFirestoreError(err, OperationType.WRITE, `listings/${reviewTarget.id}`);
                }
              } else {
                addToast('Отзыв сохранен локально');
              }

              setListings(prev => prev.map(l => {
                if (l.id === reviewTarget.id) {
                  return updatedListing;
                }
                return l;
              }));
            }
          }
          
          setIsReviewModalOpen(false);
          setReviewTarget(null);
        }}
      />
    </div>
  );
}
