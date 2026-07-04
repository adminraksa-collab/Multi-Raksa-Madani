const fs = require('fs');

let c = fs.readFileSync('src/translations.ts', 'utf8');

const keysToInject = [
  "roleSuperadmin", "roleForwarder", "roleSupplier", "roleTrader", "roleBuyer",
  "max100Char", "emailLabel", "createAccountBtn", "loginModalTitle", 
  "registerNewAccountTitle", "placeholderRetype", "placeholderMinChars",
  "placeholderEmail", "placeholderCompany", "placeholderPhone", 
  "phoneWhatsappLabel", "ecosystemRoleLabel", "institutionLabel", 
  "confirmPasswordLabel", "passwordLabel", "placeholderExampleName", "customsTaxLabel"
];

// First, ensure all these keys exist in TranslationKeys interface exactly once
const interfaceMatch = c.match(/export interface TranslationKeys \{([\s\S]*?)\}/);
if (interfaceMatch) {
    let interfaceContent = interfaceMatch[1];
    let newInterfaceContent = interfaceContent;
    
    // Remove all existing definitions of these keys to avoid duplicates
    for (const key of keysToInject) {
        const regex = new RegExp(`^\\s*${key}\\s*:\\s*string\\s*;\\s*$`, 'gm');
        newInterfaceContent = newInterfaceContent.replace(regex, '');
    }
    
    // Add them back exactly once
    for (const key of keysToInject) {
        newInterfaceContent += `  ${key}: string;\n`;
    }
    
    c = c.replace(interfaceMatch[0], `export interface TranslationKeys {${newInterfaceContent}}`);
}

// Then, for each language block, ensure keys exist exactly once
const allLangs = ['id', 'en', 'es', 'ar', 'zh', 'jp', 'ko', 'de', 'pt'];

