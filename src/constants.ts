import { Listing, Category, Company, Poll, EstateRating } from './types';
import { 
  Home, Building2, Bed, Warehouse, Car, Bike, Laptop, 
  Wrench, Brush, GraduationCap, Dog, Beef, Sofa, Gem,
  Briefcase, ShoppingBag, Vote, ShieldCheck
} from 'lucide-react';

export const CATEGORIES: Category[] = [
  { id: 'real-estate', label: 'Недвижимость', icon: Home },
  { id: 'znaval', label: 'Резидент', icon: ShieldCheck },
  { id: 'voting', label: 'Голосование', icon: Vote },
];

export const MOCK_ESTATE_RATINGS: EstateRating[] = Array.from({ length: 80 }).map((_, i) => {
  const id = `est-${i + 1}`;
  const countries = ['Россия', 'Чехия', 'Словакия', 'ОАЭ', 'Турция'];
  const cities: Record<string, string[]> = {
    'Россия': ['Москва', 'Санкт-Петербург', 'Сочи', 'Казань', 'Екатеринбург'],
    'Чехия': ['Прага', 'Брно', 'Острава', 'Пльзень'],
    'Словакия': ['Братислава', 'Кошице'],
    'ОАЭ': ['Дубай', 'Абу-Даби'],
    'Турция': ['Стамбул', 'Анталья', 'Аланья']
  };
  
  const country = countries[i % countries.length];
  const city = cities[country][i % cities[country].length];
  const names = ['Империя', 'Riverside', 'Солнечный берег', 'Green Park', 'Аквамарин', 'Новая Жизнь', 'Skyline', 'Marina Bay', 'Central Park', 'Grand Residence'];
  const name = `ЖК "${names[i % names.length]} ${i + 1}"`;
  
  const rating = (Math.random() * 3 + 2).toFixed(1); // 2.0 - 5.0
  const votes = Math.floor(Math.random() * 5000) + 100;
  
  return {
    id,
    name,
    country,
    city,
    imageUrl: `https://picsum.photos/seed/estate-${i + 1}/400/300`,
    averageRating: parseFloat(rating),
    totalVotes: votes,
    ratingDistribution: { 
      5: Math.floor(votes * 0.4), 
      4: Math.floor(votes * 0.3), 
      3: Math.floor(votes * 0.2), 
      2: Math.floor(votes * 0.05), 
      1: Math.floor(votes * 0.05) 
    },
    description: `Это демонстрационная карточка для ${name}. Прекрасный жилой комплекс в городе ${city}, ${country}. Современная архитектура, развитая инфраструктура и высокий уровень комфорта.`,
    coordinates: { 
      lat: 55.75 + (Math.random() - 0.5) * 2, 
      lng: 37.61 + (Math.random() - 0.5) * 2 
    },
    galleryUrls: [
      `https://picsum.photos/seed/estate-${i + 1}-1/800/600`,
      `https://picsum.photos/seed/estate-${i + 1}-2/800/600`,
      `https://picsum.photos/seed/estate-${i + 1}-3/800/600`
    ],
    masterPlanUrl: `https://picsum.photos/seed/plan-${i + 1}/800/600`,
    presentationUrl: '#',
    floorPlans: [
      { title: '1-комнатная', imageUrl: `https://picsum.photos/seed/floor-${i + 1}-1/400/300`, area: '45 м²' },
      { title: '2-комнатная', imageUrl: `https://picsum.photos/seed/floor-${i + 1}-2/400/300`, area: '68 м²' }
    ]
  };
});

