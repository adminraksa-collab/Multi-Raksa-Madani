const fs = require('fs');
let text = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

text = text.replace(/id: {\n(.*?)heroTagline:/s, 'id: {\n    requestSample: "Minta Sampel",\n    heroTagline:');
text = text.replace(/en: {\n(.*?)heroTagline:/s, 'en: {\n    requestSample: "Request Sample",\n    heroTagline:');
text = text.replace(/zh: {\n(.*?)heroTagline:/s, 'zh: {\n    requestSample: "申请样品",\n    heroTagline:');
text = text.replace(/ar: {\n(.*?)heroTagline:/s, 'ar: {\n    requestSample: "طلب عينة",\n    heroTagline:');
text = text.replace(/th: {\n(.*?)heroTagline:/s, 'th: {\n    requestSample: "ขอตัวอย่าง",\n    heroTagline:');
text = text.replace(/ru: {\n(.*?)heroTagline:/s, 'ru: {\n    requestSample: "Запросить образец",\n    heroTagline:');
text = text.replace(/ja: {\n(.*?)heroTagline:/s, 'ja: {\n    requestSample: "サンプルをリクエスト",\n    heroTagline:');

text = text.replace(/<span>Minta Sampel<\/span>/g, '<span>{t.requestSample}</span>');

fs.writeFileSync('src/components/LandingPage.tsx', text);
