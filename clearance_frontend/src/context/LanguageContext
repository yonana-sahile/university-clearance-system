import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    system_title: 'Mekdela Amba University',
    system_subtitle: 'Online Clearance System',
    home: 'Home',
    about: 'About',
    learn_more: 'Learn More',
    register: 'Register',
    sign_in: 'Sign In',
    logout: 'Logout',
    dashboard: 'Dashboard',
    apply_clearance: 'Apply Clearance',
    payments: 'Payments & Fines',
    office_directory: 'Office Directory',
    verify_certificate: 'Verify Clearance',
    notifications: 'Notifications',
    demo_roles: 'Demo Roles',
    clearance_progress: 'OVERALL CLEARANCE PROGRESS',
    view_certificate: 'View Official Digital Certificate',
    print_certificate: 'Print / Download PDF',
    status_cleared: '🎉 Cleared by Registrar',
    status_pending: '⏳ Under Department Review',
    status_dues: '💳 Pending Department Dues Payment',
    status_rejected: '❌ Application Rejected',
    language_name: 'English'
  },
  am: {
    system_title: 'መቅደላ አምባ ዩኒቨርሲቲ',
    system_subtitle: 'ኦንላይን የክሊራንስ ሲስተም',
    home: 'ዋና ገጽ',
    about: 'ስለ እኛ',
    learn_more: 'ተጨማሪ መረጃ',
    register: 'ተመዝገብ',
    sign_in: 'ግበሩ (ግባ)',
    logout: 'ውጣ',
    dashboard: 'ዳሽቦርድ',
    apply_clearance: 'ክሊራንስ አመልክት',
    payments: 'ክፍያዎችና ቅጣቶች',
    office_directory: 'የቢሮዎች መውጫ አድራሻ',
    verify_certificate: 'ሰርተፊኬት አረጋግጥ',
    notifications: 'ማሳወቂያዎች',
    demo_roles: 'የሙከራ ሚናዎች',
    clearance_progress: 'አጠቃላይ የክሊራንስ ሂደት ደረጃ',
    view_certificate: 'ዲጂታል የክሊራንስ ሰርተፊኬት ይመልከቱ',
    print_certificate: 'ፕሪንት / ፒዲኤፍ አውርድ',
    status_cleared: '🎉 በሬጂስትራር ጸድቋል',
    status_pending: '⏳ በክፍል ምርመራ ላይ',
    status_dues: '💳 ያልተከፈለ ክፍያ አለብዎት',
    status_rejected: '❌ ማመልከቻው አልተቀበለም',
    language_name: 'አማርኛ'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('mau_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mau_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
