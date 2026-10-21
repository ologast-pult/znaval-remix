import React, { useState, useEffect } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType, resetUserPassword } from '../lib/firebase';
import { useFirebase } from './FirebaseProvider';
import { Listing, Review } from '../types';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  X, Check, Edit3, Trash2, History, List, MessageSquare, 
  User as UserIcon, Home, Eye, Coins, FileText, Landmark, Smile, Leaf, Key, MapPin, Lock, Globe 
} from 'lucide-react';

interface UserProfileCabinetProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  listings: Listing[];
  onUpdateListings: (listings: Listing[]) => void;
  addToast: (msg: string, type?: 'success' | 'email' | 'error') => void;
}

interface DefaultAvatar {
  id: string;
  nameEn: string;
  nameRu: string;
  nameCs: string;
  type: 'vector' | 'photo';
  url: string;
  bgColor?: string;
  icon?: React.ReactNode;
}

export default function UserProfileCabinet({
  isOpen,
  onClose,
  user,
  listings,
  onUpdateListings,
  addToast
}: UserProfileCabinetProps) {
  const { refreshUser } = useFirebase();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'listings' | 'reviews'>('profile');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(user?.photoURL || '');
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Listing Edit State
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isSavingListing, setIsSavingListing] = useState(false);

  // Initialize form state
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setSelectedAvatarUrl(user.photoURL || '');
      setCustomAvatarFile(null);
      setCustomAvatarPreview(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Compile the 24 Default Avatars
  const defaultAvatars: DefaultAvatar[] = [
    // 12 Stylized Vectors
    { id: 'vec-citizen', nameEn: 'Citizen', nameRu: 'Гражданин', nameCs: 'Občan', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/924/924915.png', bgColor: 'bg-amber-100 border-amber-400 text-amber-700', icon: <Smile size={24} /> },
    { id: 'vec-builder', nameEn: 'Builder', nameRu: 'Застройщик', nameCs: 'Stavitel', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/609/609023.png', bgColor: 'bg-orange-100 border-orange-400 text-orange-700', icon: <Home size={24} /> },
    { id: 'vec-observer', nameEn: 'Observer', nameRu: 'Свидетель', nameCs: 'Svědek', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/159/159604.png', bgColor: 'bg-purple-100 border-purple-400 text-purple-700', icon: <Eye size={24} /> },
    { id: 'vec-expert', nameEn: 'Expert', nameRu: 'Эксперт', nameCs: 'Expert', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/1042/1042340.png', bgColor: 'bg-red-100 border-red-400 text-red-700', icon: <Check size={24} /> },
    { id: 'vec-eco', nameEn: 'Eco Warrior', nameRu: 'Эко-Активист', nameCs: 'Eko-Aktivista', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/626/626013.png', bgColor: 'bg-emerald-100 border-emerald-400 text-emerald-700', icon: <Leaf size={24} /> },
    { id: 'vec-tenant', nameEn: 'Tenant', nameRu: 'Жилец', nameCs: 'Nájemník', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/3075/3075908.png', bgColor: 'bg-blue-100 border-blue-400 text-blue-700', icon: <Key size={24} /> },
    { id: 'vec-investor', nameEn: 'Investor', nameRu: 'Инвестор', nameCs: 'Investor', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/2422/2422831.png', bgColor: 'bg-indigo-100 border-indigo-400 text-indigo-700', icon: <Coins size={24} /> },
    { id: 'vec-realtor', nameEn: 'Realtor', nameRu: 'Риелтор', nameCs: 'Makléř', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/902/902742.png', bgColor: 'bg-pink-100 border-pink-400 text-pink-700', icon: <Landmark size={24} /> },
    { id: 'vec-jurist', nameEn: 'Jurist', nameRu: 'Юрист', nameCs: 'Právník', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/3412/3412862.png', bgColor: 'bg-gray-200 border-gray-400 text-gray-700', icon: <FileText size={24} /> },
    { id: 'vec-historian', nameEn: 'Archivist', nameRu: 'Историк', nameCs: 'Historik', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/2232/2232688.png', bgColor: 'bg-yellow-100 border-yellow-400 text-yellow-700', icon: <History size={24} /> },
    { id: 'vec-global', nameEn: 'Nomad', nameRu: 'Кочевник', nameCs: 'Nomád', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/921/921490.png', bgColor: 'bg-sky-100 border-sky-400 text-sky-700', icon: <Globe size={24} /> },
    { id: 'vec-detective', nameEn: 'Inspector', nameRu: 'Инспектор', nameCs: 'Inspektor', type: 'vector', url: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png', bgColor: 'bg-violet-100 border-violet-400 text-violet-700', icon: <UserIcon size={24} /> },

    // 12 Authentic Photos
    { id: 'ph-guy1', nameEn: 'Milan', nameRu: 'Милан', nameCs: 'Milan', type: 'photo', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-woman1', nameEn: 'Klara', nameRu: 'Клара', nameCs: 'Klára', type: 'photo', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-guy2', nameEn: 'David', nameRu: 'Давид', nameCs: 'David', type: 'photo', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-woman2', nameEn: 'Maria', nameRu: 'Мария', nameCs: 'Marie', type: 'photo', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-guy3', nameEn: 'Antonin', nameRu: 'Антонин', nameCs: 'Antonín', type: 'photo', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-woman3', nameEn: 'Janette', nameRu: 'Жанетта', nameCs: 'Žaneta', type: 'photo', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-guy4', nameEn: 'Petr', nameRu: 'Петр', nameCs: 'Petr', type: 'photo', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-woman4', nameEn: 'Lucie', nameRu: 'Люция', nameCs: 'Lucie', type: 'photo', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-guy5', nameEn: 'Jiri', nameRu: 'Иржи', nameCs: 'Jiří', type: 'photo', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-woman5', nameEn: 'Elena', nameRu: 'Елена', nameCs: 'Elena', type: 'photo', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-guy6', nameEn: 'Tomas', nameRu: 'Томас', nameCs: 'Tomáš', type: 'photo', url: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=150' },
    { id: 'ph-woman6', nameEn: 'Veronika', nameRu: 'Вероника', nameCs: 'Veronika', type: 'photo', url: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=150' },
  ];

  const getAvatarName = (avatar: DefaultAvatar) => {
    if (i18n.language === 'ru') return avatar.nameRu;
    if (i18n.language === 'cs') return avatar.nameCs || avatar.nameEn;
    return avatar.nameEn;
  };

  // Pick or filter User's Listings
  const userListings = listings.filter(l => l.authorUid === user.uid);

  // Extract Reviews written by this User
  const userReviews: { review: Review; listing: Listing }[] = [];
  listings.forEach(listing => {
    if (listing.reviews) {
      listing.reviews.forEach(review => {
        if (review.authorUid === user.uid || (!review.authorUid && review.userName === user.displayName)) {
          userReviews.push({ review, listing });
        }
      });
    }
  });

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomAvatarFile(file);
      setCustomAvatarPreview(URL.createObjectURL(file));
      setSelectedAvatarUrl('');
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      addToast(t('cabinet_name_required', 'Имя не может быть пустым'), 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      let finalPhotoUrl = selectedAvatarUrl;

      // Handle custom file upload first if present
      if (customAvatarFile) {
        if (storage) {
          const avatarRef = ref(storage, `users/${user.uid}/avatar_${Date.now()}`);
          await uploadBytes(avatarRef, customAvatarFile);
          finalPhotoUrl = await getDownloadURL(avatarRef);
        } else {
          finalPhotoUrl = customAvatarPreview || '';
        }
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName,
        photoURL: finalPhotoUrl
      });

      // Update/Saves in Firestore users/{userId}
      if (db) {
        const userPath = `users/${user.uid}`;
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            displayName: displayName,
            photoUrl: finalPhotoUrl
          });
        } catch (fErr) {
          console.error('Failed to sync changes with Firestore users collection:', fErr);
          handleFirestoreError(fErr, OperationType.WRITE, userPath);
        }
      }

      await refreshUser();
      addToast(t('cabinet_profile_updated', 'Профиль успешно обновлен!'));
      setCustomAvatarFile(null);
      setCustomAvatarPreview(null);
    } catch (err: any) {
      addToast(`${t('cabinet_save_error', 'Ошибка сохранения')}: ${err.message}`, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) {
      addToast(t('cabinet_email_not_linked', 'Email адрес не привязан к аккаунту'), 'error');
      return;
    }
    setIsSendingReset(true);
    try {
      await resetUserPassword(user.email);
      setResetSent(true);
      addToast(`${t('cabinet_reset_sent_success', 'Письмо отправлено! Проверьте входящие на')} ${user.email}`, 'success');
    } catch (error: any) {
      console.error('Password reset error:', error);
      addToast(error?.message || t('cabinet_reset_failed', 'Не удалось отправить ссылку для сброса пароля'), 'error');
    } finally {
      setIsSendingReset(false);
    }
  };

  // Listing Deletion
  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm(t('cabinet_confirm_delete_listing', 'Вы действительно хотите архивировать/удалить этот объект?'))) return;
    
    try {
      if (db) {
        await deleteDoc(doc(db, 'listings', listingId));
      }
      onUpdateListings(listings.filter(l => l.id !== listingId));
      addToast(t('cabinet_listing_deleted', 'Объект удален из архива'));
    } catch (err: any) {
      addToast(`${t('cabinet_delete_error', 'Ошибка удаления')}: ${err.message}`, 'error');
    }
  };

  // Review Deletion
  const handleDeleteReview = async (listingId: string, reviewId: string) => {
    if (!window.confirm(t('cabinet_confirm_delete_review', 'Вы действительно хотите удалить свой отзыв?'))) return;

    try {
      const targetListing = listings.find(l => l.id === listingId);
      if (targetListing) {
        const updatedReviews = (targetListing.reviews || []).filter(r => r.id !== reviewId);
        const updatedListing = {
          ...targetListing,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: updatedReviews.length > 0 
            ? Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1))
            : 0
        };

        if (db) {
          await setDoc(doc(db, 'listings', listingId), updatedListing);
        }

        onUpdateListings(listings.map(l => l.id === listingId ? updatedListing : l));
        addToast(t('cabinet_review_deleted', 'Отзыв успешно удален!'));
      }
    } catch (err: any) {
      addToast(`${t('cabinet_delete_error', 'Ошибка удаления')}: ${err.message}`, 'error');
    }
  };

  // Listing Edit Submission
  const handleEditListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    setIsSavingListing(true);
    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);

      const updatedFields: Partial<Listing> = {
        title: formData.get('title') as string,
        price: Number(formData.get('price')),
        description: formData.get('description') as string,
        address: formData.get('address') as string,
        category: formData.get('category') as string,
        dispozice: formData.get('dispozice') as string,
        area: Number(formData.get('area') || '0'),
        sellerType: formData.get('sellerType') as any,
        hasElevator: formData.get('hasElevator') === 'yes',
        updatedAt: new Date().toISOString()
      };

      const updatedListing = {
        ...editingListing,
        ...updatedFields
      };

      if (db) {
        await setDoc(doc(db, 'listings', editingListing.id), updatedListing);
      }

      onUpdateListings(listings.map(l => l.id === editingListing.id ? updatedListing : l));
      addToast(t('cabinet_listing_updated', 'Данные объекта успешно обновлены!'));
      setEditingListing(null);
    } catch (err: any) {
      addToast(`${t('cabinet_save_error', 'Ошибка обновления')}: ${err.message}`, 'error');
    } finally {
      setIsSavingListing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border-4 border-black w-full max-w-5xl h-[750px] max-h-[90vh] flex flex-col font-sans"
      >
        {/* Banner/Header */}
        <div className="p-4 border-b-4 border-black flex justify-between items-center bg-black text-white">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-[#7a1b1b] border-2 border-white rounded-none">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none">{t('my_cabinet', 'Личный кабинет')}</h2>
              <span className="text-[10px] font-bold text-gray-400">{user.email}</span>
            </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-200">
            <X size={24} />
          </button>
        </div>

        {/* Master layout panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Side Tabs navigation */}
          <div className="w-full md:w-1/4 md:min-w-[200px] border-b-2 md:border-b-0 md:border-r-4 border-black flex flex-row md:flex-col overflow-x-auto text-left bg-[#f8f8f8] shrink-0">
            <button 
              onClick={() => { setActiveTab('profile'); setEditingListing(null); }}
              className={`p-3 md:p-4 text-[10px] md:text-[11px] font-black uppercase text-left border-r md:border-r-0 md:border-b border-black flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'profile' ? 'bg-[#7a1b1b] text-white' : 'hover:bg-gray-100 text-black'
              }`}
            >
              <UserIcon size={16} className="shrink-0" />
              <span>{t('cabinet_profile_avatars', 'Профиль & Аватары')}</span>
            </button>
            <button 
              onClick={() => { setActiveTab('listings'); setEditingListing(null); }}
              className={`p-3 md:p-4 text-[10px] md:text-[11px] font-black uppercase text-left border-r md:border-r-0 md:border-b border-black flex items-center justify-between gap-2 whitespace-nowrap transition-all ${
                activeTab === 'listings' ? 'bg-[#7a1b1b] text-white' : 'hover:bg-gray-100 text-black'
              }`}
            >
              <span className="flex items-center gap-2">
                <List size={16} className="shrink-0" />
                <span>{t('cabinet_my_listings', 'Мои Объекты')}</span>
              </span>
              <span className={`px-1.5 py-0.5 text-[8px] font-black ${activeTab === 'listings' ? 'bg-white text-[#7a1b1b]' : 'bg-black text-white'}`}>
                {userListings.length}
              </span>
            </button>
            <button 
              onClick={() => { setActiveTab('reviews'); setEditingListing(null); }}
              className={`p-3 md:p-4 text-[10px] md:text-[11px] font-black uppercase text-left md:border-b border-black flex items-center justify-between gap-2 whitespace-nowrap transition-all ${
                activeTab === 'reviews' ? 'bg-[#7a1b1b] text-white' : 'hover:bg-gray-100 text-black'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={16} className="shrink-0" />
                <span>{t('cabinet_my_reviews', 'Мои Отзывы')}</span>
              </span>
              <span className={`px-1.5 py-0.5 text-[8px] font-black ${activeTab === 'reviews' ? 'bg-white text-[#7a1b1b]' : 'bg-black text-white'}`}>
                {userReviews.length}
              </span>
            </button>

            {/* Quick Summary block (visible on desktop) */}
            <div className="hidden md:block mt-auto p-4 bg-yellow-50 border-t-2 border-black text-[10px] space-y-1.5 font-bold uppercase text-gray-800">
              <div className="text-[11px] font-black border-b border-black pb-1 text-black">{t('cabinet_your_status', 'Ваш статус')}</div>
              <div className="flex justify-between">
                <span>{t('cabinet_verified', 'Проверен')}:</span> 
                <span className={user.emailVerified ? 'text-green-700' : 'text-red-700'}>
                  {user.emailVerified ? t('cabinet_yes', 'ДА') : t('cabinet_no', 'НЕТ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('cabinet_role', 'Роль')}:</span> 
                <span className="text-[#7a1b1b]">{t('cabinet_role_resident', 'РЕЗИДЕНТ')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cabinet_posts_created', 'Создано постов')}:</span>
                <span className="text-black font-black">{userListings.length}</span>
              </div>
            </div>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc]">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="border-b-2 border-dashed border-black pb-4">
                  <h3 className="text-sm font-black uppercase tracking-tight text-black mb-1">{t('cabinet_edit_credentials', 'Редактировать учетные данные')}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{t('cabinet_edit_credentials_desc', 'Обновите ваши публичные данные для отзывов и публикации недвижимости')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Public fields */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1.5">{t('cabinet_your_name_label', 'Ваше Имя / Никнейм (Отображается публично)')}</label>
                      <input 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t('cabinet_your_name_placeholder', 'Напр. Владимир Н.')}
                        className="w-full border-2 border-black p-2 bg-white text-xs font-bold text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1.5">{t('cabinet_email_label', 'Электронная почта (Нельзя изменить)')}</label>
                      <div className="w-full border border-gray-300 p-2 bg-gray-50 text-xs font-bold text-gray-500 select-none flex justify-between items-center">
                        <span>{user.email}</span>
                        <Lock size={14} className="opacity-50" />
                      </div>
                    </div>

                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="btn-newspaper btn-red px-6 py-2.5 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingProfile ? t('cabinet_saving', 'Сохранение...') : t('cabinet_save_changes', 'Сохранить изменения')}
                    </button>

                    {/* Security & Password Reset */}
                    <div className="pt-4 border-t-2 border-dashed border-gray-200 mt-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Key size={13} className="text-[#7a1b1b]" />
                        <span className="text-[10px] font-black uppercase text-black">{t('security_password', 'Безопасность и пароль')}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2.5 leading-relaxed">
                        {t('cabinet_security_password_desc', 'Вы можете в любой момент изменить или сбросить пароль от вашей учетной записи. Защищенная ссылка будет выслана на ваш email')} <strong>{user.email}</strong>.
                      </p>
                      
                      {resetSent ? (
                        <div className="p-2.5 border-2 border-emerald-600 bg-emerald-50 text-emerald-950 text-xs flex items-center gap-2">
                          <Check size={14} className="text-emerald-700 flex-shrink-0" />
                          <span className="text-[10px] font-bold">
                            {t('cabinet_reset_sent_success', 'Письмо отправлено! Проверьте входящие на')} {user.email}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendPasswordReset}
                          disabled={isSendingReset}
                          className="border-2 border-black bg-white hover:bg-black hover:text-white px-3.5 py-2 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Lock size={12} />
                          <span>{isSendingReset ? t('cabinet_sending_reset', 'Отправка ссылки...') : t('cabinet_send_reset_btn', 'Отправить ссылку для смены пароля')}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Current Active Avatar view */}
                  <div className="flex flex-col items-center justify-center border-2 border-black p-4 bg-white">
                    <span className="text-[9px] font-black uppercase tracking-widest text-black mb-2">{t('cabinet_current_avatar', 'Текущая аватарка')}</span>
                    {customAvatarPreview ? (
                      <img src={customAvatarPreview} alt="Preview" className="w-24 h-24 border-2 border-black object-cover" />
                    ) : selectedAvatarUrl ? (
                      <div className="relative">
                        <img src={selectedAvatarUrl} alt="Avatar" className="w-24 h-24 border-2 border-black object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-black bg-gray-100 flex items-center justify-center text-gray-400">
                        <UserIcon size={40} />
                      </div>
                    )}

                    {/* File uploading triggers */}
                    <div className="mt-4 w-full">
                      <label className="block text-center bg-black hover:bg-gray-800 text-white text-[9px] font-black uppercase py-1.5 border-2 border-black cursor-pointer tracking-wider">
                        {t('cabinet_upload_photo', 'Загрузить фото')}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarFileChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Grid of default standard avatars */}
                <div className="mt-6">
                  <div className="border-b border-black pb-2 mb-4 flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-black">{t('cabinet_choose_avatar_title', 'Выберите из 24 фирменных аватаров')}</span>
                    <span className="text-[8px] font-black bg-yellow-400 text-black px-1.5 py-0.5">{t('cabinet_new_sets', 'НОВЫЕ ПОДБОРКИ')}</span>
                  </div>

                  <div className="space-y-6">
                    {/* Vector avatars */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[#7a1b1b] mb-2.5">{t('cabinet_vector_emblems', 'Векторные Эмблемы ("ZNAVAL" стиль)')}</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
                        {defaultAvatars.filter(a => a.type === 'vector').map(avatar => {
                          const isSelected = selectedAvatarUrl === avatar.url && !customAvatarPreview;
                          const name = getAvatarName(avatar);
                          return (
                            <button
                              key={avatar.id}
                              onClick={() => {
                                setSelectedAvatarUrl(avatar.url);
                                setCustomAvatarFile(null);
                                setCustomAvatarPreview(null);
                              }}
                              title={name}
                              className={`aspect-square flex flex-col items-center justify-center border-2 transition-all p-1.5 active:scale-95 ${
                                isSelected ? 'border-[#7a1b1b] ring-2 ring-[#7a1b1b] scale-105 bg-red-50' : 'border-gray-200 bg-white hover:border-black'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-none border flex items-center justify-center ${avatar.bgColor}`}>
                                {avatar.icon}
                              </div>
                              <span className="text-[6.5px] font-black uppercase tracking-tight mt-1 text-center truncate w-full text-black">
                                {name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Photo avatars */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[#7a1b1b] mb-2.5">{t('cabinet_photo_portraits', 'Художественные Портреты (Unsplash)')}</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
                        {defaultAvatars.filter(a => a.type === 'photo').map(avatar => {
                          const isSelected = selectedAvatarUrl === avatar.url && !customAvatarPreview;
                          const name = getAvatarName(avatar);
                          return (
                            <button
                              key={avatar.id}
                              onClick={() => {
                                setSelectedAvatarUrl(avatar.url);
                                setCustomAvatarFile(null);
                                setCustomAvatarPreview(null);
                              }}
                              title={name}
                              className={`aspect-square flex flex-col items-center justify-center border-2 transition-all p-0.5 active:scale-95 ${
                                isSelected ? 'border-[#7a1b1b] ring-2 ring-[#7a1b1b] scale-105' : 'border-gray-200 bg-white hover:border-black'
                              }`}
                            >
                              <img src={avatar.url} alt={name} className="w-8 h-8 object-cover border border-black" />
                              <span className="text-[6.5px] font-bold uppercase mt-1 text-center truncate w-full text-gray-700">
                                {name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                {!editingListing ? (
                  <div className="space-y-4">
                    <div className="border-b-2 border-dashed border-black pb-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-black mb-1">{t('cabinet_manage_listings', 'Управление объявлениями')}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{t('cabinet_manage_listings_desc', 'Просматривайте, редактируйте или архивируйте объекты, добавленные вами')}</p>
                      </div>
                    </div>

                    {userListings.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-black bg-white">
                        <Home size={36} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs font-black uppercase text-gray-400">{t('cabinet_no_listings', 'Вы еще не добавили ни одного объекта недвижимости')}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {userListings.map(listing => (
                          <div key={listing.id} className="border-2 border-black bg-white p-4 flex gap-4 items-start hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <img 
                              src={listing.imageUrl || listing.avatarUrl || 'https://picsum.photos/seed/listing/400/300'} 
                              alt={listing.title} 
                              className="w-20 h-20 object-cover border border-black flex-shrink-0" 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-black text-white px-1.5 py-0.5 text-[8px] font-black uppercase">
                                  {listing.category}
                                </span>
                                {listing.verified ? (
                                  <span className="bg-green-600 text-white px-1.5 py-0.5 text-[8px] font-black uppercase">{t('cabinet_status_verified', 'Проверен')}</span>
                                ) : (
                                  <span className="bg-amber-500 text-black px-1.5 py-0.5 text-[8px] font-black uppercase">{t('cabinet_status_pending', 'Ожидает проверки')}</span>
                                )}
                              </div>
                              <h4 className="text-xs font-black uppercase text-black mb-1 truncate">{listing.title}</h4>
                              <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <MapPin size={10} /> {listing.address}
                              </p>
                              <p className="text-xs font-black text-[#7a1b1b] mt-1.5">
                                {listing.price.toLocaleString()} Kč
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => setEditingListing(listing)}
                                className="border border-black p-1.5 h-8 w-8 hover:bg-black hover:text-white flex items-center justify-center transition-all bg-[#f8f8f8]"
                                title={t('cabinet_edit', 'Редактировать')}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteListing(listing.id)}
                                className="border border-black p-1.5 h-8 w-8 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all bg-[#f8f8f8]"
                                title={t('cabinet_delete', 'Удалить')}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Edit form inside Cabinet
                  <div className="space-y-4">
                    <div className="border-b border-black pb-2 flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-black">{t('cabinet_editing_object', 'Редактирование объекта')}: {editingListing.title}</span>
                      <button 
                        onClick={() => setEditingListing(null)}
                        className="text-[10px] font-black uppercase hover:underline"
                      >
                        {t('cabinet_go_back', 'Вернуться назад')}
                      </button>
                    </div>

                    <form onSubmit={handleEditListingSubmit} className="space-y-3 bg-white border-2 border-black p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1">{t('title', 'Название')}</label>
                          <input name="title" required type="text" defaultValue={editingListing.title} className="w-full border border-black p-1 bg-transparent text-xs text-black font-semibold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1">{t('price', 'Цена')} (Kč)</label>
                          <input name="price" required type="number" defaultValue={editingListing.price} className="w-full border border-black p-1 bg-transparent text-xs text-black font-semibold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1">{t('category', 'Категория')}</label>
                          <input name="category" required type="text" defaultValue={editingListing.category} className="w-full border border-black p-1 bg-transparent text-xs text-black font-semibold animate-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1">{t('address', 'Адрес объекта')}</label>
                          <input name="address" required type="text" defaultValue={editingListing.address} className="w-full border border-black p-1 bg-transparent text-xs text-black font-semibold animate-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1">{t('rooms_dispozice', 'Количество комнат (Dispozice)')}</label>
                          <input name="dispozice" type="text" defaultValue={editingListing.dispozice || '2+kk'} className="w-full border border-black p-1 bg-transparent text-xs text-black font-semibold animate-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1">{t('area_sqm', 'Площадь (м²)')}</label>
                          <input name="area" type="number" defaultValue={editingListing.area || 0} className="w-full border border-black p-1 bg-transparent text-xs text-black font-semibold animate-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1">{t('seller_type', 'Тип продавца')}</label>
                          <select name="sellerType" defaultValue={editingListing.sellerType} className="w-full border border-black p-1 bg-transparent text-xs text-black font-semibold animate-none">
                            <option value="Владелец">{t('owner', 'Владелец')}</option>
                            <option value="Риелтор">{t('realtor', 'Риелтор')}</option>
                            <option value="Резидент">{t('znaval', 'Резидент')}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1">{t('elevator', 'Наличие лифта')}</label>
                          <select name="hasElevator" defaultValue={editingListing.hasElevator ? 'yes' : 'no'} className="w-full border border-black p-1 bg-transparent text-xs text-black font-semibold animate-none">
                            <option value="yes">{t('cabinet_has_elevator_yes', 'Есть лифт')}</option>
                            <option value="no">{t('cabinet_has_elevator_no', 'Нет лифта')}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">{t('description', 'Подробное описание объекта')}</label>
                        <textarea name="description" rows={3} defaultValue={editingListing.description || ''} className="w-full border border-black p-1.5 bg-transparent text-xs text-black font-semibold" />
                      </div>

                      <div className="flex gap-2">
                        <button 
                          type="submit" 
                          disabled={isSavingListing}
                          className="btn-newspaper btn-red px-5 py-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                          {isSavingListing ? t('cabinet_saving', 'Сохранение...') : t('cabinet_save_changes', 'Сохранить изменения')}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setEditingListing(null)}
                          className="border border-black px-5 py-2 text-[10px] font-black uppercase hover:bg-gray-100"
                        >
                          {t('cabinet_cancel', 'Отмена')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="border-b-2 border-dashed border-black pb-4">
                  <h3 className="text-sm font-black uppercase tracking-tight text-black mb-1">{t('cabinet_reviews_history', 'Моя история рецензий')}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{t('cabinet_reviews_history_desc', 'Вся история оставленных вами отзывов о жилье на площадке')}</p>
                </div>

                {userReviews.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-black bg-white">
                    <MessageSquare size={36} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs font-black uppercase text-gray-400">{t('cabinet_no_reviews', 'Вы пока не оставили ни одного экспертного отзыва')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {userReviews.map(({ review, listing }) => (
                      <div key={review.id} className="border-2 border-black bg-white p-4 space-y-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                          <div>
                            <span className="text-[8px] font-black bg-black text-white px-1.5 py-0.5 uppercase tracking-wider">
                              {t('cabinet_review_for_object', 'Отзыв к объекту')}
                            </span>
                            <h4 className="text-xs font-black uppercase text-black mt-1">{listing.title}</h4>
                            <span className="text-[8px] font-bold text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-100 border border-yellow-400 text-yellow-800 px-2 py-0.5 text-xs font-black">
                            ★ {review.rating} / 5
                          </div>
                        </div>

                        <p className="text-xs font-bold text-gray-700 italic">
                          "{review.comment}"
                        </p>

                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400">
                          <span>{t('cabinet_review_status', 'Статус')}: {review.isVerified ? t('cabinet_review_verified', '✓ Проверен') : t('cabinet_review_pending', 'Ожидает одобрения модератором')}</span>
                          <button 
                            onClick={() => handleDeleteReview(listing.id, review.id)}
                            className="text-[9px] font-black uppercase text-red-600 hover:underline flex items-center gap-1"
                          >
                            <Trash2 size={10} /> {t('cabinet_delete_review', 'Удалить отзыв')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
