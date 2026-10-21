import React, { useState, useEffect } from 'react';
import { X, Camera, Trash2, History, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Review, ReviewEdit } from '../types';
import { Modal } from './Modal';

import { useTranslation } from 'react-i18next';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id' | 'date'>) => void;
  initialReview?: Review;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, initialReview }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(initialReview?.rating || 5);
  const [comment, setComment] = useState(initialReview?.comment || '');
  const [customName, setCustomName] = useState(initialReview?.customName || '');
  const [isAnonymous, setIsAnonymous] = useState(initialReview?.isAnonymous || false);
  const [livedFrom, setLivedFrom] = useState(initialReview?.livedFrom || '');
  const [livedTo, setLivedTo] = useState(initialReview?.livedTo || '');
  const [planningToLive, setPlanningToLive] = useState(initialReview?.planningToLive || false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<string[]>(initialReview?.photos || []);
  const [showHistory, setShowHistory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen && !initialReview) {
      setRating(5);
      setComment('');
      setCustomName('');
      setIsAnonymous(false);
      setLivedFrom('');
      setLivedTo('');
      setPlanningToLive(false);
      setPhotos([]);
      setContractFile(null);
      setExistingPhotos([]);
      setShowHistory(false);
    }
  }, [isOpen, initialReview]);

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setComment(initialReview.comment);
      setExistingPhotos(initialReview.photos || []);
      setLivedFrom(initialReview.livedFrom || '');
      setLivedTo(initialReview.livedTo || '');
      setPlanningToLive(initialReview.planningToLive || false);
      setCustomName(initialReview.customName || '');
      setIsAnonymous(initialReview.isAnonymous || false);
    }
  }, [initialReview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)]);
    }
  };

  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContractFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      // Firebase upload functionality is currently disabled.
      // In a real application, you would upload files to your storage solution here.
      
      onSubmit({
        userName: isAnonymous ? t('anonymous_user', 'Анонимный пользователь') : (customName || t('user', 'User')),
        rating,
        comment,
        isAnonymous,
        customName,
        livedFrom: planningToLive ? undefined : livedFrom,
        livedTo: planningToLive ? undefined : livedTo,
        planningToLive,
        photos: [...existingPhotos], // Only existing photos for now
        contractUrl: initialReview?.contractUrl, // Keep existing contract URL
        isVerified: false, // Initially false, admin will verify
        updatedAt: new Date().toISOString(),
        editHistory: initialReview ? [...(initialReview.editHistory || []), { date: new Date().toISOString(), comment: initialReview.comment }] : undefined
      });
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(t('error_adding', 'Ошибка при добавлении записи'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialReview ? t('edit_record', 'Редактировать запись') : t('new_record', 'Новая запись в архив')}
    >
      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">{t('object_rating', 'Рейтинг объекта')}</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={() => setRating(star)} 
                className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-all ${star <= rating ? 'bg-yellow-400 text-black' : 'bg-white text-gray-300 hover:bg-gray-50'}`}
              >
                <span className="text-xl font-black">★</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">{t('your_name_nickname', 'Ваше имя / Никнейм')}</label>
          <div className="space-y-3">
            <input 
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              disabled={isAnonymous}
              placeholder={t('enter_name_placeholder', 'Введите ваше имя или псевдоним')}
              className={`w-full border-2 border-black p-3 text-xs font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-black/5 ${isAnonymous ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 border-2 border-black transition-all ${isAnonymous ? 'bg-black' : 'bg-white'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 border border-black transition-all ${isAnonymous ? 'translate-x-5 bg-white' : 'bg-black'}`} />
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{t('publish_anonymously', 'Опубликовать анонимно')}</span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">{t('living_period', 'Период проживания')}</label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1 block">{t('from_date', 'С')}</label>
                <input 
                  type="date"
                  value={livedFrom}
                  onChange={(e) => setLivedFrom(e.target.value)}
                  disabled={planningToLive}
                  className={`w-full border-2 border-black p-2 text-xs font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-black/5 ${planningToLive ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1 block">{t('to_date', 'По')}</label>
                <input 
                  type="date"
                  value={livedTo}
                  onChange={(e) => setLivedTo(e.target.value)}
                  disabled={planningToLive}
                  className={`w-full border-2 border-black p-2 text-xs font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-black/5 ${planningToLive ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={planningToLive}
                  onChange={(e) => setPlanningToLive(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 border-2 border-black transition-all ${planningToLive ? 'bg-black' : 'bg-white'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 border border-black transition-all ${planningToLive ? 'translate-x-5 bg-white' : 'bg-black'}`} />
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{t('planning_to_live', 'Собираюсь жить')}</span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">{t('your_review', 'Ваш отзыв')}</label>
          <textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('review_placeholder', 'Опишите ваш опыт проживания, состояние объекта, работу риелтора...')}
            className="w-full border-2 border-black p-4 text-sm font-serif italic bg-gray-50 outline-none focus:ring-2 focus:ring-black/5"
            rows={5}
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">{t('photo_proofs', 'Фотодоказательства')}</label>
          <div className="flex gap-3 mt-2 flex-wrap">
            {existingPhotos.map((url, idx) => (
              <div key={idx} className="relative group">
                <img src={url} alt="Review" className="w-20 h-20 object-cover border-2 border-black" />
                <button 
                  onClick={() => setExistingPhotos(existingPhotos.filter((_, i) => i !== idx))}
                  className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.map((file, idx) => (
              <div key={idx} className="w-20 h-20 bg-gray-100 flex items-center justify-center border-2 border-black text-[8px] p-2 text-center font-bold relative group">
                {file.name.slice(0, 15)}...
                <button 
                  onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                  className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 border-2 border-dashed border-black flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all bg-white">
              <Camera size={24} className="opacity-40" />
              <span className="text-[8px] font-black uppercase mt-1">{t('add', 'Добавить')}</span>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-800 mb-1">{t('review_verification', 'Верификация отзыва')}</h4>
              <p className="text-[9px] font-bold text-blue-600 leading-tight mb-3">
                {t('verification_desc', 'Загрузите договор аренды или документ о праве собственности (никогда не публикуется). После проверки модератором ваш отзыв получит статус "Проверено".')}
              </p>
              
              {contractFile ? (
                <div className="flex items-center justify-between bg-white border border-blue-300 p-2 rounded-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
                    <span className="text-[9px] font-bold truncate">{contractFile.name}</span>
                  </div>
                  <button onClick={() => setContractFile(null)} className="text-red-500 hover:text-red-700">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-700 transition-all active:translate-x-1 active:translate-y-1">
                  <Upload size={14} />
                  {t('upload_contract', 'Загрузить договор')}
                  <input type="file" accept=".pdf,image/*" onChange={handleContractChange} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {initialReview?.editHistory && (
          <button 
            onClick={() => setShowHistory(!showHistory)} 
            className="text-[10px] font-black uppercase flex items-center gap-2 text-gray-400 hover:text-black transition-all"
          >
            <History size={14} /> {t('edit_history', 'История изменений')} ({initialReview.editHistory.length})
          </button>
        )}

        {showHistory && (
          <div className="bg-gray-50 p-4 text-[10px] space-y-3 border-2 border-black max-h-40 overflow-y-auto font-serif italic">
            {initialReview?.editHistory?.map((h, i) => (
              <div key={i} className="border-b border-black/10 pb-2 last:border-0">
                <div className="font-black not-italic mb-1 opacity-40">{new Date(h.date).toLocaleString()}</div>
                <div>{h.comment}</div>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={handleSubmit} 
          disabled={isUploading}
          className={`w-full py-4 font-black uppercase tracking-widest text-sm transition-all border-2 border-black active:translate-x-1 active:translate-y-1 ${isUploading ? 'bg-gray-200 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-[#7a1b1b]'}`}
        >
          {isUploading ? t('uploading', 'Загрузка...') : initialReview ? t('save_changes', 'Сохранить изменения') : t('publish', 'Опубликовать')}
        </button>
      </div>
    </Modal>
  );
};
