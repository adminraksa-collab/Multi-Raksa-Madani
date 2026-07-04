const fs = require('fs');
let text = fs.readFileSync('src/translations.ts', 'utf8');

text = text.replace(/tabHome: string;/g, 'tabProfile: string;\n  tabCatalog: string;\n  tabHome: string;');

text = text.replace(/id: {\n(.*?)tabHome:/s, 'id: {\n    tabProfile: "Profil",\n    tabCatalog: "Katalog",\n    tabHome:');
text = text.replace(/en: {\n(.*?)tabHome:/s, 'en: {\n    tabProfile: "Profile",\n    tabCatalog: "Catalog",\n    tabHome:');
text = text.replace(/zh: {\n(.*?)tabHome:/s, 'zh: {\n    tabProfile: "简介",\n    tabCatalog: "目录",\n    tabHome:');
text = text.replace(/ar: {\n(.*?)tabHome:/s, 'ar: {\n    tabProfile: "الملف الشخصي",\n    tabCatalog: "الكتالوج",\n    tabHome:');
text = text.replace(/th: {\n(.*?)tabHome:/s, 'th: {\n    tabProfile: "ข้อมูลส่วนตัว",\n    tabCatalog: "แคตตาล็อก",\n    tabHome:');
text = text.replace(/ru: {\n(.*?)tabHome:/s, 'ru: {\n    tabProfile: "Профиль",\n    tabCatalog: "Каталог",\n    tabHome:');
text = text.replace(/ja: {\n(.*?)tabHome:/s, 'ja: {\n    tabProfile: "プロフィール",\n    tabCatalog: "カタログ",\n    tabHome:');

fs.writeFileSync('src/translations.ts', text);
