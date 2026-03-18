'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type Language = 'th' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  // Common
  'common.home': { th: 'หน้าแรก', en: 'Home' },
  'common.dashboard': { th: 'แดชบอร์ด', en: 'Dashboard' },
  'common.settings': { th: 'ตั้งค่า', en: 'Settings' },
  'common.logout': { th: 'ออกจากระบบ', en: 'Logout' },
  'common.profile': { th: 'โปรไฟล์', en: 'Profile' },
  'common.admin': { th: 'ผู้ดูแลระบบ', en: 'Administrator' },
  'common.notifications': { th: 'แจ้งเตือน', en: 'Notifications' },
  'common.language': { th: 'ภาษา', en: 'Language' },
  'common.thai': { th: 'ไทย', en: 'Thai' },
  'common.english': { th: 'อังกฤษ', en: 'English' },
  'common.myAccount': { th: 'บัญชีของฉัน', en: 'My Account' },

  // Admin
  'admin.rooms': { th: 'ห้องพัก', en: 'Rooms' },
  'admin.tenants': { th: 'ผู้เช่า', en: 'Tenants' },
  'admin.meters': { th: 'มิเตอร์', en: 'Meters' },
  'admin.bills': { th: 'บิล', en: 'Bills' },
  'admin.payments': { th: 'การชำระเงิน', en: 'Payments' },
  'admin.maintenance': { th: 'บำรุงรักษา', en: 'Maintenance' },
  'admin.announcements': { th: 'ประกาศ', en: 'Announcements' },
  'admin.contracts': { th: 'สัญญา', en: 'Contracts' },
  'admin.deposits': { th: 'เงินประกัน', en: 'Deposits' },
  'admin.paymentVerification': { th: 'ยืนยันการชำระเงิน', en: 'Payment Verification' },
  'admin.paymentHistory': { th: 'ประวัติการชำระเงิน', en: 'Payment History' },

  // Tenant
  'tenant.myBills': { th: 'บิลของฉัน', en: 'My Bills' },
  'tenant.payment': { th: 'การชำระเงิน', en: 'Payment' },
  'tenant.paymentHistory': { th: 'ประวัติการชำระเงิน', en: 'Payment History' },
  'tenant.maintenance': { th: 'บำรุงรักษา', en: 'Maintenance' },

  // Notifications
  'notification.newBill': { th: 'บิลใหม่', en: 'New Bill' },
  'notification.paymentDue': { th: 'ใกล้จะถึงกำหนดชำระ', en: 'Payment Due' },
  'notification.maintenanceRequest': { th: 'คำขอบำรุงรักษา', en: 'Maintenance Request' },
  'notification.paymentConfirmed': { th: 'ยืนยันการชำระเงิน', en: 'Payment Confirmed' },
  'notification.noNotifications': { th: 'ไม่มีการแจ้งเตือน', en: 'No Notifications' },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('th')
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null
    if (saved === 'th' || saved === 'en') {
      setLanguage(saved)
      console.log('[v0] Language loaded from localStorage:', saved)
    }
    setMounted(true)
  }, [])

  // Save language to localStorage whenever it changes
  const handleSetLanguage = (lang: Language) => {
    console.log('[v0] Changing language from', language, 'to', lang)
    setLanguage(lang)
    localStorage.setItem('language', lang)
    console.log('[v0] Language saved to localStorage:', lang)
  }

  const t = (key: string): string => {
    const trans = translations[key as keyof typeof translations]
    if (!trans) return key
    return trans[language] || key
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
