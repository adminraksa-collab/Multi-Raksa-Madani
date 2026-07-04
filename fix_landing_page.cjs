const fs = require('fs');
let text = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

text = text.replace(/\{p.category\}/g, "{p.category.toUpperCase() === 'PERTANIAN / HASIL BUMI' ? t.categoryAgri : p.category}");
text = text.replace(/<span>Asal: \{p.origin\}<\/span>/g, "<span>{t.originLabel}: {p.origin}</span>");
text = text.replace(/Asal: \{selectedSampleProduct.origin\}/g, "{t.originLabel}: {selectedSampleProduct.origin}");

fs.writeFileSync('src/components/LandingPage.tsx', text);
