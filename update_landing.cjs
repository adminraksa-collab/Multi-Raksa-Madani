const fs = require('fs');
let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

content = content.replace(
/<span className="text-\[11px\] text-indigo-200 tracking-wide drop-shadow-md">\s*\{t\.companyProfileSubTitle\}\s*<\/span>/,
`<span className="text-[11px] text-indigo-200 tracking-wide drop-shadow-md">
                  {t.companyProfileSubTitle}
                </span>
                <span className="text-[10px] text-indigo-300/80 tracking-wide drop-shadow-md mt-0.5">
                  {translations[lang as keyof typeof translations]?.footerLine2 || translations.id.footerLine2}
                </span>`
);

fs.writeFileSync('src/components/LandingPage.tsx', content);
