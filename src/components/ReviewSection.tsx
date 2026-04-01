import React, { useState, useMemo } from 'react';
import { Review } from '../types';
import { Star, User, MessageSquare, Edit3, X, ChevronLeft, ChevronRight, CornerDownRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useTranslation } from 'react-i18next';

interface ReviewSectionProps {
  reviews: Review[];
  rating: number;
  onLeaveReview: () => void;
  onVerifyReview?: (reviewId: string) => void;
  isAdmin?: boolean;
  title?: string;
}

export const ReviewCard: React.FC<{ review: Review; onExpand: (review: Review) => void }> = ({ review, onExpand }) => {
  const { t } = useTranslation();
  return (
    <div 
      className="border border-black p-3 bg-white flex flex-col h-full transition-all hover:shadow-lg cursor-pointer group"
      onClick={() => onExpand(review)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border border-black overflow-hidden bg-gray-50">
            {review.userAvatar ? (
              <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={16} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <div className="text-[10px] font-black uppercase tracking-tighter leading-none">{review.userName}</div>
              {review.isVerified && (
                <ShieldCheck size={10} className="text-green-600" />
              )}
            </div>
            <div className="text-[8px] font-bold opacity-40 uppercase">{review.date}</div>
            {review.planningToLive ? (
              <div className="text-[8px] font-black uppercase text-blue-600 mt-0.5">{t('planning_to_live', 'Собираюсь жить')}</div>
            ) : (review.livedFrom || review.livedTo) && (
              <div className="text-[8px] font-bold opacity-60 uppercase mt-0.5">
                {review.livedFrom ? new Date(review.livedFrom).toLocaleDateString('ru-RU') : '?'} — {review.livedTo ? new Date(review.livedTo).toLocaleDateString('ru-RU') : t('present_time', 'н.в.')}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs font-black">{review.rating}★</div>
      </div>
      
      <p className="text-[11px] font-serif italic leading-snug line-clamp-4 flex-1">
        "{review.comment}"
      </p>

      {review.photos && review.photos.length > 0 && (
        <div className="mt-3 flex gap-1">
          {review.photos.slice(0, 3).map((photo: string, idx: number) => (
            <div key={idx} className="w-8 h-8 border border-black overflow-hidden bg-gray-100 flex-shrink-0">
              <img src={photo} alt="Review" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ))}
          {review.photos && review.photos.length > 3 && (
            <div className="w-8 h-8 border border-black flex items-center justify-center text-[8px] font-black bg-gray-50">
              +{review.photos.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, rating, onLeaveReview, onVerifyReview, isAdmin, title }) => {
  const { t } = useTranslation();
  const displayTitle = title || t('reviews', 'Отзывы');
  const [reviewFilter, setReviewFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'best' | 'worst'>('newest');
  const [expandedReview, setExpandedReview] = useState<Review | null>(null);
  const [reviewActiveImage, setReviewActiveImage] = useState<string | null>(null);

  const filteredReviews = useMemo(() => {
    let filtered = reviews.filter(r => 
      reviewFilter === 'all' ? true : r.rating === reviewFilter
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest' || sortBy === 'oldest') {
        const dateA = a.date.split('.').reverse().join('-');
        const dateB = b.date.split('.').reverse().join('-');
        const timeA = new Date(dateA).getTime();
        const timeB = new Date(dateB).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      } else {
        return sortBy === 'best' ? b.rating - a.rating : a.rating - b.rating;
      }
    });
  }, [reviews, reviewFilter, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-2 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-1.5">
            <MessageSquare size={18} /> {title}
          </h2>
          <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 border border-black/10">
            <Star size={10} className="fill-black text-black" />
            <span className="text-xs font-black">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <button 
            onClick={onLeaveReview}
            className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-[#7a1b1b] transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-[inset_0_0_0_2px_#000] active:translate-x-[2px] active:translate-y-[2px] shrink-0"
          >
            <Edit3 size={12} />
            {t('leave_review', 'Оставить отзыв')}
          </button>
          <div className="flex items-center gap-0.5 border border-black p-0.5 bg-white shrink-0">
            <button 
              onClick={() => setSortBy('newest')}
              className={`px-2 py-0.5 text-[9px] font-black uppercase transition-all ${sortBy === 'newest' ? 'bg-[#dc2626] text-white' : 'text-black hover:bg-[#dc2626] hover:text-white'}`}
            >
              {t('newest', 'Новые')}
            </button>
            <button 
              onClick={() => setSortBy('oldest')}
              className={`px-2 py-0.5 text-[9px] font-black uppercase transition-all ${sortBy === 'oldest' ? 'bg-[#dc2626] text-white' : 'text-black hover:bg-[#dc2626] hover:text-white'}`}
            >
              {t('oldest', 'Старые')}
            </button>
            <button 
              onClick={() => setSortBy('best')}
              className={`px-2 py-0.5 text-[9px] font-black uppercase transition-all ${sortBy === 'best' ? 'bg-[#dc2626] text-white' : 'text-black hover:bg-[#dc2626] hover:text-white'}`}
            >
              {t('best', 'Лучшие')}
            </button>
            <button 
              onClick={() => setSortBy('worst')}
              className={`px-2 py-0.5 text-[9px] font-black uppercase transition-all ${sortBy === 'worst' ? 'bg-[#dc2626] text-white' : 'text-black hover:bg-[#dc2626] hover:text-white'}`}
            >
              {t('worst', 'Худшие')}
            </button>
          </div>
        </div>
      </div>

      {filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onExpand={(r) => {
                setExpandedReview(r);
                if (r.photos && r.photos.length > 0) setReviewActiveImage(r.photos[0]);
                else if (r.ownerResponse?.photos && r.ownerResponse.photos.length > 0) setReviewActiveImage(r.ownerResponse.photos[0]);
                else setReviewActiveImage(null);
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-gray-300">
          <p className="text-xs font-bold uppercase opacity-50">
            {reviewFilter === 'all' ? t('no_reviews_yet', 'Отзывов пока нет. Будьте первым!') : `${t('no_reviews_with_rating', 'Отзывов с оценкой')} ${reviewFilter} ${t('not_found', 'не найдено.')}`}
          </p>
          {reviewFilter !== 'all' && (
            <button 
              onClick={() => setReviewFilter('all')}
              className="mt-2 text-[10px] font-black uppercase underline btn-newspaper-hover px-2"
            >
              {t('reset_filter', 'Сбросить фильтр')}
            </button>
          )}
        </div>
      )}

      {/* Expanded Review Modal */}
      <AnimatePresence>
        {expandedReview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setExpandedReview(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setExpandedReview(null)}
                className="absolute top-4 right-4 z-10 bg-black text-white p-2 btn-newspaper-hover transition-all"
              >
                <X size={24} />
              </button>

              {/* Left Side: Gallery */}
              <div className="w-full md:w-1/2 bg-gray-100 border-b-4 md:border-b-0 md:border-r-4 border-black relative aspect-square md:aspect-auto">
                {reviewActiveImage ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-grow relative overflow-hidden group">
                      <img 
                        src={reviewActiveImage} 
                        alt="Review detail" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Gallery Navigation */}
                      {[...(expandedReview.photos || []), ...(expandedReview.ownerResponse?.photos || [])].length > 1 && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const photos = [...(expandedReview.photos || []), ...(expandedReview.ownerResponse?.photos || [])];
                              const idx = photos.indexOf(reviewActiveImage);
                              setReviewActiveImage(photos[(idx - 1 + photos.length) % photos.length]);
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black text-white p-2 btn-newspaper-hover transition-all"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const photos = [...(expandedReview.photos || []), ...(expandedReview.ownerResponse?.photos || [])];
                              const idx = photos.indexOf(reviewActiveImage);
                              setReviewActiveImage(photos[(idx + 1) % photos.length]);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white p-2 btn-newspaper-hover transition-all"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Thumbnails */}
                    <div className="flex gap-2 p-4 overflow-x-auto bg-white border-t-4 border-black scrollbar-hide">
                      {[...(expandedReview.photos || []), ...(expandedReview.ownerResponse?.photos || [])].map((photo, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setReviewActiveImage(photo)}
                          className={`flex-shrink-0 w-16 h-16 border-2 transition-all btn-newspaper-hover ${reviewActiveImage === photo ? 'border-black scale-105' : 'border-black/10 opacity-50'}`}
                        >
                          <img src={photo} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 min-h-[300px]">
                    <div className="text-center opacity-20">
                      <User size={64} className="mx-auto mb-2" />
                      <span className="text-xs font-black uppercase">{t('no_photo', 'Нет фото')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Content */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 border-2 border-black overflow-hidden bg-gray-100">
                        {expandedReview.userAvatar ? (
                          <img src={expandedReview.userAvatar} alt={expandedReview.userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black uppercase tracking-tighter leading-none">{expandedReview.userName}</h3>
                          {expandedReview.isVerified && (
                            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 border border-green-200 rounded-full">
                              <ShieldCheck size={12} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">{t('verified', 'Проверено')}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                className={i < expandedReview.rating ? 'fill-black text-black' : 'text-gray-300'} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest border-l border-black/10 pl-2">
                            {expandedReview.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedReview.planningToLive ? (
                    <div className="inline-block px-2 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
                      {t('planning_to_live', 'Собираюсь жить')}
                    </div>
                  ) : (expandedReview.livedFrom || expandedReview.livedTo) && (
                    <div className="inline-block px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest">
                      {t('period', 'Период:')} {expandedReview.livedFrom ? new Date(expandedReview.livedFrom).toLocaleDateString('ru-RU') : '?'} — {expandedReview.livedTo ? new Date(expandedReview.livedTo).toLocaleDateString('ru-RU') : t('present_time', 'н.в.')}
                    </div>
                  )}

                  {expandedReview.stayDuration && (
                    <div className="inline-block px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest">
                      {t('duration', 'Срок:')} {expandedReview.stayDuration}
                    </div>
                  )}

                  <div className="relative">
                    <span className="absolute -left-4 -top-2 text-4xl font-serif opacity-10">"</span>
                    <p className="text-lg font-serif italic leading-relaxed text-gray-800">
                      {expandedReview.comment}
                    </p>
                    <span className="absolute -right-2 -bottom-4 text-4xl font-serif opacity-10">"</span>
                  </div>

                  {isAdmin && expandedReview.contractUrl && !expandedReview.isVerified && (
                    <div className="bg-blue-50 border-2 border-blue-200 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-blue-700 font-black uppercase text-[10px]">
                        <ShieldCheck size={16} /> {t('admin_panel_contract_check', 'Админ-панель: Проверка договора')}
                      </div>
                      <p className="text-[11px] text-blue-600">
                        {t('user_attached_contract', 'Пользователь прикрепил договор аренды. Проверьте его и подтвердите подлинность отзыва.')}
                      </p>
                      <div className="flex gap-2">
                        <a 
                          href={expandedReview.contractUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 bg-white border border-blue-300 text-blue-700 py-2 text-[10px] font-black uppercase text-center hover:bg-blue-100 transition-all"
                        >
                          {t('open_contract', 'Открыть договор')}
                        </a>
                        <button 
                          onClick={() => {
                            if (onVerifyReview) {
                              onVerifyReview(expandedReview.id);
                              setExpandedReview({ ...expandedReview, isVerified: true });
                            }
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 text-[10px] font-black uppercase hover:bg-blue-700 transition-all"
                        >
                          {t('verify', 'Подтвердить')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {expandedReview.ownerResponse && (
                  <div className="mt-auto pt-6 border-t-2 border-black/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter text-archive-blue">
                        <CornerDownRight size={16} /> {t('owner_response', 'Ответ владельца')}
                      </div>
                      <div className="text-[10px] font-bold opacity-30 uppercase">{expandedReview.ownerResponse.date}</div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-gray-700 bg-archive-blue/5 p-4 border-l-4 border-archive-blue">
                      {expandedReview.ownerResponse.comment}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
