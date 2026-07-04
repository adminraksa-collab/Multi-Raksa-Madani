const fs = require('fs');
let c = fs.readFileSync('src/translations.ts', 'utf8');

const keysToInject = ["emailLabel", "max100Char"];
const langs = ['id', 'en', 'es', 'ar', 'zh', 'jp', 'ko', 'de', 'pt'];

for(const k of keysToInject) {
  if(!c.includes(k + ": string;")) {
     c = c.replace(/export interface TranslationKeys \{/, "export interface TranslationKeys {\n  " + k + ": string;");
  }
}

for (const lang of langs) {
   let langObjStartIndex = c.indexOf(lang + ": {");
   if (langObjStartIndex === -1) continue;
   
   let langObjEndIndex = c.indexOf("},", langObjStartIndex);
   let langStr = c.substring(langObjStartIndex, langObjEndIndex);
   
   let toInject = "";
   for(const k of keysToInject) {
      if(!langStr.includes(k + ":")) {
          let val = "'TBD'";
          if (lang === 'id') {
             if (k === 'emailLabel') val = "'Surel (Email) *'";
             if (k === 'max100Char') val = "'Maks 100'";
          } else if (lang === 'en') {
             if (k === 'emailLabel') val = "'Email Address *'";
             if (k === 'max100Char') val = "'Max 100'";
          } else if (lang === 'jp') {
             if (k === 'emailLabel') val = "'メールアドレス *'";
             if (k === 'max100Char') val = "'最大100'";
          }
          toInject += "    " + k + ": " + val + ",\n";
      }
   }
   
   if (toInject) {
      c = c.replace(new RegExp(lang + ": \\{"), lang + ": {\n" + toInject);
   }
}

fs.writeFileSync('src/translations.ts', c);