export const MOCK_POLLS: Poll[] = [
  {
    id: 'p1',
    question: 'Что лучше: BMW или Mercedes?',
    category: 'Автомобили',
    totalVotes: 12450,
    createdAt: '2024-03-15',
    options: [
      { id: 'o1', label: 'BMW', votes: 6500, imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400' },
      { id: 'o2', label: 'Mercedes-Benz', votes: 5950, imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    id: 'p2',
    question: 'Лучший город для жизни в Чехии?',
    category: 'Города',
    totalVotes: 8200,
    createdAt: '2024-03-10',
    options: [
      { id: 'o3', label: 'Прага', votes: 4500 },
      { id: 'o4', label: 'Брно', votes: 2100 },
      { id: 'o5', label: 'Пльзень', votes: 1600 }
    ]
  },
  {
    id: 'p3',
    question: 'Поддерживаете ли вы новый закон о налоге на недвижимость?',
    category: 'Законы',
    totalVotes: 15600,
    createdAt: '2024-03-18',
    options: [
      { id: 'o6', label: 'Да, это необходимо', votes: 3200 },
      { id: 'o7', label: 'Нет, это слишком дорого', votes: 12400 }
    ]
  }
];

export const PROPERTY_TYPES = ['Все типы', 'Квартиры', 'Дома', 'Комнаты', 'Участки', 'Коммерция'];

const baseListings: Listing[] = [
  {
    id: '1',
    title: 'Исторические апартаменты в Старом Городе',
    address: 'Чехия, Прага, Karlova 154/12',
    description: 'Прекрасная 2-комнатная квартира в самом сердце Праги. Оригинальные деревянные потолки XVII века. Высокий индекс доверия благодаря проверенной истории владения.',
    avatarUrl: 'https://picsum.photos/seed/prague1/400/400',
    verified: true,
    trustScore: 95,
    rating: 4.8,
    reviewsCount: 24,
    category: 'Квартиры',
    transactionType: 'Покупка',
    price: 12500000,
    priceDisplay: '12,500,000 Kč',
    sellerType: 'Владелец',
    proofs: [
      { id: 'p1', date: '10.11.2023', type: 'Документ', description: 'Выписка из кадастра подтверждена' },
      { id: 'p2', date: '05.01.2024', type: 'Фото', description: 'Сертификаты реставрации приложены' }
    ],
    brandResponse: {
      company: 'Prague Heritage Group',
      status: 'Официальный представитель'
    }
  },
  {
    id: '2',
    title: 'Современный лофт у Влтавы',
    address: 'Чехия, Прага, Janáčkovo nábř. 39',
    description: 'Лофт в индустриАльном стиле с видом на реку. Недавний ремонт. Имеются споры с соседями по поводу постройки террасы.',
    avatarUrl: 'https://picsum.photos/seed/prague2/400/400',
    verified: true,
    trustScore: 62,
    rating: 3.5,
    reviewsCount: 15,
    category: 'Квартиры',
    price: 18200000,
    priceDisplay: '18,200,000 Kč',
    sellerType: 'Риелтор',
    proofs: [
      { id: 'p3', date: '15.02.2024', type: 'Свидетельство', description: 'Показания соседей об уровне шума' }
    ]
  },
  {
    id: '3',
    title: 'Семейный дом в Виноградах',
    address: 'Чехия, Прага, Slovenská 22',
    description: 'Просторный семейный дом с частным садом. Высоко оценен бывшими арендаторами за тихую атмосферу и отличное обслуживание.',
    avatarUrl: 'https://picsum.photos/seed/prague3/400/400',
    verified: true,
    trustScore: 98,
    rating: 4.9,
    reviewsCount: 42,
    category: 'Дома',
    price: 45000000,
    priceDisplay: '45,000,000 Kč',
    sellerType: 'Владелец',
    proofs: [
      { id: 'p4', date: '20.05.2023', type: 'Документ', description: 'Полная структурная экспертиза пройдена' }
    ]
  },
  {
    id: '4',
    title: 'Роскошный пентхаус "Skyline"',
    address: 'Россия, Москва, Пресненская наб., 12',
    description: 'Ультрасовременный пентхаус в Москва-Сити. Высокотехнологичная безопасность и панорамные виды. Индекс доверия снижен из-за сложной офшорной структуры владения.',
    avatarUrl: 'https://picsum.photos/seed/msc1/400/400',
    verified: false,
    trustScore: 45,
    rating: 4.2,
    reviewsCount: 8,
    category: 'Квартиры',
    price: 120000000,
    priceDisplay: '120,000,000 ₽',
    sellerType: 'Риелтор',
    proofs: [
      { id: 'p5', date: '01.03.2024', type: 'Фото', description: 'Дрон-тур по интерьеру подтвержден' }
    ]
  },
  {
    id: '5',
    title: 'Уютная студия на Жижкове',
    address: 'Чехия, Прага, Seifertova 85',
    description: 'Маленькая, но эффективная студия. Популярна среди студентов. Проверенная история коммунальных платежей и отчеты о скорости интернета доступны в архиве.',
    avatarUrl: 'https://picsum.photos/seed/prague4/400/400',
    verified: true,
    trustScore: 85,
    rating: 4.0,
    reviewsCount: 56,
    category: 'Комнаты',
    price: 4200000,
    priceDisplay: '4,200,000 Kč',
    sellerType: 'Владелец',
    stayDuration: '6 месяцев', // Added for Резидент type
    proofs: [
      { id: 'p6', date: '20.01.2024', type: 'Документ', description: 'История платежей подтверждена' }
    ]
  },
  {
    id: '6',
    title: 'Отреставрированная вилла в Бубенече',
    address: 'Чехия, Прага, Na Zátorce 5',
    description: 'Вилла в дипломатическом районе. Высокий уровень приватности. Полное историческое досье включено в листинг.',
    avatarUrl: 'https://picsum.photos/seed/prague5/400/400',
    verified: true,
    trustScore: 92,
    rating: 4.7,
    reviewsCount: 19,
    category: 'Дома',
    price: 89000000,
    priceDisplay: '89,000,000 Kč',
    sellerType: 'Риелтор',
    proofs: [
      { id: 'p7', date: '12.12.2023', type: 'Документ', description: 'Совпадение с историческим архивом подтверждено' }
    ]
  },
  {
    id: '7',
    title: 'Компактная квартира на Смихове',
    address: 'Чехия, Прага, Plzeňská 112',
    description: 'Отличное расположение для тех, кто ездит на работу. Сообщается о проблемах с уличным шумом. Индекс доверия отражает смешанные отзывы сообщества.',
    avatarUrl: 'https://picsum.photos/seed/prague6/400/400',
    verified: true,
    trustScore: 55,
    rating: 3.2,
    reviewsCount: 31,
    category: 'Квартиры',
    price: 6800000,
    priceDisplay: '6,800,000 Kč',
    sellerType: 'Владелец',
    proofs: [
      { id: 'p8', date: '28.02.2024', type: 'Свидетельство', description: 'Замеры уровня шума приложены' }
    ]
  },
  {
    id: '8',
    title: 'Садовая резиденция "Flora"',
    address: 'Чехия, Прага, Vinohradská 150',
    description: 'Новостройка with акцентом на экологичную жизнь. Высокая энергоэффективность. Проверка сообществом документов о финальной инспекции продолжается.',
    avatarUrl: 'https://picsum.photos/seed/prague7/400/400',
    verified: false,
    trustScore: 78,
    rating: 4.5,
    reviewsCount: 14,
    category: 'Квартиры',
    price: 15400000,
    priceDisplay: '15,400,000 Kč',
    sellerType: 'Риелтор',
    proofs: [
      { id: 'p9', date: '10.03.2024', type: 'Фото', description: 'Фотографии хода строительства' }
    ]
  },
  {
    id: '9',
    title: 'Лофт художника в Голешовице',
    address: 'Чехия, Прага, Komunardů 35',
    description: 'Творческое пространство в арт-районе. Высокие потолки и большие окна. Подтверждено как бывшая промышленная мастерская.',
    avatarUrl: 'https://picsum.photos/seed/prague8/400/400',
    verified: true,
    trustScore: 89,
    rating: 4.6,
    reviewsCount: 22,
    category: 'Коммерция',
    price: 11200000,
    priceDisplay: '11,200,000 Kč',
    sellerType: 'Владелец',
    proofs: [
      { id: 'p10', date: '15.08.2023', type: 'Документ', description: 'Разрешение на промышленное использование подтверждено' }
    ]
  },
  {
    id: '10',
    title: 'Загородное убежище',
    address: 'Чехия, Прага-Восток, Ржичаны, Hlavní 45',
    description: 'Тихий дом вдали от городской суеты. Идеально для семей. Длительное владение одной семьей в течение 40 лет.',
    avatarUrl: 'https://picsum.photos/seed/prague9/400/400',
    verified: true,
    trustScore: 99,
    rating: 5.0,
    reviewsCount: 12,
    category: 'Дома',
    price: 22000000,
    priceDisplay: '22,000,000 Kč',
    sellerType: 'Владелец',
    proofs: [
      { id: 'p11', date: '01.01.2024', type: 'Свидетельство', description: 'Подтверждение длительного проживания от местного сообщества' }
    ]
  },
  {
    id: '11',
    title: 'Земельный участок в пригороде Праги',
    address: 'Чехия, Прага-Запад, Есенице',
    description: 'Участок 1200 м2 под застройку. Все коммуникации подведены. Чистая юридическая история.',
    avatarUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400',
    verified: true,
    trustScore: 94,
    rating: 4.5,
    reviewsCount: 5,
    category: 'Участки',
    price: 8500000,
    priceDisplay: '8,500,000 Kč',
    sellerType: 'Владелец',
    proofs: [
      { id: 'p12', date: '12.02.2024', type: 'Документ', description: 'Разрешение на строительство подтверждено' }
    ]
  },
  {
    id: '12',
    title: 'Уютный коттедж с видом на лес',
    address: 'Чехия, Среднечешский край, Бероун, Lesní 12',
    description: 'Продаем наш любимый семейный дом. Строили для себя, использовали только натуральные материалы. Большой сад с плодовыми деревьями и баня. Продажа в связи с переездом. Все документы в порядке, один собственник.',
    avatarUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400',
    verified: true,
    trustScore: 96,
    rating: 4.9,
    reviewsCount: 12,
    category: 'Дома',
    price: 15800000,
    priceDisplay: '15,800,000 Kč',
    sellerType: 'Владелец',
    proofs: [
      { id: 'p13', date: '10.01.2024', type: 'Документ', description: 'Выписка из реестра прав собственности' },
      { id: 'p14', date: '15.01.2024', type: 'Фото', description: 'Технический паспорт здания' }
    ]
  },
  {
    id: '13',
    title: 'Современная вилла в Небушице',
    address: 'Чехия, Прага 6, Nebušice, Větrná 45',
    description: 'Стильный дом с панорамными окнами и системой умный дом. Полностью меблирован. Тихие соседи, рядом международная школа. Один владелец, документы готовы к сделке. Продажа напрямую без посредников.',
    avatarUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=400',
    verified: true,
    trustScore: 92,
    rating: 4.7,
    reviewsCount: 8,
    category: 'Дома',
    price: 32500000,
    priceDisplay: '32,500,000 Kč',
    sellerType: 'Владелец',
    proofs: [
      { id: 'p15', date: '05.02.2024', type: 'Документ', description: 'Сертификат энергоэффективности (PENB)' }
    ]
  }
];

export const MOCK_LISTINGS: Listing[] = Array.from({ length: 80 }, (_, i) => {
  const base = baseListings[i % baseListings.length];
  
  return {
    ...base,
    id: (i + 1).toString(),
    title: `${base.title} #${i + 1}`,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(), // One hour apart
    transactionType: i % 3 === 0 ? 'Аренда' : 'Покупка',
    sellerType: i % 3 === 0 ? 'Владелец' : (i % 3 === 1 ? 'Риелтор' : 'Застройщик'),
    stayDuration: i % 3 === 0 ? '1 год' : undefined,
    avatarUrl: base.avatarUrl.includes('unsplash') ? base.avatarUrl : `https://picsum.photos/seed/listing-${i + 1}/400/400`,
    galleryUrls: [
      base.avatarUrl.includes('unsplash') ? base.avatarUrl : `https://picsum.photos/seed/listing-${i + 1}/800/600`,
      `https://picsum.photos/seed/gallery-${i + 1}-1/800/600`,
      `https://picsum.photos/seed/gallery-${i + 1}-2/800/600`,
      `https://picsum.photos/seed/gallery-${i + 1}-3/800/600`,
      `https://picsum.photos/seed/gallery-${i + 1}-4/800/600`,
    ],
    reviews: Array.from({ length: 20 }, (_, j) => {
      const reviewTemplates = [
        { rating: 5, comment: 'Отличное место, очень тихо и уютно. Соседи вежливые, инфраструктура рядом на высоте.', duration: '6 месяцев' },
        { rating: 4, comment: 'Квартира соответствует описанию. Были небольшие проблемы с сантехникой, но владелец быстро все исправил.', duration: '1 год' },
        { rating: 5, comment: 'Лучшее жилье, которое я снимал в этом районе. Очень чисто и современно.', duration: '3 месяца' },
        { rating: 2, comment: 'Ужасная шумоизоляция. Слышно каждое слово соседей. В подъезде постоянно пахнет куревом.', duration: '1 месяц' },
        { rating: 3, comment: 'Расположение хорошее, но мебель очень старая и скрипучая. Цена явно завышена.', duration: '2 месяца' },
        { rating: 1, comment: 'Владелец неадекватный. Залог не вернул под надуманным предлогом. Не рекомендую связываться.', duration: '2 недели' },
        { rating: 4, comment: 'Хороший вариант за свои деньги. Рядом парк и метро. Из минусов — старый лифт.', duration: '8 месяцев' },
        { rating: 5, comment: 'Все супер! Квартира даже лучше чем на фото. Очень рекомендую.', duration: '4 месяца' },
        { rating: 3, comment: 'Средне. Жить можно, но ремонт делали лет 10 назад. Техника иногда барахлит.', duration: '5 месяцев' },
        { rating: 2, comment: 'Очень холодно зимой. Окна продувает, обогреватели не спасают. Счет за свет вышел огромный.', duration: '3 месяца' }
      ];
      
      const template = reviewTemplates[j % reviewTemplates.length];
      const names = ['Александр', 'Елена', 'Дмитрий', 'Мария', 'Игорь', 'Ольга', 'Сергей', 'Анна', 'Виктор', 'Наталья'];
      const surnames = ['М.', 'К.', 'С.', 'П.', 'В.', 'Т.', 'Б.', 'Л.', 'Д.', 'Р.'];
      
      return {
        id: `r-${i}-${j}`,
        userName: `${names[j % names.length]} ${surnames[(j + i) % surnames.length]}`,
        userAvatar: `https://i.pravatar.cc/150?u=user-${i}-${j}`,
        date: `${(j + 1).toString().padStart(2, '0')}.0${(j % 9) + 1}.2024`,
        rating: template.rating,
        comment: template.comment,
        stayDuration: template.duration,
        photos: j % 4 === 0 ? [
          `https://picsum.photos/seed/review-${i}-${j}-1/800/600`,
          `https://picsum.photos/seed/review-${i}-${j}-2/800/600`
        ] : undefined,
        ownerResponse: j % 5 === 0 ? {
          comment: j % 2 === 0 
            ? 'Спасибо за ваш отзыв! Мы всегда стараемся сделать проживание максимально комфортным.' 
            : 'Сожалеем, что у вас возникли трудности. Мы уже провели работу с персоналом и устранили технические неполадки.',
          date: `${(j + 2).toString().padStart(2, '0')}.0${(j % 9) + 1}.2024`,
          photos: j % 10 === 0 ? [`https://picsum.photos/seed/owner-${i}-${j}/800/600`] : undefined
        } : undefined
      };
    })
  };
});
