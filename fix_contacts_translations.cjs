const fs = require('fs');

let c = fs.readFileSync('src/translations.ts', 'utf8');

const keysToInject = ["telephoneContact", "whatsappContact", "emailContact"];
const allLangs = ['id', 'en', 'es', 'ar', 'zh', 'jp', 'ja', 'ko', 'de', 'pt'];

if(!c.includes("telephoneContact: string;")) {
   c = c.replace(/export interface TranslationKeys \{/, "export interface TranslationKeys {\n  telephoneContact: string;\n  whatsappContact: string;\n  emailContact: string;");
}

for (const lang of allLangs) {
    const langRegex = new RegExp(`\\b${lang}\\s*:\\s*\\{([\\s\\S]*?)(?:\\n\\s*\\},|\\n\\s*\\}$)`, 'g');
    const match = langRegex.exec(c);
    
    if (match) {
        let blockContent = match[1];
        let newBlockContent = blockContent;
        
        let defaults = "";
        for (const key of keysToInject) {
            const keyRegex = new RegExp(`^\\s*${key}\\s*:`, 'm');
            if (!keyRegex.test(newBlockContent)) {
                let val = "'TBD'";
                if (lang === 'id') {
                    if (key === 'telephoneContact') val = "'Telepon:'";
                    if (key === 'whatsappContact') val = "'WhatsApp:'";
                    if (key === 'emailContact') val = "'Email:'";
                } else if (lang === 'en') {
                    if (key === 'telephoneContact') val = "'Phone:'";
                    if (key === 'whatsappContact') val = "'WhatsApp:'";
                    if (key === 'emailContact') val = "'Email:'";
                } else if (lang === 'ja') {
                    if (key === 'telephoneContact') val = "'電話:'";
                    if (key === 'whatsappContact') val = "'WhatsApp:'";
                    if (key === 'emailContact') val = "'メール:'";
                }
                defaults += `    ${key}: ${val},\n`;
            }
        }
        
        if (defaults) {
            if (!newBlockContent.match(/,\s*$/)) {
                newBlockContent += ",";
            }
            newBlockContent = newBlockContent + "\n" + defaults;
            c = c.replace(match[0], `${lang}: {${newBlockContent}},`);
        }
    }
}

fs.writeFileSync('src/translations.ts', c);

let l = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');
l = l.replace(/Telepon: /g, '{t.telephoneContact} ');
l = l.replace(/WhatsApp: /g, '{t.whatsappContact} ');
l = l.replace(/Email: /g, '{t.emailContact} ');
fs.writeFileSync('src/components/LandingPage.tsx', l);

