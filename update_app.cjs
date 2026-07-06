const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
/<p className="text-\[12px\] text-gray-400">\s*\{t\.footerLine2\}\s*<\/p>/,
``
);

fs.writeFileSync('src/App.tsx', content);
