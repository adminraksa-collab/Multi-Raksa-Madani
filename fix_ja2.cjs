const fs = require('fs');
let c = fs.readFileSync('src/translations.ts', 'utf8');

c = c.replace(/ja:\s*\{/, "ja: {\n    telephoneContact: '電話:',\n    whatsappContact: 'WhatsApp:',\n    emailContact: 'メール:',");
fs.writeFileSync('src/translations.ts', c);
