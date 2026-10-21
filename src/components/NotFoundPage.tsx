import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Home, FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t, i18n } = useTranslation();

  const currentLang = (lang && ['cs', 'ru', 'en'].includes(lang))
    ? lang 
    : (i18n.language?.startsWith('ru') ? 'ru' : i18n.language?.startsWith('en') ? 'en' : 'cs');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto p-8 my-12 bg-white border-2 border-black text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 border-2 border-black flex items-center justify-center text-[#7a1b1b]">
        <FileQuestion size={36} />
      </div>

      <div className="text-5xl font-black tracking-tighter mb-2">404</div>
      <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-3">
        {t('not_found_title', 'Страница не найдена')}
      </h1>
      <p className="font-serif text-gray-700 text-sm mb-6 max-w-md mx-auto leading-relaxed">
        {t('not_found_desc', 'Запрашиваемая страница не существует или была перемещена.')}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto px-4 py-2 border-2 border-black font-black uppercase text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
        >
          <ArrowLeft size={14} />
          {t('back_btn', 'Назад')}
        </button>
        <button 
          onClick={() => navigate(`/${currentLang}`)}
          className="w-full sm:w-auto px-5 py-2 bg-[#7a1b1b] text-white border-2 border-black font-black uppercase text-xs hover:bg-black transition-all flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <Home size={14} />
          {t('back_to_listings', 'В каталог')}
        </button>
      </div>
    </motion.div>
  );
};
