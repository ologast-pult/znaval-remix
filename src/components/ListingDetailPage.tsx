import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronLeft, ChevronRight, Home, AlertCircle } from 'lucide-react';
import { ListingDetail } from './ListingDetail';
import { Listing } from '../types';

interface ListingDetailPageProps {
  listings: Listing[];
  isLoading?: boolean;
  comparisons: string[];
  toggleComparison: (id: string) => void;
  user: any;
  setReviewTarget: (target: { type: 'listing' | 'estate'; id: string }) => void;
  setIsReviewModalOpen: (open: boolean) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  isAdmin: boolean;
  handleVerifyReview: (listingId: string, reviewId: string) => void;
}

export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({
  listings,
  isLoading,
  comparisons,
  toggleComparison,
  user,
  setReviewTarget,
  setIsReviewModalOpen,
  setIsLoginModalOpen,
  isAdmin,
  handleVerifyReview
}) => {
  const { id, lang } = useParams<{ id: string; lang: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const currentLang = (lang && ['cs', 'ru', 'en'].includes(lang)) 
    ? lang 
    : (i18n.language?.startsWith('ru') ? 'ru' : i18n.language?.startsWith('en') ? 'en' : 'cs');

  const listing = (listings || []).find(l => String(l.id) === String(id));

  // If still loading and listing not found yet
  if (!listing && isLoading) {
    return (
      <div className="max-w-4xl mx-auto my-16 p-12 text-center border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black uppercase tracking-widest">{t('loading', 'Загрузка...')}</p>
      </div>
    );
  }

  // Not found
  if (!listing) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 border-2 border-black bg-white text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="w-12 h-12 mx-auto mb-3 bg-red-100 text-[#7a1b1b] border-2 border-black flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight mb-2">
          {t('listing_not_found', 'Объявление не найдено')}
        </h2>
        <p className="text-xs text-gray-600 mb-6 font-serif">
          ID: {id}
        </p>
        <button 
          onClick={() => navigate(`/${currentLang}`)}
          className="px-5 py-2.5 bg-[#7a1b1b] text-white border-2 border-black text-xs font-black uppercase hover:bg-black transition-all flex items-center justify-center gap-2 mx-auto active:translate-x-[1px] active:translate-y-[1px]"
        >
          <Home size={14} />
          {t('back_to_listings', 'В каталог')}
        </button>
      </div>
    );
  }

  const currentIndex = listings.findIndex(l => String(l.id) === String(id));
  const hasNext = currentIndex !== -1 && currentIndex < listings.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      navigate(`/${currentLang}/listing/${listings[currentIndex + 1].id}`);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      navigate(`/${currentLang}/listing/${listings[currentIndex - 1].id}`);
    }
  };

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-black">
        <button 
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate(`/${currentLang}`);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white hover:bg-black hover:text-white text-[10px] font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
        >
          <ArrowLeft size={14} />
          <span>{t('back_btn', 'Назад')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            disabled={!hasPrev}
            onClick={handlePrev}
            className={`px-3 py-1.5 border-2 border-black text-[10px] font-black uppercase transition-all flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px] ${
              !hasPrev ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-black hover:text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
            }`}
            title="Предыдущее объявление"
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline">{t('prev', 'Назад')}</span>
          </button>
          <button 
            disabled={!hasNext}
            onClick={handleNext}
            className={`px-3 py-1.5 border-2 border-black text-[10px] font-black uppercase transition-all flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px] ${
              !hasNext ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-black hover:text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
            }`}
            title="Следующее объявление"
          >
            <span className="hidden sm:inline">{t('next', 'Вперед')}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <ListingDetail 
        listing={listing} 
        onClose={() => navigate(`/${currentLang}`)} 
        onToggleComparison={toggleComparison}
        onFilterCategory={(cat) => {
          if (cat === 'Резидент') {
            navigate(`/${currentLang}/residents`);
          } else {
            navigate(`/${currentLang}?type=${encodeURIComponent(cat)}`);
          }
        }}
        isInComparison={comparisons.includes(listing.id)}
        user={user}
        onLeaveReview={() => {
          setReviewTarget({ type: 'listing', id: listing.id });
          setIsReviewModalOpen(true);
        }}
        setIsLoginModalOpen={setIsLoginModalOpen}
        isAdmin={isAdmin}
        onVerifyReview={handleVerifyReview}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    </div>
  );
};
