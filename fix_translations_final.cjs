const fs = require('fs');
let text = fs.readFileSync('src/translations.ts', 'utf8');

text = text.replace(/tabHome: string;/g, 'tabProfile: string;\n  tabCatalog: string;\n  requestSample: string;\n  logisticsCert: string;\n  originLabel: string;\n  categoryAgri: string;\n  tabHome: string;');

text = text.replace(/tabHome: "Beranda",/g, 'tabProfile: "Profil",\n    tabCatalog: "Katalog",\n    requestSample: "Minta Sampel",\n    logisticsCert: "Logistik & Sertifikat",\n    originLabel: "Asal",\n    categoryAgri: "PERTANIAN / HASIL BUMI",\n    tabHome: "Beranda",');
text = text.replace(/tabHome: "Home",/g, 'tabProfile: "Profile",\n    tabCatalog: "Catalog",\n    requestSample: "Request Sample",\n    logisticsCert: "Logistics & Certificates",\n    originLabel: "Origin",\n    categoryAgri: "AGRICULTURE / PRODUCE",\n    tabHome: "Home",');
text = text.replace(/tabHome: "主页",/g, 'tabProfile: "简介",\n    tabCatalog: "目录",\n    requestSample: "申请样品",\n    logisticsCert: "物流与证书",\n    originLabel: "产地",\n    categoryAgri: "农业 / 农产品",\n    tabHome: "主页",');
text = text.replace(/tabHome: "الرئيسية",/g, 'tabProfile: "الملف الشخصي",\n    tabCatalog: "الكتالوج",\n    requestSample: "طلب عينة",\n    logisticsCert: "اللوجستيات والشهادات",\n    originLabel: "الأصل",\n    categoryAgri: "الزراعة / المنتجات الزراعية",\n    tabHome: "الرئيسية",');
text = text.replace(/tabHome: "หน้าแรก",/g, 'tabProfile: "ข้อมูลส่วนตัว",\n    tabCatalog: "แคตตาล็อก",\n    requestSample: "ขอตัวอย่าง",\n    logisticsCert: "โลจิสติกส์และใบรับรอง",\n    originLabel: "แหล่งกำเนิด",\n    categoryAgri: "เกษตรกรรม / ผลิตผล",\n    tabHome: "หน้าแรก",');
text = text.replace(/tabHome: "Главная",/g, 'tabProfile: "Профиль",\n    tabCatalog: "Каталог",\n    requestSample: "Запросить образец",\n    logisticsCert: "Логистика и сертификаты",\n    originLabel: "Происхождение",\n    categoryAgri: "СЕЛЬСКОЕ ХОЗЯЙСТВО / ПРОДУКЦИЯ",\n    tabHome: "Главная",');
text = text.replace(/tabHome: "ホーム",/g, 'tabProfile: "プロフィール",\n    tabCatalog: "カタログ",\n    requestSample: "サンプルをリクエスト",\n    logisticsCert: "物流と証明書",\n    originLabel: "原産地",\n    categoryAgri: "農業 / 農産物",\n    tabHome: "ホーム",');

fs.writeFileSync('src/translations.ts', text);
