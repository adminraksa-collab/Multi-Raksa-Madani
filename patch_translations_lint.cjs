const fs = require('fs');
let c = fs.readFileSync('src/translations.ts', 'utf8');

const keysToInject = [
  "roleSuperadmin", "roleForwarder", "roleSupplier", "roleTrader", "roleBuyer",
  "max100Char", "emailLabel", "createAccountBtn", "loginModalTitle", 
  "registerNewAccountTitle", "placeholderRetype", "placeholderMinChars",
  "placeholderEmail", "placeholderCompany", "placeholderPhone", 
  "phoneWhatsappLabel", "ecosystemRoleLabel", "institutionLabel", 
  "confirmPasswordLabel", "passwordLabel", "placeholderExampleName"
];

const allLangs = ['id', 'en', 'es', 'ar', 'zh', 'jp', 'ko', 'de', 'pt'];

for (const lang of allLangs) {
   let langObjStartIndex = c.indexOf(lang + ": {");
   if (langObjStartIndex === -1) continue;
   
   let langObjEndIndex = c.indexOf("},", langObjStartIndex);
   let langStr = c.substring(langObjStartIndex, langObjEndIndex);
   
   let toInject = "";
   for(const k of keysToInject) {
      if(!langStr.includes(k + ":")) {
          toInject += "    " + k + ": 'TBD',\n";
      }
   }
   
   if (toInject) {
      c = c.replace(new RegExp(lang + ": \\{"), lang + ": {\n" + toInject);
   }
}

fs.writeFileSync('src/translations.ts', c);
