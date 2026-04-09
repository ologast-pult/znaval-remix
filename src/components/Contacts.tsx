import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Globe, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Contacts: React.FC = () => {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto p-6 bg-white border-2 border-black my-8"
    >
      <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-[#7a1b1b]" size={32} />
          <h1 className="text-3xl font-black uppercase tracking-tighter">Контакты</h1>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 border-2 border-black font-bold uppercase text-xs hover:bg-black hover:text-white transition-all active:translate-x-1 active:translate-y-1"
        >
          <ArrowLeft size={16} />
          Назад
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-black uppercase mb-4">Свяжитесь с нами</h2>
          <p className="font-serif text-gray-800 leading-relaxed">
            Если у вас есть вопросы, предложения или вы хотите сообщить о проблеме, пожалуйста, свяжитесь с нами любым удобным для вас способом.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border-2 border-black bg-gray-50">
              <Mail className="text-[#7a1b1b] shrink-0" size={24} />
              <div>
                <h3 className="font-bold uppercase text-sm">Электронная почта</h3>
                <p className="text-gray-600">support@znaval.archive</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border-2 border-black bg-gray-50">
              <Phone className="text-[#7a1b1b] shrink-0" size={24} />
              <div>
                <h3 className="font-bold uppercase text-sm">Телефон</h3>
                <p className="text-gray-600">+7 (999) 123-45-67</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border-2 border-black bg-gray-50">
              <MapPin className="text-[#7a1b1b] shrink-0" size={24} />
              <div>
                <h3 className="font-bold uppercase text-sm">Адрес</h3>
                <p className="text-gray-600">г. Москва, ул. Примерная, д. 10, оф. 202</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-black uppercase mb-4">Социальные сети</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="#" className="flex flex-col items-center justify-center p-6 border-2 border-black hover:bg-black hover:text-white transition-all active:translate-x-1 active:translate-y-1">
              <Globe size={32} className="mb-2" />
              <span className="font-bold uppercase text-[10px]">Website</span>
            </a>
            <a href="#" className="flex flex-col items-center justify-center p-6 border-2 border-black hover:bg-black hover:text-white transition-all active:translate-x-1 active:translate-y-1">
              <MessageSquare size={32} className="mb-2" />
              <span className="font-bold uppercase text-[10px]">Telegram</span>
            </a>
          </div>

          <div className="p-6 border-2 border-black bg-[#7a1b1b] text-white">
            <h3 className="font-bold uppercase mb-2">Режим работы</h3>
            <p className="text-sm opacity-90">
              Понедельник — Пятница: 10:00 – 19:00<br />
              Суббота — Воскресенье: Выходной
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t-2 border-black text-center">
        <p className="text-[10px] font-bold uppercase opacity-50">
          ZNAVAL ARCHIVE — Мы всегда на связи.
        </p>
      </div>
    </motion.div>
  );
};
