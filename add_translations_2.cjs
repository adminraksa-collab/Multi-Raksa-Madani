const fs = require('fs');
let text = fs.readFileSync('src/translations.ts', 'utf8');

text = text.replace(/tabHome: string;/g, 'originLabel: string;\n  categoryAgri: string;\n  tabHome: string;');

text = text.replace(/tabHome: "Beranda",/g, 'originLabel: "Asal",\n    categoryAgri: "PERTANIAN / HASIL BUMI",\n    tabHome: "Beranda",');
text = text.replace(/tabHome: "Home",/g, 'originLabel: "Origin",\n    categoryAgri: "AGRICULTURE / PRODUCE",\n    tabHome: "Home",');
text = text.replace(/tabHome: "主页",/g, 'originLabel: "产地",\n    categoryAgri: "农业 / 农产品",\n    tabHome: "主页",');
text = text.replace(/tabHome: "الرئيسية",/g, 'originLabel: "الأصل",\n    categoryAgri: "الزراعة / المنتجات الزراعية",\n    tabHome: "الرئيسية",');
text = text.replace(/tabHome: "หน้าแรก",/g, 'originLabel: "แหล่งกำเนิด",\n    categoryAgri: "เกษตรกรรม / ผลิตผล",\n    tabHome: "หน้าแรก",');
text = text.replace(/tabHome: "Главная",/g, 'originLabel: "Происхождение",\n    categoryAgri: "СЕЛЬСКОЕ ХОЗЯЙСТВО / ПРОДУКЦИЯ",\n    tabHome: "Главная",');
text = text.replace(/tabHome: "ホーム",/g, 'originLabel: "原産地",\n    categoryAgri: "農業 / 農産物",\n    tabHome: "ホーム",');

fs.writeFileSync('src/translations.ts', text);
