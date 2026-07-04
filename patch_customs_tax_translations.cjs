const fs = require('fs');
let c = fs.readFileSync('src/translations.ts', 'utf8');

const keysToInject = ["customsTaxLabel"];
const allLangs = ['id', 'en', 'es', 'ar', 'zh', 'jp', 'ko', 'de', 'pt'];

if(!c.includes("customsTaxLabel: string;")) {
   c = c.replace(/export interface TranslationKeys \{/, "export interface TranslationKeys {\n  customsTaxLabel: string;");
}

const matches = [...c.matchAll(/([a-z]{2}):\s*\{/g)];
for (const match of matches) {
   const langObjStartIndex = match.index;
   
   let langObjEndIndex = c.indexOf("},", langObjStartIndex);
   if (langObjEndIndex === -1) {
      langObjEndIndex = c.lastIndexOf("}"); 
   }
   
   let langStr = c.substring(langObjStartIndex, langObjEndIndex);
   
   let toInject = "";
   for(const k of keysToInject) {
      if(!langStr.includes(k + ":")) {
          let val = "'TBD'";
          if (match[1] === 'id') val = "'PABEAN & PAJAK (NPWP)'";
          else if (match[1] === 'en') val = "'CUSTOMS & TAX (NPWP)'";
          else if (match[1] === 'jp') val = "'税関と税務 (NPWP)'";
          else val = "'CUSTOMS & TAX (NPWP)'";
          toInject += "    " + k + ": " + val + ",\n";
      }
   }
   
   if (toInject) {
      c = c.replace(new RegExp(match[1] + ": \\{"), match[1] + ": {\n" + toInject);
   }
}

fs.writeFileSync('src/translations.ts', c);
