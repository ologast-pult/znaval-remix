import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Globe, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ContactsContent {
  title: string;
  back: string;
  getInTouch: string;
  description: string;
  emailLabel: string;
  emailValue: string;
  phoneLabel: string;
  phoneValue: string;
  addressLabel: string;
  addressValue: string;
  socialLabel: string;
  hoursLabel: string;
  hoursWeekdays: string;
  hoursWeekends: string;
  footerNote: string;
}

const contentByLang: Record<string, ContactsContent> = {
  ru: {
    title: "Контакты",
    back: "Назад",
    getInTouch: "Свяжитесь с нами",
    description: "Если у вас есть вопросы, предложения или вы хотите сообщить о проблеме, пожалуйста, свяжитесь с нами любым удобным для вас способом.",
    emailLabel: "Электронная почта",
    emailValue: "support@znaval.archive",
    phoneLabel: "Телефон",
    phoneValue: "+420 777 123 456 / +7 (999) 123-45-67",
    addressLabel: "Адрес",
    addressValue: "Praha, Česká republika / г. Москва",
    socialLabel: "Социальные сети",
    hoursLabel: "Режим работы",
    hoursWeekdays: "Понедельник — Пятница: 10:00 – 19:00",
    hoursWeekends: "Суббота — Воскресенье: Выходной",
    footerNote: "ZNAVAL ARCHIVE — Мы всегда на связи."
  },
  en: {
    title: "Contacts",
    back: "Back",
    getInTouch: "Get in Touch",
    description: "If you have questions, suggestions, or need assistance, please feel free to contact our support team using any of the channels below.",
    emailLabel: "Email Address",
    emailValue: "support@znaval.archive",
    phoneLabel: "Phone Number",
    phoneValue: "+420 777 123 456 / +7 (999) 123-45-67",
    addressLabel: "Office Location",
    addressValue: "Prague, Czech Republic / Moscow",
    socialLabel: "Social Networks",
    hoursLabel: "Working Hours",
    hoursWeekdays: "Monday — Friday: 10:00 – 19:00 (CET)",
    hoursWeekends: "Saturday — Sunday: Closed",
    footerNote: "ZNAVAL ARCHIVE — We are always here to help."
  },
  cs: {
    title: "Kontakty",
    back: "Zpět",
    getInTouch: "Kontaktujte nás",
    description: "Máte-li jakékoli dotazy, návrhy na zlepšení nebo potřebujete podporu, neváhejte se na nás obrátit kterýmkoli z uvedených způsobů.",
    emailLabel: "E-mailová adresa",
    emailValue: "support@znaval.archive",
    phoneLabel: "Telefonní číslo",
    phoneValue: "+420 777 123 456",
    addressLabel: "Sídlo kanceláře",
    addressValue: "Praha, Česká republika",
    socialLabel: "Sociální sítě",
    hoursLabel: "Provozní doba",
    hoursWeekdays: "Pondělí — Pátek: 10:00 – 19:00",
    hoursWeekends: "Sobota — Neděle: Zavřeno",
    footerNote: "ZNAVAL ARCHIVE — Jsme vám kdykoliv k dispozici."
  }
};

export const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('cs') 
    ? 'cs' 
    : i18n.language?.startsWith('en') 
      ? 'en' 
      : 'ru';

  const content = contentByLang[currentLang] || contentByLang.ru;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/${currentLang}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto p-6 bg-white border-2 border-black my-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-[#7a1b1b]" size={32} />
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">{content.title}</h1>
        </div>
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 border-2 border-black font-bold uppercase text-xs hover:bg-black hover:text-white transition-all active:translate-x-1 active:translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft size={16} />
          {content.back}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-black uppercase tracking-tight">{content.getInTouch}</h2>
          <p className="font-serif text-gray-800 leading-relaxed text-sm sm:text-base">
            {content.description}
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border-2 border-black bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Mail className="text-[#7a1b1b] shrink-0" size={24} />
              <div>
                <h3 className="font-black uppercase text-xs tracking-wider">{content.emailLabel}</h3>
                <a href={`mailto:${content.emailValue}`} className="text-sm font-semibold text-gray-800 hover:text-[#7a1b1b] underline">
                  {content.emailValue}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border-2 border-black bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Phone className="text-[#7a1b1b] shrink-0" size={24} />
              <div>
                <h3 className="font-black uppercase text-xs tracking-wider">{content.phoneLabel}</h3>
                <p className="text-sm font-semibold text-gray-800">{content.phoneValue}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border-2 border-black bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <MapPin className="text-[#7a1b1b] shrink-0" size={24} />
              <div>
                <h3 className="font-black uppercase text-xs tracking-wider">{content.addressLabel}</h3>
                <p className="text-sm font-semibold text-gray-800">{content.addressValue}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-black uppercase tracking-tight">{content.socialLabel}</h2>
          <div className="grid grid-cols-2 gap-4">
            <a 
              href="https://znaval.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center justify-center p-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all active:translate-x-1 active:translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Globe size={32} className="mb-2" />
              <span className="font-black uppercase text-xs tracking-wider">Website</span>
            </a>
            <a 
              href="https://t.me" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center justify-center p-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all active:translate-x-1 active:translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <MessageSquare size={32} className="mb-2" />
              <span className="font-black uppercase text-xs tracking-wider">Telegram</span>
            </a>
          </div>

          <div className="p-6 border-2 border-black bg-[#7a1b1b] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} />
              <h3 className="font-black uppercase tracking-wider text-sm">{content.hoursLabel}</h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold opacity-95 leading-relaxed">
              {content.hoursWeekdays}<br />
              {content.hoursWeekends}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t-2 border-black text-center">
        <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">
          {content.footerNote}
        </p>
      </div>
    </motion.div>
  );
};
