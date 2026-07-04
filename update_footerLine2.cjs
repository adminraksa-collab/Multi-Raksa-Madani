const fs = require('fs');
let text = fs.readFileSync('src/translations.ts', 'utf8');

text = text.replace(/footerLine2: "Proyek Simulasi Pameran Kemendag RI © 2026\. Semua kalkulasi FOB dan data kepabeanan mematuhi standar INCOTERMS internasional\."/g, 'footerLine2: "Semua kalkulasi FOB dan data kepabeanan mematuhi standar INCOTERMS internasional."');
text = text.replace(/footerLine2: "Ministry of Trade RI Exhibition Simulation Project © 2026\. All FOB calculations and customs data comply with international INCOTERMS standards\."/g, 'footerLine2: "All FOB calculations and customs data comply with international INCOTERMS standards."');
text = text.replace(/footerLine2: "印尼贸易部展览模拟项目 © 2026。所有FOB计算和海关数据均符合国际INCOTERMS标准。"/g, 'footerLine2: "所有FOB计算和海关数据均符合国际INCOTERMS标准。"');
text = text.replace(/footerLine2: "مشروع محاكاة معرض وزارة التجارة الإندونيسية © 2026\. جميع حسابات FOB وبيانات الجمارك تتوافق مع معايير INCOTERMS الدولية\."/g, 'footerLine2: "جميع حسابات FOB وبيانات الجمارك تتوافق مع معايير INCOTERMS الدولية."');
text = text.replace(/footerLine2: "โครงการจำลองนิทรรศการกระทรวงพาณิชย์อินโดนีเซีย © 2026 การคำนวณ FOB และข้อมูลศุลกากรทั้งหมดเป็นไปตามมาตรฐาน INCOTERMS สากล"/g, 'footerLine2: "การคำนวณ FOB และข้อมูลศุลกากรทั้งหมดเป็นไปตามมาตรฐาน INCOTERMS สากล"');
text = text.replace(/footerLine2: "Проект-симулятор выставки Министерства торговли Индонезии © 2026\. Все расчеты FOB и таможенные данные соответствуют международным стандартам INCOTERMS\."/g, 'footerLine2: "Все расчеты FOB и таможенные данные соответствуют международным стандартам INCOTERMS."');
text = text.replace(/footerLine2: "インドネシア貿易省展示シミュレーションプロジェクト © 2026。すべてのFOB計算と税関データは、国際的なINCOTERMS基準に準拠しています。"/g, 'footerLine2: "すべてのFOB計算と税関データは、国際的なINCOTERMS基準に準拠しています。"');

fs.writeFileSync('src/translations.ts', text);
