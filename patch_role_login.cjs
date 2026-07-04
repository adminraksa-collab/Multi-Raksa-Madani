const fs = require('fs');
let c = fs.readFileSync('src/components/LoginModal.tsx', 'utf8');

c = c.replace(/<option value="Buyer">Buyer \(Pembeli Luar Negeri\)<\/option>/g, '<option value="Buyer">{t.roleBuyer}</option>');
c = c.replace(/<option value="Trader">Trader \/ Eksportir RI<\/option>/g, '<option value="Trader">{t.roleTrader}</option>');
c = c.replace(/<option value="Supplier">Supplier \/ UMKM Penyedia<\/option>/g, '<option value="Supplier">{t.roleSupplier}</option>');
c = c.replace(/<option value="Forwarder">Forwarder \/ Logistik<\/option>/g, '<option value="Forwarder">{t.roleForwarder}</option>');
c = c.replace(/<option value="Superadmin">Superadmin<\/option>/g, '<option value="Superadmin">{t.roleSuperadmin}</option>');

fs.writeFileSync('src/components/LoginModal.tsx', c);
