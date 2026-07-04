const fs = require('fs');
let text = fs.readFileSync('src/translations.ts', 'utf8');

text = text.replace(/logoutText: "登出"/g, 'logoutText: "登出",\n    requestSample: "申请样品"');
text = text.replace(/logoutText: "تسجيل الخروج"/g, 'logoutText: "تسجيل الخروج",\n    requestSample: "طلب عينة"');

fs.writeFileSync('src/translations.ts', text);
