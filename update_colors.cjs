const fs = require('fs');
let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

content = content.replace(
/<span className="text-\[11px\] text-indigo-200 tracking-wide drop-shadow-md">\s*\{t\.companyProfileSubTitle\}\s*<\/span>/,
`<span className="text-[11px] text-yellow-400 tracking-wide drop-shadow-md">
                  {t.companyProfileSubTitle}
                </span>`
);

content = content.replace(
/<span className="text-\[10px\] text-indigo-300\/80 tracking-wide drop-shadow-md mt-0\.5">\s*\{t\.footerLine2\}\s*<\/span>/,
`<span className="text-[10px] text-yellow-400 tracking-wide drop-shadow-md mt-0.5">
                  {t.footerLine2}
                </span>`
);

content = content.replace(
/\{t\.officialLicense\}\n\s*<\/span>/,
`{t.officialLicense}
              </span>`
).replace(
/<span className="text-xs font-black text-indigo-400 tracking-wider uppercase block">\s*\{t\.officialLicense\}\s*<\/span>/,
`<span className="text-xs font-black text-yellow-400 tracking-wider uppercase block">
                {t.officialLicense}
              </span>`
);

content = content.replace(
/<span className="text-xs font-black text-indigo-400 tracking-wider uppercase block">\s*\{t\.customsTaxLabel\}\s*<\/span>/,
`<span className="text-xs font-black text-yellow-400 tracking-wider uppercase block">
                {t.customsTaxLabel}
              </span>`
);

content = content.replace(
/<span className="text-xs font-black text-indigo-400 tracking-wider uppercase block">\s*\{t\.officeAddress\}\s*<\/span>/,
`<span className="text-xs font-black text-yellow-400 tracking-wider uppercase block">
                {t.officeAddress}
              </span>`
);

content = content.replace(
/<span className="text-xs font-black text-indigo-400 tracking-wider uppercase block">\s*\{t\.contactService\}\s*<\/span>/,
`<span className="text-xs font-black text-yellow-400 tracking-wider uppercase block">
                {t.contactService}
              </span>`
);

fs.writeFileSync('src/components/LandingPage.tsx', content);
