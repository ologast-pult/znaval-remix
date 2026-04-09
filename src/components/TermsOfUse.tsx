import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const TermsOfUse: React.FC = () => {
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
          <FileText className="text-[#7a1b1b]" size={32} />
          <h1 className="text-3xl font-black uppercase tracking-tighter">Условия использования</h1>
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
          <h2 className="text-xl font-bold text-black uppercase mb-3">1. Принятие условий</h2>
          <p>
            Используя данный веб-сайт (далее — «Сервис»), вы соглашаетесь соблюдать настоящие Условия использования. Если вы не согласны с каким-либо из условий, пожалуйста, прекратите использование Сервиса.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">2. Описание сервиса</h2>
          <p>
            ZNAVAL ARCHIVE — это платформа для архивации и обмена информацией. Мы предоставляем инструменты для публикации контента, голосования и взаимодействия между пользователями.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">3. Регистрация и безопасность</h2>
          <p>
            Для доступа к некоторым функциям может потребоваться регистрация. Вы несете ответственность за сохранение конфиденциальности ваших учетных данных и за все действия, совершаемые под вашей учетной записью.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">4. Правила поведения</h2>
          <p>
            Пользователям запрещается публиковать контент, который является незаконным, оскорбительным, вредоносным или нарушает права третьих лиц. Мы оставляем за собой право удалять любой контент, нарушающий данные правила.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">5. Интеллектуальная собственность</h2>
          <p>
            Весь контент, представленный в Сервисе, включая текст, графику, логотипы и программное обеспечение, является собственностью Оператора или его лицензиаров и защищен законами об авторском праве.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">6. Ограничение ответственности</h2>
          <p>
            Сервис предоставляется на условиях «как есть». Мы не гарантируем бесперебойную работу Сервиса и не несем ответственности за любые убытки, возникшие в результате его использования.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black uppercase mb-3">7. Изменения условий</h2>
          <p>
            Мы оставляем за собой право изменять настоящие Условия в любое время. Продолжение использования Сервиса после внесения изменений означает ваше согласие с новыми условиями.
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
