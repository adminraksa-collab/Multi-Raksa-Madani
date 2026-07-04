const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

text = text.replace(/Aplikasi Manajemen Administrasi Ekspor Indonesia \(ExportFlow\) &bull; Terintegrasi dengan Karantina, Bea Cukai RI, CEISA, & INSW\./, '{t.footerLine1}');
text = text.replace(/Proyek Simulasi Pameran Kemendag RI &copy; 2026\. Semua kalkulasi FOB dan data kepabeanan mematuhi standar INCOTERMS internasional\./, '{t.footerLine2}');

fs.writeFileSync('src/App.tsx', text);
