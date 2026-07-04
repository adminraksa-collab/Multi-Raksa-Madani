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

const matches = [...c.matchAll(/([a-z]{2}):\s*\{/g)];
for (const match of matches) {
   const langObjStartIndex = match.index;
   
   let langObjEndIndex = c.indexOf("},", langObjStartIndex);
   if (langObjEndIndex === -1) {
      langObjEndIndex = c.lastIndexOf("}"); // in case it's the very last one
   }
   
   let langStr = c.substring(langObjStartIndex, langObjEndIndex);
   
   let toInject = "";
   for(const k of keysToInject) {
      if(!langStr.includes(k + ":")) {
          toInject += "    " + k + ": 'TBD',\n";
      }
   }
   
   if (toInject) {
      c = c.replace(new RegExp(match[1] + ": \\{"), match[1] + ": {\n" + toInject);
   }
}

fs.writeFileSync('src/translations.ts', c);
