import React from 'react';
import { Listing } from '../types';
import { StarRating } from './StarRating';
import { CheckCircle2, ArrowUpDown, AlertTriangle, Share2, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../utils';

interface ListingCardProps {
  listing: Listing;
  onAction: (msg: string) => void;
  onClick: (listing: Listing) => void;
  onToggleComparison?: (id: string) => void;
  isInComparison?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, onAction, onClick, onToggleComparison, isInComparison
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col border border-black p-1 bg-white group transition-all duration-300 h-full cursor-pointer hover:scale-[1.02] hover:z-10"
    >
      {/* Image Section */}
      <div className="relative" onClick={() => onClick(listing)}>
        <div className="halftone-container aspect-[4/3] overflow-hidden bg-black/5">
          <img 
            src={listing.imageUrl || listing.avatarUrl} 
            alt={listing.title} 
            className="w-full h-full object-cover halftone-img transition-all duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}/400/400`;
            }}
          />
        </div>
        {listing.verified && (
          <div className="absolute top-1 left-1 bg-white text-black p-0.5 rounded-full border border-black/10 z-10">
            <CheckCircle2 size={10} />
          </div>
        )}
        
        {onToggleComparison && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleComparison(listing.id);
            }}
            className={`absolute top-1 right-1 p-1 border border-black transition-all ${isInComparison ? 'bg-[#dc2626] text-white' : 'bg-white text-black hover:text-[#dc2626] hover:border-[#dc2626]'}`}
            title={isInComparison ? "Удалить из сравнения" : "Добавить в сравнение"}
          >
            <ArrowUpDown size={10} />
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 mt-2 px-0.5" onClick={() => onClick(listing)}>
        <h3 
          className="text-[10px] font-bold text-archive-blue leading-tight hover:underline cursor-pointer line-clamp-1 transition-colors"
        >
          {listing.title}
        </h3>
        
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-[12px] font-black tracking-tighter">
            {formatPrice(listing.price, listing.transactionType === 'Аренда' ? 'Kč/мес' : 'Kč')}
          </span>
          {(listing.dispozice || listing.area) && (
            <span className="text-[10px] font-black uppercase text-[#dc2626]">
              {listing.dispozice}{listing.dispozice && listing.area ? ' / ' : ''}{listing.area ? `${listing.area} м²` : ''}
            </span>
          )}
          {listing.transactionType && (
            <span className={`text-[8px] font-black uppercase px-1 border border-black ${listing.transactionType === 'Аренда' ? 'bg-yellow-400' : 'bg-emerald-400'}`}>
              {listing.transactionType}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1">
          <span className="text-[9px] font-bold">{listing.rating}★</span>
        </div>

        <p className="text-[9.5px] text-gray-700 leading-snug mt-1.5 line-clamp-3 flex-1 transition-colors">
          {listing.description}
        </p>

        <div className="mt-2 pt-1 border-t border-black/10 flex items-center justify-between transition-colors">
          <span className="text-[8px] uppercase font-mono opacity-60">{listing.category}</span>
          <span className="text-[8px] font-bold opacity-60">{listing.reviewsCount || 0} отз.</span>
        </div>
      </div>
    </motion.div>
  );
};
