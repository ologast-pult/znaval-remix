import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
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
          <Shield className="text-[#7a1b1b]" size={32} />
          <h1 className="text-3xl font-black uppercase tracking-tighter">Политика конфиденциальности</h1>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 border-2 border-black font-bold uppercase text-xs hover:bg-black hover:text-white transition-all active:translate-x-1 active:translate-y-1"
        >
          <ArrowLeft size={16} />
          Назад
        </button>
      </div>

      <div className="space-y-6 font-serif text-gray-800 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">1. Общие положения</h2>
          <p>
            Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных ZNAVAL (далее — Оператор).
          </p>
          <p className="mt-2">
            Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">2. Основные понятия, используемые в Политике</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Персональные данные</strong> — любая информация, относящаяся прямо или косвенно к определенному или определяемому Пользователю веб-сайта.</li>
            <li><strong>Обработка персональных данных</strong> — любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными.</li>
            <li><strong>Пользователь</strong> — любой посетитель веб-сайта.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">3. Оператор может обрабатывать следующие персональные данные Пользователя</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Фамилия, имя, отчество;</li>
            <li>Электронный адрес;</li>
            <li>Номера телефонов;</li>
            <li>Также на сайте происходит сбор и обработка обезличенных данных о посетителях (в т.ч. файлов «cookie») с помощью сервисов интернет-статистики.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">4. Цели обработки персональных данных</h2>
          <p>
            Цель обработки персональных данных Пользователя — информирование Пользователя посредством отправки электронных писем; предоставление доступа Пользователю к сервисам, информации и/или материалам, содержащимся на веб-сайте.
          </p>
          <p className="mt-2">
            Также Оператор имеет право направлять Пользователю уведомления о новых продуктах и услугах, специальных предложениях и различных событиях. Пользователь всегда может отказаться от получения информационных сообщений.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">5. Правовые основания обработки персональных данных</h2>
          <p>
            Оператор обрабатывает персональные данные Пользователя только в случае их заполнения и/или отправки Пользователем самостоятельно через специальные формы, расположенные на сайте. Заполняя соответствующие формы и/или отправляя свои персональные данные Оператору, Пользователь выражает свое согласие с данной Политикой.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">6. Порядок сбора, хранения, передачи и других видов обработки персональных данных</h2>
          <p>
            Безопасность персональных данных, которые обрабатываются Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">7. Заключительные положения</h2>
          <p>
            Пользователь может получить любые разъяснения по интересующим вопросам, касающимся обработки его персональных данных, обратившись к Оператору с помощью электронной почты.
          </p>
          <p className="mt-2">
            В данном документе будут отражены любые изменения политики обработки персональных данных Оператором. Политика действует бессрочно до замены ее новой версией.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t-2 border-black text-center">
        <p className="text-[10px] font-bold uppercase opacity-50">
          Последнее обновление: 25 марта 2026 г.
        </p>
      </div>
    </motion.div>
  );
};
