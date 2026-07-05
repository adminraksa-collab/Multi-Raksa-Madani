const fs = require('fs');
let content = fs.readFileSync('src/translations.ts', 'utf8');
const missingKeys = ['estShippingCost', 'estDeliveryTime', 'daysLabel', 'estimatedShippingCost', 'estimatedDeliveryTime'];
// We'll just remove the newly added ones from interface and use standard ones.
