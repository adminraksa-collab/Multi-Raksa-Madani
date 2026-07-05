import React, { useState } from 'react';
import { 
  Globe, ArrowRight, ShieldCheck, FileText, 
  ChevronRight, Ship, FileSignature, Calculator, Info, X,
  Lock, UserPlus, Edit, Trash2, Save, Plus, Award, MapPin, Calendar,
  Upload, Image, Package, Clock, Search, Handshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { UserProfile, ExportProduct, ExportShipment } from '../types';
import { deleteProductFromFirestore, saveProductToFirestore } from '../lib/firebaseService';
import { translations } from '../translations';


const landingTranslations: Record<string, Record<string, string>> = {
  id: {
    logisticsCert: "Logistik & Sertifikat",
    requestSample: "Minta Sampel",
    heroTagline: "PORTAL PENJUALAN KOMODITAS EKSPOR INDONESIA",
    heroTitle: "Sourcing Komoditas Premium Secara Aman & Transparan",
    heroDesc: "PT Multi Raksa Madani menghubungkan petani lokal dengan pembeli internasional secara transparan. Mulai negosiasi kargo bilateral secara elektronik, awasi draf berkas pabean dari meja kerja Anda.",
    companyProfileTitle: "PROFIL PERUSAHAAN",
    companyProfileSubTitle: "Terintegrasi dengan Karantina, Bea Cukai RI, CEISA, & INSW",
    verified: "Terverifikasi",
    officialLicense: "Izin Resmi",
    officeAddress: "Alamat Kantor",
    contactService: "Kontak & Layanan",
    editCompanyProfile: "Edit Profil Perusahaan",
    featuredCommoditiesTitle: "Katalog Ekspor Unggulan",
    featuredCommoditiesDesc: "Eksplorasi komoditas agro-industri Indonesia bersertifikat ekspor aman siap kirim.",
    addCommodity: "Katalog",
    customsClearedTag: "99.8% Lolos Bea Cukai RI & Karantina",
    calculatorTitle: "Kalkulator & Permintaan/LOI",
    calculatorSub: "Estimasi Volume, Wadah Laut FCL, & Harga FOB",
    cargoSourcing: "Komoditas Sourcing",
    mainSpecification: "Spesifikasi Utama",
    fobPriceRef: "Harga Acuan FOB",
    determineVolume: "Tentukan Volume Pesanan",
    hsCodeStandard: "Kode HS Standard",
    oceanContainerType: "Jenis Kontainer Laut",
    estLeadTime: "Estimasi Lead Time Gudang",
    containersNeeded: "Jumlah Kontainer Diperlukan",
    totalEstFobPrice: "Total Estimasi Harga FOB",
    fobTermsDesc: "Bebas di Atas Kapal (Tanjung Priok, Jakarta)",
    guestAlertText: "Anda masuk sebagai Tamu. Pengajuan Letter of Intent (LOI) memerlukan akun pembeli (Buyer) terdaftar.",
    roleAlertText: "Peran Anda saat ini ({role}) dilarang mengirimkan LOI. Silakan login kembali sebagai 'Buyer'.",
    loginBtn: "Login",
    registerBtn: "Daftar",
    fobPriceLimitText: "Sesuai batasan acuan FOB",
    reqLoiBtn: "Permintaan / LOI →",
    cancelBtn: "Batal",
    saveBtn: "Simpan Perubahan",
    officialLicenseLabel: "Izin Resmi (NIB/SIUP)",
    nibNotesLabel: "Catatan Tambahan Izin",
    telephoneLabel: "Nomor Telepon",
    emailLabel: "Email Kontak",
    heroBannerLabel: "Gambar Banner Hero",
    activeBannerPreview: "Pratinjau Banner Aktif",
    noCustomBanner: "Belum Ada Banner Kustom (Menggunakan Default)",
    chooseImageFile: "Pilih Berkas Gambar",
    premiumQuickPreset: "Preset Cepat Premium",
    cargoPreset: "Kargo",
    spicesPreset: "Rempah",
    warehousePreset: "Gudang",
    pasteImageUrl: "Atau Tempel Tautan URL Gambar",
    deleteConfirm: "Apakah Anda yakin ingin menghapus komoditas ini dari katalog?",
    minOrder: "Min. Order",
    fobPriceTentative: "Harga FOB Tentatif",
    commodityLabel: "Komoditas",
    specificationLabel: "Spesifikasi",
    originLabel: "Asal",
    minVolLabel: "Min",
    maxVolLabel: "Max",
    fclContainers: "Wadah Kontainer 20ft",
    hoursWorking: "Hari Kerja",
    customsClearedShort: "Lolos Bea Cukai & Karantina"
  },
  en: {
    logisticsCert: "Logistics & Certificates",
    requestSample: "Request Sample",
    heroTagline: "INDONESIAN EXPORT COMMODITY SALES PORTAL",
    heroTitle: "Source Premium Commodities Securely & Transparently",
    heroDesc: "PT Multi Raksa Madani connects local farmers with international buyers transparently. Start bilateral cargo negotiations electronically, oversee custom clearance draft documents from your desk.",
    companyProfileTitle: "COMPANY PROFILE",
    companyProfileSubTitle: "Integrated with Quarantine, Indonesian Customs, CEISA, & INSW",
    verified: "Verified",
    officialLicense: "Official License",
    officeAddress: "Office Address",
    contactService: "Contact & Services",
    editCompanyProfile: "Edit Company Profile",
    featuredCommoditiesTitle: "Featured Export Catalog",
    featuredCommoditiesDesc: "Explore Indonesian agro-industrial commodities with secure export certification ready to ship.",
    addCommodity: "Catalog",
    customsClearedTag: "99.8% Passed RI Customs & Quarantine",
    calculatorTitle: "Calculator & Request/LOI",
    calculatorSub: "Estimate Volume, FCL Ocean Containers, & FOB Price",
    cargoSourcing: "Sourcing Commodity",
    mainSpecification: "Main Specification",
    fobPriceRef: "FOB Reference Price",
    determineVolume: "Determine Order Volume",
    hsCodeStandard: "Standard HS Code",
    oceanContainerType: "Ocean Container Type",
    estLeadTime: "Estimated Warehouse Lead Time",
    containersNeeded: "Number of Containers Required",
    totalEstFobPrice: "Total Estimated FOB Price",
    fobTermsDesc: "Free On Board (Tanjung Priok, Jakarta)",
    guestAlertText: "You are logged in as a Guest. Submitting a Letter of Intent (LOI) requires a registered Buyer account.",
    roleAlertText: "Your current role ({role}) is not allowed to send LOI. Please re-login as a 'Buyer'.",
    loginBtn: "Login",
    registerBtn: "Register",
    fobPriceLimitText: "Consistent with FOB price guidelines",
    reqLoiBtn: "Request / LOI →",
    cancelBtn: "Cancel",
    saveBtn: "Save Changes",
    officialLicenseLabel: "Official License (NIB/SIUP)",
    nibNotesLabel: "Additional License Notes",
    telephoneLabel: "Telephone Number",
    emailLabel: "Contact Email",
    heroBannerLabel: "Hero Banner Image",
    activeBannerPreview: "Active Banner Preview",
    noCustomBanner: "No Custom Banner Yet (Using Default)",
    chooseImageFile: "Choose Image File",
    premiumQuickPreset: "Premium Quick Presets",
    cargoPreset: "Cargo",
    spicesPreset: "Spices",
    warehousePreset: "Warehouse",
    pasteImageUrl: "Or Paste Image URL",
    deleteConfirm: "Are you sure you want to delete this commodity from the catalog?",
    minOrder: "Min. Order",
    fobPriceTentative: "Tentative FOB Price",
    commodityLabel: "Commodity",
    specificationLabel: "Specification",
    originLabel: "Origin",
    minVolLabel: "Min",
    maxVolLabel: "Max",
    fclContainers: "20ft Containers",
    hoursWorking: "Working Days",
    customsClearedShort: "Passed Customs & Quarantine"
  },
  zh: {
    logisticsCert: "物流与证书",
    requestSample: "申请样品",
    heroTagline: "印尼出口商品销售门户",
    heroTitle: "安全透明地采购优质商品",
    heroDesc: "PT Multi Raksa Madani 透明地连接本地农民与国际买家。在线启动双边货物谈判，在办公桌前监督清关草案文件。",
    companyProfileTitle: "公司简介",
    verified: "已验证",
    officialLicense: "官方执照",
    officeAddress: "办公地址",
    contactService: "联系与服务",
    editCompanyProfile: "编辑公司简介",
    featuredCommoditiesTitle: "精选出口目录",
    featuredCommoditiesDesc: "探索印尼农工业商品，具备安全出口认证，准备发货。",
    addCommodity: "目录",
    customsClearedTag: "99.8% 通过印尼海关与检疫",
    calculatorTitle: "计算器与意向书 (LOI) 申请",
    calculatorSub: "估算数量、FCL 海运集装箱与 FOB 价格",
    cargoSourcing: "采购商品",
    mainSpecification: "主要规格",
    fobPriceRef: "FOB 参考价格",
    determineVolume: "确定订单数量",
    hsCodeStandard: "标准海关编码 (HS Code)",
    oceanContainerType: "海运集装箱类型",
    estLeadTime: "预估仓库前置时间",
    containersNeeded: "所需集装箱数量",
    totalEstFobPrice: "总预估 FOB 价格",
    fobTermsDesc: "船上交货（丹绒不碌港，雅加达）",
    guestAlertText: "您当前以访客身份登录。提交意向书 (LOI) 需要注册的买方 (Buyer) 账户。",
    roleAlertText: "您当前的角色 ({role}) 不允许发送 LOI。请重新登录为 'Buyer'。",
    loginBtn: "登录",
    registerBtn: "注册",
    fobPriceLimitText: "符合 FOB 价格参考限制",
    reqLoiBtn: "提交申请 / LOI →",
    cancelBtn: "取消",
    saveBtn: "保存更改",
    officialLicenseLabel: "官方执照 (NIB/SIUP)",
    nibNotesLabel: "额外执照备注",
    telephoneLabel: "电话号码",
    emailLabel: "联系邮箱",
    heroBannerLabel: "英雄横幅图片",
    activeBannerPreview: "激活横幅预览",
    noCustomBanner: "暂无自定义横幅（使用默认）",
    chooseImageFile: "选择图片文件",
    premiumQuickPreset: "高级快速预设",
    cargoPreset: "货物",
    spicesPreset: "香料",
    warehousePreset: "仓库",
    pasteImageUrl: "或粘贴图片链接 URL",
    deleteConfirm: "您确定要从目录中删除此商品吗？",
    minOrder: "最小起订量",
    fobPriceTentative: "暂定 FOB 价格",
    commodityLabel: "商品",
    specificationLabel: "规格",
    originLabel: "产地",
    minVolLabel: "最小",
    maxVolLabel: "最大",
    fclContainers: "20尺集装箱",
    hoursWorking: "工作日",
    customsClearedShort: "通过海关与检疫"
  },
  ar: {
    logisticsCert: "اللوجستيات والشهادات",
    requestSample: "طلب عينة",
    heroTagline: "بوابة مبيعات السلع التصديرية الإندونيسية",
    heroTitle: "الحصول على السلع الممتازة بأمان وشفافية",
    heroDesc: "تربط PT Multi Raksa Madani المزارعين المحليين بالمشترين الدوليين بشفافية. ابدأ مفاوضات الشحنات الثنائية إلكترونيًا، وأشرف على مسودات وثائق التخليص الجمركي من مكتبك.",
    companyProfileTitle: "ملف الشركة",
    verified: "تم التحقق منه",
    officialLicense: "الترخيص الرسمي",
    officeAddress: "عنوان المكتب",
    contactService: "الاتصال والخدمات",
    editCompanyProfile: "تعديل ملف الشركة",
    featuredCommoditiesTitle: "كتالوج التصدير المميز",
    featuredCommoditiesDesc: "اكتشف السلع الزراعية الصناعية الإندونيسية المعتمدة للتصدير الآمن والجاهزة للشحن.",
    addCommodity: "الكتالوج",
    customsClearedTag: "99.8٪ اجتازت الجمارك والحجر الصحي الإندونيسي",
    calculatorTitle: "الحاسبة وطلب خطاب النوايا (LOI)",
    calculatorSub: "تقدير الحجم، حاويات الشحن البحري (FCL)، وسعر FOB",
    cargoSourcing: "السلعة المطلوبة",
    mainSpecification: "المواصفات الرئيسية",
    fobPriceRef: "سعر FOB المرجعي",
    determineVolume: "تحديد حجم الطلب",
    hsCodeStandard: "رمز النظام المنسق القياسي (HS)",
    oceanContainerType: "نوع حاوية الشحن البحري",
    estLeadTime: "الوقت المقدر لتجهيز المستودع",
    containersNeeded: "عدد الحاويات المطلوبة",
    totalEstFobPrice: "إجمالي سعر FOB المقدر",
    fobTermsDesc: "تسليم على ظهر السفينة (تانجونغ بريوك، جاكرتا)",
    guestAlertText: "لقد قمت بالدخول كضيف. يتطلب تقديم خطاب النوايا (LOI) حساب مشتري (Buyer) مسجل.",
    roleAlertText: "دورك الحالي ({role}) لا يسمح بإرسال LOI. يرجى إعادة تسجيل الدخول كـ 'Buyer'.",
    loginBtn: "تسجيل الدخول",
    registerBtn: "تسجيل",
    fobPriceLimitText: "متوافق مع إرشادات سعر FOB المرجعي",
    reqLoiBtn: "طلب / خطاب نوايا →",
    cancelBtn: "إلغاء",
    saveBtn: "حفظ التغييرات",
    officialLicenseLabel: "الترخيص الرسمي (NIB/SIUP)",
    nibNotesLabel: "ملاحظات إضافية على الترخيص",
    telephoneLabel: "رقم الهاتف",
    emailLabel: "البريد الإلكتروني للاتصال",
    heroBannerLabel: "صورة بنر البطل",
    activeBannerPreview: "معاينة البنر النشط",
    noCustomBanner: "لا يوجد بنر مخصص بعد (باستخدام الافتراضي)",
    chooseImageFile: "اختر ملف الصورة",
    premiumQuickPreset: "الإعدادات المسبقة السريعة المميزة",
    cargoPreset: "شحنة",
    spicesPreset: "توابل",
    warehousePreset: "مستودع",
    pasteImageUrl: "أو الصق رابط الصورة",
    deleteConfirm: "هل أنت متأكد من رغبتك في حذف هذه السلعة من الكتالوج؟",
    minOrder: "الحد الأدنى للطلب",
    fobPriceTentative: "سعر FOB المؤقت",
    commodityLabel: "سلعة",
    specificationLabel: "المواصفات",
    originLabel: "المصدر",
    minVolLabel: "أدنى",
    maxVolLabel: "أقصى",
    fclContainers: "حاويات 20 قدم",
    hoursWorking: "أيام عمل",
    customsClearedShort: "اجتاز الجمارك والحجر"
  },
  th: {
    logisticsCert: "โลจิสติกส์และใบรับรอง",
    requestSample: "ขอตัวอย่าง",
    heroTagline: "พอร์ทัลการขายสินค้าโภคภัณฑ์ส่งออกของอินโดนีเซีย",
    heroTitle: "จัดหาสินค้าโภคภัณฑ์ระดับพรีเมียมอย่างปลอดภัยและโปร่งใส",
    heroDesc: "PT Multi Raksa Madani เชื่อมโยงเกษตรกรในท้องถิ่นกับผู้ซื้อต่างประเทศอย่างโปร่งใส เริ่มเจรจาการขนส่งสินค้าระดับทวิภาคีทางอิเล็กทรอนิกส์ ตรวจสอบร่างเอกสารพิธีการศุลกากรจากโต๊ะทำงานของคุณ",
    companyProfileTitle: "ข้อมูลบริษัท",
    verified: "ผ่านการตรวจสอบแล้ว",
    officialLicense: "ใบอนุญาตอย่างเป็นทางการ",
    officeAddress: "ที่อยู่สำนักงาน",
    contactService: "การติดต่อและบริการ",
    editCompanyProfile: "แก้ไขข้อมูลบริษัท",
    featuredCommoditiesTitle: "แคตตาล็อกส่งออกเด่น",
    featuredCommoditiesDesc: "สำรวจสินค้าเกษตรอุตสาหกรรมของอินโดนีเซียที่ได้รับการรับรองการส่งออกอย่างปลอดภัยและพร้อมจัดส่ง",
    addCommodity: "แคตตาล็อก",
    customsClearedTag: "99.8% ผ่านพิธีการศุลกากรและการกักกันของอินโดนีเซีย",
    calculatorTitle: "เครื่องคำนวณและคำขอ/LOI",
    calculatorSub: "ประมาณการปริมาณ, ตู้คอนเทนเนอร์ FCL และราคา FOB",
    cargoSourcing: "การจัดหาสินค้าโภคภัณฑ์",
    mainSpecification: "ข้อมูลจำเพาะหลัก",
    fobPriceRef: "ราคาอ้างอิง FOB",
    determineVolume: "กำหนดปริมาณการสั่งซื้อ",
    hsCodeStandard: "รหัสพิกัดศุลกากรมาตรฐาน (HS Code)",
    oceanContainerType: "ประเภทตู้คอนเทนเนอร์ขนส่งสินค้าทางทะเล",
    estLeadTime: "ระยะเวลาในการดำเนินการคลังสินค้าโดยประมาณ",
    containersNeeded: "จำนวนตู้คอนเทนเนอร์ที่ต้องการ",
    totalEstFobPrice: "ราคา FOB ประมาณการทั้งหมด",
    fobTermsDesc: "ส่งมอบ ณ ท่าเรือต้นทาง (Tanjung Priok, จาการ์ตา)",
    guestAlertText: "คุณเข้าสู่ระบบในฐานะแขก การส่งหนังสือแสดงเจตจำนง (LOI) ต้องใช้บัญชีผู้ซื้อ (Buyer) ที่ลงทะเบียนแล้ว",
    roleAlertText: "บทบาทปัจจุบันของคุณ ({role}) ไม่ได้รับการอนุญาตให้ส่ง LOI กรุณาเข้าสู่ระบบใหม่ในฐานะ 'Buyer'",
    loginBtn: "เข้าสู่ระบบ",
    registerBtn: "ลงทะเบียน",
    fobPriceLimitText: "สอดคล้องกับแนวทางราคาอ้างอิง FOB",
    reqLoiBtn: "ส่งคำขอ / LOI →",
    cancelBtn: "ยกเลิก",
    saveBtn: "บันทึกการเปลี่ยนแปลง",
    officialLicenseLabel: "ใบอนุญาตอย่างเป็นทางการ (NIB/SIUP)",
    nibNotesLabel: "บันทึกใบอนุญาตเพิ่มเติม",
    telephoneLabel: "หมายเลขโทรศัพท์",
    emailLabel: "อีเมลติดต่อ",
    heroBannerLabel: "รูปภาพแบนเนอร์ฮีโร่",
    activeBannerPreview: "แสดงตัวอย่างแบนเนอร์ปัจจุบัน",
    noCustomBanner: "ยังไม่มีแบนเนอร์แบบกำหนดเอง (ใช้ค่าเริ่มต้น)",
    chooseImageFile: "เลือกไฟล์รูปภาพ",
    premiumQuickPreset: "พรีเซ็ตด่วนระดับพรีเมียม",
    cargoPreset: "คาร์โก้",
    spicesPreset: "เครื่องเทศ",
    warehousePreset: "คลังสินค้า",
    pasteImageUrl: "หรือวาง URL รูปภาพ",
    deleteConfirm: "คุณแน่ใจหรือไม่ว่าต้องการลบสินค้าโภคภัณฑ์นี้ออกจากแคตตาล็อก?",
    minOrder: "สั่งซื้อขั้นต่ำ",
    fobPriceTentative: "ราคา FOB ชั่วคราว",
    commodityLabel: "สินค้าโภคภัณฑ์",
    specificationLabel: "ข้อมูลจำเพาะ",
    originLabel: "แหล่งกำเนิด",
    minVolLabel: "ขั้นต่ำ",
    maxVolLabel: "สูงสุด",
    fclContainers: "ตู้คอนเทนเนอร์ 20 ฟุต",
    hoursWorking: "วันทำการ",
    customsClearedShort: "ผ่านศุลกากรและการกักกัน"
  },
  ru: {
    logisticsCert: "Логистика и сертификаты",
    requestSample: "Запросить образец",
    heroTagline: "ИНДОНЕЗИЙСКИЙ ПОРТАЛ ПРОДАЖ ЭКСПОРТНЫХ ТОВАРОВ",
    heroTitle: "Закупайте премиальные товары безопасно и прозрачно",
    heroDesc: "PT Multi Raksa Madani прозрачно связывает местных фермеров с международными покупателями. Начните двусторонние переговоры по грузам в электронном виде, контролируйте проекты документов по таможенной очистке со своего стола.",
    companyProfileTitle: "ПРОФИЛЬ КОМПАНИИ",
    verified: "Подтверждено",
    officialLicense: "Официальная лицензия",
    officeAddress: "Адрес офиса",
    contactService: "Контакты и услуги",
    editCompanyProfile: "Редактировать профиль компании",
    featuredCommoditiesTitle: "Каталог ведущего экспорта",
    featuredCommoditiesDesc: "Изучите индонезийские агропромышленные товары с безопасной экспортной сертификацией, готовые к отправке.",
    addCommodity: "Каталог",
    customsClearedTag: "99.8% прошли таможню и карантин Индонезии",
    calculatorTitle: "Калькулятор и запрос/LOI",
    calculatorSub: "Оценка объема, FCL-контейнеров и цены FOB",
    cargoSourcing: "Закупаемый товар",
    mainSpecification: "Основные характеристики",
    fobPriceRef: "Справочная цена FOB",
    determineVolume: "Определить объем заказа",
    hsCodeStandard: "Стандартный код ТН ВЭД (HS)",
    oceanContainerType: "Тип морского контейнера",
    estLeadTime: "Оценочный срок подготовки на складе",
    containersNeeded: "Количество необходимых контейнеров",
    totalEstFobPrice: "Итоговая оценочная стоимость FOB",
    fobTermsDesc: "Франко-борт (Танджунг Приок, Джакарта)",
    guestAlertText: "Вы вошли как гость. Для подачи Письма о намерениях (LOI) требуется зарегистрированный аккаунт покупателя (Buyer).",
    roleAlertText: "Ваша текущая роль ({role}) не позволяет отправлять LOI. Пожалуйста, войдите снова как 'Buyer'.",
    loginBtn: "Войти",
    registerBtn: "Регистрация",
    fobPriceLimitText: "Соответствует справочным ограничениям цены FOB",
    reqLoiBtn: "Запрос / LOI →",
    cancelBtn: "Отмена",
    saveBtn: "Сохранить изменения",
    officialLicenseLabel: "Официальная лицензия (NIB/SIUP)",
    nibNotesLabel: "Дополнительные примечания к лицензии",
    telephoneLabel: "Номер телефона",
    emailLabel: "Контактный email",
    heroBannerLabel: "Изображение баннера Hero",
    activeBannerPreview: "Предпросмотр активного баннера",
    noCustomBanner: "Кастомный баннер отсутствует (используется по умолчанию)",
    chooseImageFile: "Выбрать файл изображения",
    premiumQuickPreset: "Быстрые премиум-пресеты",
    cargoPreset: "Груз",
    spicesPreset: "Специи",
    warehousePreset: "Склад",
    pasteImageUrl: "Или вставьте ссылку на изображение URL",
    deleteConfirm: "Вы уверены, что хотите удалить этот товар из каталога?",
    minOrder: "Мин. заказ",
    fobPriceTentative: "Ориентировочная цена FOB",
    commodityLabel: "Товар",
    specificationLabel: "Спецификация",
    originLabel: "Происхождение",
    minVolLabel: "Мин",
    maxVolLabel: "Макс",
    fclContainers: "20-футовые контейнеры",
    hoursWorking: "Рабочих дней",
    customsClearedShort: "Прошел таможню и карантин"
  },
  ja: {
    logisticsCert: "物流と証明書",
    requestSample: "サンプルをリクエスト",
    heroTagline: "インドネシア輸出商品販売ポータル",
    heroTitle: "安全かつ透明性の高い方法でプレミアム商品を調達",
    heroDesc: "PT Multi Raksa Madani は、地元の農家と国際的なバイヤーを透明性をもって結びつけます。双方向の電子貨物交渉を開始し、デスクからカスタム通関草案書類を監視します。",
    companyProfileTitle: "会社概要",
    verified: "検証済み",
    officialLicense: "公式ライセンス",
    officeAddress: "オフィス住所",
    contactService: "連絡先＆サービス",
    editCompanyProfile: "会社概要を編集",
    featuredCommoditiesTitle: "注目の輸出カタログ",
    featuredCommoditiesDesc: "安全な輸出認証を取得した、出荷準備が整ったインドネシアの農産業商品を探索します。",
    addCommodity: "カタログ",
    customsClearedTag: "99.8% インドネシア通関＆検疫を通過",
    calculatorTitle: "電卓＆意向表明書（LOI）申請",
    calculatorSub: "注文数量、FCL海上コンテナ、FOB価格を推定",
    cargoSourcing: "調達商品",
    mainSpecification: "主な仕様",
    fobPriceRef: "FOB参考価格",
    determineVolume: "注文数量 of Determine",
    hsCodeStandard: "標準HSコード",
    oceanContainerType: "海上コンテナの種類",
    estLeadTime: "推定倉庫リードタイム",
    containersNeeded: "必要なコンテナ数",
    totalEstFobPrice: "推定FOB総額",
    fobTermsDesc: "本船渡し（タンジュン・プリオク、ジャカルタ）",
    guestAlertText: "ゲストとしてログインしています。意向表明書（LOI）を送信するには、登録されたバイヤー（Buyer）アカウントが必要です。",
    roleAlertText: "現在の役割 ({role}) ではLOIの送信が許可されていません。 'Buyer'として再ログインしてください。",
    loginBtn: "ログイン",
    registerBtn: "登録",
    fobPriceLimitText: "FOB価格制限基準に準拠しています",
    reqLoiBtn: "申請 / LOI →",
    cancelBtn: "キャンセル",
    saveBtn: "変更を保存",
    officialLicenseLabel: "公式ライセンス (NIB/SIUP)",
    nibNotesLabel: "ライセンス追加メモ",
    telephoneLabel: "電話番号",
    emailLabel: "連絡先メールアドレス",
    heroBannerLabel: "ヒーローバナー画像",
    activeBannerPreview: "アクティブバナープレビュー",
    noCustomBanner: "カスタムバナーは未設定です（デフォルトを使用）",
    chooseImageFile: "画像ファイルを選択",
    premiumQuickPreset: "プレミアムクイックプリセット",
    cargoPreset: "貨物",
    spicesPreset: "スパイス",
    warehousePreset: "倉庫",
    pasteImageUrl: "または画像URLを貼り付け",
    deleteConfirm: "カタログからこの商品を削除してもよろしいですか？",
    minOrder: "最小注文数",
    fobPriceTentative: "暫定FOB価格",
    commodityLabel: "商品",
    specificationLabel: "仕様",
    originLabel: "原産地",
    minVolLabel: "最小",
    maxVolLabel: "最大",
    fclContainers: "20ftコンテナ",
    hoursWorking: "営業日",
    customsClearedShort: "通関＆検疫を通過"
  }
};

interface ProductLogisticsData {
  originRegion: string;
  exportPackaging: string;
  leadTime: string;
  moqDetails: string;
  certifications: string[];
}

const PRODUCT_LOGISTICS_CERTIFICATES: Record<string, ProductLogisticsData> = {
  'prod-1': {
    originRegion: 'Halmahera, Maluku Utara & Sulawesi',
    exportPackaging: 'Inner Plastic Bag + Double Wall Master Carton 10 Kg',
    leadTime: '20-30 Hari',
    moqDetails: '20 Metrik Ton (MT) / 1x20ft Container FCL',
    certifications: [
      'MSDS (Material Safety Data Sheet)',
      'Charcoal Certificate of Origin (SHT)',
      'Certificate of Heat Treatment & Fumigation',
      'Sucofindo Quality Certificate (Laporan Analisis)'
    ]
  },
  'prod-2': {
    originRegion: 'Dataran Tinggi Gayo, Aceh Tengah',
    exportPackaging: 'GrainPro Liner + Karung Goni Rami 60 Kg',
    leadTime: '14-21 Hari',
    moqDetails: '3 Tons (LCL) / 19 Tons (1x20ft FCL)',
    certifications: [
      'Sertifikasi Organik USDA',
      'Fairtrade Organic Certification',
      'Phytosanitary Certificate of Indonesia',
      'Sertifikat Indikasi Geografis (IG) Aceh Gayo'
    ]
  },
  'prod-3': {
    originRegion: 'Banda Neira, Kepulauan Banda, Maluku',
    exportPackaging: 'Multi-wall Paper Bag / Gunny Bags with Inner PE 25 Kg',
    leadTime: '15-25 Hari',
    moqDetails: '5 Tons (LCL) / 15 Tons (1x20ft FCL)',
    certifications: [
      'Phytosanitary Certificate of Indonesia',
      'Sertifikat Halal Indonesia (BPJPH)',
      'Aflatoxin-Free Analysis Certificate (Sucofindo)',
      'Food Safety System Certification HACCP'
    ]
  },
  'prod-4': {
    originRegion: 'Sampit, Kalimantan Tengah & Riau',
    exportPackaging: 'Flexibag in 20ft Container (21 MT) / Jerican 20L / PET Bottle',
    leadTime: '7-14 Hari',
    moqDetails: '100 Metrik Ton (MT) / 5x20ft FCL Flexitank',
    certifications: [
      'RSPO (Roundtable on Sustainable Palm Oil)',
      'ISO 22000 Food Safety Management',
      'Sertifikat Halal Indonesia (BPJPH)',
      'Certificate of Quality & Weight (Sucofindo/SGS)'
    ]
  },
  'prod-5': {
    originRegion: 'Minahasa, Sulawesi Utara',
    exportPackaging: 'Multi-layer Kraft Paper Bag with Inner PE Liner 25 Kg',
    leadTime: '15-20 Hari',
    moqDetails: '12 Metrik Ton (MT) / 1x20ft Container FCL',
    certifications: [
      'HACCP Food Safety Certified',
      'Kosher Certification',
      'Sertifikat Halal Indonesia (BPJPH)',
      'Phytosanitary Certificate of Indonesia'
    ]
  }
};

interface CompanyProfileData {
  nib: string;
  nibNotes: string;
  npwp?: string;
  ceisa?: string;
  insw?: string;
  address: string;
  telephone: string;
  whatsapp?: string;
  email: string;
  bannerImage?: string;
  originPort?: string;
  exporterLegality?: string;
  qualityCompliance?: string;
  financialGuarantee?: string;
}

interface LandingPageProps {
  onNavigate: (tab: any) => void;
  onStartNegotiation: (product: ExportProduct, quantity: number) => void;
  shipmentsCount: number;
  totalVolume: number;
  totalValue: number;
  currentUser: UserProfile | null;
  onOpenProfile: (mode?: 'login' | 'register', fromCalculator?: boolean) => void;
  onLogout: () => void;
  isCalcOpen?: boolean;
  setIsCalcOpen?: (open: boolean) => void;
  products: ExportProduct[];
  onUpdateProducts: (newProds: ExportProduct[]) => void;
  companyProfile: CompanyProfileData;
  onUpdateCompanyProfile: (newProfile: CompanyProfileData) => void;
  currentLanguage?: string;
  activeShipment?: ExportShipment;
  negoStepId?: number;
  onAddSampleRequest?: (req: any) => void;
}

// Compact infographic component for export process
const ExportProcessInfographic = ({ t }: { t: any }) => {
  const steps = [
    { icon: Search, title: t.exportStep1Title, desc: t.exportStep1Desc },
    { icon: Handshake, title: t.exportStep2Title, desc: t.exportStep2Desc },
    { icon: ShieldCheck, title: t.exportStep3Title, desc: t.exportStep3Desc }
  ];
  return (
    <div className="bg-slate-900/40 border border-slate-700/30 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5 text-center">{t.exportProcessTitle}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
              <step.icon className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="font-black text-sm text-white">{step.title}</div>
              <div className="text-xs text-slate-300 leading-tight">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function LandingPage({ 
  onNavigate, 
  onStartNegotiation,
  shipmentsCount, 
  totalVolume, 
  totalValue,
  currentUser,
  onOpenProfile,
  onLogout,
  isCalcOpen: isCalcOpenProp,
  setIsCalcOpen: setIsCalcOpenProp,
  products,
  onUpdateProducts,
  companyProfile,
  onUpdateCompanyProfile,
  currentLanguage = 'id',
  activeShipment,
  negoStepId = 1,
  onAddSampleRequest
}: LandingPageProps) {
  // Helper for translating product fields
  const getT = (prod: any, field: string) => {
    if (currentLanguage === 'en' && prod?.translations?.en?.[field]) {
      return prod.translations.en[field];
    }
    return prod?.[field];
  };

  // Choose translations for active language
  const localT = landingTranslations[currentLanguage] || landingTranslations.id;
  const globalT = translations[currentLanguage] || translations.id;
  const t = { ...globalT, ...localT };

  const [targetProduct, setTargetProduct] = useState<string>('prod-1');
  const [orderVolume, setOrderVolume] = useState<number>(20); // default 20 metric tons
  const [localCalcOpen, setLocalCalcOpen] = useState<boolean>(false);
  const isCalcOpen = isCalcOpenProp !== undefined ? isCalcOpenProp : localCalcOpen;
  const setIsCalcOpen = setIsCalcOpenProp !== undefined ? setIsCalcOpenProp : setLocalCalcOpen;

  // Sample Request State
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [selectedSampleProduct, setSelectedSampleProduct] = useState<ExportProduct | null>(null);
  const [sampleQty, setSampleQty] = useState('1 kg');

  // Logistics & Certifications Modal State
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [selectedLogisticsProduct, setSelectedLogisticsProduct] = useState<ExportProduct | null>(null);
  const [logisticsDataMap, setLogisticsDataMap] = useState<Record<string, ProductLogisticsData>>(() => {
    const cached = localStorage.getItem('product_logistics_data');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    return PRODUCT_LOGISTICS_CERTIFICATES;
  });
  const [isEditingLogistics, setIsEditingLogistics] = useState(false);
  const [editOriginRegion, setEditOriginRegion] = useState('');
  const [editExportPackaging, setEditExportPackaging] = useState('');
  const [editLeadTime, setEditLeadTime] = useState('');
  const [editMoqDetails, setEditMoqDetails] = useState('');
  const [editCertifications, setEditCertifications] = useState<string[]>([]);
  const [newCertText, setNewCertText] = useState('');

  const [sampleCourier, setSampleCourier] = useState('DHL Express');
  const [sampleCourierAcc, setSampleCourierAcc] = useState('');
  const [sampleAddress, setSampleAddress] = useState('');
  const [sampleFeePayer, setSampleFeePayer] = useState<'buyer' | 'seller'>('buyer');
  const [sampleSuccessMsg, setSampleSuccessMsg] = useState('');

  const handleRequestSampleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'Buyer') {
      return;
    }
    if (!selectedSampleProduct) return;

    const newSampleReq = {
      id: `samp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: selectedSampleProduct.id,
      productName: selectedSampleProduct.name,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerCompany: currentUser.companyName || 'Importir Asing',
      quantity: sampleQty,
      courier: sampleCourier,
      courierAccount: sampleCourierAcc,
      shippingAddress: sampleAddress || currentUser.address || 'Alamat tidak diisi',
      shippingFeePaidBy: sampleFeePayer,
      shippingFeeAmount: sampleQty === '500 gram' ? 35 : sampleQty === '1 kg' ? 45 : sampleQty === '2 kg' ? 65 : sampleQty === '5 kg' ? 120 : 25,
      shippingFeeFixed: sampleFeePayer === 'buyer' && !sampleCourierAcc ? false : true,
      status: 'pending',
      trackingNumber: '',
      createdAt: new Date().toISOString()
    };

    if (onAddSampleRequest) {
      onAddSampleRequest(newSampleReq);
    } else {
      try {
        const stored = localStorage.getItem('exportflow_sample_requests');
        let currentList = [];
        if (stored) {
          currentList = JSON.parse(stored);
        }
        currentList.push(newSampleReq);
        localStorage.setItem('exportflow_sample_requests', JSON.stringify(currentList));
      } catch (err) {}
    }

    setSampleSuccessMsg('Permintaan sampel Anda berhasil dikirim! Silakan cek tab Transaksi untuk memantau status pengiriman sampel.');
    setTimeout(() => {
      setIsSampleModalOpen(false);
      setSampleSuccessMsg('');
      setSampleQty('1 kg');
      setSampleCourier('DHL Express');
      setSampleCourierAcc('');
      setSampleAddress('');
      setSampleFeePayer('buyer');
    }, 4000);
  };

  // Company profile edit state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempProfile, setTempProfile] = useState(companyProfile);

  const handleEditProfileClick = () => {
    setTempProfile(companyProfile);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyProfile(tempProfile);
    setIsProfileModalOpen(false);
  };

  // Catalog products editing state
  const [editingProduct, setEditingProduct] = useState<ExportProduct | 'new' | null>(null);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    hsCode: '',
    price: '',
    unit: 'Metrik Ton (MT)',
    specification: '',
    origin: '',
    minOrder: '',
    image: '',
    attachmentUrl: '',
    attachmentName: '',
  });

  const handleEditProductClick = (prod: ExportProduct) => {
    setEditingProduct(prod);
    setFileError(null);
    setProductForm({
      name: prod.name,
      category: prod.category,
      hsCode: prod.hsCode,
      price: prod.price,
      unit: prod.unit,
      specification: prod.specification,
      origin: prod.origin,
      minOrder: prod.minOrder,
      image: prod.image,
      attachmentUrl: prod.attachmentUrl || '',
      attachmentName: prod.attachmentName || '',
    });
  };

  const handleAddProductClick = () => {
    setEditingProduct('new');
    setFileError(null);
    setProductForm({
      name: '',
      category: 'Pertanian / Hasil Bumi',
      hsCode: '0901.11.10',
      price: '1,000',
      unit: 'Metrik Ton (MT)',
      specification: '',
      origin: 'Indonesia',
      minOrder: '10 MT',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
      attachmentUrl: '',
      attachmentName: '',
    });
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    onUpdateProducts(updated);
    setProductToDeleteId(null);
    deleteProductFromFirestore(productId).catch(err => console.error("Failed to delete from Firestore:", err));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let translated = {};
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: JSON.stringify({
            name: productForm.name,
            specification: productForm.specification,
            category: productForm.category,
            origin: productForm.origin,
            unit: productForm.unit
          }), 
          targetLanguage: 'English' 
        })
      });
      if (response.ok) {
        const data = await response.json();
        // Assuming Gemini returns a JSON string, we parse it
        try {
           const cleanedText = data.result.replace(/```json/g, '').replace(/```/g, '');
           translated = JSON.parse(cleanedText);
        } catch(e) {
           console.log("Failed to parse translation result", e);
        }
      }
    } catch(err) {
      console.error("Translation error:", err);
    }
    
    setIsSubmitting(false);
    if (editingProduct === 'new') {
      const newProd: ExportProduct = {
        id: 'prod-' + Date.now(),
        name: productForm.name,
        category: productForm.category,
        hsCode: productForm.hsCode,
        price: productForm.price,
        unit: productForm.unit,
        specification: productForm.specification,
        origin: productForm.origin,
        minOrder: productForm.minOrder,
        image: productForm.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
        supplierName: 'Koperasi Mitra AgriFlow',
        attachmentUrl: productForm.attachmentUrl || undefined,
        attachmentName: productForm.attachmentName || undefined, translations: { en: translated }};
      saveProductToFirestore(newProd).catch(err => console.error(err));
      onUpdateProducts([...products, newProd]);
      // set as default target
      setTargetProduct(newProd.id);
    } else if (editingProduct && editingProduct !== 'new') {
      const updatedItem = { ...editingProduct, 
        name: productForm.name,
        category: productForm.category,
        hsCode: productForm.hsCode,
        price: productForm.price,
        unit: productForm.unit,
        specification: productForm.specification,
        origin: productForm.origin,
        minOrder: productForm.minOrder,
        image: productForm.image,
        supplierName: editingProduct.supplierName || 'Koperasi Mitra AgriFlow',
        attachmentUrl: productForm.attachmentUrl || undefined,
        attachmentName: productForm.attachmentName || undefined, translations: { en: Object.keys(translated).length > 0 ? translated : editingProduct.translations?.en } };
      saveProductToFirestore(updatedItem).catch(err => console.error(err));
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return updatedItem;
        }
        return p;
      });
      onUpdateProducts(updated);
    }
    setEditingProduct(null);
  };

  // Product price guidelines derived dynamically from the products state
  const productPricing = products.reduce((acc, p) => {
    const cleanPrice = parseFloat(p.price.replace(/,/g, '')) || 1000;
    const minVolMatch = p.minOrder.match(/\d+/);
    const minVol = minVolMatch ? parseInt(minVolMatch[0]) : 10;
    
    acc[p.id] = {
      name: getT(p, 'name'),
      pricePerTon: cleanPrice,
      containerCapacity20ft: p.id === 'prod-1' ? 20 : p.id === 'prod-2' ? 18 : p.id === 'prod-3' ? 15 : p.id === 'prod-4' ? 21 : 16,
      hsCode: p.hsCode,
      leadTimeDays: p.id === 'prod-1' ? 30 : p.id === 'prod-2' ? 25 : p.id === 'prod-3' ? 28 : p.id === 'prod-4' ? 20 : 22,
      rawProduct: p,
      minVol: minVol,
      maxVol: minVol * 50
    };
    return acc;
  }, {} as Record<string, any>);

  const activeProductId = productPricing[targetProduct] ? targetProduct : (products[0]?.id || 'prod-1');
  const activeProduct = productPricing[activeProductId] || {
    name: 'Komoditas',
    pricePerTon: 1000,
    containerCapacity20ft: 20,
    hsCode: '0000.00.00',
    leadTimeDays: 30,
    rawProduct: products[0],
    minVol: 10,
    maxVol: 500
  };

  const totalCost = (orderVolume || activeProduct.minVol) * activeProduct.pricePerTon;
  const fclCount = Math.ceil((orderVolume || activeProduct.minVol) / activeProduct.containerCapacity20ft);

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      
      {/* 1. COMPACT COMPANY PROFILE HERO */}
      <div 
        className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%), url(${companyProfile.bannerImage || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=80'})` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />

        <div id="company-profile-section" className="scroll-mt-20 p-4 sm:p-5 lg:p-6 relative z-15 space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-2.5">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-black text-white tracking-wider uppercase drop-shadow-md">
                  {t.companyProfileTitle} — PT Multi Raksa Madani
                </span>
                <span className="text-[11px] text-indigo-200 tracking-wide drop-shadow-md">
                  {t.companyProfileSubTitle}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[12px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                {t.verified}
              </span>
            </div>
            {currentUser?.role === 'Superadmin' && (
              <button
                onClick={handleEditProfileClick}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow hover:shadow-md border border-indigo-500 cursor-pointer animate-pulse"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{t.editCompanyProfile}</span>
              </button>
            )}
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 text-xs text-left">
            {/* Col 1: Izin Resmi */}
            <div className="space-y-1">
              <span className="text-xs font-black text-indigo-400 tracking-wider uppercase block">
                {t.officialLicense}
              </span>
              <p className="text-slate-200 font-semibold leading-relaxed">
                NIB: <span className="text-white font-black">{companyProfile.nib}</span>
              </p>

            </div>

            {/* Col 2: Perpajakan & Pabean */}
            <div className="space-y-1">
              <span className="text-xs font-black text-indigo-400 tracking-wider uppercase block">
                {t.customsTaxLabel}
              </span>
              {companyProfile.npwp && (
                <p className="text-slate-200 font-mono font-bold leading-relaxed mb-1">
                  NPWP: <span className="text-white font-mono">{companyProfile.npwp}</span>
                </p>
              )}
              <div className="flex gap-4">
                {companyProfile.ceisa && (
                  <div className="space-y-0.5">
                    <span className="text-[12px] font-bold text-slate-500 uppercase">CEISA</span>
                    <p className="text-slate-200 font-semibold">{companyProfile.ceisa}</p>
                  </div>
                )}
                {companyProfile.insw && (
                  <div className="space-y-0.5">
                    <span className="text-[12px] font-bold text-slate-500 uppercase">INSW</span>
                    <p className="text-slate-200 font-semibold">{companyProfile.insw}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Col 3: Alamat Kantor */}
            <div className="space-y-1">
              <span className="text-xs font-black text-indigo-400 tracking-wider uppercase block">
                {t.officeAddress}
              </span>
              <p className="text-slate-300 font-medium leading-relaxed text-[12px] sm:text-xs">
                {companyProfile.address}
              </p>
            </div>

            {/* Col 4: Kontak & Layanan */}
            <div className="space-y-1">
              <span className="text-xs font-black text-indigo-400 tracking-wider uppercase block">
                {t.contactService}
              </span>
              <div className="text-slate-300 font-medium leading-relaxed space-y-0.5 text-[12px] sm:text-xs">
                <div>
                  {t.telephoneContact} <span className="text-white font-bold">{companyProfile.telephone}</span>
                </div>
                {companyProfile.whatsapp && (
                  <div>
                    {t.whatsappContact} <span className="text-emerald-400 font-bold">{companyProfile.whatsapp}</span>
                  </div>
                )}
                <div className="truncate">
                  {t.emailContact} <span className="text-indigo-300 font-semibold hover:underline">{companyProfile.email}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <ExportProcessInfographic t={t} />
          </div>
        </div>
      </div>

      {/* 4. DYNAMIC INLINE COMMODITY CATALOG */}
      <div id="featured-commodities" className="space-y-6 scroll-mt-20">
          <div className="text-left border-b border-gray-200 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">{t.featuredCommoditiesTitle}</h2>
              <p className="text-xs text-slate-500">{t.featuredCommoditiesDesc}</p>
            </div>
            <div className="flex gap-2 items-center">
              {(currentUser?.role === 'Superadmin' || currentUser?.role === 'Trader') && (
                <button
                  onClick={handleAddProductClick}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addCommodity}</span>
                </button>
              )}
              <span className="bg-emerald-50 text-emerald-700 text-[12px] font-bold px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {t.customsClearedTag}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-3xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all relative group">
                <div>
                  <div className="relative h-44 w-full bg-slate-100">
                    <img src={p.image} alt={String(getT(p, 'name'))} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[12px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-3xs animate-pulse">
                      {(() => {
                        const catVal = getT(p, 'category') || p.category;
                        const upper = String(catVal).toUpperCase().trim();
                        if (upper === 'PERTANIAN / HASIL BUMI' || upper === 'AGRICULTURE / PRODUCE' || upper === 'AGRICULTURE/PRODUCE' || upper === 'PERTANIAN' || upper === 'AGRICULTURE') {
                          return t.categoryAgri;
                        }
                        return catVal;
                      })()}
                    </div>

                    {(currentUser?.role === 'Superadmin' || currentUser?.role === 'Trader') && (
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditProductClick(p)}
                          className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg backdrop-blur-3xs transition-colors cursor-pointer border border-slate-700"
                          title="Edit Komoditas"
                        >
                          <Edit className="w-3.5 h-3.5 text-indigo-300" />
                        </button>
                        <button
                          onClick={() => setProductToDeleteId(p.id)}
                          className="p-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-lg backdrop-blur-3xs transition-colors cursor-pointer border border-red-700"
                          title="Hapus Komoditas"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-100" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-5 text-left space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors leading-snug">{getT(p, 'name')}</h3>
                      <p className="text-[12px] text-gray-400 font-extrabold flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded">HS {p.hsCode}</span>
                        <span>&bull;</span>
                        <span>{t.originLabel}: {getT(p, 'origin')}</span>
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium h-24 overflow-y-auto">
                      {getT(p, 'specification')}
                    </p>
                    {(() => {
                      const hasAttachment = p.attachmentUrl || p.id === 'prod-1' || p.id === 'prod-2' || p.id === 'prod-3';
                      const attachmentUrl = p.attachmentUrl || 'data:application/pdf;base64,JVBERi0xLjUKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNTk1IDg0Ml0vUGFyZW50IDIgMCBSPj5lbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMTcgMDAwMDAgbgowMDAwMDAwMDY2IDAwMDAwIG4KMDAwMDAwMDExNSAwMDAwMCBuCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+c3RhcnR4cmVmCjE2OQolJUVPRg==';
                      const attachmentName = p.attachmentName || (
                        p.id === 'prod-1' ? 'Spesifikasi_Coconut_Shell_Charcoal_PT_MRM.pdf' :
                        p.id === 'prod-2' ? 'Spesifikasi_Gayo_Coffee_Grade1_PT_MRM.pdf' :
                        p.id === 'prod-3' ? 'Spesifikasi_Premium_Nutmeg_PT_MRM.pdf' :
                        'Dokumen_Spesifikasi.pdf'
                      );

                      if (!hasAttachment) return null;

                      return (
                        <div className="flex items-center justify-between p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-950 mt-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="text-[12px] font-bold truncate text-slate-700" title={attachmentName}>
                              {attachmentName}
                            </span>
                          </div>
                          <a
                            href={attachmentUrl}
                            download={attachmentName}
                            className="text-[12px] bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-2.5 py-1 rounded-lg transition-colors uppercase tracking-wider shrink-0 cursor-pointer text-center"
                          >
                            Unduh
                          </a>
                        </div>
                      );
                    })()}
                    <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                      <div>
                        <span className="text-[12px] uppercase font-black text-gray-400 block tracking-wider leading-none">{t.fobPriceTentative}</span>
                        <span className="text-sm font-black text-indigo-600 font-mono">${p.price} <span className="text-[12px] text-gray-500 font-bold">/ {getT(p, 'unit').split(' ')[0]}</span></span>
                      </div>
                      <div className="text-right">
                        <span className="text-[12px] uppercase font-black text-gray-400 block tracking-wider leading-none">{t.minOrder}</span>
                        <span className="text-[12px] font-black text-slate-800">{p.minOrder}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setSelectedSampleProduct(p);
                      if (currentUser && currentUser.address) {
                        setSampleAddress(currentUser.address);
                      } else {
                        setSampleAddress('');
                      }
                      setIsSampleModalOpen(true);
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-black rounded-lg transition-all shadow-sm hover:translate-y-[-1px] flex items-center justify-center gap-1 tracking-wider cursor-pointer font-sans"
                  >
                    <span>{t.requestSample}</span>
                  </button>
                  <button
                    onClick={() => {
                      setTargetProduct(p.id);
                      const prodInfo = productPricing[p.id as keyof typeof productPricing];
                      if (prodInfo) {
                        setOrderVolume(prodInfo.minVol);
                      }
                      setIsCalcOpen(true);
                    }}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-black rounded-lg transition-all shadow-sm hover:translate-y-[-1px] flex items-center justify-center gap-1 tracking-wider cursor-pointer font-sans"
                  >
                    <span>{t.calculatorTitle}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLogisticsProduct(p);
                      setIsLogisticsModalOpen(true);
                    }}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-[12px] font-black rounded-lg transition-all shadow-sm hover:translate-y-[-1px] flex items-center justify-center gap-1 tracking-wider cursor-pointer font-sans"
                  >
                    <span>{t.logisticsCert}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* 5. SOURCING CALCULATOR MODAL POPUP */}
      <AnimatePresence>
        {isCalcOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalcOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-slate-900 shadow-2xl flex flex-col z-10 font-sans"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white z-20 px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                    <Calculator className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black tracking-tight text-slate-900 leading-none mb-1">{t.calculatorTitle}</h3>
                    <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider leading-none">{t.calculatorSub}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCalcOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-5 space-y-6 flex flex-col justify-between text-left">
                  <div className="space-y-5">
                    {/* Detail Komoditas Terpilih */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
                      <div className="flex items-start gap-3">
                        {activeProduct.rawProduct?.image && (
                          <img
                            src={activeProduct.rawProduct.image}
                            alt={getT(activeProduct.rawProduct, 'name')}
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[12px] font-black uppercase text-indigo-600 tracking-wider block mb-1">{t.cargoSourcing}</span>
                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug break-words">{getT(activeProduct.rawProduct, 'name')}</h4>
                          <span className="text-[12px] text-slate-500 font-mono font-semibold block mt-1">{t.originLabel || 'Asal'}: {activeProduct.rawProduct?.origin || 'Indonesia'}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-200 pt-3 space-y-3">
                        {activeProduct.rawProduct?.specification && (
                          <div className="text-left">
                            <span className="text-[12px] font-black uppercase text-slate-500 tracking-wider block mb-1">{t.mainSpecification}</span>
                            <p className="text-[12px] text-slate-600 leading-relaxed font-medium line-clamp-3">
                              {activeProduct.rawProduct.specification}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                          <span className="text-slate-500 font-bold uppercase text-[12px] tracking-wider">{t.fobPriceRef}</span>
                          <span className="font-mono font-black text-indigo-600">${activeProduct.pricePerTon.toLocaleString('id-ID')} USD / MT</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2 gap-2 text-left">
                        <label className="text-[12px] font-black uppercase text-slate-500 tracking-wider block">{t.determineVolume}</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={activeProduct.minVol}
                            max={activeProduct.maxVol}
                            value={orderVolume || ''}
                            onChange={(e) => {
                              let val = Number(e.target.value);
                              if (val > activeProduct.maxVol) val = activeProduct.maxVol;
                              setOrderVolume(val);
                            }}
                            onBlur={() => {
                              if (!orderVolume || orderVolume < activeProduct.minVol) {
                                  setOrderVolume(activeProduct.minVol);
                              }
                            }}
                            className="w-20 py-1 px-2 text-center font-mono font-black text-xs text-indigo-600 bg-indigo-50 rounded border border-indigo-200 focus:outline-none focus:border-indigo-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-[12px] font-bold text-slate-500">MT</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={activeProduct.minVol}
                        max={activeProduct.maxVol}
                        step="1"
                        value={orderVolume || activeProduct.minVol}
                        onChange={(e) => setOrderVolume(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[12px] text-slate-500 font-mono mt-1">
                        <span>{t.minVolLabel || 'Min'}: {activeProduct.minVol} MT</span>
                        <span>{t.maxVolLabel || 'Max'}: {activeProduct.maxVol} MT</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-6 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-b border-slate-200 pb-3 text-left">
                      <span className="text-[12px] font-black uppercase text-slate-500 tracking-wider block mb-1">{t.hsCodeStandard}</span>
                      <span className="text-sm font-mono font-bold text-indigo-600">{activeProduct.hsCode}</span>
                    </div>
                    <div className="border-b border-slate-200 pb-3 text-left">
                      <span className="text-[12px] font-black uppercase text-slate-500 tracking-wider block mb-1">{t.oceanContainerType}</span>
                      <span className="text-sm font-bold text-slate-800">FCL Container (20ft Dry Van)</span>
                    </div>
                    <div className="border-b border-slate-200 pb-3 text-left">
                      <span className="text-[12px] font-black uppercase text-slate-500 tracking-wider block mb-1">{t.estLeadTime}</span>
                      <span className="text-sm font-bold text-slate-800">~{activeProduct.leadTimeDays} {t.hoursWorking || 'Hari Kerja'}</span>
                    </div>
                    <div className="border-b border-slate-200 pb-3 text-left">
                      <span className="text-[12px] font-black uppercase text-slate-500 tracking-wider block mb-1">{t.containersNeeded}</span>
                      <span className="text-sm font-mono font-bold text-indigo-600">{fclCount} × {t.fclContainers || 'Wadah Kontainer 20ft'}</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center text-left">
                      <div>
                        <span className="text-[12px] font-black uppercase text-amber-600 tracking-wider block">{t.totalEstFobPrice}</span>
                        <span className="text-xs text-slate-500 font-medium">{t.fobTermsDesc}</span>
                      </div>
                      <span className="text-2xl font-black text-slate-900 font-mono">${totalCost.toLocaleString('id-ID')} USD</span>
                    </div>

                    {/* Edukasi Tanggung Jawab Ongkir (FOB) */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[12px] leading-relaxed text-slate-600">
                      <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold uppercase text-[12px] tracking-wider">
                        <Info className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t.shippingLogisticsFobTitle}</span>
                      </div>
                      <p className="text-slate-700">
                        {t.fobBasePriceInfo}
                      </p>
                      <ul className="space-y-1.5 pl-1">
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold shrink-0">{t.seaFreightInsuranceTitle}</span>
                          <span className="text-slate-600">{t.seaFreightInsuranceDesc}</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold shrink-0">{t.localOriginPortCostsTitle}</span>
                          <span className="text-slate-600">{t.localOriginPortCostsDesc}</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Pembatasan Autentikasi Peran Buyer */}
                    {currentUser?.role !== 'Buyer' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-left rounded-lg text-[12px] text-amber-700 leading-relaxed font-semibold flex items-start gap-2">
                        <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-2 flex-1">
                          <p>
                            {!currentUser 
                              ? t.guestAlertText
                              : t.roleAlertText.replace('{role}', currentUser.role)
                            }
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <button
                              onClick={() => {
                                onOpenProfile('login', true);
                              }}
                              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[12px] tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <Lock className="w-3.5 h-3.5 text-white" />
                              <span>{t.loginBtn}</span>
                            </button>
                            <button
                              onClick={() => {
                                onOpenProfile('register', true);
                              }}
                              className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-amber-200 text-amber-700 font-black uppercase text-[12px] tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-amber-650" />
                              <span>{t.registerBtn || "Daftar"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[12px] text-slate-500">
                      <span className="italic flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        {t.fobPriceLimitText}: ${activeProduct.pricePerTon}/MT
                      </span>
                      <button
                        onClick={() => {
                          if (currentUser?.role !== 'Buyer') return;
                          const targetProdObj = activeProduct.rawProduct;
                          if (targetProdObj) {
                            setIsCalcOpen(false);
                            onStartNegotiation(targetProdObj, orderVolume);
                          }
                        }}
                        disabled={currentUser?.role !== 'Buyer'}
                        className={`px-3.5 py-1.5 font-bold rounded-lg text-[12px] uppercase tracking-wider transition-all flex items-center gap-1 shadow ${
                          currentUser?.role === 'Buyer'
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <span>{t.reqLoiBtn}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5.5 REQUEST SAMPLE MODAL */}
      <AnimatePresence>
        {isSampleModalOpen && selectedSampleProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSampleModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-slate-900 shadow-2xl flex flex-col z-10 p-6 font-sans text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight">Permintaan Sampel Produk</h3>
                    <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">Commodity Sample Request Gateway</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSampleModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sampleSuccessMsg ? (
                <div className="py-8 px-4 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Award className="w-8 h-8 animate-bounce" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Permintaan Berhasil!</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {sampleSuccessMsg}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestSampleSubmit} className="space-y-4 text-xs font-semibold">
                  
                  {/* Info Produk */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    {selectedSampleProduct.image && (
                      <img
                        src={selectedSampleProduct.image}
                        alt={selectedSampleProduct.name}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                      <span className="text-[12px] font-black uppercase text-emerald-600 tracking-wider block mb-0.5">KOMODITAS</span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{selectedSampleProduct.name}</h4>
                      <p className="text-[12px] text-slate-500 font-mono mt-0.5">HS: {selectedSampleProduct.hsCode} &bull; {t.originLabel}: {selectedSampleProduct.origin}</p>
                    </div>
                  </div>

                  {/* Quantity & Courier info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider">{t.sampleQtyLabel}</label>
                      <select
                        value={sampleQty}
                        onChange={(e) => setSampleQty(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer"
                      >
                        <option value="500 gram">{t.sampleQty500g}</option>
                        <option value="1 kg">{t.sampleQty1kg}</option>
                        <option value="2 kg">{t.sampleQty2kg}</option>
                        <option value="5 kg">{t.sampleQty5kg}</option>
                        <option value="Swatch/Kit">{t.sampleQtySwatch}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider">{t.logisticCourierLabel}</label>
                      <select
                        value={sampleCourier}
                        onChange={(e) => setSampleCourier(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer"
                      >
                        <option value="DHL Express">DHL Express</option>
                        <option value="FedEx International">FedEx International</option>
                        <option value="UPS / TNT">UPS / TNT Express</option>
                      </select>
                    </div>
                  </div>

                  {/* Estimasi Biaya & Mekanisme Pembayaran (Tabel) */}
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-500" />
                      {currentLanguage === 'id' ? 'Opsi Pembayaran Ongkir' : 'Shipping Payment Options'}
                    </label>
                    <div className="overflow-x-auto rounded-lg shadow-sm">
                      <table className="w-full text-left text-[10px] border-collapse border border-slate-200">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                          <tr>
                            <th className="px-2.5 py-2 border-r border-slate-200 whitespace-nowrap">{currentLanguage === 'id' ? 'Metode' : 'Method'}</th>
                            <th className="px-2.5 py-2 border-r border-slate-200 whitespace-nowrap">{currentLanguage === 'id' ? 'Biaya' : 'Cost'}</th>
                            <th className="px-2.5 py-2 border-r border-slate-200 whitespace-nowrap">{currentLanguage === 'id' ? 'Waktu' : 'Time'}</th>
                            <th className="px-2.5 py-2">{currentLanguage === 'id' ? 'Proses' : 'Process'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                          {/* Opsi 1: Dengan Akun Kurir (Freight Collect) */}
                          <tr className="bg-indigo-50 hover:bg-indigo-100/80 transition-colors">
                            <td className="px-2.5 py-2.5 border-r border-slate-200 font-bold text-indigo-800 whitespace-nowrap">
                              Freight Collect
                              <span className="block text-[8.5px] text-indigo-600 font-medium uppercase mt-0.5 tracking-wider">{currentLanguage === 'id' ? '(Punya Akun Kurir)' : '(Have Courier Account)'}</span>
                            </td>
                            <td className="px-2.5 py-2.5 border-r border-slate-200 font-medium italic whitespace-nowrap text-slate-500">
                              {currentLanguage === 'id' ? 'Tarif Kurir' : 'Courier Rate'}
                            </td>
                            <td className="px-2.5 py-2.5 border-r border-slate-200 font-bold whitespace-nowrap text-slate-800">
                              {sampleCourier === 'DHL Express' ? '3-5' : sampleCourier === 'FedEx International' ? '4-6' : '5-7'} {currentLanguage === 'id' ? 'Hr' : 'Day'}
                            </td>
                            <td className="px-2.5 py-2.5 min-w-[150px] leading-snug">
                              {currentLanguage === 'id' 
                                ? 'Ditagih otomatis (autodebit) ke akun kurir Anda.' 
                                : 'Billed automatically to your courier account.'}
                            </td>
                          </tr>
                          {/* Opsi 2: Tanpa Akun Kurir (Prepaid Transfer) */}
                          <tr className="bg-amber-50 hover:bg-amber-100/80 transition-colors">
                            <td className="px-2.5 py-2.5 border-r border-slate-200 font-bold text-amber-800 whitespace-nowrap">
                              Prepaid
                              <span className="block text-[8.5px] text-amber-600 font-medium uppercase mt-0.5 tracking-wider">{currentLanguage === 'id' ? '(Tanpa Akun Kurir)' : '(No Courier Account)'}</span>
                            </td>
                            <td className="px-2.5 py-2.5 border-r border-slate-200 font-black text-emerald-600 whitespace-nowrap">
                              ${sampleQty === '500 gram' ? '35' : sampleQty === '1 kg' ? '45' : sampleQty === '2 kg' ? '65' : sampleQty === '5 kg' ? '120' : '25'}
                            </td>
                            <td className="px-2.5 py-2.5 border-r border-slate-200 font-bold whitespace-nowrap text-slate-800">
                              {sampleCourier === 'DHL Express' ? '3-5' : sampleCourier === 'FedEx International' ? '4-6' : '5-7'} {currentLanguage === 'id' ? 'Hr' : 'Day'}
                            </td>
                            <td className="px-2.5 py-2.5 min-w-[150px] leading-snug">
                              {currentLanguage === 'id' 
                                ? 'Transfer ke eksportir, eksportir bayar ke agen kurir.' 
                                : 'Transfer to exporter, exporter pays to courier agent.'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* No Akun Kurir (Optional) */}
                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>{t.courierAccountNoLabel}</span>
                      <span className="text-[12px] text-slate-400 font-normal lowercase italic">{t.optionalLabel}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t.courierAccountPlaceholder}
                      value={sampleCourierAcc}
                      onChange={(e) => setSampleCourierAcc(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 placeholder-slate-400 font-mono"
                    />
                  </div>

                  {/* Alamat Pengiriman */}
                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider">{t.fullDestinationAddressLabel}</label>
                    <textarea
                      required
                      rows={2.5}
                      placeholder={t.destinationAddressPlaceholder}
                      value={sampleAddress}
                      onChange={(e) => setSampleAddress(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 placeholder-slate-400 resize-none font-medium text-[12px]"
                    />
                  </div>

                  {/* Penanggung Ongkir */}
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider">{t.shippingFeePayerLabel}</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSampleFeePayer('buyer')}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                          sampleFeePayer === 'buyer'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[12px] font-bold block">{t.payerBuyerTitle}</span>
                        <span className={`text-[12px] leading-tight block mt-1 font-medium ${sampleFeePayer === 'buyer' ? 'text-emerald-600' : 'text-slate-400'}`}>{t.payerBuyerDesc}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSampleFeePayer('seller')}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                          sampleFeePayer === 'seller'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[12px] font-bold block">{t.payerSellerTitle}</span>
                        <span className={`text-[12px] leading-tight block mt-1 font-medium ${sampleFeePayer === 'seller' ? 'text-emerald-600' : 'text-slate-400'}`}>{t.payerSellerDesc}</span>
                      </button>
                    </div>
                  </div>

                  {/* Edukasi Aturan Sampel */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[12px] text-slate-600 leading-relaxed font-medium">
                    <p className="font-bold text-amber-600 flex items-center gap-1 text-[12px] uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5 animate-pulse" />
                      <span>{t.internationalSampleRulesTitle}</span>
                    </p>
                    <p>
                      {t.sampleFreePolicyInfo}
                    </p>
                  </div>

                  {/* Submit Button atau Login Alert */}
                  {currentUser?.role === 'Buyer' ? (
                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs rounded-xl transition-all tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <Award className="w-4 h-4 text-emerald-100" />
                      <span>{t.submitOfficialSampleRequestBtn}</span>
                    </button>
                  ) : (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 text-center rounded-xl space-y-2.5 mt-2">
                      <p className="text-[12px] text-amber-700 leading-normal font-semibold">
                        {!currentUser 
                          ? t.loginToRequestSampleText
                          : t.roleNotAllowedRequestSampleText.replace('{role}', currentUser.role)
                        }
                      </p>
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSampleModalOpen(false);
                            onOpenProfile('login', false);
                          }}
                          className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[12px] tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Lock className="w-4 h-4 text-white" />
                          <span>{t.loginBuyerBtn}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSampleModalOpen(false);
                            onOpenProfile('register', false);
                          }}
                          className="px-5 py-2 bg-white hover:bg-slate-50 border border-amber-200 text-amber-700 font-black uppercase text-[12px] tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <UserPlus className="w-4 h-4 text-amber-600" />
                          <span>{t.registerAccountBtn}</span>
                        </button>
                      </div>
                    </div>
                  )}

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5.6 LOGISTICS & CERTIFICATIONS DETAILS MODAL */}
      <AnimatePresence>
        {isLogisticsModalOpen && selectedLogisticsProduct && (() => {
          const logisticsData = logisticsDataMap[selectedLogisticsProduct.id] || {
            originRegion: selectedLogisticsProduct.origin || 'Indonesia',
            exportPackaging: 'Standar Ekspor Karton Tebal / Polyethylene',
            leadTime: '15-30 Hari',
            moqDetails: selectedLogisticsProduct.minOrder || '1 Kontainer FCL 20ft',
            certifications: [
              'Sertifikat Halal Indonesia (BPJPH)',
              'Phytosanitary Certificate of Indonesia',
              'Certificate of Origin (COO / SKA)'
            ]
          };

          const startEditing = () => {
            setEditOriginRegion(logisticsData.originRegion);
            setEditExportPackaging(logisticsData.exportPackaging);
            setEditLeadTime(logisticsData.leadTime);
            setEditMoqDetails(logisticsData.moqDetails);
            setEditCertifications([...logisticsData.certifications]);
            setNewCertText('');
            setIsEditingLogistics(true);
          };

          const handleSave = () => {
            const updated: ProductLogisticsData = {
              originRegion: editOriginRegion,
              exportPackaging: editExportPackaging,
              leadTime: editLeadTime,
              moqDetails: editMoqDetails,
              certifications: editCertifications
            };
            const newMap = { ...logisticsDataMap, [selectedLogisticsProduct.id]: updated };
            setLogisticsDataMap(newMap);
            localStorage.setItem('product_logistics_data', JSON.stringify(newMap));
            setIsEditingLogistics(false);
          };

          const handleCancel = () => {
            setIsEditingLogistics(false);
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsEditingLogistics(false);
                  setIsLogisticsModalOpen(false);
                }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-900 shadow-2xl flex flex-col z-10 p-6 font-sans text-left"
              >
                {/* Simplified Header with Edit Button & Close Button */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-5">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-slate-900">{selectedLogisticsProduct.name}</h3>
                    <p className="text-[12px] text-teal-600 font-extrabold uppercase tracking-widest mt-0.5">
                      {isEditingLogistics ? t.editLogisticsProfileTitle : t.logisticsProfileTitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isEditingLogistics && currentUser?.role === 'Superadmin' && (
                      <button
                        onClick={startEditing}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-black rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-sans"
                      >
                        <Edit className="w-3.5 h-3.5 text-teal-600" />
                        <span>{t.editDataBtn}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsEditingLogistics(false);
                        setIsLogisticsModalOpen(false);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isEditingLogistics ? (
                  // EDIT MODE
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* ASAL WILAYAH */}
                      <div className="space-y-1">
                        <label className="text-[12px] text-slate-500 font-bold uppercase tracking-wider block">{t.originRegionLabel}</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={editOriginRegion}
                            onChange={(e) => setEditOriginRegion(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                            placeholder={t.originRegionLabel}
                          />
                        </div>
                      </div>

                      {/* KEMASAN EKSPOR */}
                      <div className="space-y-1">
                        <label className="text-[12px] text-slate-500 font-bold uppercase tracking-wider block">{t.exportPackagingLabel}</label>
                        <div className="relative">
                          <Package className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={editExportPackaging}
                            onChange={(e) => setEditExportPackaging(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                            placeholder={t.exportPackagingLabel}
                          />
                        </div>
                      </div>

                      {/* LEAD TIME PRODUKSI */}
                      <div className="space-y-1">
                        <label className="text-[12px] text-slate-500 font-bold uppercase tracking-wider block">{t.productionLeadTimeLabel}</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={editLeadTime}
                            onChange={(e) => setEditLeadTime(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                            placeholder={t.productionLeadTimeLabel}
                          />
                        </div>
                      </div>
                    </div>

                    {/* MOQ Notice Box Edit */}
                    <div className="space-y-1">
                      <label className="text-[12px] text-slate-500 font-bold uppercase tracking-wider block">{t.moqLabel}</label>
                      <div className="relative">
                        <Info className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <textarea
                          value={editMoqDetails}
                          onChange={(e) => setEditMoqDetails(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 h-16 resize-none"
                          placeholder={t.moqDetailsPlaceholder}
                        />
                      </div>
                    </div>

                    {/* Certifications Section Edit */}
                    <div className="space-y-2">
                      <span className="text-[12px] text-teal-600 font-black uppercase tracking-widest block">{t.complianceCertsLabel}</span>
                      
                      {/* List existing certifications with remove buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {editCertifications.map((cert, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs font-bold"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                              <span className="truncate leading-snug">{cert}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditCertifications(editCertifications.filter((_, i) => i !== index));
                              }}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new certification input */}
                      <div className="flex gap-2 pt-1.5">
                        <input
                          type="text"
                          placeholder={t.newCertPlaceholder || "Nama sertifikat baru..."}
                          value={newCertText}
                          onChange={(e) => setNewCertText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newCertText.trim()) {
                                setEditCertifications([...editCertifications, newCertText.trim()]);
                                setNewCertText('');
                              }
                            }
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 placeholder-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCertText.trim()) {
                              setEditCertifications([...editCertifications, newCertText.trim()]);
                              setNewCertText('');
                            }
                          }}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer font-sans uppercase tracking-wider"
                        >{t.addBtn}</button>
                      </div>
                    </div>

                    {/* Edit Form Action Buttons */}
                    <div className="pt-4 border-t border-slate-200 flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >{t.cancelBtn}</button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-sans"
                      >
                        <Save className="w-3.5 h-3.5 text-teal-100" />
                        <span>{t.saveChangesBtn}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div className="space-y-5">
                    {/* Top Row Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* ASAL WILAYAH */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2">
                        <span className="text-[12px] text-slate-500 font-bold uppercase tracking-wider block">{t.originRegionLabel}</span>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span className="text-xs font-bold text-slate-800 leading-snug">{logisticsData.originRegion}</span>
                        </div>
                      </div>

                      {/* KEMASAN EKSPOR */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2">
                        <span className="text-[12px] text-slate-500 font-bold uppercase tracking-wider block">{t.exportPackagingLabel}</span>
                        <div className="flex items-start gap-2">
                          <Package className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span className="text-xs font-bold text-slate-800 leading-snug">{logisticsData.exportPackaging}</span>
                        </div>
                      </div>

                      {/* LEAD TIME PRODUKSI */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2">
                        <span className="text-[12px] text-slate-500 font-bold uppercase tracking-wider block">{t.productionLeadTimeLabel}</span>
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span className="text-xs font-bold text-slate-800 leading-snug">{logisticsData.leadTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 my-1" />

                    {/* MOQ Notice Box */}
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
                      <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black uppercase tracking-wider block text-[12px] text-amber-600 mb-0.5">{t.moqLabel}</span>
                        <p className="font-semibold leading-relaxed text-amber-800">
                          {logisticsData.moqDetails}
                        </p>
                      </div>
                    </div>

                    {/* Certifications Section */}
                    <div className="space-y-2.5">
                      <span className="text-[12px] text-teal-600 font-black uppercase tracking-widest block">{t.complianceCertsLabel}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {logisticsData.certifications.map((cert, index) => (
                          <div
                            key={index}
                            className="bg-teal-50 border border-teal-100 text-teal-800 p-3 rounded-xl flex items-center gap-2.5 text-xs font-bold"
                          >
                            <ShieldCheck className="w-4.5 h-4.5 text-teal-600 shrink-0" />
                            <span className="leading-snug text-teal-900">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* COMPANY PROFILE EDIT MODAL */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto text-slate-900 shadow-2xl flex flex-col z-10 p-6 font-sans text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black uppercase tracking-wider">Edit Profil Perusahaan</h3>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Izin Resmi (NIB/SIUP)</label>
                  <input
                    type="text"
                    required
                    value={tempProfile.nib}
                    onChange={(e) => setTempProfile({ ...tempProfile, nib: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Catatan Tambahan Izin</label>
                  <input
                    type="text"
                    required
                    value={tempProfile.nibNotes}
                    onChange={(e) => setTempProfile({ ...tempProfile, nibNotes: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">NPWP (Tax ID)</label>
                    <input
                      type="text"
                      value={tempProfile.npwp || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, npwp: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">CEISA Status</label>
                    <input
                      type="text"
                      value={tempProfile.ceisa || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, ceisa: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">INSW Status</label>
                    <input
                      type="text"
                      value={tempProfile.insw || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, insw: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Alamat Kantor</label>
                  <textarea
                    required
                    rows={2}
                    value={tempProfile.address}
                    onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Nomor Telepon</label>
                  <input
                    type="text"
                    required
                    value={tempProfile.telephone}
                    onChange={(e) => setTempProfile({ ...tempProfile, telephone: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={tempProfile.whatsapp || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, whatsapp: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Email Kontak</label>
                  <input
                    type="email"
                    required
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-3">
                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Pelabuhan Asal</label>
                    <input
                      type="text"
                      required
                      value={tempProfile.originPort || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, originPort: e.target.value })}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Legalitas Eksportir</label>
                    <input
                      type="text"
                      required
                      value={tempProfile.exporterLegality || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, exporterLegality: e.target.value })}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Kepatuhan Mutu</label>
                    <input
                      type="text"
                      required
                      value={tempProfile.qualityCompliance || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, qualityCompliance: e.target.value })}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Jaminan Keuangan</label>
                    <input
                      type="text"
                      required
                      value={tempProfile.financialGuarantee || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, financialGuarantee: e.target.value })}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-slate-800 pt-3">
                  <span className="block text-[12px] font-bold text-indigo-400 uppercase tracking-widest">Gambar Banner Hero</span>
                  
                  {/* Banner Image Preview */}
                  <div className="relative h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                    {tempProfile.bannerImage ? (
                      <>
                        <img 
                          src={tempProfile.bannerImage} 
                          alt="Banner Preview" 
                          className="absolute inset-0 w-full h-full object-cover opacity-75"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-950/40" />
                        <span className="relative z-10 text-[12px] font-black uppercase bg-black/75 px-2.5 py-1 rounded border border-white/10 tracking-widest text-slate-100">Pratinjau Banner Aktif</span>
                      </>
                    ) : (
                      <div className="text-center p-2 text-slate-500">
                        <Image className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                        <span className="text-[12px] font-bold">Belum Ada Banner Kustom (Menggunakan Default)</span>
                      </div>
                    )}
                  </div>

                  {/* Upload File & Link URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {/* File Upload Selector */}
                    <div className="relative group border border-dashed border-slate-800 rounded-xl bg-slate-950/40 hover:bg-slate-950 hover:border-indigo-500/50 transition-all p-3 text-center cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setTempProfile({ ...tempProfile, bannerImage: reader.result });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-4 h-4 mx-auto mb-1 text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span className="block text-[12px] font-bold text-slate-300">Pilih Berkas Gambar</span>
                      <span className="block text-[12px] text-slate-500 mt-0.5">PNG, JPG (Maks. 2MB)</span>
                    </div>

                    {/* Presets Grid */}
                    <div className="border border-slate-800 rounded-xl p-2 bg-slate-950/30">
                      <span className="block text-[12px] font-black text-slate-500 uppercase tracking-wider mb-1">Preset Cepat Premium</span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => setTempProfile({ ...tempProfile, bannerImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=80' })}
                          className="h-10 rounded-lg overflow-hidden relative border border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer group"
                          title="Pelabuhan Cargo Kontainer"
                        >
                          <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=150" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                            <span className="text-[12px] font-black text-white uppercase text-center leading-none tracking-widest">Kargo</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempProfile({ ...tempProfile, bannerImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1600&q=80' })}
                          className="h-10 rounded-lg overflow-hidden relative border border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer group"
                          title="Hasil Bumi Rempah Indonesia"
                        >
                          <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                            <span className="text-[12px] font-black text-white uppercase text-center leading-none tracking-widest">Rempah</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempProfile({ ...tempProfile, bannerImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80' })}
                          className="h-10 rounded-lg overflow-hidden relative border border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer group"
                          title="Gudang Logistik Modern"
                        >
                          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                            <span className="text-[12px] font-black text-white uppercase text-center leading-none tracking-widest">Gudang</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Manual URL Input */}
                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider">Atau Tempel Tautan URL Gambar</label>
                    <input
                      type="url"
                      value={tempProfile.bannerImage || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, bannerImage: e.target.value })}
                      placeholder="https://images.unsplash.com/... atau tautan gambar lainnya"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[12px]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                  >{t.cancelBtn}</button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT COMMODITY CATALOG MODAL */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-y-auto max-h-[90vh] text-slate-900 shadow-2xl flex flex-col z-10 p-6 font-sans text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black uppercase tracking-wider">
                    {editingProduct === 'new' ? 'Tambah Komoditas Baru' : 'Edit Komoditas Katalog'}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs overflow-y-auto pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Nama Komoditas</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Premium Coffee Beans"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Kategori</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pertanian / Kopi"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">HS Code</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 0901.11.10"
                      value={productForm.hsCode}
                      onChange={(e) => setProductForm({ ...productForm, hsCode: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Harga FOB (USD)</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 1,450"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Satuan</label>
                    <input
                      type="text"
                      required
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Asal / Origin</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Aceh Tengah, Sumatra"
                      value={productForm.origin}
                      onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Min Order</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 10 MT"
                      value={productForm.minOrder}
                      onChange={(e) => setProductForm({ ...productForm, minOrder: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Foto Komoditas (Upload Gambar)</label>
                  
                  {/* Drag and Drop Upload Area */}
                  <div 
                    className="border-2 border-dashed border-slate-800 hover:border-indigo-500 bg-slate-950/40 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer group relative overflow-hidden w-full"
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setProductForm(prev => ({ ...prev, image: reader.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  >
                    <input 
                      type="file"
                      accept="image/*"
                      id="commodity-file-upload"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setProductForm(prev => ({ ...prev, image: reader.result as string }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {productForm.image && (productForm.image.startsWith('data:') || productForm.image.startsWith('http')) ? (
                      <div className="relative w-full h-20 flex items-center justify-center">
                        <img 
                          src={productForm.image} 
                          alt="Preview" 
                          className="h-full object-contain rounded-lg max-w-full"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-lg text-slate-200 gap-1">
                          <Upload className="w-4 h-4 text-indigo-400" />
                          <span className="text-[12px] font-bold uppercase">Ganti File Gambar</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 mx-auto mb-1 transition-colors" />
                        <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-200">Lepaskan file / Klik di sini</p>
                        <p className="text-[12px] text-slate-500 font-semibold mt-0.5">Mendukung file JPG, PNG, WEBP</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Spesifikasi Detail</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Spesifikasi kualitas ekspor, kadar air, defek, kemurnian..."
                    value={productForm.specification}
                    onChange={(e) => setProductForm({ ...productForm, specification: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold resize-none"
                  />
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                      Dokumen Spesifikasi Katalog (Maks 3MB)
                    </label>
                    <span className="text-[12px] text-slate-500 font-bold uppercase">Format: PDF, DOCX, XLSX, Gambar (Opsional)</span>
                  </div>

                  {productForm.attachmentUrl ? (
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div className="text-left overflow-hidden">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {productForm.attachmentName || 'Dokumen_Katalog.pdf'}
                          </p>
                          <p className="text-[12px] text-emerald-600 font-bold uppercase tracking-wider">Siap diunduh buyer</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProductForm(prev => ({ ...prev, attachmentUrl: '', attachmentName: '' }));
                          setFileError(null);
                        }}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                        fileError ? 'border-red-300 bg-red-50/20' : 'border-slate-200 hover:border-indigo-500 bg-slate-50'
                      }`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          if (file.size > 3 * 1024 * 1024) {
                            setFileError('Ukuran file melebihi batas maksimal 3MB!');
                            return;
                          }
                          setFileError(null);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setProductForm(prev => ({ 
                                ...prev, 
                                attachmentUrl: reader.result, 
                                attachmentName: file.name 
                              }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    >
                      <input 
                        type="file"
                        accept=".pdf,.docx,.xlsx,.doc,.xls,.png,.jpg,.jpeg,.webp"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 3 * 1024 * 1024) {
                              setFileError('Ukuran file melebihi batas maksimal 3MB!');
                              return;
                            }
                            setFileError(null);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setProductForm(prev => ({ 
                                  ...prev, 
                                  attachmentUrl: reader.result, 
                                  attachmentName: file.name 
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Upload className={`w-5 h-5 mb-1 ${fileError ? 'text-red-400' : 'text-slate-400'}`} />
                      <p className="text-[12px] text-slate-500 font-bold uppercase">Tarik & Lepas file dokumen di sini atau klik</p>
                      <p className="text-[12px] text-slate-400 mt-0.5">Ukuran file maksimal: 3 Megabyte (3MB)</p>
                    </div>
                  )}

                  {fileError && (
                    <p className="text-[12px] text-red-600 font-black text-left">
                      ⚠️ {fileError}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                  >{t.cancelBtn}</button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSubmitting ? "Menyimpan Simpan Komoditas Menerjemahkan..." : "Simpan Komoditas"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deletion Confirmation Modal for Products */}
      {productToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-red-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center animate-pulse">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">Hapus Komoditas</h3>
                <p className="text-[12px] font-extrabold uppercase tracking-widest text-red-400">Tindakan Permanen</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
              Apakah Anda yakin ingin menghapus komoditas ini dari katalog <strong>secara permanen</strong>?
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setProductToDeleteId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={() => handleDeleteProduct(productToDeleteId)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-3xs cursor-pointer animate-none"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
// trigger update
