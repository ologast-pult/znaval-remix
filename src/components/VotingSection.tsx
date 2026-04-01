import React, { useState, useMemo, useEffect } from 'react';
import { EstateRating } from '../types';
import { MOCK_ESTATE_RATINGS } from '../constants';
import { motion } from 'motion/react';
import { Star, MapPin, Globe, ArrowUpDown, Navigation, FileText, Image as ImageIcon, LayoutDashboard, Map as MapIcon, Scale, ExternalLink, Plus, ChevronLeft, ChevronRight, UserCheck, MessageSquare, AlertTriangle, Share2, Edit3 } from 'lucide-react';
import { LargeModal } from './LargeModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom icon for estate marker
const estateIcon = new L.DivIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: black; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});
import { Modal } from './Modal';
import { ReviewSection } from './ReviewSection';
import RepresentativeModal from './RepresentativeModal';

import { useTranslation } from 'react-i18next';

interface VotingSectionProps {
  user: any | null;
  onLeaveReview?: (estateId: string) => void;
  setIsLoginModalOpen?: (open: boolean) => void;
}

export const VotingSection: React.FC<VotingSectionProps> = ({ 
  user,
  onLeaveReview, 
  setIsLoginModalOpen 
}) => {
  const { t } = useTranslation();
  const [ratings, setRatings] = useState<EstateRating[]>(MOCK_ESTATE_RATINGS);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [countryFilter, setCountryFilter] = useState<string>('Все');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'rating_asc'>('rating_desc');
  const [selectedEstateId, setSelectedEstateId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Extract unique countries
  const countries = useMemo(() => ['Все', ...Array.from(new Set(ratings.map(r => r.country)))], [ratings]);

  const uniqueCities = useMemo(() => {
    const filtered = countryFilter === 'Все' ? ratings : ratings.filter(r => r.country === countryFilter);
    const cities = Array.from(new Set(filtered.map(r => r.city))).sort();
    return ['Все', ...cities];
  }, [ratings, countryFilter]);

  const handleVote = async (id: string, rating: number) => {
    alert(t('login_to_vote', 'Пожалуйста, войдите в систему, чтобы голосовать.'));
  };

  const handleAddEstate = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Функциональность отключена');
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...ratings];
    if (countryFilter !== 'Все') result = result.filter(r => r.country === countryFilter);
    if (cityFilter) result = result.filter(r => r.city.toLowerCase().includes(cityFilter.toLowerCase()));

    result.sort((a, b) => {
      if (sortBy === 'rating_desc') return b.averageRating - a.averageRating;
      if (sortBy === 'rating_asc') return a.averageRating - b.averageRating;
      return 0;
    });

    return result.slice(0, 84); // 14 rows * 6 cards
  }, [ratings, countryFilter, cityFilter, sortBy]);

  const handleNextEstate = () => {
    if (!selectedEstateId) return;
    const currentIndex = filteredAndSorted.findIndex(e => e.id === selectedEstateId);
    if (currentIndex < filteredAndSorted.length - 1) {
      setSelectedEstateId(filteredAndSorted[currentIndex + 1].id);
    }
  };

  const handlePrevEstate = () => {
    if (!selectedEstateId) return;
    const currentIndex = filteredAndSorted.findIndex(e => e.id === selectedEstateId);
    if (currentIndex > 0) {
      setSelectedEstateId(filteredAndSorted[currentIndex - 1].id);
    }
  };

  const hasNextEstate = useMemo(() => {
    if (!selectedEstateId) return false;
    const currentIndex = filteredAndSorted.findIndex(e => e.id === selectedEstateId);
    return currentIndex < filteredAndSorted.length - 1;
  }, [selectedEstateId, filteredAndSorted]);

  const hasPrevEstate = useMemo(() => {
    if (!selectedEstateId) return false;
    const currentIndex = filteredAndSorted.findIndex(e => e.id === selectedEstateId);
    return currentIndex > 0;
  }, [selectedEstateId, filteredAndSorted]);

  const selectedEstate = ratings.find(r => r.id === selectedEstateId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b-4 border-black pb-4 relative">
        <h2 className="text-[18px] font-black uppercase tracking-tighter">{t('estate_rating', 'Рейтинг ЖК')}</h2>
        <p className="text-[16px] font-bold opacity-60 uppercase tracking-widest">
          {t('public_voting', 'Народное голосование за лучшие жилые комплексы')}
        </p>
        
        {user && (
          <button 
            onClick={() => setIsAdminModalOpen(true)}
            className="absolute right-0 top-0 bg-black text-white px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Plus size={14} />
            {t('add_estate_admin', 'Добавить ЖК (Admin)')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-paper-light border-2 border-black p-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase opacity-60">{t('country', 'Страна')}</label>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-1.5 text-[10px] font-black uppercase border border-black bg-white focus:outline-none"
          >
            {countries.map(c => (
              <option 
                key={c} 
                value={c}
                disabled={c !== 'Чехия' && c !== 'Все'}
              >
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase opacity-60">{t('city', 'Город')}</label>
          <select
            value={cityFilter || 'Все'}
            onChange={(e) => setCityFilter(e.target.value === 'Все' ? '' : e.target.value)}
            className="px-3 py-1.5 text-[10px] font-black uppercase border border-black bg-white focus:outline-none"
          >
            {uniqueCities.map(city => (
              <option key={city} value={city}>
                {city === 'Все' ? t('all', 'Все') : city}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase opacity-60">{t('sort', 'Сортировка')}</label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: t('rating_desc', 'Рейтинг ↑'), value: 'rating_desc' },
              { label: t('rating_asc', 'Рейтинг ↓'), value: 'rating_asc' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all border border-black ${
                  sortBy === option.value 
                    ? 'bg-[#dc2626] text-white' 
                    : 'bg-white text-black hover:text-[#dc2626]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setCountryFilter('Все');
              setCityFilter('');
              setSortBy('rating_desc');
            }}
            className="px-3 py-1.5 text-[10px] font-black uppercase transition-all border border-black bg-black text-white hover:bg-[#dc2626]"
          >
            {t('reset_all', 'Сбросить все')}
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {filteredAndSorted.map(item => (
            <EstateCard 
              key={item.id} 
              item={item} 
              userVote={userVotes[item.id]} 
              isCompared={compareIds.includes(item.id)}
              onToggleCompare={() => toggleCompare(item.id)}
              onVote={(rating) => handleVote(item.id, rating)} 
              onClick={() => setSelectedEstateId(item.id)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEstate && (
        <LargeModal 
          isOpen={!!selectedEstateId} 
          onClose={() => setSelectedEstateId(null)} 
          title={t('complex_details', 'Детали комплекса')}
          headerActions={
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevEstate}
                disabled={!hasPrevEstate}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-[9px] font-black uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] ${!hasPrevEstate ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-black hover:text-white'}`}
              >
                <ChevronLeft size={14} />
                {t('back', 'Назад')}
              </button>
              <button 
                onClick={handleNextEstate}
                disabled={!hasNextEstate}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-[9px] font-black uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] ${!hasNextEstate ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-black hover:text-white'}`}
              >
                {t('forward', 'Вперед')}
                <ChevronRight size={14} />
              </button>
            </div>
          }
        >
          <EstateDetail 
            estate={selectedEstate} 
            userVote={userVotes[selectedEstate.id]} 
            isCompared={compareIds.includes(selectedEstate.id)}
            onToggleCompare={() => toggleCompare(selectedEstate.id)}
            onVote={(rating) => handleVote(selectedEstate.id, rating)} 
            onNext={handleNextEstate}
            onPrev={handlePrevEstate}
            hasNext={hasNextEstate}
            hasPrev={hasPrevEstate}
            onLeaveReview={() => onLeaveReview?.(selectedEstate.id)}
            setIsLoginModalOpen={setIsLoginModalOpen}
            isAdmin={user?.email === 'Ologast@gmail.com'}
            user={user}
          />
        </LargeModal>
      )}

      {/* Comparison Modal */}
      <LargeModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} title={t('compare_estates', 'Сравнение ЖК')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ratings.filter(r => compareIds.includes(r.id)).map(estate => (
            <div key={estate.id} className="border-2 border-black p-4 bg-white space-y-4">
              <img src={estate.imageUrl} alt={estate.name} className="w-full aspect-video object-cover border border-black" referrerPolicy="no-referrer" />
              <h3 className="text-sm font-black uppercase">{estate.name}</h3>
              <div className="space-y-1 text-[10px] font-bold uppercase">
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>{t('location', 'Локация:')}</span>
                  <span>{estate.country}, {estate.city}</span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>{t('rating', 'Рейтинг:')}</span>
                  <span>{estate.averageRating.toFixed(1)} ★</span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span>{t('votes', 'Голосов:')}</span>
                  <span>{estate.totalVotes}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => toggleCompare(estate.id)}
                  className="w-full py-2 bg-red-600 text-white text-[10px] font-black uppercase hover:bg-red-700 transition-all"
                >
                  {t('delete', 'Удалить')}
                </button>
              </div>
            </div>
          ))}
          {compareIds.length === 0 && (
            <div className="col-span-full py-12 text-center opacity-40">
              <p className="text-xs font-bold uppercase">{t('compare_list_empty', 'Список сравнения пуст')}</p>
            </div>
          )}
        </div>
      </LargeModal>

      {/* Comparison Floating Bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black text-white px-6 py-3 border-2 border-white flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest">{t('compare_estates', 'Сравнение ЖК')}</span>
            <span className="text-[8px] font-bold opacity-60 uppercase">{compareIds.length} {t('objects', 'объекта(ов)')}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsCompareModalOpen(true)}
              className="bg-white text-black px-4 py-1 text-[10px] font-black uppercase hover:bg-gray-200 transition-all"
            >
              {t('compare', 'Сравнить')}
            </button>
            <button 
              onClick={() => setCompareIds([])}
              className="border border-white/30 px-4 py-1 text-[10px] font-black uppercase hover:bg-white/10 transition-all"
            >
              {t('reset', 'Сбросить')}
            </button>
          </div>
        </div>
      )}

      {/* Admin Add Estate Modal */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title={t('add_new_estate', 'Добавить новый ЖК')}>
        <form onSubmit={handleAddEstate} className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">{t('estate_name', 'Название ЖК')}</label>
            <input name="name" required type="text" className="w-full border-2 border-black p-2 bg-white text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">{t('country', 'Страна')}</label>
              <input name="country" required type="text" className="w-full border-2 border-black p-2 bg-white text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">{t('city', 'Город')}</label>
              <input name="city" required type="text" className="w-full border-2 border-black p-2 bg-white text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">{t('total_floors_label', 'Этажность (всего)')}</label>
              <input name="totalFloors" type="number" className="w-full border-2 border-black p-2 bg-white text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">{t('cadastre_url_label', 'Ссылка на кадастр')}</label>
              <input name="cadastreUrl" type="url" className="w-full border-2 border-black p-2 bg-white text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">{t('property_type_label', 'Тип недвижимости')}</label>
              <select name="propertyType" className="w-full border-2 border-black p-2 bg-white text-xs">
                <option value="">{t('select_type', 'Выберите тип')}</option>
                <option value="Кооперативная">{t('cooperative', 'Кооперативная')}</option>
                <option value="Частная">{t('private', 'Частная')}</option>
                <option value="Долевая">{t('shared', 'Долевая')}</option>
                <option value="Муниципальная">{t('municipal', 'Муниципальная')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">{t('material_label', 'Материал')}</label>
              <select name="material" className="w-full border-2 border-black p-2 bg-white text-xs">
                <option value="">{t('select_material', 'Выберите материал')}</option>
                <option value="Кирпич">{t('brick', 'Кирпич')}</option>
                <option value="Монолит">{t('monolith', 'Монолит')}</option>
                <option value="other">{t('other', 'Другое')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">{t('land_type_label', 'Тип участка')}</label>
              <select name="landType" className="w-full border-2 border-black p-2 bg-white text-xs">
                <option value="">{t('select_land_type', 'Выберите тип участка')}</option>
                <option value="Под застройку">{t('for_building', 'Под застройку')}</option>
                <option value="Сельхоз">{t('agricultural', 'Сельхоз')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">{t('description', 'Описание')}</label>
            <textarea name="description" required className="w-full border-2 border-black p-2 bg-white text-xs h-20"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">{t('latitude', 'Широта (Lat)')}</label>
              <input name="lat" type="number" step="any" className="w-full border-2 border-black p-2 bg-white text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">{t('longitude', 'Долгота (Lng)')}</label>
              <input name="lng" type="number" step="any" className="w-full border-2 border-black p-2 bg-white text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">{t('main_photo', 'Главное фото')}</label>
            <input name="imageFile" type="file" accept="image/*" className="w-full border-2 border-black p-2 bg-white text-xs" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">{t('gallery_multiple', 'Галерея (несколько фото)')}</label>
            <input name="galleryFiles" type="file" accept="image/*" multiple className="w-full border-2 border-black p-2 bg-white text-xs" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">{t('master_plan', 'Генплан (Master Plan)')}</label>
            <input name="masterPlanFile" type="file" accept="image/*,application/pdf" className="w-full border-2 border-black p-2 bg-white text-xs" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">{t('pdf_presentation', 'PDF Презентация')}</label>
            <input name="presentationFile" type="file" accept="application/pdf" className="w-full border-2 border-black p-2 bg-white text-xs" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-black uppercase py-3 mt-4 hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isLoading ? t('uploading', 'Загрузка...') : t('add_object', 'Добавить объект')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

const EstateDetail = ({ 
  estate, 
  userVote, 
  isCompared, 
  onToggleCompare, 
  onVote,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  onLeaveReview,
  setIsLoginModalOpen,
  isAdmin,
  user
}: { 
  estate: EstateRating, 
  userVote?: number, 
  isCompared: boolean, 
  onToggleCompare: () => void, 
  onVote: (r: number) => void,
  onNext?: () => void,
  onPrev?: () => void,
  hasNext?: boolean,
  hasPrev?: boolean,
  onLeaveReview?: () => void,
  setIsLoginModalOpen?: (open: boolean) => void,
  isAdmin?: boolean,
  user: any | null
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'plans' | 'docs' | 'reviews'>('overview');
  const [mainImage, setMainImage] = useState(estate.imageUrl);
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [isRepresentativeModalOpen, setIsRepresentativeModalOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState(estate.websiteUrl || '');

  useEffect(() => {
    setMainImage(estate.imageUrl);
    setActiveTab('overview');
    setWebsiteUrl(estate.websiteUrl || '');
    setIsEditingWebsite(false);
  }, [estate.id, estate.websiteUrl]);

  const handleSaveWebsite = async () => {
      setIsEditingWebsite(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, hasNext, hasPrev]);

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation for mobile/quick access */}
      {(onNext || onPrev) && (
        <div className="flex justify-between items-center md:hidden border-b-2 border-black pb-4">
          <button 
            onClick={onPrev}
            disabled={!hasPrev}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-[9px] font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${!hasPrev ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-black hover:text-white'}`}
          >
            <ChevronLeft size={14} />
            {t('back', 'Назад')}
          </button>
          <div className="text-[10px] font-black uppercase opacity-40">{t('navigation', 'Навигация')}</div>
          <button 
            onClick={onNext}
            disabled={!hasNext}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-[9px] font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${!hasNext ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-black hover:text-white'}`}
          >
            {t('forward', 'Вперед')}
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-black pb-2 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'overview' ? 'bg-[#dc2626] text-white shadow-[inset_0_0_0_2px_#000]' : 'bg-white text-black border-2 border-black hover:text-[#dc2626] hover:border-[#dc2626]'}`}
        >
          <LayoutDashboard size={14} /> {t('overview', 'Обзор')}
        </button>
        <button 
          onClick={() => setActiveTab('gallery')} 
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'gallery' ? 'bg-[#dc2626] text-white shadow-[inset_0_0_0_2px_#000]' : 'bg-white text-black border-2 border-black hover:text-[#dc2626] hover:border-[#dc2626]'}`}
        >
          <ImageIcon size={14} /> {t('gallery', 'Галерея')}
        </button>
        <button 
          onClick={() => setActiveTab('plans')} 
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'plans' ? 'bg-[#dc2626] text-white shadow-[inset_0_0_0_2px_#000]' : 'bg-white text-black border-2 border-black hover:text-[#dc2626] hover:border-[#dc2626]'}`}
        >
          <MapIcon size={14} /> {t('plans_and_development', 'Планы и застройка')}
        </button>
        <button 
          onClick={() => setActiveTab('docs')} 
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'docs' ? 'bg-[#dc2626] text-white shadow-[inset_0_0_0_2px_#000]' : 'bg-white text-black border-2 border-black hover:text-[#dc2626] hover:border-[#dc2626]'}`}
        >
          <FileText size={14} /> {t('documents', 'Документы')}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="aspect-video border-2 border-black overflow-hidden relative">
            <img src={estate.imageUrl} alt={estate.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute top-4 right-4 bg-black text-white px-3 py-2 flex items-center gap-2 border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
              <Star size={16} className="fill-white" />
              <span className="text-xl font-black">{estate.averageRating.toFixed(1)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-2">{estate.name}</h3>
                <div className="flex items-center gap-2 font-bold uppercase opacity-60">
                  <MapPin size={16} /> {estate.country}, {estate.city}
                </div>
              </div>

              <div className="p-4 bg-paper-light border-2 border-black space-y-4">
                <div className="text-sm font-medium leading-relaxed">
                  {estate.description || t('no_description', 'Описание отсутствует.')}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/10">
                  {estate.totalFloors && (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('total_floors_label', 'Этажность')}</span>
                      <span className="text-xs font-bold">{estate.totalFloors}</span>
                    </div>
                  )}
                  {estate.propertyType && (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('property_type_label', 'Тип недвижимости')}</span>
                      <span className="text-xs font-bold">{estate.propertyType}</span>
                    </div>
                  )}
                  {estate.material && (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('material_label', 'Материал')}</span>
                      <span className="text-xs font-bold">{estate.material}</span>
                    </div>
                  )}
                  {estate.landType && (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('land_type_label', 'Тип участка')}</span>
                      <span className="text-xs font-bold">{estate.landType}</span>
                    </div>
                  )}
                  {estate.cadastreUrl && (
                    <div className="flex flex-col col-span-2">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('cadastre_url_label', 'Кадастр')}</span>
                      <a 
                        href={estate.cadastreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {t('view_in_cadastre', 'Посмотреть в кадастре')} <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={onToggleCompare}
                className={`w-full py-3 text-xs font-black uppercase tracking-widest transition-all border-2 border-black flex items-center justify-center gap-2 ${isCompared ? 'bg-red-600 text-white border-red-600' : 'bg-white text-black hover:bg-gray-100'}`}
              >
                <Scale size={16} />
                {isCompared ? t('in_comparison_remove', 'В сравнении (Удалить)') : t('add_to_comparison', 'Добавить к сравнению')}
              </button>

              {/* Website Button */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  {estate.websiteUrl ? (
                    <a 
                      href={estate.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#dc2626] transition-all border-2 border-black"
                    >
                      <ExternalLink size={14} /> {t('go_to_official_website', 'Перейти на официальный сайт')}
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-[10px] border-2 border-gray-200 cursor-not-allowed"
                    >
                      <ExternalLink size={14} /> {t('go_to_official_website', 'Перейти на официальный сайт')}
                    </button>
                  )}
                  
                  {isAdmin && (
                    <button 
                      onClick={() => setIsEditingWebsite(true)}
                      className="w-12 border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-all"
                      title={estate.websiteUrl ? t('edit_link', 'Редактировать ссылку') : t('add_link', 'Добавить ссылку')}
                    >
                      {estate.websiteUrl ? <Edit3 size={14} /> : <Plus size={14} />}
                    </button>
                  )}
                </div>

                {isEditingWebsite && isAdmin && (
                  <div className="p-4 border-2 border-black bg-gray-50 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">{t('estate_website_link', 'Ссылка на сайт ЖК')}</label>
                    <input 
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full border-2 border-black p-2 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSaveWebsite}
                        className="flex-1 py-2 bg-black text-white font-black uppercase tracking-widest text-[10px] hover:bg-green-600 transition-all border-2 border-black"
                      >
                        {t('save', 'Сохранить')}
                      </button>
                      <button 
                        onClick={() => setIsEditingWebsite(false)}
                        className="px-4 py-2 border-2 border-black font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                      >
                        {t('cancel', 'Отмена')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  if (user) {
                    onLeaveReview?.();
                  } else {
                    setIsLoginModalOpen?.(true);
                  }
                }}
                className="w-full py-3 bg-red-600 text-white border-2 border-black font-black uppercase tracking-widest text-[10px] hover:bg-[#7a1b1b] transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-[inset_0_0_0_2px_#000] active:translate-x-[2px] active:translate-y-[2px]"
              >
                <Star size={14} /> {t('leave_review', 'Оставить отзыв')}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-xs font-black uppercase tracking-widest">{t('location_on_map', 'Расположение на карте')}</div>
              <div className="flex-1 min-h-[300px] border-2 border-black bg-[#e5e7eb] relative overflow-hidden">
                {estate.coordinates && 
                 typeof estate.coordinates.lat === 'number' && !isNaN(estate.coordinates.lat) && 
                 typeof estate.coordinates.lng === 'number' && !isNaN(estate.coordinates.lng) ? (
                  <>
                    <MapContainer
                      center={[estate.coordinates.lat, estate.coordinates.lng]}
                      zoom={14}
                      style={{width: '100%', height: '100%'}}
                      zoomControl={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[estate.coordinates.lat, estate.coordinates.lng]} icon={estateIcon} />
                    </MapContainer>
                    <a 
                      href={`https://www.openstreetmap.org/?mlat=${estate.coordinates.lat}&mlon=${estate.coordinates.lng}#map=15/${estate.coordinates.lat}/${estate.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 left-4 bg-white border-2 border-black px-3 py-2 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-[400]"
                    >
                      <ExternalLink size={14} />
                      {t('open_in_osm', 'Открыть в OpenStreetMap')}
                    </a>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-50">
                    <MapIcon size={32} />
                    <span className="ml-2 text-xs font-black uppercase">{t('coordinates_not_specified', 'Координаты не указаны')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="aspect-video border-2 border-black overflow-hidden relative bg-black">
            <img src={mainImage} alt="Gallery Main" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {[estate.imageUrl, ...(estate.galleryUrls || [])].map((url, idx) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(url)} 
                className={`aspect-square border-2 ${mainImage === url ? 'border-red-600' : 'border-black'} overflow-hidden bg-gray-100`}
              >
                <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover hover:opacity-80 transition-opacity" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {estate.masterPlanUrl && (
            <div className="space-y-2">
              <h4 className="text-lg font-black uppercase border-b-2 border-black pb-2">{t('master_plan', 'План застройки (Генплан)')}</h4>
              <div className="border-2 border-black p-2 bg-white">
                <img src={estate.masterPlanUrl} alt="Master Plan" className="w-full h-auto border border-black/10" referrerPolicy="no-referrer" />
              </div>
            </div>
          )}
          
          {estate.floorPlans && estate.floorPlans.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-black uppercase border-b-2 border-black pb-2">{t('floor_plans', 'Планы помещений')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {estate.floorPlans.map((plan, idx) => (
                  <div key={idx} className="border-2 border-black bg-white p-2 flex flex-col gap-2 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                    <div className="aspect-square border border-black/10 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                      <img src={plan.imageUrl} alt={plan.title} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-black uppercase">{plan.title}</span>
                      {plan.area && <span className="text-[10px] font-bold opacity-60 bg-black text-white px-2 py-0.5">{plan.area}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!estate.masterPlanUrl && (!estate.floorPlans || estate.floorPlans.length === 0) && (
            <div className="p-8 text-center border-2 border-black bg-gray-50 opacity-50">
              <MapIcon className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-xs font-black uppercase">{t('plans_not_uploaded', 'Планы не загружены')}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <h4 className="text-lg font-black uppercase border-b-2 border-black pb-2">{t('project_documents', 'Документы проекта')}</h4>
          {estate.presentationUrl ? (
            <a href={estate.presentationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border-2 border-black bg-white hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center font-black">PDF</div>
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase">{t('project_presentation', 'Презентация проекта')}</span>
                  <span className="text-[10px] font-bold opacity-50">{t('download_or_view_pdf', 'Скачать или посмотреть (PDF)')}</span>
                </div>
              </div>
              <FileText className="opacity-30 group-hover:opacity-100 transition-opacity" />
            </a>
          ) : (
            <div className="p-8 text-center border-2 border-black bg-gray-50 opacity-50">
              <FileText className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-xs font-black uppercase">{t('documents_not_uploaded', 'Документы не загружены')}</p>
            </div>
          )}
        </div>
      )}

      {/* Reviews Section - Moved to bottom */}
      <div className="mt-8 border-t-4 border-black pt-8">
        <ReviewSection 
          reviews={estate.reviews || []} 
          rating={estate.averageRating} 
          onLeaveReview={() => {
            if (user) {
              onLeaveReview?.();
            } else {
              setIsLoginModalOpen?.(true);
            }
          }} 
        />
      </div>

      {/* Footer Links */}
      <div className="mt-4 pt-4 border-t border-black/20 flex flex-wrap gap-3 justify-center text-[10px] font-black uppercase tracking-widest">
        <button 
          onClick={() => {
            if (!user) {
              setIsLoginModalOpen?.(true);
            } else {
              setIsRepresentativeModalOpen(true);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all rounded-full"
        >
          <UserCheck size={12} />
          {t('i_am_representative', 'Я представитель объекта')}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all rounded-full">
          <Share2 size={12} />
          {t('share', 'Поделиться')}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all rounded-full">
          <AlertTriangle size={12} />
          {t('report', 'Пожаловаться')}
        </button>
      </div>

      <RepresentativeModal 
        isOpen={isRepresentativeModalOpen}
        onClose={() => setIsRepresentativeModalOpen(false)}
        targetId={estate.id}
        targetName={estate.name}
        targetType="estate"
        onSuccess={(msg) => alert(msg)}
      />
    </div>
  );
};

const EstateCard = ({ item, userVote, isCompared, onToggleCompare, onVote, onClick }: { item: EstateRating, userVote?: number, isCompared: boolean, onToggleCompare: () => void, onVote: (r: number) => void, onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="flex flex-col border-2 border-black bg-white group transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 cursor-pointer"
    >
      <div className="aspect-[4/3] border-b-2 border-black overflow-hidden relative">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
        <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
            className={`p-1.5 border border-white/20 transition-all ${isCompared ? 'bg-red-600 text-white' : 'bg-black text-white hover:bg-red-600'}`}
            title={isCompared ? t('remove_from_comparison', 'Удалить из сравнения') : t('add_to_comparison', 'Добавить к сравнению')}
          >
            <Scale size={14} />
          </button>
        </div>
        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 flex items-center gap-1 border border-white/20">
          <Star size={12} className="fill-white" />
          <span className="text-xs font-black">{item.averageRating.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-black uppercase tracking-tighter leading-tight mb-1">{item.name}</h3>
        <div className="flex items-center gap-1 text-[9px] font-bold uppercase opacity-60 mb-3">
          <MapPin size={10} /> {item.country}, {item.city}
        </div>
        
        <div className="mt-auto pt-3 border-t border-black/10 flex justify-between items-center">
          <div className="text-[8px] font-black uppercase opacity-50">
            {item.totalVotes} {t('votes', 'голосов')}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 border border-black/10">
            <Star size={10} className="fill-black text-black" />
            <span className="text-[10px] font-black">{item.averageRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
