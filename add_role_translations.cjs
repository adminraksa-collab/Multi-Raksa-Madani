const fs = require('fs');
let c = fs.readFileSync('src/translations.ts', 'utf8');

const keysToInject = ["roleBuyer", "roleTrader", "roleSupplier", "roleForwarder", "roleSuperadmin"];
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
             if (k === 'roleBuyer') val = "'Buyer (Pembeli Luar Negeri)'";
             if (k === 'roleTrader') val = "'Trader / Eksportir RI'";
             if (k === 'roleSupplier') val = "'Supplier / UMKM Penyedia'";
             if (k === 'roleForwarder') val = "'Forwarder / Logistik'";
             if (k === 'roleSuperadmin') val = "'Superadmin'";
          } else if (lang === 'en') {
             if (k === 'roleBuyer') val = "'Buyer (Overseas)'";
             if (k === 'roleTrader') val = "'Trader / ID Exporter'";
             if (k === 'roleSupplier') val = "'Supplier / SME'";
             if (k === 'roleForwarder') val = "'Forwarder / Logistics'";
             if (k === 'roleSuperadmin') val = "'Superadmin'";
          } else if (lang === 'jp') {
             if (k === 'roleBuyer') val = "'バイヤー（海外購入者）'";
             if (k === 'roleTrader') val = "'トレーダー/インドネシア輸出者'";
             if (k === 'roleSupplier') val = "'サプライヤー/中小企業'";
             if (k === 'roleForwarder') val = "'フォワーダー/物流'";
             if (k === 'roleSuperadmin') val = "'スーパー管理者'";
          }
          toInject += "    " + k + ": " + val + ",\n";
      }
   }
   
   if (toInject) {
      c = c.replace(new RegExp(lang + ": \\{"), lang + ": {\n" + toInject);
   }
}

fs.writeFileSync('src/translations.ts', c);
