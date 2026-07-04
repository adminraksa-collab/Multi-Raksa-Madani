const fs = require('fs');
let c = fs.readFileSync('src/components/LoginModal.tsx', 'utf8');

c = c.replace(/placeholder="Contoh: Kenji Sato"/g, 'placeholder={t.placeholderExampleName}');
c = c.replace(/<span>Sandi \*/g, '<span>{t.passwordLabel}');
c = c.replace(/<span>Konfirmasi \*/g, '<span>{t.confirmPasswordLabel}');
c = c.replace(/<span>Instansi \*/g, '<span>{t.institutionLabel}');
c = c.replace(/<span>Peran Ekosistem/g, '<span>{t.ecosystemRoleLabel}');
c = c.replace(/<span>Nomor Telepon \/ WhatsApp \*/g, '<span>{t.phoneWhatsappLabel}');
c = c.replace(/placeholder="Contoh: \+6281234567890"/g, 'placeholder={t.placeholderPhone}');
c = c.replace(/placeholder="Nama perusahaan"/g, 'placeholder={t.placeholderCompany}');
c = c.replace(/placeholder="nama@perusahaan.com"/g, 'placeholder={t.placeholderEmail}');
c = c.replace(/placeholder="Min 6 karakter"/g, 'placeholder={t.placeholderMinChars}');
c = c.replace(/placeholder="Ketik ulang"/g, 'placeholder={t.placeholderRetype}');

// "REGISTER NEW ACCOUNT" or "REGISTER NEW ACCOUNT" header might be hardcoded as uppercase.
c = c.replace(/<h2 className="text-xl font-black text-slate-900 uppercase tracking-tight ml-2.5">\s*REGISTER NEW ACCOUNT\s*<\/h2>/gi, '<h2 className="text-xl font-black text-slate-900 uppercase tracking-tight ml-2.5">{t.registerNewAccountTitle}</h2>');

// Also check if there's "DAFTAR AKUN BARU" or "BUAT AKUN BARU"
c = c.replace(/<span>BUAT AKUN BARU<\/span>/gi, '<span>{t.createAccountBtn}</span>');
c = c.replace(/<span>Masuk \(Login\)<\/span>/gi, '<span>{t.loginToSystem}</span>');

fs.writeFileSync('src/components/LoginModal.tsx', c);
