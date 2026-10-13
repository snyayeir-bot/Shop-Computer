import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  kh: {
    // Navigation
    nav: {
      brandSub: 'គ្រឿងបន្លាស់ & Laptops',
      searchPlaceholder: 'ស្វែងរក RTX 4090, Ryzen 7800X3D, DDR5, ROG Laptop...',
      catalog: 'កាតាឡុកទំនិញ',
      sellerPortal: 'ផ្ទាំងអ្នកលក់',
      adminPanel: 'ផ្ទាំងគ្រប់គ្រង',
      dashboard: 'ផ្ទាំងផ្ទាល់ខ្លួន',
      credits: 'Credits',
      topUp: '+ បញ្ចូលលុយ',
      signIn: 'ចូលគណនី',
      register: 'ចុះឈ្មោះ',
      logout: 'ចាកចេញ',
      viewCart: 'មើលកន្ត្រកទំនិញ',
    },
    // Home Page
    home: {
      badge: 'ទីផ្សារកុំព្យូទ័រ និងគ្រឿងបន្លាស់ជំនាន់ថ្មី',
      heroTitle1: 'បញ្ចេញថាមពល',
      heroTitle2: 'កុំព្យូទ័រកម្រិតខ្ពស់',
      heroSubtitle: 'ភ្ជាប់ទំនាក់ទំនងផ្ទាល់ជាមួយហាងលក់គ្រឿងបន្លាស់កុំព្យូទ័រឈានមុខគេក្នុងប្រទេសកម្ពុជា។ ផ្គត់ផ្គង់ GPU, CPU, RAM DDR5 និង Gaming Laptop ធានាសុទ្ធ ១០០%។',
      exploreCatalog: 'ស្វែងរកកាតាឡុក',
      becomeSeller: 'បើកហាងលក់',
      hardwareCategories: 'ប្រភេទគ្រឿងបន្លាស់',
      categoriesSubtitle: 'ស្វែងរកតាមប្រភេទគ្រឿងបន្លាស់កុំព្យូទ័រដែលអ្នកត្រូវការ',
      featuredTitle: 'ផលិតផលពេញនិយម',
      featuredSubtitle: 'គ្រឿងបន្លាស់កុំព្យូទ័រថ្មីៗ និងលក់ដាច់បំផុតប្រចាំសប្តាហ៍',
      viewAll: 'មើលទាំងអស់',
      verifiedVendors: 'ហាងលក់មានការបញ្ជាក់',
      genuineHardware: 'គ្រឿងបន្លាស់សុទ្ធ ១០០%',
      expressDelivery: 'ដឹកជញ្ជូនរហ័សទូទាំងប្រទេស',
      securePayments: 'ទូទាត់ Bakong KHQR សុវត្ថិភាព',
    },
    // Catalog Page
    catalog: {
      title: 'កាតាឡុកគ្រឿងបន្លាស់កុំព្យូទ័រ',
      subtitle: 'ស្វែងរក និងចម្រាញ់ផលិតផលតាម Category និង Spec បច្ចេកទេស',
      allCategories: 'គ្រប់ប្រភេទ',
      filters: 'ចម្រាញ់ទំនិញ',
      priceRange: 'កម្រិតតម្លៃ',
      inStockOnly: 'មានក្នុងស្តុកតែប៉ុណ្ណោះ',
      brand: 'ម៉ាក (Brand)',
      addToCart: 'ដាក់កន្ត្រក',
      buyNow: 'ទិញភ្លាមៗ',
      inStock: 'មានក្នុងស្តុក',
      lowStock: 'ស្តុកនៅសល់តិច',
      outOfStock: 'អស់ពីស្តុក',
      noProducts: 'រកមិនឃើញផលិតផលដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ',
    },
    // Cart Drawer
    cart: {
      title: 'កន្ត្រកទំនិញរបស់អ្នក',
      items: 'មុខទំនិញ',
      subtotal: 'តម្លៃសរុប',
      shipping: 'ថ្លៃដឹកជញ្ជូន',
      freeShipping: 'ឥតគិតថ្លៃ',
      vatTax: 'ពន្ធ VAT (10%)',
      grandTotal: 'ទឹកប្រាក់ត្រូវបង់សរុប',
      proceedCheckout: 'បន្តទៅការទូទាត់',
      emptyTitle: 'កន្ត្រករបស់អ្នកទទេ',
      emptyDesc: 'អ្នកមិនទាន់បានបន្ថែមគ្រឿងបន្លាស់ណាមួយទៅក្នុងកន្ត្រកនៅឡើយទេ',
      startShopping: 'ចាប់ផ្តើមទិញទំនិញ',
      remove: 'លុបចេញ',
      clearCart: 'សម្អាតកន្ត្រក',
    },
    // Top-Up Modal
    topup: {
      title: 'បញ្ចូលទឹកប្រាក់កាបូបលុយ (Top-Up)',
      subtitle: 'ស្គែន Bakong KHQR ឬ Upload Slip ធនាគារដើម្បីទទួលបាន Credits ស្វ័យប្រវត្តិ',
      scanPayTab: 'ស្គែន & បញ្ចូលលុយ',
      historyTab: 'ប្រវត្តិប្រតិបត្តិការ',
      rateNotice: 'អត្រាប្តូរប្រាក់៖ $1 = 1 Credit | ៤,០០០៛ = ១ Credit',
      uploadSlip: 'Upload រូបភាពបង្កាន់ដៃ (Bank Slip)',
      dropHere: 'ចុច ឬទម្លាក់រូបភាពបង្កាន់ដៃផ្ទេរប្រាក់ទីនេះ (PNG, JPG)',
      aiAnalyzing: 'AI កំពុងវិភាគ និងផ្ទៀងផ្ទាត់បង្កាន់ដៃ...',
      confirmTopUp: 'បញ្ជាក់ការបញ្ចូល Credits',
      successTitle: 'បញ្ចូល Credits ជោគជ័យ!',
      currentBalance: 'សមតុល្យបច្ចុប្បន្ន',
      transactionId: 'លេខប្រតិបត្តិការ (TxID)',
      amount: 'ចំនួនទឹកប្រាក់',
      creditsAdded: 'Credits ទទួលបាន',
    },
    // Checkout Page
    checkout: {
      title: 'ការទូទាត់ប្រាក់ (Checkout)',
      shippingAddress: 'អាសយដ្ឋានដឹកជញ្ជូន',
      fullName: 'ឈ្មោះពេញ',
      phone: 'លេខទូរស័ព្ទ',
      city: 'រាជធានី / ខេត្ត',
      paymentMethod: 'វិធីសាស្ត្រទូទាត់ប្រាក់',
      walletCredits: 'ទូទាត់តាម Wallet Credits',
      khqrPayment: 'ទូទាត់តាម Bakong KHQR',
      placeOrder: 'បញ្ជាក់ការបញ្ជាទិញ',
      orderSummary: 'សង្ខេបការបញ្ជាទិញ',
    },
    // Admin Dashboard
    admin: {
      pageTitle: 'ផ្ទាំងគ្រប់គ្រង Super Admin',
      pageSubtitle: 'ការគ្រប់គ្រងវេទិកា ការអនុម័តហាងពហុអ្នកលក់ និងប្រតិបត្តិការប្រព័ន្ធ',
      tabOverview: 'ទិដ្ឋភាពទូទៅ & ហិរញ្ញវត្ថុ',
      tabTopups: 'ការបញ្ចូលលុយ Slip',
      tabWithdrawals: 'ការដកប្រាក់',
      totalUsers: 'អ្នកប្រើប្រាស់សរុប',
      buyers: 'អ្នកទិញ',
      sellers: 'អ្នកលក់',
      hardwareProducts: 'ផលិតផលគ្រឿងបន្លាស់',
      acrossApproved: 'ទូទាំងហាងដែលបានអនុម័ត',
      totalOrders: 'ការបញ្ជាទិញសរុប',
      paidOrders: 'ការបញ្ជាទិញបានបង់ប្រាក់',
      dailyVisitors: 'អ្នកចូលទស្សនាប្រចាំថ្ងៃ',
      pageViewsToday: 'ការមើលទំព័រថ្ងៃនេះ',
      financialTitle: 'គណនេយ្យហិរញ្ញវត្ថុ & ចំណូលវេទិកា',
      financialSubtitle: 'ការគណនាផ្ទាល់នៃទំហំពាណិជ្ជកម្មសរុប (GMV), កម្រៃជើងសារ 5%, និងការចំណាយ Server',
      totalMarketplaceVolume: 'ទំហំពាណិជ្ជកម្មទីផ្សារសរុប',
      platformCommission: 'កម្រៃជើងសារវេទិកា (5%)',
      grossRevenue: 'ចំណូលដុលរបស់វេទិកា',
      serverExpenses: 'ការចំណាយលើ Server & CDN',
      cloudInfra: 'ហេដ្ឋារចនាសម្ព័ន្ធ Cloud & Hosting',
      netProfit: 'ប្រាក់ចំណេញសុទ្ធរបស់វេទិកា',
      afterCosts: 'ក្រោយទូទាត់ការចំណាយប្រតិបត្តិការ',
      vendorModerationTitle: 'ជួររង់ចាំអនុម័តហាងអ្នកលក់',
      vendorModerationSubtitle: 'ពិនិត្យមើលពាក្យស្នើសុំបង្កើតហាង និងអនុម័ត / បដិសេធ',
      storesRegistered: 'ហាងអ្នកលក់បានចុះឈ្មោះ',
      storeName: 'ឈ្មោះហាង',
      ownerDetails: 'ព័ត៌មានម្ចាស់ហាង',
      itemsListed: 'ចំនួនទំនិញ',
      shopBalance: 'សមតុល្យហាង',
      currentStatus: 'ស្ថានភាពបច្ចុប្បន្ន',
      actions: 'សកម្មភាព',
      approve: 'អនុម័ត',
      reject: 'បដិសេធ',
      pending: 'រង់ចាំពិនិត្យ',
      approved: 'បានអនុម័ត',
      rejected: 'បានបដិសេធ',
    },
    // Footer Section
    footer: {
      genuineTitle: 'គ្រឿងបន្លាស់សុទ្ធ ១០០%',
      genuineDesc: 'ធានាត្រឹមត្រូវពីរោងចក្រ និងតំណាងចែកចាយ',
      deliveryTitle: 'ដឹកជញ្ជូនរហ័សទូទាំងប្រទេស',
      deliveryDesc: 'រយៈពេល ២៤-៤៨ ម៉ោងទូទាំង ២៥ ខេត្ត-ក្រុង',
      khqrTitle: 'ទូទាត់រហ័សតាម KHQR & កាត',
      khqrDesc: 'Bakong KHQR ស្កេនទូទាត់ភ្លាមៗ និងសុវត្ថិភាព',
      multiVendorTitle: 'ហាងលក់មានការបញ្ជាក់ត្រឹមត្រូវ',
      multiVendorDesc: 'ត្រួតពិនិត្យ និងអនុម័តហាងម៉ត់ចត់បំផុត',
      brandDesc: 'វេទិកាពាណិជ្ជកម្មអេឡិចត្រូនិចលក់គ្រឿងបន្លាស់កុំព្យូទ័រ និង Laptop ឈានមុខគេក្នុងប្រទេសកម្ពុជា។',
      techStack: 'បង្កើតដោយ Node.js & React',
      categoriesTitle: 'ប្រភេទគ្រឿងបន្លាស់',
      portalsTitle: 'អ្នកលក់ & ផ្ទាំងគ្រប់គ្រង',
      supportTitle: 'ការទូទាត់ & ជំនួយ',
      supportDesc: 'គាំទ្រ Bakong KHQR, Visa/Mastercard និងការធានាផ្ទាល់ពីហាង។',
      hotline: 'លេខទូរស័ព្ទជំនួយ:',
      copyright: '© 2026 CYBERTECH Multi-Vendor Platform. រក្សាសិទ្ធិគ្រប់យ៉ាង។',
      poweredBy: 'ដំណើរការដោយ React + Tailwind + Express.js + MySQL/SQLite Engine',
    },
    // Common / Global
    common: {
      loading: 'កំពុងផ្ទុក...',
      error: 'មានបញ្ហាបច្ចេកទេស',
      success: 'ជោគជ័យ',
      close: 'បិទ',
      cancel: 'បោះបង់',
      confirm: 'យល់ព្រម',
      credits: 'Credits',
      usd: 'USD',
      khr: 'KHR',
      language: 'ភាសា',
    }
  },
  en: {
    // Navigation
    nav: {
      brandSub: 'Hardware & Laptops',
      searchPlaceholder: 'Search RTX 4090, Ryzen 7800X3D, DDR5, ROG Laptop...',
      catalog: 'Hardware Catalog',
      sellerPortal: 'Seller Portal',
      adminPanel: 'Admin Panel',
      dashboard: 'Dashboard',
      credits: 'Credits',
      topUp: '+ Top-Up',
      signIn: 'Sign In',
      register: 'Register Account',
      logout: 'Log out',
      viewCart: 'View Cart',
    },
    // Home Page
    home: {
      badge: 'Next-Gen Multi-Vendor Computer Hardware Marketplace',
      heroTitle1: 'UNLEASH MAXIMUM',
      heroTitle2: 'COMPUTING POWER',
      heroSubtitle: 'Directly connect with top verified hardware vendors in Cambodia. Source flagship GPUs, Ryzen & Intel CPUs, DDR5 RAM, and high-refresh OLED laptops with guaranteed genuine warranties.',
      exploreCatalog: 'Explore Catalog',
      becomeSeller: 'Become a Seller',
      hardwareCategories: 'Hardware Categories',
      categoriesSubtitle: 'Select the hardware components you need for your battle station',
      featuredTitle: 'Featured Hardware',
      featuredSubtitle: 'Top-rated components & flagship gaming gear of the week',
      viewAll: 'View All Products',
      verifiedVendors: 'Verified Vendors',
      genuineHardware: '100% Genuine Hardware',
      expressDelivery: 'Nationwide Express Shipping',
      securePayments: 'Secure KHQR & Wallet Payments',
    },
    // Catalog Page
    catalog: {
      title: 'Hardware Catalog',
      subtitle: 'Browse & filter flagship GPUs, processors, motherboards, and laptops',
      allCategories: 'All Categories',
      filters: 'Hardware Filters',
      priceRange: 'Price Range',
      inStockOnly: 'In Stock Only',
      brand: 'Brand',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
      noProducts: 'No products found matching your filter criteria.',
    },
    // Cart Drawer
    cart: {
      title: 'Your Shopping Cart',
      items: 'items',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      freeShipping: 'FREE',
      vatTax: 'VAT Tax (10%)',
      grandTotal: 'Grand Total',
      proceedCheckout: 'Proceed to Checkout',
      emptyTitle: 'Your Cart is Empty',
      emptyDesc: 'You haven\'t added any hardware components yet.',
      startShopping: 'Start Shopping',
      remove: 'Remove',
      clearCart: 'Clear Cart',
    },
    // Top-Up Modal
    topup: {
      title: 'Top-Up Wallet Credits',
      subtitle: 'Scan Bakong KHQR or Upload Bank Slip for automatic credits verification',
      scanPayTab: 'Scan & Pay',
      historyTab: 'Top-Up History',
      rateNotice: 'Exchange Rate: $1 = 1 Credit | 4,000 KHR = 1 Credit',
      uploadSlip: 'Upload Bank Slip Image',
      dropHere: 'Click or drop payment slip image here (PNG, JPG)',
      aiAnalyzing: 'AI is analyzing & verifying slip with Gemini Vision...',
      confirmTopUp: 'Confirm Top-Up Credits',
      successTitle: 'Credits Added Successfully!',
      currentBalance: 'Current Balance',
      transactionId: 'Transaction ID (TxID)',
      amount: 'Amount',
      creditsAdded: 'Credits Added',
    },
    // Checkout Page
    checkout: {
      title: 'Checkout & Order Confirmation',
      shippingAddress: 'Shipping Address',
      fullName: 'Full Name',
      phone: 'Phone Number',
      city: 'City / Province',
      paymentMethod: 'Payment Method',
      walletCredits: 'Pay with Wallet Credits',
      khqrPayment: 'Pay with Bakong KHQR',
      placeOrder: 'Place Order',
      orderSummary: 'Order Summary',
    },
    // Admin Dashboard
    admin: {
      pageTitle: 'Super Admin Operational Panel',
      pageSubtitle: 'Platform Governance, Multi-Vendor Verification & System Operations',
      tabOverview: 'Overview & Financials',
      tabTopups: 'Slip Top-Ups',
      tabWithdrawals: 'Withdrawals',
      totalUsers: 'Total Users',
      buyers: 'Buyers',
      sellers: 'Sellers',
      hardwareProducts: 'Hardware Products',
      acrossApproved: 'Across approved stores',
      totalOrders: 'Total Platform Orders',
      paidOrders: 'Paid Orders',
      dailyVisitors: 'Live Daily Visitors',
      pageViewsToday: 'Page Views Today',
      financialTitle: 'Financial Accounting & Platform Revenue',
      financialSubtitle: 'Live calculations of Gross Merchandise Value (GMV), 5% commission, and hosting expenses',
      totalMarketplaceVolume: 'Total Marketplace Volume',
      platformCommission: 'Platform Commission (5%)',
      grossRevenue: 'Gross Platform Revenue',
      serverExpenses: 'Server & CDN Expenses',
      cloudInfra: 'Cloud infra & edge hosting',
      netProfit: 'Net Platform Profit',
      afterCosts: 'After operational costs',
      vendorModerationTitle: 'Vendor Store Moderation Queue',
      vendorModerationSubtitle: 'Review new store applications and toggle Approve / Reject status',
      storesRegistered: 'Vendor Stores Registered',
      storeName: 'Store / Shop Name',
      ownerDetails: 'Owner Details',
      itemsListed: 'Items Listed',
      shopBalance: 'Shop Balance',
      currentStatus: 'Current Status',
      actions: 'Moderation Actions',
      approve: 'Approve',
      reject: 'Reject',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    // Footer Section
    footer: {
      genuineTitle: '100% Genuine Hardware',
      genuineDesc: 'Official distributor warranties',
      deliveryTitle: 'Fast Nationwide Delivery',
      deliveryDesc: '24-48h arrival across Cambodia',
      khqrTitle: 'Instant KHQR & Card',
      khqrDesc: 'Bakong KHQR seamless checkout',
      multiVendorTitle: 'Multi-Vendor Verified',
      multiVendorDesc: 'Strict store moderation queue',
      brandDesc: 'Leading multi-vendor computer parts, PC builder hardware, and high-performance gaming laptops marketplace in Cambodia.',
      techStack: 'Built with Node.js & React',
      categoriesTitle: 'Hardware Categories',
      portalsTitle: 'Vendor & Portals',
      supportTitle: 'Payment & Support',
      supportDesc: 'Support Bakong KHQR, Visa/Mastercard, and Cash on Delivery with direct vendor warranty verification.',
      hotline: 'Support Hot-Line:',
      copyright: '© 2026 CYBERTECH Multi-Vendor Platform. All rights reserved.',
      poweredBy: 'Powered by React + Tailwind + Express.js + MySQL/SQLite Engine',
    },
    // Common / Global
    common: {
      loading: 'Loading...',
      error: 'Technical Error',
      success: 'Success',
      close: 'Close',
      cancel: 'Cancel',
      confirm: 'Confirm',
      credits: 'Credits',
      usd: 'USD',
      khr: 'KHR',
      language: 'Language',
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('cybertech_language') || 'kh';
  });

  const setLang = (newLang) => {
    if (newLang === 'kh' || newLang === 'en') {
      setLangState(newLang);
      localStorage.setItem('cybertech_language', newLang);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'kh' ? 'en' : 'kh');
  };

  // Helper translation function with dot notation support: t('nav.catalog')
  const t = (path, fallback = '') => {
    const keys = path.split('.');
    let current = translations[lang];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English if missing in current language
        let enCurrent = translations.en;
        for (const enKey of keys) {
          if (enCurrent && enCurrent[enKey] !== undefined) {
            enCurrent = enCurrent[enKey];
          } else {
            return fallback || path;
          }
        }
        return enCurrent || fallback || path;
      }
    }

    return current || fallback || path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
