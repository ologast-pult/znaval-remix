import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Mail, Globe, Building, User, FileText, Send, Briefcase } from 'lucide-react';
import { Modal } from './Modal';
import { RepresentativeRequest } from '../types';

import { useTranslation } from 'react-i18next';

interface RepresentativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
  targetType: 'listing' | 'estate';
  onSuccess: (msg: string) => void;
}

const RepresentativeModal: React.FC<RepresentativeModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetName,
  targetType,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [role, setRole] = useState<'owner' | 'realtor' | 'developer'>('owner');
  const [company, setCompany] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Functionality disabled
    setTimeout(() => {
        setIsSubmitting(false);
        alert(t('request_send_error', 'Ошибка при отправке заявки. Попробуйте позже.'));
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('i_am_representative', 'Я представитель объекта')}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-amber-50 border-2 border-amber-200 p-4 flex gap-3">
          <ShieldCheck className="text-amber-600 shrink-0" size={20} />
          <p className="text-[11px] font-bold text-amber-900 leading-relaxed uppercase tracking-tight">
            {t('representative_status_desc', 'Статус представителя позволяет редактировать описание и фото объекта после верификации администратором.')}
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest opacity-60">{t('who_are_you', 'Кто вы?')}</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'owner', label: t('owner', 'Владелец'), icon: User },
              { id: 'realtor', label: t('realtor_agent', 'Риелтор / агент'), icon: Briefcase },
              { id: 'developer', label: t('developer_rep', 'Представитель застройщика'), icon: Building }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRole(opt.id as any)}
                className={`flex items-center gap-3 p-3 border-2 transition-all text-left ${
                  role === opt.id 
                    ? 'border-black bg-black text-white' 
                    : 'border-black/10 hover:border-black bg-white text-black'
                }`}
              >
                <opt.icon size={16} />
                <span className="text-xs font-black uppercase tracking-widest">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest opacity-60">{t('company_if_any', 'Компания (если есть)')}</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border-2 border-black text-xs font-bold outline-none focus:bg-gray-50"
                placeholder={t('company_name', 'Название компании')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest opacity-60">{t('contact_email', 'Контактный email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border-2 border-black text-xs font-bold outline-none focus:bg-gray-50"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase tracking-widest opacity-60">{t('website_optional', 'Сайт / ссылка на объект (опционально)')}</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border-2 border-black text-xs font-bold outline-none focus:bg-gray-50"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-1.5 p-4 bg-gray-50 border-2 border-black border-dashed">
          <label className="block text-[10px] font-black uppercase tracking-widest">{t('confirmation_required', 'Подтверждение (обязательно)')}</label>
          <p className="text-[9px] font-bold opacity-60 mb-2 uppercase">{t('provide_official_email', 'Укажите почтовый ящик с официального домена или официальной страницы')}</p>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
            <input
              type="text"
              required
              value={confirmationEmail}
              onChange={(e) => setConfirmationEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border-2 border-black text-xs font-bold outline-none focus:bg-white"
              placeholder="email@official-domain.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-black uppercase tracking-widest opacity-60">{t('comment_optional', 'Комментарий (опционально)')}</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 opacity-30" size={14} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border-2 border-black text-xs font-bold outline-none focus:bg-gray-50 min-h-[80px]"
              placeholder={t('additional_info_admin', 'Дополнительная информация для администратора...')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-[#dc2626] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? t('sending', 'Отправка...') : (
            <>
              <Send size={16} />
              {t('send_request', 'Отправить заявку')}
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};

export default RepresentativeModal;
