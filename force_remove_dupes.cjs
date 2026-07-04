const fs = require('fs');
let c = fs.readFileSync('src/translations.ts', 'utf8');
c = c.replace(/roleSuperadmin:\s*'TBD',\n/g, '');
c = c.replace(/roleForwarder:\s*'TBD',\n/g, '');
c = c.replace(/roleSupplier:\s*'TBD',\n/g, '');
c = c.replace(/roleTrader:\s*'TBD',\n/g, '');
c = c.replace(/roleBuyer:\s*'TBD',\n/g, '');
c = c.replace(/max100Char:\s*'TBD',\n/g, '');
c = c.replace(/emailLabel:\s*'TBD',\n/g, '');
c = c.replace(/createAccountBtn:\s*'TBD',\n/g, '');
c = c.replace(/loginModalTitle:\s*'TBD',\n/g, '');
c = c.replace(/registerNewAccountTitle:\s*'TBD',\n/g, '');
c = c.replace(/placeholderRetype:\s*'TBD',\n/g, '');
c = c.replace(/placeholderMinChars:\s*'TBD',\n/g, '');
c = c.replace(/placeholderEmail:\s*'TBD',\n/g, '');
c = c.replace(/placeholderCompany:\s*'TBD',\n/g, '');
c = c.replace(/placeholderPhone:\s*'TBD',\n/g, '');
c = c.replace(/phoneWhatsappLabel:\s*'TBD',\n/g, '');
c = c.replace(/ecosystemRoleLabel:\s*'TBD',\n/g, '');
c = c.replace(/institutionLabel:\s*'TBD',\n/g, '');
c = c.replace(/confirmPasswordLabel:\s*'TBD',\n/g, '');
c = c.replace(/passwordLabel:\s*'TBD',\n/g, '');
c = c.replace(/placeholderExampleName:\s*'TBD',\n/g, '');

const allLangs = ['id', 'en', 'es', 'ar', 'zh', 'jp', 'ko', 'de', 'pt'];
for (const lang of allLangs) {
   let langObjStartIndex = c.indexOf(lang + ": {");
   if (langObjStartIndex !== -1) {
       c = c.replace(new RegExp(lang + ": \\{"), lang + ": {\n    roleSuperadmin: 'TBD',\n    roleForwarder: 'TBD',\n    roleSupplier: 'TBD',\n    roleTrader: 'TBD',\n    roleBuyer: 'TBD',\n    max100Char: 'TBD',\n    emailLabel: 'TBD',\n    createAccountBtn: 'TBD',\n    loginModalTitle: 'TBD',\n    registerNewAccountTitle: 'TBD',\n    placeholderRetype: 'TBD',\n    placeholderMinChars: 'TBD',\n    placeholderEmail: 'TBD',\n    placeholderCompany: 'TBD',\n    placeholderPhone: 'TBD',\n    phoneWhatsappLabel: 'TBD',\n    ecosystemRoleLabel: 'TBD',\n    institutionLabel: 'TBD',\n    confirmPasswordLabel: 'TBD',\n    passwordLabel: 'TBD',\n    placeholderExampleName: 'TBD',");
   }
}
fs.writeFileSync('src/translations.ts', c);
