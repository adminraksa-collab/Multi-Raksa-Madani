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

const allLangs = ['id', 'en', 'zh', 'ar', 'th', 'ru', 'ja'];

for (const lang of allLangs) {
    const langRegex = new RegExp(`\\b${lang}\\s*:\\s*\\{([\\s\\S]*?)(?:\\n\\s*\\},|\\n\\s*\\}$)`, 'g');
    const match = langRegex.exec(c);
    
    if (match) {
        let blockContent = match[1];
        let newBlockContent = blockContent;
        
        let defaults = "";
        for (const key of keysToInject) {
            // check if key exists in the block, if not add it
            const keyRegex = new RegExp(`^\\s*${key}\\s*:`, 'm');
            if (!keyRegex.test(newBlockContent)) {
                let val = "'TBD'";
                if (lang === 'ja') {
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
        }
        
        if (defaults) {
            // ensure last element has comma
            if (!newBlockContent.match(/,\s*$/)) {
                newBlockContent += ",";
            }
            newBlockContent = newBlockContent + "\n" + defaults;
            c = c.replace(match[0], `${lang}: {${newBlockContent}},`);
        }
    }
}

fs.writeFileSync('src/translations.ts', c);