for (const lang of allLangs) {
    // Regex to match the whole block for a language
    const langRegex = new RegExp(`\\b${lang}\\s*:\\s*\\{([\\s\\S]*?)(?:\\n\\s*\\},|\\n\\s*\\}$)`, 'g');
    const match = langRegex.exec(c);
    
    if (match) {
        let blockContent = match[1];
        let newBlockContent = blockContent;
        
        // Remove all instances of these keys in this block
        for (const key of keysToInject) {
             const keyRegex = new RegExp(`^\\s*${key}\\s*:\\s*.*?,?\\s*$`, 'gm');
             newBlockContent = newBlockContent.replace(keyRegex, '');
        }
        
        // Add them back with default values at the end of the block
        let defaults = "";
        for (const key of keysToInject) {
            let val = "'TBD'";
            if (lang === 'id') {
                if (key === 'customsTaxLabel') val = "'PABEAN & PAJAK (NPWP)'";
                if (key === 'roleBuyer') val = "'Buyer (Pembeli Luar Negeri)'";
                if (key === 'roleTrader') val = "'Trader / Eksportir RI'";
                if (key === 'roleSupplier') val = "'Supplier / UMKM Penyedia'";
                if (key === 'roleForwarder') val = "'Forwarder / Logistik'";
                if (key === 'roleSuperadmin') val = "'Superadmin'";
                if (key === 'emailLabel') val = "'Surel (Email) *'";
                if (key === 'max100Char') val = "'Maks 100'";
                if (key === 'placeholderExampleName') val = "'Contoh: Kenji Sato'";
                if (key === 'passwordLabel') val = "'Sandi *'";
                if (key === 'confirmPasswordLabel') val = "'Konfirmasi *'";
                if (key === 'institutionLabel') val = "'Instansi *'";
                if (key === 'ecosystemRoleLabel') val = "'Peran Ekosistem'";
                if (key === 'phoneWhatsappLabel') val = "'Nomor Telepon / WhatsApp *'";
                if (key === 'placeholderPhone') val = "'Contoh: +6281234567890'";
                if (key === 'placeholderCompany') val = "'Nama perusahaan'";
                if (key === 'placeholderEmail') val = "'nama@perusahaan.com'";
                if (key === 'placeholderMinChars') val = "'Min 6 karakter'";
                if (key === 'placeholderRetype') val = "'Ketik ulang'";
                if (key === 'registerNewAccountTitle') val = "'DAFTAR AKUN BARU'";
                if (key === 'loginModalTitle') val = "'MASUK AKUN'";
                if (key === 'createAccountBtn') val = "'BUAT AKUN BARU'";
            } else if (lang === 'en') {
                if (key === 'customsTaxLabel') val = "'CUSTOMS & TAX (NPWP)'";
                if (key === 'roleBuyer') val = "'Buyer (Overseas)'";
                if (key === 'roleTrader') val = "'Trader / ID Exporter'";
                if (key === 'roleSupplier') val = "'Supplier / SME'";
                if (key === 'roleForwarder') val = "'Forwarder / Logistics'";
                if (key === 'roleSuperadmin') val = "'Superadmin'";
                if (key === 'emailLabel') val = "'Email Address *'";
                if (key === 'max100Char') val = "'Max 100'";
                if (key === 'placeholderExampleName') val = "'Example: Kenji Sato'";
                if (key === 'passwordLabel') val = "'Password *'";
                if (key === 'confirmPasswordLabel') val = "'Confirm *'";
                if (key === 'institutionLabel') val = "'Institution *'";
                if (key === 'ecosystemRoleLabel') val = "'Ecosystem Role'";
                if (key === 'phoneWhatsappLabel') val = "'Phone / WhatsApp *'";
                if (key === 'placeholderPhone') val = "'Example: +6281234567890'";
                if (key === 'placeholderCompany') val = "'Company Name'";
                if (key === 'placeholderEmail') val = "'name@company.com'";
                if (key === 'placeholderMinChars') val = "'Min 6 chars'";
                if (key === 'placeholderRetype') val = "'Retype'";
                if (key === 'registerNewAccountTitle') val = "'REGISTER NEW ACCOUNT'";
                if (key === 'loginModalTitle') val = "'LOGIN ACCOUNT'";
                if (key === 'createAccountBtn') val = "'CREATE NEW ACCOUNT'";
            } else if (lang === 'jp') {
                if (key === 'customsTaxLabel') val = "'税関と税務 (NPWP)'";
                if (key === 'roleBuyer') val = "'バイヤー（海外購入者）'";
                if (key === 'roleTrader') val = "'トレーダー/インドネシア輸出者'";
                if (key === 'roleSupplier') val = "'サプライヤー/中小企業'";
                if (key === 'roleForwarder') val = "'フォワーダー/物流'";
                if (key === 'roleSuperadmin') val = "'スーパー管理者'";
                if (key === 'emailLabel') val = "'メールアドレス *'";
                if (key === 'max100Char') val = "'最大100'";
                if (key === 'placeholderExampleName') val = "'例: Kenji Sato'";
                if (key === 'passwordLabel') val = "'パスワード *'";
                if (key === 'confirmPasswordLabel') val = "'確認 *'";
                if (key === 'institutionLabel') val = "'機関 *'";
                if (key === 'ecosystemRoleLabel') val = "'エコシステムの役割'";
                if (key === 'phoneWhatsappLabel') val = "'電話 / WhatsApp *'";
                if (key === 'placeholderPhone') val = "'例: +6281234567890'";
                if (key === 'placeholderCompany') val = "'会社名'";
                if (key === 'placeholderEmail') val = "'name@company.com'";
                if (key === 'placeholderMinChars') val = "'最低6文字'";
                if (key === 'placeholderRetype') val = "'再入力'";
                if (key === 'registerNewAccountTitle') val = "'新しいアカウントを登録'";
                if (key === 'loginModalTitle') val = "'アカウントにログイン'";
                if (key === 'createAccountBtn') val = "'新しいアカウントを作成'";
            }
            defaults += `    ${key}: ${val},\n`;
        }
        
        newBlockContent = newBlockContent + "\n" + defaults;
        c = c.replace(match[0], `${lang}: {${newBlockContent}},`);
    }
}

// Clean up any double commas or trailing commas before closing braces if needed, though TS is forgiving.
fs.writeFileSync('src/translations.ts', c);
console.log("Translations fixed.");
