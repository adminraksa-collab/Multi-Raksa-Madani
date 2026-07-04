const fs = require('fs');
let text = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

text = text.replace(/id: {\n(.*?)requestSample:/s, 'id: {\n    logisticsCert: "Logistik & Sertifikat",\n    requestSample:');
text = text.replace(/en: {\n(.*?)requestSample:/s, 'en: {\n    logisticsCert: "Logistics & Certificates",\n    requestSample:');
text = text.replace(/zh: {\n(.*?)requestSample:/s, 'zh: {\n    logisticsCert: "物流与证书",\n    requestSample:');
text = text.replace(/ar: {\n(.*?)requestSample:/s, 'ar: {\n    logisticsCert: "اللوجستيات والشهادات",\n    requestSample:');
text = text.replace(/th: {\n(.*?)requestSample:/s, 'th: {\n    logisticsCert: "โลจิสติกส์และใบรับรอง",\n    requestSample:');
text = text.replace(/ru: {\n(.*?)requestSample:/s, 'ru: {\n    logisticsCert: "Логистика и сертификаты",\n    requestSample:');
text = text.replace(/ja: {\n(.*?)requestSample:/s, 'ja: {\n    logisticsCert: "物流と証明書",\n    requestSample:');

text = text.replace(/<span>Logistik & Sertifikat<\/span>/g, '<span>{t.logisticsCert}</span>');

fs.writeFileSync('src/components/LandingPage.tsx', text);
