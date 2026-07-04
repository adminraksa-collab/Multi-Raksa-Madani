const fs = require('fs');
let text = fs.readFileSync('src/translations.ts', 'utf8');

text = text.replace('  logoutText: string;\n}', '  logoutText: string;\n  requestSample: string;\n}');

text = text.replace(/logoutText: "Keluar"/g, 'logoutText: "Keluar",\n    requestSample: "Minta Sampel"');
text = text.replace(/logoutText: "Logout"/g, 'logoutText: "Logout",\n    requestSample: "Request Sample"');
text = text.replace(/logoutText: "退出"/g, 'logoutText: "退出",\n    requestSample: "申请样品"');
text = text.replace(/logoutText: "تسجيل خروج"/g, 'logoutText: "تسجيل خروج",\n    requestSample: "طلب عينة"');
text = text.replace(/logoutText: "ออกจากระบบ"/g, 'logoutText: "ออกจากระบบ",\n    requestSample: "ขอตัวอย่าง"');
text = text.replace(/logoutText: "Выйти"/g, 'logoutText: "Выйти",\n    requestSample: "Запросить образец"');
text = text.replace(/logoutText: "ログアウト"/g, 'logoutText: "ログアウト",\n    requestSample: "サンプルをリクエスト"');

fs.writeFileSync('src/translations.ts', text);
