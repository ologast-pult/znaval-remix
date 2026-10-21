import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface TermsContent {
  title: string;
  back: string;
  lastUpdated: string;
  sections: {
    title: string;
    text: string;
  }[];
}

const contentByLang: Record<string, TermsContent> = {
  ru: {
    title: "Условия использования",
    back: "Назад",
    lastUpdated: "Последнее обновление: 25 марта 2026 г.",
    sections: [
      {
        title: "1. Принятие условий",
        text: "Используя данный веб-сайт (далее — «Сервис»), вы соглашаетесь соблюдать настоящие Условия использования. Если вы не согласны с каким-либо из условий, пожалуйста, прекратите использование Сервиса."
      },
      {
        title: "2. Описание сервиса",
        text: "ZNAVAL ARCHIVE — это платформа для размещения объявлений, архивации и обмена информацией. Мы предоставляем инструменты для публикации контента, поиска объектов недвижимости, голосования и взаимодействия между пользователями."
      },
      {
        title: "3. Регистрация и безопасность",
        text: "Для доступа к некоторым функциям (создание объявлений, управление личным кабинетом, отзывы) может потребоваться регистрация. Вы несете ответственность за сохранение конфиденциальности ваших учетных данных и за все действия, совершаемые под вашей учетной записью."
      },
      {
        title: "4. Правила поведения",
        text: "Пользователям запрещается публиковать контент, который является незаконным, недостоверным, оскорбительным, вредоносным или нарушает права третьих лиц. Мы оставляем за собой право модерировать или удалять любой контент, нарушающий данные правила."
      },
      {
        title: "5. Интеллектуальная собственность",
        text: "Весь контент, представленный в Сервисе, включая текст, графику, интерфейс, логотипы и программное обеспечение, является собственностью Оператора или его лицензиаров и защищен законами об интеллектуальной собственности."
      },
      {
        title: "6. Ограничение ответственности",
        text: "Сервис предоставляется на условиях «как есть». Мы не гарантируем абсолютно бесперебойную работу Сервиса и не несем ответственности за любые убытки или решения, принятые на основе размещенных объявлений."
      },
      {
        title: "7. Изменения условий",
        text: "Мы оставляем за собой право изменять настоящие Условия в любое время. Продолжение использования Сервиса после публикации изменений означает ваше согласие с новыми условиями."
      }
    ]
  },
  en: {
    title: "Terms of Use",
    back: "Back",
    lastUpdated: "Last updated: March 25, 2026",
    sections: [
      {
        title: "1. Acceptance of Terms",
        text: "By accessing or using this website (hereinafter the 'Service'), you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please discontinue using the Service immediately."
      },
      {
        title: "2. Description of the Service",
        text: "ZNAVAL ARCHIVE is a comprehensive catalog and community platform for real estate listings, service archiving, and public ratings. We provide tools for posting verified listings, voting, user reviews, and direct communication."
      },
      {
        title: "3. Registration and Account Security",
        text: "Certain features (creating listings, editing your user profile, submitting reviews) require user account registration. You are solely responsible for maintaining the confidentiality of your login credentials and for all actions taken under your account."
      },
      {
        title: "4. Code of Conduct and Content Policy",
        text: "Users are strictly prohibited from publishing misleading, illegal, defamatory, abusive, or unauthorized commercial material. We reserve the full right to moderate, unpublish, or delete content that violates our standards or local regulations."
      },
      {
        title: "5. Intellectual Property Rights",
        text: "All elements of the Service—including source code, visual design, typographic layouts, branding, and logos—are the proprietary assets of the Operator or its respective licensors and are protected under international copyright law."
      },
      {
        title: "6. Limitation of Liability",
        text: "The Service is provided on an 'as is' and 'as available' basis without warranties of any kind. The Operator shall not be held liable for any direct or indirect losses, disruptions, or transactions executed between third parties."
      },
      {
        title: "7. Modifications to These Terms",
        text: "We reserve the right to amend or replace these Terms at any time. Continued engagement with the Service after revised terms are posted constitutes your binding acceptance of the updated conditions."
      }
    ]
  },
  cs: {
    title: "Podmínky použití",
    back: "Zpět",
    lastUpdated: "Poslední aktualizace: 25. března 2026",
    sections: [
      {
        title: "1. Přijetí podmínek",
        text: "Používáním této webové stránky (dále jen „Služba“) souhlasíte s dodržováním těchto Podmínek použití. Pokud s jakoukoliv částí těchto podmínek nesouhlasíte, ukončete používání Služby."
      },
      {
        title: "2. Popis služby",
        text: "ZNAVAL ARCHIVE je platforma pro inzerci nemovitostí a služeb, archivaci a výměnu informací. Poskytujeme nástroje pro publikování nabídek, hlasování, recenze a vzájemnou komunikaci uživatelů."
      },
      {
        title: "3. Registrace a bezpečnost účtu",
        text: "Pro využití některých funkcí (vytváření inzerátů, správa osobního profilu, hodnocení) je nezbytná registrace. Nesete plnou odpovědnost za zachování důvěrnosti svých přístupových údajů a za veškeré činnosti prováděné v rámci vašeho účtu."
      },
      {
        title: "4. Pravidla chování",
        text: "Uživatelům je zakázáno publikovat klamavý, nezákonný, urážlivý či škodlivý obsah nebo materiály porušující práva třetích stran. Vyhrazujeme si právo jakýkoli nevhodný obsah bez předchozího upozornění odstranit."
      },
      {
        title: "5. Duševní vlastnictví",
        text: "Veškerý obsah a prvky prezentované ve Službě, včetně textů, grafického designu, log a zdrojového kódu, jsou majetkem Správce nebo jeho poskytovatelů licencí a podléhají autorskoprávní ochraně."
      },
      {
        title: "6. Omezení odpovědnosti",
        text: "Služba je poskytována ve stavu „jak stojí a leží“. Nezaručujeme nepřetržitý či bezchybný provoz a neneseme odpovědnost za jakékoliv újmy či rozhodnutí vzniklá v souvislosti s používáním zveřejněných inzerátů."
      },
      {
        title: "7. Změny podmínek",
        text: "Vyhrazujeme si právo tyto Podmínky kdykoli aktualizovat. Dalším používáním Služby po provedení úprav vyjadřujete svůj výslovný souhlas s novým zněním podmínek."
      }
    ]
  }
};

export const TermsOfUse: React.FC = () => {
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
          <FileText className="text-[#7a1b1b]" size={32} />
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

      <div className="space-y-6 font-serif text-gray-800 leading-relaxed text-sm sm:text-base">
        {content.sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-lg sm:text-xl font-bold text-black uppercase mb-3 font-sans tracking-tight">
              {section.title}
            </h2>
            <p>{section.text}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t-2 border-black text-center">
        <p className="text-[10px] font-bold uppercase opacity-50 tracking-widest font-sans">
          {content.lastUpdated}
        </p>
      </div>
    </motion.div>
  );
};
