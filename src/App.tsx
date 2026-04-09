import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CATEGORIES, PROPERTY_TYPES } from './constants';
import { ListingCard } from './components/ListingCard';
import { ListingDetail } from './components/ListingDetail';
import { VotingSection } from './components/VotingSection';
import { PollCard } from './components/PollCard';
import { SearchIcon, ShieldCheck, MapPin, Globe, Building, Info, ArrowLeft, ArrowRight, Search, LayoutGrid, Map as MapIcon, ArrowUpDown, Home, LogOut, LogIn, Building2, ChevronLeft, ChevronRight, X, Users, Plus, Settings, ChevronDown } from 'lucide-react';
import { ReviewModal } from './components/ReviewModal';
import AdminRepresentativeDashboard from './components/AdminRepresentativeDashboard';
import { Modal } from './components/Modal';
import { LargeModal } from './components/LargeModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AddressAutocomplete } from './components/AddressAutocomplete';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from './utils';
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

import { useTranslation } from 'react-i18next';

import { useFirebase } from './components/FirebaseProvider';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocFromServer, collection, getDocs, writeBatch } from 'firebase/firestore';

import { Routes, Route, Link, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfUse } from './components/TermsOfUse';
import { Contacts } from './components/Contacts';

function RootRedirect() {
  const { i18n } = useTranslation();
  const location = useLocation();
  
  // Get detected language or fallback to 'en'
  const detectedLang = i18n.language ? i18n.language.split('-')[0] : 'en';
  const supportedLangs = ['en', 'cs', 'ru'];
  const lang = supportedLangs.includes(detectedLang) ? detectedLang : 'en';
  
  return <Navigate to={`/${lang}${location.pathname}${location.search}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/:lang/*" element={<AppContent />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function AppContent() {
  const { lang } = useParams();
  const { t, i18n } = useTranslation();
  const { user, isAuthReady } = useFirebase();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (lang && ['en', 'cs', 'ru'].includes(lang) && i18n.language !== lang) {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [streetFilter, setStreetFilter] = useState('');
  const [houseFilter, setHouseFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [sellerTypeFilters, setSellerTypeFilters] = useState<string[]>([]);
  const [dispoziceFilters, setDispoziceFilters] = useState<string[]>([]);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'Все' | 'Аренда' | 'Покупка'>('Все');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000000]);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Calculate price range
  const priceBounds = useMemo(() => {
    if (!listings || listings.length === 0) return [0, 1000000000];
    const prices = listings.map(l => l.price).filter(p => p > 0);
    if (prices.length === 0) return [0, 1000000000];
    return [Math.min(...prices), Math.max(...prices)];
  }, [listings]);

  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    listings.forEach(l => {
      const parts = l.address.split(',').map(p => p.trim());
      if (parts.length >= 2) cities.add(parts[1]);
    });
    return Array.from(cities).sort();
  }, [listings]);

  useEffect(() => {
    setPriceRange(priceBounds as [number, number]);
  }, [priceBounds]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [zoom, setZoom] = useState(12);

  // Helper to generate consistent mock coordinates from string ID
  const getMockCoords = (id: string): [number, number] => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = (Math.sin(hash) * 0.1) + 55.75;
    const lng = (Math.cos(hash) * 0.1) + 37.61;
    return [lat, lng];
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
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isRepresentativeModalOpen, setIsRepresentativeModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [comparisons, setComparisons] = useState<string[]>([]); // Array of listing IDs
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isAddingListing, setIsAddingListing] = useState(false);
  const [formSellerType, setFormSellerType] = useState<string>('Владелец');
  const isSeedingRef = React.useRef(false);

  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Listener removed

  // Data initialization
  useEffect(() => {
    const fetchData = async () => {
      try {
        const listingsSnapshot = await getDocs(collection(db, 'listings'));
        const pollsSnapshot = await getDocs(collection(db, 'polls'));
        
        if (!listingsSnapshot.empty) {
          setListings(listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing)));
        } else {
          const { MOCK_LISTINGS } = await import('./constants');
          setListings(MOCK_LISTINGS);
        }

        if (!pollsSnapshot.empty) {
          setPolls(pollsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll)));
        } else {
          const { MOCK_POLLS } = await import('./constants');
          setPolls(MOCK_POLLS);
        }
      } catch (error: any) {
        console.error("Error fetching from Firestore, using mock data:", error);
        if (error.code === 'permission-denied') {
          console.warn("Firestore Permission Denied: Please ensure your security rules are correctly deployed to your Firebase project.");
        }
        const { MOCK_LISTINGS, MOCK_POLLS } = await import('./constants');
        setListings(MOCK_LISTINGS);
        setPolls(MOCK_POLLS);
      }
    };
    
    fetchData();
  }, []);

  const syncDataToFirestore = async () => {
    if (!user || user.email?.toLowerCase() !== 'ologast@gmail.com') {
      addToast('Доступ запрещен', 'error');
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
      setPolls(pollsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll)));
    } catch (error: any) {
      addToast(`Ошибка синхронизации: ${error.message}`, 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
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

  const executeRecaptcha = (action: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!(window as any).grecaptcha?.enterprise) {
        console.warn('reCAPTCHA not loaded yet');
        resolve(true); // Allow for now if not loaded
        return;
      }
      (window as any).grecaptcha.enterprise.ready(async () => {
        try {
          const token = await (window as any).grecaptcha.enterprise.execute('6LcDg5ksAAAAALw2m4UgX_WgN24UysR3cl4djG_K', { action });
          
          // Verify token with backend
          const response = await fetch('/api/verify-recaptcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, action }),
          });
          
          const result = await response.json();
          console.log('reCAPTCHA verification result:', result);
          
          // In a real app, you'd check the score (e.g., > 0.5)
          const score = result.riskAnalysis?.score ?? 1.0;
          if (score < 0.3) {
            addToast('Подозрительная активность. Пожалуйста, попробуйте позже.', 'error');
            resolve(false);
          } else {
            resolve(true);
          }
        } catch (error) {
          console.error('reCAPTCHA execution/verification error:', error);
          resolve(true); // Fallback to allow if verification fails
        }
      });
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      // Execute reCAPTCHA
      const isValid = await executeRecaptcha('LOGIN');
      if (!isValid) return;
      
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      addToast(t('login_success', 'Успешный вход!'));
      setIsLoginModalOpen(false);
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      // Execute reCAPTCHA
      const isValid = await executeRecaptcha('REGISTER');
      if (!isValid) return;

      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      await updateProfile(userCredential.user, { displayName: authDisplayName });
      
      // Create user document
      const userPath = `users/${userCredential.user.uid}`;
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: authEmail,
          displayName: authDisplayName,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, userPath);
      }

      addToast(t('register_success', 'Регистрация успешна!'));
      setIsLoginModalOpen(false);
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user doc exists
      const userPath = `users/${result.user.uid}`;
      try {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            role: 'user',
            createdAt: new Date().toISOString()
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, userPath);
      }

      addToast(t('login_success', 'Успешный вход!'));
      setIsLoginModalOpen(false);
    } catch (error: any) {
      addToast(error.message, 'error');
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
    addToast('Функциональность добавления объектов временно отключена (Firebase удален)', 'error');
  };

  const handleVote = async (pollId: string, optionId: string) => {
    addToast('Функциональность голосования временно отключена (Firebase удален)', 'error');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    if (isRegistering) {
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
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedCategory(null); setSelectedSubCategories([]); setSearchQuery(''); }}>
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
              <button className="p-1 border border-black btn-newspaper-hover transition-all">
                <ArrowLeft size={12} />
              </button>
              <button className="p-1 border border-black btn-newspaper-hover transition-all">
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
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-[#7a1b1b] text-white' : 'text-black hover:text-[#7a1b1b]'}`}
              title="Список"
            >
              <LayoutGrid size={16} />
              <span className="text-[10px] font-black uppercase hidden md:inline">{t('list', 'Список')}</span>
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`p-1.5 flex items-center gap-1 transition-all ${viewMode === 'map' ? 'bg-[#7a1b1b] text-white' : 'text-black hover:text-[#7a1b1b]'}`}
              title="Карта"
            >
              <MapIcon size={16} />
              <span className="text-[10px] font-black uppercase hidden md:inline">{t('map', 'Карта')}</span>
            </button>
          </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2 relative" ref={langMenuRef}>
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`px-3 py-1.5 border-2 border-black text-[10px] font-black uppercase transition-all flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px] ${
                  isLangMenuOpen ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
                }`}
                title="Change language"
              >
                <span className="flex items-center gap-1.5">
                  {i18n.language.split('-')[0].toUpperCase()}
                </span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-2 bg-white border-2 border-black z-50 min-w-[140px] overflow-hidden"
                  >
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'cs', label: 'Čeština' },
                      { code: 'ru', label: 'Русский' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full px-4 py-2.5 text-[10px] font-black uppercase text-left flex items-center justify-between transition-all group ${
                          i18n.language.startsWith(lang.code) 
                            ? 'bg-black text-white' 
                            : 'bg-white text-black hover:bg-[#7a1b1b] hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.label}</span>
                        </span>
                        {i18n.language.startsWith(lang.code) && (
                          <div className="w-1.5 h-1.5 bg-[#7a1b1b] rounded-full" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {user?.email?.toLowerCase() === 'ologast@gmail.com' && (
              <button 
                onClick={() => setIsAdminDashboardOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase hover:bg-gray-800 transition-all border-2 border-black active:translate-x-[2px] active:translate-y-[2px]"
              >
                <Users size={14} />
                Запросы
              </button>
            )}
            <button onClick={() => setIsAddModalOpen(true)} className="bg-red-600 text-white border-2 border-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-[#7a1b1b] transition-all active:translate-x-[2px] active:translate-y-[2px]">
              {t('add_listing')}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase leading-none">{user.displayName}</span>
                  <button onClick={handleLogout} className="text-[8px] font-bold uppercase underline opacity-50 hover:text-[#7a1b1b] hover:opacity-100 px-1 transition-all">{t('logout')}</button>
                </div>
                <img src={user.photoURL || ''} alt="User" className="w-8 h-8 border-2 border-black" />
              </div>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="bg-white text-black border-2 border-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest hover:text-[#7a1b1b] hover:border-[#7a1b1b] transition-all active:translate-x-[2px] active:translate-y-[2px]">
                {t('login_email')}
              </button>
            )}
          </div>
      </header>

      {/* Categories Bar */}
      <div className="px-4 py-2 border-b border-black bg-white overflow-x-auto scrollbar-hide flex items-center gap-6">
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
                  ? 'text-[#7a1b1b] scale-105 opacity-100' 
                  : 'text-black opacity-60 hover:text-[#7a1b1b] hover:opacity-100'
              } text-[12px]`}
            >
              <cat.icon size={16} />
              <span className="font-black uppercase tracking-tighter">{t(cat.id)}</span>
            </button>
          );
        })}
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
                    onChange={(e) => setCountryFilter(e.target.value)}
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
                    {uniqueCities.map(city => (
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
                      center={[55.7558, 37.6173]} // Default to Moscow or somewhere
                      zoom={zoom}
                      style={{width: '100%', height: '100%'}}
                      zoomControl={false} // We have custom zoom controls
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {(filteredListings || []).slice(0, 50).map((listing) => {
                        const [mockLat, mockLng] = getMockCoords(listing.id);
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
                        onClick={() => setZoom(z => Math.min(z + 1, 20))}
                        className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center font-black text-xl btn-newspaper-hover active:translate-x-0.5 active:translate-y-0.5"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => setZoom(z => Math.max(z - 1, 1))}
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
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('new_object', 'Новый объект')}>
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
          <div className="p-2 border-2 border-black border-dashed bg-gray-50">
            <label className="block text-[10px] font-bold uppercase mb-1">{t('property_photo', 'Фотография объекта')}</label>
            <input name="imageFile" required type="file" accept="image/*" className="w-full text-[10px] font-bold uppercase" />
            <p className="text-[8px] font-bold opacity-50 mt-1 uppercase">{t('photo_helper', 'Выберите главное фото для отображения в архиве')}</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-0.5">{t('pdf_presentation', 'PDF Презентация')}</label>
            <input name="presentationFile" type="file" accept="application/pdf" className="w-full border border-black p-1 bg-transparent text-xs" />
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
          setIsRegistering(false);
          setAuthEmail('');
          setAuthPassword('');
          setAuthDisplayName('');
        }} 
        title={isRegistering ? t('register_archive', "Регистрация в архиве") : t('login_archive', "Вход в архив")}
      >
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-serif italic text-gray-600">
              {isRegistering 
                ? t('register_desc', "Зарегистрируйтесь для доступа к секретным записям архива.") 
                : t('login_desc', "Для доступа к секретным записям архива необходимо подтвердить личность.")}
            </p>
          </div>
          
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">{t('username', 'Имя пользователя')}</label>
                <input 
                  type="text" 
                  required 
                  value={authDisplayName}
                  onChange={(e) => setAuthDisplayName(e.target.value)}
                  className="w-full border border-black p-2 bg-transparent text-xs" 
                  placeholder={t('your_name', 'Ваше имя')} 
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Email</label>
              <input 
                type="email" 
                required 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full border border-black p-2 bg-transparent text-xs" 
                placeholder="email@example.com" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">{t('password', 'Пароль')}</label>
              <input 
                type="password" 
                required 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full border border-black p-2 bg-transparent text-xs" 
                placeholder="••••••••" 
                minLength={6}
              />
            </div>
            <button 
              type="submit"
              disabled={isAuthLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#7a1b1b] text-white border-2 border-black p-3 transition-all hover:bg-red-700 active:translate-x-1 active:translate-y-1 disabled:opacity-50"
            >
              <span className="text-xs font-black uppercase tracking-widest">
                {isAuthLoading ? t('loading', 'Загрузка...') : (isRegistering ? t('register', 'Зарегистрироваться') : t('login', 'Войти'))}
              </span>
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-black/20"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] font-bold uppercase text-gray-500">{t('or', 'или')}</span>
            <div className="flex-grow border-t border-black/20"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isAuthLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-black p-3 btn-newspaper-hover transition-all group active:translate-x-1 active:translate-y-1 disabled:opacity-50"
          >
            <LogIn size={20} />
            <span className="text-xs font-black uppercase tracking-widest">{t('login_google', 'Войти через Google')}</span>
          </button>

          <div className="pt-4 border-t border-black/10 text-center">
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] font-bold uppercase text-[#7a1b1b] hover:underline"
            >
              {isRegistering ? t('already_have_account', 'Уже есть аккаунт? Войти') : t('no_account', 'Нет аккаунта? Зарегистрироваться')}
            </button>
            <p className="text-[8px] font-bold uppercase opacity-40 mt-2">
              {t('data_protected', 'Ваши данные защищены протоколами ZNAVAL')}
            </p>
          </div>
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
            userAvatar: reviewData.isAnonymous ? undefined : user?.photoURL,
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
            setListings(prev => prev.map(l => {
              if (l.id === reviewTarget.id) {
                return { ...l, reviews: [...(l.reviews || []), newReview] };
              }
              return l;
            }));
          }
          
          addToast('Отзыв добавлен (демо-режим)');
          setIsReviewModalOpen(false);
          setReviewTarget(null);
        }}
      />
    </div>
  );
}
