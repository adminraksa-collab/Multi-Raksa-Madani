const fs = require('fs');

const file = 'src/translations.ts';
let content = fs.readFileSync(file, 'utf8');

const keysToAdd = [
  'sampleStatusPending',
  'sampleStatusShipped',
  'sampleStatusDelivered',
  'codeLabel',
  'submittedDate',
  'prospectiveBuyer',
  'sampleQty',
  'logisticCourierLabel', // might exist
  'courierAccountNo',
  'shippingFeePayer',
  'estShippingCost', // exists
  'trackingNo',
  'shippingAddress',
  'shippingPaymentMechanism',
  'methodFreightCollect',
  'methodPrepaid',
  'statusUnpaid',
  'statusPaid',
  'statusPendingVerification',
  'buyerMustTransfer1',
  'buyerMustTransfer2',
  'sellerTransferAccount',
  'bankLabel',
  'accountNoLabel',
  'accountNameLabel',
  'confirmTransferBtn',
  'buyerReceiver',
  'sellerSender',
  'noneCash',
  'freightCollectDesc1',
  'freightCollectDesc2'
];

// We will just replace hardcoded Indonesian text in src/App.tsx with conditionals based on `lang`.
// Since modifying translations.ts manually requires updating the interface and all languages, it is simpler to do inline translation in App.tsx or use the translation object but add them properly.

// Wait, the interface `TranslationKeys` has ~200+ properties.
// A simpler way is to just do a quick inline translation in `App.tsx` since we already use `const isId = lang === 'id';` there.
