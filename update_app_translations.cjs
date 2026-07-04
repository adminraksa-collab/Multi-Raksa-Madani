const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

text = text.replace(/<span>Profil<\/span>/, '<span>{t.tabProfile}</span>');
text = text.replace(/<span>Katalog<\/span>/, '<span>{t.tabCatalog}</span>');

fs.writeFileSync('src/App.tsx', text);
