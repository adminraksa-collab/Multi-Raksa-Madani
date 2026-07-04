const fs = require('fs');
let c = fs.readFileSync('src/translations.ts', 'utf8');

const keysToInject = [
  "placeholderExampleName", "passwordLabel", "confirmPasswordLabel",
  "institutionLabel", "ecosystemRoleLabel", "phoneWhatsappLabel",
  "placeholderPhone", "placeholderCompany", "placeholderEmail",
  "placeholderMinChars", "placeholderRetype", "registerNewAccountTitle",
  "loginModalTitle", "createAccountBtn"
];

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
          // Set appropriate defaults for 'id' and 'en'
          let val = "'TBD'";
          if (lang === 'id') {
             if (k === 'placeholderExampleName') val = "'Contoh: Kenji Sato'";
             if (k === 'passwordLabel') val = "'Sandi *'";
             if (k === 'confirmPasswordLabel') val = "'Konfirmasi *'";
             if (k === 'institutionLabel') val = "'Instansi *'";
             if (k === 'ecosystemRoleLabel') val = "'Peran Ekosistem'";
             if (k === 'phoneWhatsappLabel') val = "'Nomor Telepon / WhatsApp *'";
             if (k === 'placeholderPhone') val = "'Contoh: +6281234567890'";
             if (k === 'placeholderCompany') val = "'Nama perusahaan'";
             if (k === 'placeholderEmail') val = "'nama@perusahaan.com'";
             if (k === 'placeholderMinChars') val = "'Min 6 karakter'";
             if (k === 'placeholderRetype') val = "'Ketik ulang'";
             if (k === 'registerNewAccountTitle') val = "'DAFTAR AKUN BARU'";
             if (k === 'loginModalTitle') val = "'MASUK AKUN'";
             if (k === 'createAccountBtn') val = "'BUAT AKUN BARU'";
          } else if (lang === 'en') {
             if (k === 'placeholderExampleName') val = "'Example: Kenji Sato'";
             if (k === 'passwordLabel') val = "'Password *'";
             if (k === 'confirmPasswordLabel') val = "'Confirm *'";
             if (k === 'institutionLabel') val = "'Institution *'";
             if (k === 'ecosystemRoleLabel') val = "'Ecosystem Role'";
             if (k === 'phoneWhatsappLabel') val = "'Phone / WhatsApp *'";
             if (k === 'placeholderPhone') val = "'Example: +6281234567890'";
             if (k === 'placeholderCompany') val = "'Company Name'";
             if (k === 'placeholderEmail') val = "'name@company.com'";
             if (k === 'placeholderMinChars') val = "'Min 6 chars'";
             if (k === 'placeholderRetype') val = "'Retype'";
             if (k === 'registerNewAccountTitle') val = "'REGISTER NEW ACCOUNT'";
             if (k === 'loginModalTitle') val = "'LOGIN ACCOUNT'";
             if (k === 'createAccountBtn') val = "'CREATE NEW ACCOUNT'";
          } else if (lang === 'jp') {
             if (k === 'placeholderExampleName') val = "'例: Kenji Sato'";
             if (k === 'passwordLabel') val = "'パスワード *'";
             if (k === 'confirmPasswordLabel') val = "'確認 *'";
             if (k === 'institutionLabel') val = "'機関 *'";
             if (k === 'ecosystemRoleLabel') val = "'エコシステムの役割'";
             if (k === 'phoneWhatsappLabel') val = "'電話 / WhatsApp *'";
             if (k === 'placeholderPhone') val = "'例: +6281234567890'";
             if (k === 'placeholderCompany') val = "'会社名'";
             if (k === 'placeholderEmail') val = "'name@company.com'";
             if (k === 'placeholderMinChars') val = "'最低6文字'";
             if (k === 'placeholderRetype') val = "'再入力'";
             if (k === 'registerNewAccountTitle') val = "'新しいアカウントを登録'";
             if (k === 'loginModalTitle') val = "'アカウントにログイン'";
             if (k === 'createAccountBtn') val = "'新しいアカウントを作成'";
          }
          toInject += "    " + k + ": " + val + ",\n";
      }
   }
   
   if (toInject) {
      c = c.replace(new RegExp(lang + ": \\{"), lang + ": {\n" + toInject);
   }
}

fs.writeFileSync('src/translations.ts', c);
