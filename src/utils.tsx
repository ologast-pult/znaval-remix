import React from 'react';

export const formatPrice = (price: number, currency: string = 'Kč') => {
  const parts = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ").split(" ");
  
  return (
    <span className="font-black tracking-tighter">
      <span className="text-[#7a1b1b]">{parts[0]}</span>
      {parts.length > 1 && (
        <span> {parts.slice(1).join(" ")}</span>
      )}
      <span className="ml-1">{currency}</span>
    </span>
  );
};

export const formatAuthErrorMessage = (error: any, lang: string = 'ru'): string => {
  const code = (error?.code || '').toLowerCase();
  const rawMsg = (error?.message || '').toLowerCase();
  const isEn = lang === 'en';
  const isCs = lang === 'cs';

  if (code.includes('auth/email-already-in-use') || rawMsg.includes('email-already-in-use')) {
    if (isEn) return 'This email address is already in use. Please sign in instead.';
    if (isCs) return 'Tato e-mailová adresa je již používána. Přihlaste se prosím.';
    return 'Этот адрес электронной почты уже зарегистрирован. Пожалуйста, выполните вход.';
  }
  if (code.includes('auth/invalid-email') || rawMsg.includes('invalid-email')) {
    if (isEn) return 'Invalid email format. Please check the address.';
    if (isCs) return 'Neplatný formát e-mailu. Zkontrolujte prosím adresu.';
    return 'Некорректный формат email. Проверьте правильность ввода.';
  }
  if (code.includes('auth/missing-email')) {
    if (isEn) return 'Please enter your email address.';
    if (isCs) return 'Zadejte prosím svou e-mailovou adresu.';
    return 'Пожалуйста, введите ваш email адрес.';
  }
  if (code.includes('auth/weak-password') || rawMsg.includes('weak-password') || rawMsg.includes('at least 6 characters')) {
    if (isEn) return 'Password should be at least 6 characters.';
    if (isCs) return 'Heslo musí mít alespoň 6 znaků.';
    return 'Пароль должен содержать минимум 6 символов.';
  }
  if (
    code.includes('auth/user-not-found') || 
    code.includes('auth/wrong-password') || 
    code.includes('auth/invalid-credential') ||
    rawMsg.includes('invalid-credential')
  ) {
    if (isEn) return 'Invalid email or password.';
    if (isCs) return 'Nesprávný e-mail nebo heslo.';
    return 'Неверный email или пароль.';
  }
  if (code.includes('auth/too-many-requests') || rawMsg.includes('too-many-requests')) {
    if (isEn) return 'Too many attempts. Please try again in a few minutes.';
    if (isCs) return 'Příliš mnoho pokusů. Zkuste to prosím za chvíli.';
    return 'Слишком много попыток. Пожалуйста, подождите несколько минут.';
  }
  if (code.includes('auth/network-request-failed') || rawMsg.includes('network')) {
    if (isEn) return 'Network error. Please check your connection.';
    if (isCs) return 'Chyba sítě. Zkontrolujte připojení k internetu.';
    return 'Ошибка сети. Проверьте подключение к интернету.';
  }
  if (code.includes('auth/popup-closed-by-user')) {
    if (isEn) return 'Sign-in window was closed.';
    if (isCs) return 'Přihlašovací okno bylo zavřeno.';
    return 'Окно авторизации было закрыто.';
  }
  if (code.includes('auth/popup-blocked')) {
    if (isEn) return 'Popup window blocked by browser. Please allow popups for this site.';
    if (isCs) return 'Vyskakovací okno bylo zablokováno prohlížečem.';
    return 'Всплывающее окно заблокировано браузером. Разрешите всплывающие окна.';
  }
  if (code.includes('auth/operation-not-allowed')) {
    if (isEn) return 'Sign-in method is not enabled. Please contact support.';
    if (isCs) return 'Metoda přihlášení není povolena.';
    return 'Данный метод регистрации временно недоступен.';
  }
  if (code.includes('auth/unauthorized-domain') || rawMsg.includes('unauthorized-domain')) {
    if (isEn) return 'This domain is not authorized in Firebase Auth. Please use Email and Password.';
    if (isCs) return 'Tato doména není autorizována ve Firebase Auth. Použijte prosím e-mail a heslo.';
    return 'Домен не авторизован в Firebase Auth. Пожалуйста, используйте регистрацию и вход через Email и пароль.';
  }

  // General fallback cleaned of Firebase technical tokens
  const cleanMsg = (error?.message || '')
    .replace(/^Firebase:\s*/i, '')
    .replace(/\(auth\/[^)]+\)\.?/gi, '')
    .trim();

  return cleanMsg || (isEn ? 'Authentication error' : isCs ? 'Chyba ověření' : 'Ошибка авторизации');
};
