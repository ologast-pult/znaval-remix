export interface Proof {
  id: string;
  date: string;
  type: 'Photo' | 'Document' | 'Witness' | 'Video' | 'Фото' | 'Документ' | 'Свидетельство' | 'Видео';
  description: string;
}

export interface ReviewEdit {
  date: string;
  comment: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  date: string;
  updatedAt?: string; // Modification date
  rating: number;
  comment: string;
  isAnonymous?: boolean;
  customName?: string;
  photos?: string[];
  stayDuration?: string;
  livedFrom?: string;
  livedTo?: string;
  planningToLive?: boolean;
  editHistory?: ReviewEdit[]; // History of changes
  ownerResponse?: {
    comment: string;
    date: string;
    photos?: string[];
  };
  contractUrl?: string; // URL to the uploaded contract for verification
  isVerified?: boolean; // Whether the review is verified by admin
}

export interface Listing {
  id: string;
  title: string;
  address: string;
  description: string;
  imageUrl?: string; // Changed from avatarUrl to match Firestore
  avatarUrl?: string; // Keep for compatibility if needed
  verified: boolean;
  trustScore: number; // 0-100
  rating: number; // 0-5
  reviewsCount: number;
  proofs: Proof[];
  reviews?: Review[];
  category: string;
  price: number; // Changed to number to match Firestore
  priceDisplay?: string; // For formatted price
  sellerType: 'Owner' | 'Realtor' | 'Владелец' | 'Риелтор' | 'Застройщик' | 'Резидент';
  authorUid?: string;
  createdAt?: any; // Timestamp
  status?: 'active' | 'archived';
  transactionType?: 'Аренда' | 'Покупка';
  coordinates?: {
    lat: number;
    lng: number;
  };
  brandResponse?: {
    company: string;
    status: string;
  };
  galleryUrls?: string[];
  dispozice?: string;
  area?: number;
  stayDuration?: string; // For Резидент type listings
  isClaimed?: boolean;
  claimedBy?: string;
  // New fields
  floor?: number;
  totalFloors?: number;
  propertyType?: 'cooperative' | 'private' | 'share' | 'municipal' | 'custom';
  propertyTypeCustom?: string;
  material?: 'brick' | 'concrete' | 'other' | 'custom';
  materialCustom?: string;
  landType?: 'building' | 'agricultural' | 'custom';
  landTypeCustom?: string;
  commission?: number;
  cadastreUrl?: string;
  representativeUid?: string;
  isVerifiedRepresentative?: boolean;
}

export interface Comparison {
  id: string;
  userUid: string;
  listingIds: string[];
  createdAt: any;
}

export interface EstateRating {
  id: string;
  name: string;
  country: string;
  city: string;
  imageUrl: string;
  averageRating: number;
  totalVotes: number;
  ratingDistribution: Record<number, number>;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  galleryUrls?: string[];
  masterPlanUrl?: string;
  presentationUrl?: string;
  floorPlans?: { title: string; imageUrl: string; area?: string }[];
  isClaimed?: boolean;
  claimedBy?: string;
  websiteUrl?: string;
  reviews?: Review[];
  // New fields
  floor?: number;
  totalFloors?: number;
  propertyType?: 'cooperative' | 'private' | 'share' | 'municipal' | 'custom';
  propertyTypeCustom?: string;
  material?: 'brick' | 'concrete' | 'other' | 'custom';
  materialCustom?: string;
  landType?: 'building' | 'agricultural' | 'custom';
  landTypeCustom?: string;
  commission?: number;
  cadastreUrl?: string;
  representativeUid?: string;
  isVerifiedRepresentative?: boolean;
}

export interface RepresentativeRequest {
  id: string;
  userUid: string;
  userName: string;
  targetId: string; // listingId or estateId
  targetName: string;
  targetType: 'listing' | 'estate';
  role: 'owner' | 'realtor' | 'developer';
  company?: string;
  contactEmail: string;
  website?: string;
  confirmationEmail: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  imageUrl?: string;
}

export interface Poll {
  id: string;
  question: string;
  category: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: any;
}

export interface Category {
  id: string;
  label: string;
  icon: any;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  stats: {
    response?: string;
    statistic?: string;
    slowResponse?: string;
    monitor?: string;
    staritus?: string;
  };
}

export type TrustLevel = 'RISK' | 'MEDIUM' | 'SAFE';

export function getTrustLevel(score: number): TrustLevel {
  if (score < 40) return 'RISK';
  if (score < 75) return 'MEDIUM';
  return 'SAFE';
}

export function getTrustColor(level: TrustLevel): string {
  switch (level) {
    case 'RISK': return 'text-red-600';
    case 'MEDIUM': return 'text-yellow-600';
    case 'SAFE': return 'text-green-600';
  }
}
