const fs = require('fs');
let c = fs.readFileSync('src/translations.ts', 'utf8');

const keysToInject = ["telephoneContact", "whatsappContact", "emailContact"];
const langs = ['id', 'en', 'es', 'ar', 'zh', 'jp', 'ja', 'ko', 'de', 'pt', 'th', 'ru'];

for (const lang of langs) {
    const langRegex = new RegExp(`\\b${lang}\\s*:\\s*\\{([\\s\\S]*?)(?:\\n\\s*\\},|\\n\\s*\\}$)`, 'g');
    const match = langRegex.exec(c);
    
    if (match) {
        let blockContent = match[1];
        
        let defaults = "";
        for (const key of keysToInject) {
            const keyRegex = new RegExp(`^\\s*${key}\\s*:`, 'm');
            if (!keyRegex.test(blockContent)) {
                let val = "'TBD'";
                defaults += `    ${key}: ${val},\n`;
            }
        }
        
        if (defaults) {
            if (!blockContent.match(/,\s*$/)) {
                blockContent += ",";
            }
            blockContent = blockContent + "\n" + defaults;
            c = c.replace(match[0], `${lang}: {${blockContent}},`);
        }
    }
}
fs.writeFileSync('src/translations.ts', c);
