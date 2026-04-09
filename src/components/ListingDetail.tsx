import React, { useState } from 'react';
import { Listing, getTrustLevel, getTrustColor } from '../types';
import { ProofTimeline } from './ProofTimeline';
import { MapPin, ShieldCheck, Phone, MessageSquare, Share2, Info, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, Star, User, Calendar, ArrowUpDown, X, CornerDownRight, UserCheck, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from '../utils';
import { ReviewSection } from './ReviewSection';
import RepresentativeModal from './RepresentativeModal';
import { useTranslation } from 'react-i18next';

interface ListingDetailProps {
  listing: Listing;
  onClose: () => void;
  onToggleComparison?: (id: string) => void;
  onFilterCategory?: (category: string) => void;
  isInComparison?: boolean;
  user?: any;
  onLeaveReview: () => void;
  setIsLoginModalOpen: (open: boolean) => void;
  onVerifyReview?: (listingId: string, reviewId: string) => void;
  isAdmin?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const ListingDetail: React.FC<ListingDetailProps> = ({ 
  listing, onClose, onToggleComparison, onFilterCategory, isInComparison, user, onLeaveReview, setIsLoginModalOpen,
  onVerifyReview, isAdmin, onNext, onPrev, hasNext, hasPrev
}) => {
  const { t } = useTranslation();
  const [activeImage, setActiveImage] = React.useState(listing.imageUrl || listing.avatarUrl);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRepresentativeModalOpen, setIsRepresentativeModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    floor: listing.floor,
    totalFloors: listing.totalFloors,
    propertyType: listing.propertyType,
    propertyTypeCustom: listing.propertyTypeCustom,
    material: listing.material,
    materialCustom: listing.materialCustom,
    landType: listing.landType,
    landTypeCustom: listing.landTypeCustom,
    commission: listing.commission,
    cadastreUrl: listing.cadastreUrl
  });

  const isClaimedOwner = user && listing.isClaimed && listing.claimedBy === user.uid;
  const isOriginalAuthor = user && listing.authorUid === user.uid;
  const canEdit = isClaimedOwner || isOriginalAuthor;
  
  const trustLevel = getTrustLevel(listing.trustScore);
  const trustColor = getTrustColor(trustLevel);

  const images = (listing.galleryUrls && listing.galleryUrls.length > 0) 
    ? listing.galleryUrls 
    : [listing.imageUrl || listing.avatarUrl || 'https://picsum.photos/seed/listing/800/600'];
  const currentIndex = images.indexOf(activeImage);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIndex = (currentIndex + 1) % images.length;
    setActiveImage(images[nextIndex]);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setActiveImage(images[prevIndex]);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Priority 1: Lightbox navigation
      if (isLightboxOpen) {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'Escape') setIsLightboxOpen(false);
        return;
      }

      // Priority 2: Listing navigation (only if not in an input/textarea)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentIndex, onNext, onPrev, hasNext, hasPrev]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Navigation for mobile/quick access */}
      {(onNext || onPrev) && (
        <div className="flex justify-between items-center md:hidden border-b-2 border-black pb-4">
          <button 
            onClick={onPrev}
            disabled={!hasPrev}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-[9px] font-black uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] ${!hasPrev ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-black hover:text-white'}`}
          >
            <ChevronLeft size={14} />
            {t('back', 'Назад')}
          </button>
          <div className="text-[10px] font-black uppercase opacity-40">{t('navigation', 'Навигация')}</div>
          <button 
            onClick={onNext}
            disabled={!hasNext}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-[9px] font-black uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] ${!hasNext ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-black hover:text-white'}`}
          >
            {t('forward', 'Вперед')}
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 cursor-zoom-out"
          >
            {/* Navigation Buttons */}
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all btn-newspaper-hover z-10"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all btn-newspaper-hover z-10"
            >
              <ChevronRight size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full aspect-video border-4 border-white overflow-hidden cursor-default"
            >
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                src={activeImage} 
                alt="Full resolution" 
                className="w-full h-full object-contain bg-black"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
                {t('detailed_view', 'Режим детального осмотра')} • {listing.id} • {currentIndex + 1} / {images.length}
              </div>
              <button 
                className="absolute top-4 right-4 w-10 h-10 bg-white text-black flex items-center justify-center font-bold btn-newspaper-hover transition-all"
                onClick={() => setIsLightboxOpen(false)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="border-b-2 border-black pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          {/* Left Side: Object & Listing Details */}
          <div className="flex-1 space-y-4">
            {/* Object Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[12px] font-black uppercase tracking-widest text-gray-500">
                <span>ID: {listing.id}</span>
                <span>{listing.category}</span>
                <span className="text-black">
                  {listing.sellerType === 'Резидент' 
                    ? t('review_from_resident', 'Отзыв от Резидента') 
                    : `${t('from', 'от')} ${listing.sellerType === 'Риелтор' ? t('realtor_genitive', 'риелтора') : listing.sellerType === 'Владелец' ? t('owner_genitive', 'владельца') : listing.sellerType === 'Застройщик' ? t('developer_genitive', 'застройщика') : listing.sellerType}`}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {listing.address}
              </div>
              <div className="text-xl font-black uppercase tracking-tighter">
                <button 
                  onClick={() => onFilterCategory?.('Голосование')}
                  className={`px-2 py-0.5 border-2 border-black bg-white text-black transition-all hover:text-[#7a1b1b] hover:border-[#7a1b1b] active:bg-[#7a1b1b] active:text-white active:border-[#7a1b1b]`}
                >
                  {listing.title}
                </button>
              </div>
            </div>

            {/* Listing Section */}
            <div className="space-y-1 pt-2 border-t border-black/10">
              <div className="text-[9px] font-black uppercase opacity-40 tracking-widest">{t('listing_label', 'Объявление')}</div>
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-black tracking-tighter">
                  {formatPrice(listing.price, listing.transactionType === 'Аренда' ? t('czk_month', 'Kč/мес') : 'Kč')}
                </div>
                {(listing.dispozice || listing.area) && (
                  <div className="text-lg font-black uppercase text-[#7a1b1b] border-l-2 border-black pl-2 flex items-center gap-2">
                    <span>
                      {listing.dispozice}{listing.dispozice && listing.area ? ' / ' : ''}{listing.area ? `${listing.area} ${t('sqm', 'м²')}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full md:w-auto flex flex-col gap-3 min-w-[220px]">
            
            {onToggleComparison && (
              <button 
                onClick={() => onToggleComparison(listing.id)}
                className={`w-full py-3 border-2 border-black text-[11px] font-black uppercase transition-all active:translate-x-1 active:translate-y-1 ${isInComparison ? 'bg-[#7a1b1b] text-white' : 'bg-white text-black hover:bg-gray-50'}`}
              >
                {isInComparison ? t('remove_from_compare', 'Удалить из сравнения') : t('add_to_compare', 'Добавить к сравнению')}
              </button>
            )}

            {canEdit && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="w-full py-2 border-2 border-black bg-blue-50 text-blue-700 text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1"
              >
                <Edit3 size={14} />
                {isEditing ? t('cancel', 'Отмена') : t('edit', 'Редактировать')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Visuals & Description */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="border-2 border-black p-1 bg-white">
              <div 
                className="halftone-container aspect-video overflow-hidden relative cursor-zoom-in group/mainimg"
                onClick={() => setIsLightboxOpen(true)}
              >
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={activeImage} 
                  alt={listing.title} 
                  className="w-full h-full object-cover halftone-img filter-none mix-blend-normal transition-transform duration-500 group-hover/mainimg:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/mainimg:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="bg-white/90 text-black text-[10px] font-black px-3 py-1 border border-black opacity-0 group-hover/mainimg:opacity-100 transition-opacity uppercase tracking-tighter">
                    {t('zoom_in', 'Увеличить')}
                  </span>
                </div>
                {listing.verified && (
                  <div className="absolute top-2 left-2 bg-white border-2 border-black px-2 py-1 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-archive-blue" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{t('verified', 'Верифицировано')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2">
              {images.map((url, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(url)}
                  className={`aspect-square border-2 transition-all overflow-hidden btn-newspaper-hover ${activeImage === url ? 'border-archive-blue scale-95' : 'border-black'}`}
                >
                  <img src={url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase border-b border-black pb-1 flex items-center gap-2">
              <Info size={14} /> {t('object_description', 'Описание объекта')}
            </h3>
            {isEditing ? (
              <div className="space-y-4 bg-gray-50 p-4 border-2 border-black">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">{t('title', 'Заголовок')}</label>
                  <input 
                    type="text" 
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="w-full border-2 border-black p-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">{t('price_czk', 'Цена (Kč)')}</label>
                  <input 
                    type="number" 
                    value={editData.price}
                    onChange={(e) => setEditData({...editData, price: Number(e.target.value)})}
                    className="w-full border-2 border-black p-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">{t('description', 'Описание')}</label>
                  <textarea 
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="w-full border-2 border-black p-2 text-sm font-bold h-40 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1">{t('floor', 'Этаж')}</label>
                    <input 
                      type="number" 
                      value={editData.floor || ''}
                      onChange={(e) => setEditData({...editData, floor: Number(e.target.value)})}
                      className="w-full border-2 border-black p-2 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1">{t('total_floors', 'Всего этажей')}</label>
                    <input 
                      type="number" 
                      value={editData.totalFloors || ''}
                      onChange={(e) => setEditData({...editData, totalFloors: Number(e.target.value)})}
                      className="w-full border-2 border-black p-2 text-sm font-bold"
                    />
                  </div>
                </div>

                <button 
                  onClick={async () => {
                      setIsEditing(false);
                      alert(t('info_updated', 'Информация обновлена!'));
                  }}
                  className="w-full bg-black text-white py-2 text-xs font-black uppercase hover:bg-gray-800 transition-all"
                >
                  {t('save_changes', 'Сохранить изменения')}
                </button>
              </div>
            ) : (
              <>
                <p className="font-serif text-sm leading-relaxed text-gray-800 italic mb-6">
                  {listing.description}
                </p>

                {/* New Characteristics Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 border-t border-black/10 pt-4">
                  {(listing.floor || listing.totalFloors) && (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('floor', 'Этаж')}</span>
                      <span className="text-xs font-bold">
                        {listing.floor || '?'}{listing.totalFloors ? ` ${t('of', 'из')} ${listing.totalFloors}` : ''}
                      </span>
                    </div>
                  )}
                  {listing.propertyType && (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('property_type', 'Тип недвижимости')}</span>
                      <span className="text-xs font-bold">
                        {listing.propertyType === 'custom' ? listing.propertyTypeCustom : t(listing.propertyType, listing.propertyType)}
                      </span>
                    </div>
                  )}
                  {listing.material && (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('material', 'Материал')}</span>
                      <span className="text-xs font-bold">
                        {listing.material === 'other' ? listing.materialCustom : t(listing.material, listing.material)}
                      </span>
                    </div>
                  )}
                  {listing.landType && (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('land_type', 'Тип участка')}</span>
                      <span className="text-xs font-bold">
                        {listing.landType === 'custom' ? listing.landTypeCustom : t(listing.landType, listing.landType)}
                      </span>
                    </div>
                  )}
                  {listing.commission !== undefined && (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('commission', 'Комиссия')}</span>
                      <span className="text-xs font-bold text-red-600">
                        {listing.commission > 0 ? `${listing.commission} Kč` : t('no_commission', 'Без комиссии')}
                      </span>
                    </div>
                  )}
                  {listing.cadastreUrl && (
                    <div className="flex flex-col col-span-2">
                      <span className="text-[8px] font-black uppercase opacity-40 mb-1">{t('cadastre', 'Кадастр')}</span>
                      <a 
                        href={listing.cadastreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {t('view_in_cadastre', 'Посмотреть в кадастре')} <ArrowUpDown size={10} className="rotate-45" />
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-[#7a1b1b] text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all border-2 border-black">
              <Phone size={14} /> {t('show_phone', 'Показать телефон')}
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border-2 border-black font-black uppercase tracking-widest text-[10px] bg-white text-black hover:text-[#7a1b1b] hover:border-[#7a1b1b] transition-all">
              <MessageSquare size={14} /> {t('write_message', 'Написать')}
            </button>
            <button 
              onClick={() => {
                if (user) {
                  onLeaveReview();
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className="col-span-2 flex items-center justify-center gap-2 bg-red-600 text-white border-2 border-black px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#7a1b1b] transition-all active:translate-x-[2px] active:translate-y-[2px]"
            >
              <Star size={14} /> {t('leave_review', 'Оставить отзыв')}
            </button>
          </div>
        </div>

        {/* Right Column: Trust & Proofs */}
        <div className="space-y-4">
          {/* Trust Score Card - Compact */}
          <div className="border-2 border-black py-2 px-3 bg-gray-50 flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-5">
              <ShieldCheck size={60} />
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-black tracking-tighter ${trustColor}`}>
                {listing.trustScore}%
              </div>
              <div>
                <div className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">{t('trust_index', 'Индекс доверия')}</div>
                <div className={`text-[10px] font-black uppercase ${trustColor} leading-none`}>
                  {t(trustLevel, trustLevel)}
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-[100px] ml-4">
              <div className="h-[5px] bg-gray-200 border border-black/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${listing.trustScore || 0}%` }}
                  className={`h-full ${trustLevel === 'SAFE' ? 'bg-green-600' : trustLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-600'}`}
                />
              </div>
              <div className="text-[7px] font-bold uppercase opacity-50 mt-1 text-right">
                {(listing.proofs || []).length} {t('docs', 'док.')}
              </div>
            </div>
          </div>

          {/* Proof Timeline */}
          <ProofTimeline proofs={listing.proofs || []} />

          {/* Verification Badges */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">{t('archive_checks', 'Проверки архива')}</h3>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-sm">
                <CheckCircle2 size={10} className="text-green-600" />
                <span className="text-[8px] font-bold uppercase">{t('docs_verified', 'Документы проверены')}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-sm">
                <CheckCircle2 size={10} className="text-green-600" />
                <span className="text-[8px] font-bold uppercase">{t('identity_verified', 'Личность подтверждена')}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-archive-blue/10 border border-archive-blue/20 rounded-sm">
                <ShieldCheck size={10} className="text-archive-blue" />
                <span className="text-[8px] font-bold uppercase">{t('deal_protection', 'Защита сделки')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <ReviewSection 
          reviews={listing.reviews || []} 
          rating={listing.rating} 
          onLeaveReview={onLeaveReview} 
          isAdmin={isAdmin}
          onVerifyReview={(reviewId) => onVerifyReview?.(listing.id, reviewId)}
        />
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-4 border-t border-black flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest">
          <button 
            onClick={() => {
              if (!user) {
                setIsLoginModalOpen(true);
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
        <div className="text-[8px] font-mono opacity-40 uppercase">
          {t('last_updated', 'Последнее обновление:')} {new Date().toLocaleDateString()}
        </div>
      </div>

      <RepresentativeModal 
        isOpen={isRepresentativeModalOpen}
        onClose={() => setIsRepresentativeModalOpen(false)}
        targetId={listing.id}
        targetName={listing.title}
        targetType="listing"
        onSuccess={(msg) => alert(msg)}
      />
    </div>
  );
};
