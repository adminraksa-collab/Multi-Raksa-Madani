const fs = require('fs');
let content = fs.readFileSync('src/translations.ts', 'utf8');

// strip all previous occurrences
content = content.replace(/\s*estShippingCost:[^\n]+/g, '');
content = content.replace(/\s*estDeliveryTime:[^\n]+/g, '');
content = content.replace(/\s*daysLabel:[^\n]+/g, '');
content = content.replace(/\s*estimatedShippingCost:[^\n]+/g, '');
content = content.replace(/\s*estimatedDeliveryTime:[^\n]+/g, '');

// now insert them back cleanly
content = content.replace(/logisticCourierLabel: string;/g, 'logisticCourierLabel: string;\n  estShippingCost: string;\n  estDeliveryTime: string;\n  daysLabel: string;');

// for each language
content = content.replace(/logisticCourierLabel: "Kurir Logistik",/g, 'logisticCourierLabel: "Kurir Logistik",\n    estShippingCost: "Estimasi Biaya Kirim",\n    estDeliveryTime: "Estimasi Waktu Sampai",\n    daysLabel: "Hari Kerja",');

content = content.replace(/logisticCourierLabel: "Logistics Courier",/g, 'logisticCourierLabel: "Logistics Courier",\n    estShippingCost: "Estimated Shipping Cost",\n    estDeliveryTime: "Estimated Delivery Time",\n    daysLabel: "Business Days",');

content = content.replace(/logisticCourierLabel: "物流快递",/g, 'logisticCourierLabel: "物流快递",\n    estShippingCost: "Estimated Shipping Cost",\n    estDeliveryTime: "Estimated Delivery Time",\n    daysLabel: "Days",');

content = content.replace(/logisticCourierLabel: "شركة الشحن اللوجستية",/g, 'logisticCourierLabel: "شركة الشحن اللوجستية",\n    estShippingCost: "Estimated Shipping Cost",\n    estDeliveryTime: "Estimated Delivery Time",\n    daysLabel: "Days",');

content = content.replace(/logisticCourierLabel: "ผู้จัดส่งโลจิสติกส์",/g, 'logisticCourierLabel: "ผู้จัดส่งโลจิสติกส์",\n    estShippingCost: "Estimated Shipping Cost",\n    estDeliveryTime: "Estimated Delivery Time",\n    daysLabel: "Days",');

content = content.replace(/logisticCourierLabel: "Логистический курьер",/g, 'logisticCourierLabel: "Логистический курьер",\n    estShippingCost: "Estimated Shipping Cost",\n    estDeliveryTime: "Estimated Delivery Time",\n    daysLabel: "Days",');

content = content.replace(/logisticCourierLabel: "物流クーリエ",/g, 'logisticCourierLabel: "物流クーリエ",\n    estShippingCost: "Estimated Shipping Cost",\n    estDeliveryTime: "Estimated Delivery Time",\n    daysLabel: "Days",');

fs.writeFileSync('src/translations.ts', content, 'utf8');
