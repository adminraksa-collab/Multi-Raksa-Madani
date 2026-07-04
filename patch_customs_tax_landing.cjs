const fs = require('fs');
let c = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

c = c.replace(/Pabean & Pajak \(NPWP\)/g, '{t.customsTaxLabel}');

fs.writeFileSync('src/components/LandingPage.tsx', c);
