import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PrivacyContent {
  title: string;
  back: string;
  lastUpdated: string;
  sections: {
    title: string;
    paragraphs?: string[];
    list?: string[];
  }[];
}

const contentByLang: Record<string, PrivacyContent> = {
  ru: {
    title: "Политика конфиденциальности",
    back: "Назад",
    lastUpdated: "Последнее обновление: 25 марта 2026 г.",
    sections: [
      {
        title: "1. Общие положения",
        paragraphs: [
          "Настоящая политика обработки персональных данных составлена в соответствии с применимым законодательством о защите информации и определяет порядок обработки и меры по обеспечению безопасности персональных данных ZNAVAL (далее — Оператор).",
          "Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну."
        ]
      },
      {
        title: "2. Основные понятия, используемые в Политике",
        list: [
          "Персональные данные — любая информация, относящаяся прямо или косвенно к определенному или определяемому Пользователю веб-сайта.",
          "Обработка персональных данных — любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными.",
          "Пользователь — любой посетитель веб-сайта."
        ]
      },
      {
        title: "3. Оператор может обрабатывать следующие персональные данные Пользователя",
        list: [
          "Фамилия, имя, отчество (или отображаемое имя/псевдоним);",
          "Электронный адрес (email);",
          "Номера телефонов (при добровольном указании в контактных данных объявления);",
          "Обезличенные данные о посетителях (в т.ч. файлы cookie и параметры сессии) с помощью сервисов веб-аналитики."
        ]
      },
      {
        title: "4. Цели обработки персональных данных",
        paragraphs: [
          "Цель обработки персональных данных Пользователя — информирование посредством сервисных сообщений; предоставление доступа к публикации объявлений, личному кабинету, отзывам и архиву материалов ZNAVAL.",
          "Также Оператор имеет право направлять Пользователю уведомления об обновлениях сервиса и специальных событиях. Пользователь всегда может отказаться от информационных сообщений."
        ]
      },
      {
        title: "5. Правовые основания обработки персональных данных",
        paragraphs: [
          "Оператор обрабатывает персональные данные Пользователя только в случае их заполнения и/или отправки Пользователем самостоятельно через специальные формы, расположенные на сайте. Заполняя соответствующие формы и/или отправляя свои данные, Пользователь выражает согласие с данной Политикой."
        ]
      },
      {
        title: "6. Порядок сбора, хранения и защиты данных",
        paragraphs: [
          "Безопасность персональных данных, обрабатываемых Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных."
        ]
      },
      {
        title: "7. Заключительные положения",
        paragraphs: [
          "Пользователь может получить любые разъяснения по интересующим вопросам, касающимся обработки его персональных данных, обратившись к Оператору по электронной почте support@znaval.archive.",
          "В данном документе будут отражены любые изменения политики обработки персональных данных Оператором. Политика действует бессрочно до замены ее новой версией."
        ]
      }
    ]
  },
  en: {
    title: "Privacy Policy",
    back: "Back",
    lastUpdated: "Last updated: March 25, 2026",
    sections: [
      {
        title: "1. General Provisions",
        paragraphs: [
          "This Personal Data Processing Policy is formulated in accordance with applicable data protection laws and regulations, setting out the principles and measures for ensuring the privacy and security of personal data processed by ZNAVAL (hereinafter referred to as the 'Operator').",
          "The Operator regards the safeguarding of human rights and personal liberties in processing personal information—including rights to personal privacy and confidentiality—as an absolute priority in its activities."
        ]
      },
      {
        title: "2. Key Definitions Used in This Policy",
        list: [
          "Personal Data — any piece of information relating directly or indirectly to an identified or identifiable User of the website.",
          "Processing of Personal Data — any operation or set of operations performed upon personal data, whether or not by automated means.",
          "User — any visitor, resident, or registered account holder of the website."
        ]
      },
      {
        title: "3. Categories of Processed Personal Data",
        list: [
          "Full name or public display name/handle;",
          "Email address;",
          "Phone numbers (if voluntarily provided in listings or profile contacts);",
          "Aggregated, non-personally identifiable browser data and cookies used for site analytics and authentication stability."
        ]
      },
      {
        title: "4. Purposes of Data Processing",
        paragraphs: [
          "The primary purpose of collecting personal data is to deliver platform features, facilitate account authentication, manage property listings and verified reviews, and provide notifications regarding relevant site actions.",
          "The Operator may periodically send technical updates or service notices. Users may update their communication preferences at any time."
        ]
      },
      {
        title: "5. Legal Grounds for Processing",
        paragraphs: [
          "The Operator processes personal information solely when submitted voluntarily by the User through form entries, profile customization, or sign-in procedures. Submission of data constitutes consent to this Privacy Policy."
        ]
      },
      {
        title: "6. Data Storage and Security Measures",
        paragraphs: [
          "The security of personal data is enforced through comprehensive administrative, cryptographic, and technical safeguards engineered to prevent unauthorized access, loss, or disclosure."
        ]
      },
      {
        title: "7. Inquiries and Contact Information",
        paragraphs: [
          "Users may address any questions or data access requests to the Operator by emailing support@znaval.archive.",
          "The Operator reserves the right to revise this Policy. Updates will be published on this page and remain in effect until revised."
        ]
      }
    ]
  },
  cs: {
    title: "Zásady ochrany osobních údajů",
    back: "Zpět",
    lastUpdated: "Poslední aktualizace: 25. března 2026",
    sections: [
      {
        title: "1. Všeobecná ustanovení",
        paragraphs: [
          "Tyto zásady zpracování osobních údajů jsou vypracovány v souladu s platnými právními předpisy (včetně nařízení GDPR) a definují postupy a bezpečnostní opatření při zpracování osobních údajů na platformě ZNAVAL (dále jen „Správce“).",
          "Ochrana soukromí, osobních údajů a základních práv uživatelů je klíčovou prioritou a základní podmínkou veškerých aktivit Správce."
        ]
      },
      {
        title: "2. Základní pojmy",
        list: [
          "Osobní údaje — veškeré informace týkající se přímo či nepřímo identifikované nebo identifikovatelné osoby (Uživatele webu).",
          "Zpracování osobních údajů — jakákoli operace nebo soubor operací prováděných s osobními údaji s využitím automatizovaných postupů či bez nich.",
          "Uživatel — každý návštěvník nebo registrovaný uživatel webu."
        ]
      },
      {
        title: "3. Kategorie zpracovávaných údajů",
        list: [
          "Jméno, příjmení nebo zvolené veřejné uživatelské jméno;",
          "E-mailová adresa;",
          "Telefonní číslo (pokud je dobrovolně uvedeno u inzerátu);",
          "Anonymizovaná data o návštěvnících (včetně souborů cookie a relací) pro zajištění stability a analýzy."
        ]
      },
      {
        title: "4. Účely zpracování osobních údajů",
        paragraphs: [
          "Účelem zpracování je zajištění funkčnosti uživatelského účtu, správa inzerátů nemovitostí a služeb, ověřených recenzí a zasílání důležitých servisních informací.",
          "Správce může zasílat novinky a oznámení o platformě; Uživatel má právo odběr těchto sdělení kdykoliv ukončit."
        ]
      },
      {
        title: "5. Právní základ pro zpracování",
        paragraphs: [
          "Správce zpracovává údaje výhradně na základě dobrovolného vyplnění a odeslání Uživatelem v registračních a inzertních formulářích. Odesláním údajů Uživatel vyjadřuje souhlas s těmito zásadami."
        ]
      },
      {
        title: "6. Uchovávání a zabezpečení dat",
        paragraphs: [
          "Zabezpečení osobních údajů je zajištěno prostřednictvím moderních technických, organizačních a šifrovacích standardů zabraňujících neoprávněnému přístupu či zneužití."
        ]
      },
      {
        title: "7. Závěrečná ustanovení a kontakt",
        paragraphs: [
          "V případě dotazů týkajících se zpracování osobních údajů se můžete obrátit na Správce prostřednictvím e-mailu support@znaval.archive.",
          "Správce si vyhrazuje právo tyto Zásady aktualizovat. Platná verze je vždy k dispozici na této stránce."
        ]
      }
    ]
  }
};

export const PrivacyPolicy: React.FC = () => {
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
          <Shield className="text-[#7a1b1b]" size={32} />
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
            {section.paragraphs && section.paragraphs.map((para, pIdx) => (
              <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>
                {para}
              </p>
            ))}
            {section.list && (
              <ul className="list-disc pl-6 space-y-2 mt-2">
                {section.list.map((item, lIdx) => (
                  <li key={lIdx}>{item}</li>
                ))}
              </ul>
            )}
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
