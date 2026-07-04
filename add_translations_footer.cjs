const fs = require('fs');
let text = fs.readFileSync('src/translations.ts', 'utf8');

text = text.replace(/tabHome: string;/g, 'footerLine1: string;\n  footerLine2: string;\n  tabHome: string;');

text = text.replace(/tabHome: "Beranda",/g, 'footerLine1: "Aplikasi Manajemen Administrasi Ekspor Indonesia (ExportFlow) \\u2022 Terintegrasi dengan Karantina, Bea Cukai RI, CEISA, & INSW.",\n    footerLine2: "Proyek Simulasi Pameran Kemendag RI © 2026. Semua kalkulasi FOB dan data kepabeanan mematuhi standar INCOTERMS internasional.",\n    tabHome: "Beranda",');
text = text.replace(/tabHome: "Home",/g, 'footerLine1: "Indonesian Export Administration Management Application (ExportFlow) \\u2022 Integrated with Quarantine, Indonesian Customs, CEISA, & INSW.",\n    footerLine2: "Ministry of Trade RI Exhibition Simulation Project © 2026. All FOB calculations and customs data comply with international INCOTERMS standards.",\n    tabHome: "Home",');
text = text.replace(/tabHome: "主页",/g, 'footerLine1: "印尼出口行政管理应用程序 (ExportFlow) \\u2022 与检疫局、印尼海关、CEISA和INSW集成。",\n    footerLine2: "印尼贸易部展览模拟项目 © 2026。所有FOB计算和海关数据均符合国际INCOTERMS标准。",\n    tabHome: "主页",');
text = text.replace(/tabHome: "الرئيسية",/g, 'footerLine1: "تطبيق إدارة إدارة التصدير الإندونيسي (ExportFlow) \\u2022 متكامل مع الحجر الصحي والجمارك الإندونيسية وCEISA وINSW.",\n    footerLine2: "مشروع محاكاة معرض وزارة التجارة الإندونيسية © 2026. جميع حسابات FOB وبيانات الجمارك تتوافق مع معايير INCOTERMS الدولية.",\n    tabHome: "الرئيسية",');
text = text.replace(/tabHome: "หน้าแรก",/g, 'footerLine1: "แอปพลิเคชันการจัดการการบริหารการส่งออกของอินโดนีเซีย (ExportFlow) \\u2022 บูรณาการกับสถานกักกัน, ศุลกากรอินโดนีเซีย, CEISA และ INSW",\n    footerLine2: "โครงการจำลองนิทรรศการกระทรวงพาณิชย์อินโดนีเซีย © 2026 การคำนวณ FOB และข้อมูลศุลกากรทั้งหมดเป็นไปตามมาตรฐาน INCOTERMS สากล",\n    tabHome: "หน้าแรก",');
text = text.replace(/tabHome: "Главная",/g, 'footerLine1: "Приложение для управления экспортом Индонезии (ExportFlow) \\u2022 Интегрировано с карантином, таможней Индонезии, CEISA и INSW.",\n    footerLine2: "Проект-симулятор выставки Министерства торговли Индонезии © 2026. Все расчеты FOB и таможенные данные соответствуют международным стандартам INCOTERMS.",\n    tabHome: "Главная",');
text = text.replace(/tabHome: "ホーム",/g, 'footerLine1: "インドネシア輸出管理アプリケーション (ExportFlow) \\u2022 検疫所、インドネシア税関、CEISA、INSWと統合。",\n    footerLine2: "インドネシア貿易省展示シミュレーションプロジェクト © 2026。すべてのFOB計算と税関データは、国際的なINCOTERMS基準に準拠しています。",\n    tabHome: "ホーム",');

fs.writeFileSync('src/translations.ts', text);
