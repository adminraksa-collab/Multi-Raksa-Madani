const fs = require('fs');
let c = fs.readFileSync('src/components/LoginModal.tsx', 'utf8');

c = c.replace(/<span>Surel \(Email\) \*/g, '<span>{t.emailLabel}');
c = c.replace(/>Maks 100</g, '>{t.max100Char}<');

fs.writeFileSync('src/components/LoginModal.tsx', c);
