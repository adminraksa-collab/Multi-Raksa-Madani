import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, CheckCircle, AlertCircle, Clock, ArrowRight, 
  ShieldAlert, Check, FileSignature, Trash2, Info, 
  FileText, Shield, AlertTriangle, Sparkles, ChevronDown,
  CircleAlert, Calendar, DollarSign, Archive, X
} from 'lucide-react';
import { UserProfile, ExportShipment, RealTimeAlert } from '../types';

export interface UserTask {
  id: string;
  shipmentId: string;
  contractNumber: string;
  productName: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  category: 'contract' | 'logistics' | 'document' | 'payment' | 'sample';
  targetStepIndex?: number;
  targetSubStepIndex?: number;
  isSample?: boolean;
}

// Local translation dictionary for full multi-language support (ID, EN, ZH, AR, TH, RU, JA)
const localT: Record<string, Record<string, string>> = {
  id: {
    title: "Pusat Tugas & Notifikasi",
    activeRole: "Peran Aktif",
    switchHelp: "Beralih akun jika ingin ganti tugas",
    tasksHeading: "Kewajiban Tugas",
    alertsHeading: "Aktivitas & Notifikasi Baru",
    noTasksTitle: "Tugas Selesai Bersih!",
    noTasksDesc: "Semua kewajiban komersial dan operasional ekspor untuk peran Anda telah diselesaikan.",
    noAlertsTitle: "Tidak Ada Notifikasi",
    noAlertsDesc: "Log aktivitas ekspor saat ini kosong. Sinyal pabean atau pelayaran belum dipicu.",
    guestTitle: "Sesi Terbatas",
    guestDesc: "Silakan login terlebih dahulu untuk mengakses kewajiban logistik, persetujuan PEB, atau pelacakan kargo.",
    close: "Tutup",
    clear: "Bersihkan",
    priorityHigh: "PENTING",
    priorityMedium: "SEDANG",
    priorityLow: "RENDAH",
    commodity: "Komoditi",
    logSystem: "LOG SISTEM",
    unread: "Belum dibaca",
    totalTasksCount: "Kewajiban Tugas Aktif",
  },
  en: {
    title: "Task & Notification Center",
    activeRole: "Active Role",
    switchHelp: "Switch account to change tasks",
    tasksHeading: "Actionable Tasks",
    alertsHeading: "Recent Alerts & Activities",
    noTasksTitle: "All Tasks Cleared!",
    noTasksDesc: "All commercial and operational export obligations for your active role are complete.",
    noAlertsTitle: "No New Notifications",
    noAlertsDesc: "Export activity log is currently empty. Logistics and customs signals are pending.",
    guestTitle: "Limited Session",
    guestDesc: "Please log in first to access logistics tasks, PEB approvals, or cargo tracking.",
    close: "Close",
    clear: "Clear All",
    priorityHigh: "HIGH",
    priorityMedium: "MEDIUM",
    priorityLow: "LOW",
    commodity: "Commodity",
    logSystem: "SYSTEM LOG",
    unread: "Unread",
    totalTasksCount: "Active Tasks",
  },
  zh: {
    title: "任务与通知中心",
    activeRole: "当前角色",
    switchHelp: "切换账户以更改任务",
    tasksHeading: "待办任务",
    alertsHeading: "最新动态与通知",
    noTasksTitle: "所有任务已完成！",
    noTasksDesc: "您当前角色的所有商业和运营出口义务均已完成。",
    noAlertsTitle: "暂无通知",
    noAlertsDesc: "出口活动日志目前为空。物流或海关信号尚未触发。",
    guestTitle: "有限会话",
    guestDesc: "请先登录以访问物流任务、PEB 批准或货物跟踪。",
    close: "关闭",
    clear: "清除全部",
    priorityHigh: "重要",
    priorityMedium: "中等",
    priorityLow: "低",
    commodity: "商品",
    logSystem: "系统日志",
    unread: "未读",
    totalTasksCount: "个活跃任务",
  },
  ar: {
    title: "مركز المهام والتنبيهات",
    activeRole: "الدور النشط",
    switchHelp: "قم بتبديل الحساب لتغيير المهام",
    tasksHeading: "المهام النشطة",
    alertsHeading: "التنبيهات والأنشطة الأخيرة",
    noTasksTitle: "تم إكمال جميع المهام!",
    noTasksDesc: "تم إكمال جميع التزامات التصدير التجارية والتشغيلية لدورك الحالي.",
    noAlertsTitle: "لا توجد تنبيهات",
    noAlertsDesc: "سجل نشاط التصدير فارغ حاليًا. لم يتم تشغيل إشارات الخدمات اللوجستية أو الجمارك بعد.",
    guestTitle: "جلسة محدودة",
    guestDesc: "يرجى تسجيل الدخول أولاً للوصول إلى المهام اللوجستية، أو موافقات PEB، أو تتبع الشحنات.",
    close: "إغلاق",
    clear: "مسح الكل",
    priorityHigh: "هام",
    priorityMedium: "متوسط",
    priorityLow: "منخفض",
    commodity: "السلعة",
    logSystem: "سجل النظام",
    unread: "غير مقروء",
    totalTasksCount: "مهام نشطة",
  },
  th: {
    title: "ศูนย์งานและการแจ้งเตือน",
    activeRole: "บทบาทปัจจุบัน",
    switchHelp: "สลับบัญชีเพื่อเปลี่ยนงาน",
    tasksHeading: "งานที่ต้องดำเนินการ",
    alertsHeading: "กิจกรรมและการแจ้งเตือนล่าสุด",
    noTasksTitle: "เสร็จสิ้นทุกงาน!",
    noTasksDesc: "ภาระผูกพันในการส่งออกเชิงพาณิชย์และการดำเนินงานทั้งหมดสำหรับบทบาทของคุณเสร็จสมบูรณ์แล้ว",
    noAlertsTitle: "ไม่มีการแจ้งเตือน",
    noAlertsDesc: "บันทึกกิจกรรมการส่งออกว่างเปล่าในขณะนี้ ยังไม่มีสัญญาณโลจิสติกส์หรือศุลกากรถูกกระตุ้น",
    guestTitle: "เซสชันจำกัด",
    guestDesc: "โปรดเข้าสู่ระบบก่อนเพื่อเข้าถึงงานโลจิสติกส์ การอนุมัติ PEB หรือการติดตามสินค้า",
    close: "ปิด",
    clear: "ล้างทั้งหมด",
    priorityHigh: "สำคัญ",
    priorityMedium: "ปานกลาง",
    priorityLow: "ต่ำ",
    commodity: "สินค้า",
    logSystem: "บันทึกระบบ",
    unread: "ยังไม่ได้อ่าน",
    totalTasksCount: "งานที่เปิดใช้งานอยู่",
  },
  ru: {
    title: "Центр задач и уведомлений",
    activeRole: "Активная роль",
    switchHelp: "Смените аккаунт, чтобы изменить задачи",
    tasksHeading: "Активные задачи",
    alertsHeading: "Последние уведомления и события",
    noTasksTitle: "Все задачи выполнены!",
    noTasksDesc: "Все коммерческие и операционные экспортные обязательства для вашей роли выполнены.",
    noAlertsTitle: "Нет уведомлений",
    noAlertsDesc: "Журнал экспорта пуст. Логистические или таможенные сигналы еще не получены.",
    guestTitle: "Ограниченный сеанс",
    guestDesc: "Пожалуйста, сначала войдите в систему, чтобы получить доступ к задачам логистики, одобрениям PEB или отслеживанию грузов.",
    close: "Закрыть",
    clear: "Очистить все",
    priorityHigh: "ВАЖНО",
    priorityMedium: "СРЕДНИЙ",
    priorityLow: "НИЗКИЙ",
    commodity: "Товар",
    logSystem: "СИСТЕМНЫЙ ЛОГ",
    unread: "Не прочитано",
    totalTasksCount: "активных задач",
  },
  ja: {
    title: "タスク＆通知センター",
    activeRole: "有効な役割",
    switchHelp: "タスクを変更するにはアカウントを切り替えてください",
    tasksHeading: "実行が必要なタスク",
    alertsHeading: "最近の通知とアクティビティ",
    noTasksTitle: "すべてのタスクが完了しました！",
    noTasksDesc: "現在のアクティブな役割に対するすべての商業および運営上の輸出義務が完了しています。",
    noAlertsTitle: "新しい通知はありません",
    noAlertsDesc: "輸出アクティビティログは現在空です。物流または税関のシグナルは保留中です。",
    guestTitle: "制限付きセッション",
    guestDesc: "物流タスク、PEBの承認、または貨物の追跡にアクセスするには、まずログインしてください。",
    close: "閉じる",
    clear: "すべてクリア",
    priorityHigh: "高",
    priorityMedium: "中",
    priorityLow: "低",
    commodity: "品目",
    logSystem: "システムログ",
    unread: "未読",
    totalTasksCount: "件のアクティブなタスク",
  }
};

export function getPendingTasks(
  currentUser: UserProfile | null, 
  shipments: ExportShipment[],
  sampleRequests: any[] = [],
  lang: string = 'id'
): UserTask[] {
  if (!currentUser) return [];

  const tasks: UserTask[] = [];
  const isId = lang === 'id';

  // 1. Cargo Shipments
  shipments.forEach(s => {
    // If fully Completed, check if Buyer has import/clearance tasks
    if (s.currentStep === 'Completed') {
      if (currentUser.role === 'Buyer') {
        tasks.push({
          id: `task-import-${s.id}`,
          shipmentId: s.id,
          contractNumber: s.contractNumber,
          productName: s.productName,
          title: isId ? 'Urus Bea Masuk & Rilis Impor Tokyo' : 'Manage Import Clearance Tokyo',
          description: isId 
            ? `Kargo tuntas dikirim! Selesaikan bea pabean impor clearance lokal di Pelabuhan Tokyo, Jerman untuk melepas barang.`
            : `Cargo fully shipped! Complete local import customs clearance at Tokyo/Germany port to release goods.`,
          priority: 'medium',
          actionLabel: isId ? 'Tinjau Arsip Transaksi' : 'Review Transaction',
          category: 'logistics',
          targetStepIndex: 2
        });
      }
      return;
    }

    // Draft / Commercial Negotiation Stage
    if (s.currentStep === 'Draft') {
      const salesContractDoc = s.documents.find(d => d.type === 'Sales Contract' || (d.type as string) === 'Proforma Invoice');
      const docStatus = salesContractDoc?.status || 'Draft';

      if (docStatus === 'Draft') {
        if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-sc-draft-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Kirim Draf Kontrak/PI Bilateral' : 'Send Draft Contract/PI Bilateral',
            description: isId
              ? `Draf Sales Contract masih berstatus draf. Lengkapi isian harga FOB/CIF dan rincian kargo, lalu ajukan ke Buyer.`
              : `Sales Contract is still in draft mode. Complete the FOB/CIF price details and cargo breakdown, then submit to Buyer.`,
            priority: 'high',
            actionLabel: isId ? 'Lengkapi & Ajukan' : 'Complete & Submit',
            category: 'contract',
            targetStepIndex: 0
          });
        } else if (currentUser.role === 'Buyer') {
          tasks.push({
            id: `task-sc-review-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Tinjau & Rumuskan Proposal Balasan' : 'Review & Submit Counter Proposal',
            description: isId
              ? `Negosiasi harga dan spesifikasi kargo untuk ${s.productName} sedang berlangsung. Kirim proposal balasan atau setujui draf.`
              : `Price & specification negotiations for ${s.productName} are underway. Submit a counter proposal or approve draft.`,
            priority: 'high',
            actionLabel: isId ? 'Masuk Negosiasi' : 'Enter Negotiation',
            category: 'contract',
            targetStepIndex: 0
          });
        }
      } else if (docStatus === 'Issued') {
        if (currentUser.role === 'Buyer') {
          tasks.push({
            id: `task-sc-sign-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Tanda Tangani Sales Contract Resmi' : 'Sign Official Sales Contract',
            description: isId
              ? `Draf resmi telah diajukan oleh eksportir. Segera setujui dan tanda tangani draf agar alur pengapalan dapat dimulai.`
              : `Official draft has been issued by exporter. Agree and sign the draft immediately to start shipping workflows.`,
            priority: 'high',
            actionLabel: isId ? 'Tandatangani Kontrak' : 'Sign Contract',
            category: 'contract',
            targetStepIndex: 0
          });
        } else if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-sc-wait-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Menunggu Tanda Tangan Buyer' : 'Awaiting Buyer Signature',
            description: isId
              ? `Draf final kontrak telah Anda ajukan kepada Buyer Jerman. Menunggu validasi bilateral.`
              : `Final contract has been submitted to German Buyer. Awaiting bilateral validation.`,
            priority: 'medium',
            actionLabel: isId ? 'Pantau Transaksi' : 'Monitor Transaction',
            category: 'contract',
            targetStepIndex: 0
          });
        }
      }
    }

    // Shipping / Logistics & Operational Stage
    if (s.currentStep === 'Shipping') {
      let completedSubs: number[] = [];
      try {
        const stored = localStorage.getItem(`exportflow_completed_substeps_${s.id}`);
        if (stored) {
          completedSubs = JSON.parse(stored);
        }
      } catch (e) {}

      const completedCount = completedSubs.length;

      if (completedCount === 0) {
        // Substep 0: Sourcing Komoditas
        if (currentUser.role === 'Supplier') {
          tasks.push({
            id: `task-source-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Sortir & Kirim Komoditas Organik' : 'Sort & Dispatch Organic Commodity',
            description: isId
              ? `Segera lakukan pemilihan grade kualitas prima (Grade A), lakukan packing, dan mobilisasi kargo menuju Gudang Transit Utama.`
              : `Conduct sorting for premium grade (Grade A), wrap cleanly, and mobilize cargo to the Main Transit Warehouse.`,
            priority: 'high',
            actionLabel: isId ? 'Kirim Komoditi' : 'Dispatch Commodity',
            category: 'logistics',
            targetStepIndex: 1,
            targetSubStepIndex: 0
          });
        } else if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-source-trader-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Awasi Sourcing Komoditas Bahan Baku' : 'Supervise Raw Material Sourcing',
            description: isId
              ? `Pastikan Supplier petani lokal menyortir komoditas sesuai kadar air ekspor (max 12%) dan mengirimkannya tepat waktu ke gudang transit.`
              : `Verify that local farmer suppliers sort commodities to export moisture level (max 12%) and ship on-schedule.`,
            priority: 'medium',
            actionLabel: isId ? 'Kelola Sourcing' : 'Manage Sourcing',
            category: 'logistics',
            targetStepIndex: 1,
            targetSubStepIndex: 0
          });
        }
      } else if (completedCount === 1) {
        // Substep 1: Karantina & Bea Cukai
        if (currentUser.role === 'Trader') {
          tasks.push({
            id: `task-customs-trader-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Ajukan Pemberitahuan Ekspor Barang (PEB)' : 'Submit Goods Export Declaration (PEB)',
            description: isId
              ? `Susun formulir pabean ekspor, bayar pungutan ekspor, dan ajukan berkas PEB ke sistem Bea Cukai RI.`
              : `Compile export customs form, settle export levies, and submit PEB files to the Indonesian Customs system.`,
            priority: 'high',
            actionLabel: isId ? 'Isi PEB Cukai' : 'File PEB Customs',
            category: 'document',
            targetStepIndex: 1,
            targetSubStepIndex: 1
          });
        } else if (currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-customs-officer-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Verifikasi Berkas PEB & Terbitkan NPE' : 'Verify PEB Records & Release NPE',
            description: isId
              ? `Lakukan verifikasi kelengkapan berkas PEB eksportir dan terbitkan Nota Pelayanan Ekspor (NPE) hijau untuk melepaskan kontainer.`
              : `Verify the completeness of exporter PEB filings and issue the green Export Clearance Note (NPE) to release containers.`,
            priority: 'high',
            actionLabel: isId ? 'Verifikasi PEB' : 'Verify PEB Filing',
            category: 'document',
            targetStepIndex: 1,
            targetSubStepIndex: 1
          });
        }
      } else if (completedCount === 2) {
        // Substep 2: Pelayaran Kargo
        if (currentUser.role === 'Forwarder') {
          tasks.push({
            id: `task-shipping-forwarder-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Selesaikan Stuffing Kontainer & Rilis B/L' : 'Complete Container Stuffing & Issue B/L',
            description: isId
              ? `Ambil muatan dari Gudang Transit, selesaikan stuffing kargo ke kontainer ekspor, urus customs pelabuhan, dan rilis Bill of Lading (B/L) resmi.`
              : `Pick up cargo from Transit Hub, complete container stuffing, clear customs port parameters, and issue the official Bill of Lading (B/L).`,
            priority: 'high',
            actionLabel: isId ? 'Proses Logistik' : 'Process Logistics',
            category: 'logistics',
            targetStepIndex: 1,
            targetSubStepIndex: 2
          });
        } else if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-shipping-trader-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Kirim Instruksi Pengapalan (SI)' : 'Send Shipping Instructions (SI)',
            description: isId
              ? `Segera lengkapi parameter pengirim & penerima kargo untuk dikirimkan sebagai Shipping Instruction (SI) ke Forwarder Samudera Logistik.`
              : `Complete consignor & consignee settings and submit the Shipping Instruction (SI) to Samudera Logistics Forwarder.`,
            priority: 'medium',
            actionLabel: isId ? 'Buka Live Editor' : 'Open Live Editor',
            category: 'document',
            targetStepIndex: 1,
            targetSubStepIndex: 2
          });
        }
      } else if (completedCount === 3) {
        // Substep 3: Pencairan L/C
        if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
          tasks.push({
            id: `task-lc-trader-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Serahkan Dokumen Kargo Bersih ke Bank' : 'Present Clean Cargo Docs to Bank',
            description: isId
              ? `Ajukan draf salinan Bill of Lading, Invoice, Packing List, Phytosanitary, dan COO ke Bank Mandiri sebagai syarat pencairan dana L/C.`
              : `Submit copies of Bill of Lading, Invoice, Packing List, Phytosanitary, and COO to Bank Mandiri for L/C disbursement.`,
            priority: 'high',
            actionLabel: isId ? 'Presentasi Dokumen' : 'Present Documents',
            category: 'payment',
            targetStepIndex: 1,
            targetSubStepIndex: 3
          });
        } else if (currentUser.role === 'Buyer') {
          tasks.push({
            id: `task-lc-buyer-${s.id}`,
            shipmentId: s.id,
            contractNumber: s.contractNumber,
            productName: s.productName,
            title: isId ? 'Verifikasi Berkas Bersih & Cairkan Dana L/C' : 'Verify Clean Docs & Disburse L/C',
            description: isId
              ? `Bank pembeli (Deutsche Bank) telah menerima salinan dokumen kargo bersih. Validasi berkas fisik dan cairkan dana Letter of Credit ke eksportir.`
              : `Buyer bank (Deutsche Bank) received clean cargo filings. Validate physical papers and disburse the Letter of Credit funds to exporter.`,
            priority: 'high',
            actionLabel: isId ? 'Verifikasi L/C' : 'Verify L/C Release',
            category: 'payment',
            targetStepIndex: 1,
            targetSubStepIndex: 3
          });
        }
      }
    }
  });

  // 2. Sample Requests - Active Business Process/Transaction Actionable Items
  if (sampleRequests && sampleRequests.length > 0) {
    sampleRequests.forEach(req => {
      const isPending = req.status === 'pending';
      const isShipped = req.status === 'shipped';

      if (currentUser.role === 'Trader' || currentUser.role === 'Superadmin') {
        if (isPending) {
          tasks.push({
            id: `task-sample-pending-${req.id}`,
            shipmentId: req.id,
            contractNumber: `SAMP-${req.id.slice(-4).toUpperCase()}`,
            productName: req.productName,
            title: isId 
              ? `Kirim Paket Sampel ke ${req.buyerCompany}`
              : `Ship Sample Package to ${req.buyerCompany}`,
            description: isId
              ? `Permintaan sampel dari ${req.buyerName} sebanyak ${req.quantity} via kurir ${req.courier}. Siapkan komoditi dan kirim.`
              : `Sample request from ${req.buyerName} of ${req.quantity} via ${req.courier}. Prepare commodities and dispatch package.`,
            priority: 'high',
            actionLabel: isId ? 'Proses Kirim' : 'Process Shipment',
            category: 'sample',
            isSample: true
          });
        } else if (req.shippingFeePaidBy === 'buyer' && req.shippingFeePaymentStatus === 'pending_confirmation') {
          tasks.push({
            id: `task-sample-pay-${req.id}`,
            shipmentId: req.id,
            contractNumber: `SAMP-${req.id.slice(-4).toUpperCase()}`,
            productName: req.productName,
            title: isId
              ? `Verifikasi Ongkos Kirim Sampel`
              : `Verify Sample Shipping Payment`,
            description: isId
              ? `Buyer ${req.buyerCompany} telah mengonfirmasi transfer ongkos kirim $${req.shippingFeeAmount} USD. Periksa rekening bank Mandiri Anda.`
              : `Buyer ${req.buyerCompany} submitted payment confirmation of $${req.shippingFeeAmount} USD. Validate Bank Mandiri records and approve.`,
            priority: 'high',
            actionLabel: isId ? 'Sahkan Dana' : 'Verify Funds',
            category: 'sample',
            isSample: true
          });
        }
      } else if (currentUser.role === 'Buyer') {
        if (isPending) {
          tasks.push({
            id: `task-sample-buyer-pending-${req.id}`,
            shipmentId: req.id,
            contractNumber: `SAMP-${req.id.slice(-4).toUpperCase()}`,
            productName: req.productName,
            title: isId
              ? `Menunggu Persetujuan Sampel PT Multi Raksa`
              : `Awaiting Sample Approval from Exporter`,
            description: isId
              ? `Permintaan sampel untuk ${req.productName} sedang ditinjau dan diverifikasi oleh tim PT Multi Raksa Madani.`
              : `Your sample request for ${req.productName} is currently under verification by PT Multi Raksa Madani team.`,
            priority: 'low',
            actionLabel: isId ? 'Pantau Progres' : 'Track Status',
            category: 'sample',
            isSample: true
          });
        } else if (req.shippingFeePaidBy === 'buyer' && (!req.shippingFeePaymentStatus || req.shippingFeePaymentStatus === 'unpaid')) {
          tasks.push({
            id: `task-sample-buyer-pay-${req.id}`,
            shipmentId: req.id,
            contractNumber: `SAMP-${req.id.slice(-4).toUpperCase()}`,
            productName: req.productName,
            title: isId
              ? `Bayar Ongkos Kirim Sampel (${req.courier})`
              : `Pay Sample Shipping Fee (${req.courier})`,
            description: isId
              ? `Segera transfer biaya kurir $${req.shippingFeeAmount} USD ke rekening bank eksportir agar paket sampel Anda segera dikirim.`
              : `Transfer the required courier cost of $${req.shippingFeeAmount} USD to exporter's bank account to initiate dispatch.`,
            priority: 'high',
            actionLabel: isId ? 'Bayar Sekarang' : 'Pay Now',
            category: 'sample',
            isSample: true
          });
        } else if (isShipped) {
          tasks.push({
            id: `task-sample-buyer-receive-${req.id}`,
            shipmentId: req.id,
            contractNumber: `SAMP-${req.id.slice(-4).toUpperCase()}`,
            productName: req.productName,
            title: isId
              ? `Konfirmasi Penerimaan Sampel`
              : `Confirm Sample Package Delivery`,
            description: isId
              ? `Paket sampel telah meluncur via ${req.courier} dengan resi ${req.trackingNumber}. Konfirmasi jika fisik paket telah sampai.`
              : `Sample package is currently in-transit via ${req.courier} (${req.trackingNumber}). Confirm once received.`,
            priority: 'medium',
            actionLabel: isId ? 'Konfirmasi Terima' : 'Confirm Receipt',
            category: 'sample',
            isSample: true
          });
        }
      }
    });
  }

  return tasks;
}

interface NotificationCenterProps {
  currentUser: UserProfile | null;
  shipments: ExportShipment[];
  onSelectShipment: (shipmentId: string, targetStepIndex?: number, targetSubStepIndex?: number) => void;
  onNavigateToTab: (tab: 'home' | 'workflow' | 'guide' | 'negotiation' | 'users', keepActiveShipment?: boolean) => void;
  alerts: RealTimeAlert[];
  onMarkAlertAsRead: (alertId: string) => void;
  onClearAlerts: () => void;
  lang?: string;
  sampleRequests?: any[];
  onSelectSampleRequest?: () => void;
}

export default function NotificationCenter({
  currentUser,
  shipments,
  onSelectShipment,
  onNavigateToTab,
  alerts,
  onMarkAlertAsRead,
  onClearAlerts,
  lang = 'id',
  sampleRequests = [],
  onSelectSampleRequest
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fallback to Indonesian if lang is invalid
  const loc = localT[lang] || localT.id;

  // Compile unified pending obligations (both shipments and sample transactions)
  const pendingTasks = getPendingTasks(currentUser, shipments, sampleRequests, lang);
  
  // Total badge count represents tasks requiring attention
  const totalCount = pendingTasks.length;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTaskAction = (task: UserTask) => {
    setIsOpen(false);
    if (task.isSample) {
      if (onSelectSampleRequest) {
        onSelectSampleRequest();
      }
      onNavigateToTab('workflow', true);
    } else {
      onSelectShipment(task.shipmentId, task.targetStepIndex, task.targetSubStepIndex);
      onNavigateToTab('workflow', true);
    }
  };

  const handleReadAlert = (alertId: string) => {
    onMarkAlertAsRead(alertId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contract':
        return <FileSignature className="w-4 h-4 text-amber-500" />;
      case 'logistics':
        return <Clock className="w-4 h-4 text-indigo-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'sample':
        return <Sparkles className="w-4 h-4 text-pink-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityStyle = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar trigger Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen 
            ? 'bg-slate-900 text-white border-slate-950 shadow-sm' 
            : 'bg-white hover:bg-slate-50 border-gray-200 text-slate-700 hover:text-slate-950 hover:border-gray-300 shadow-3xs'
        }`}
        id="notification-bell-trigger"
        title={loc.title}
      >
        <Bell className={`w-4 h-4 ${totalCount > 0 && !isOpen ? 'animate-bounce' : ''}`} />
        
        {totalCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-extrabold text-[12px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm font-sans">
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown panel - Re-engineered into a beautifully unified vertical list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 text-left"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">{loc.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Tamu (Guest)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Role Helper Info bar */}
            {currentUser && (
              <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100/50 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{loc.activeRole}: <strong className="uppercase font-black">{currentUser.role}</strong></span>
                </div>
                <span className="text-[10px] text-indigo-500 font-medium">{loc.switchHelp}</span>
              </div>
            )}

            {/* Single Consolidated List Body */}
            <div className="max-h-[420px] overflow-y-auto p-3.5 space-y-4 bg-slate-50/40">
              
              {/* GUEST WARNING / EMPTY STATE IF NOT LOGGED IN */}
              {!currentUser && (
                <div className="p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase">{loc.guestTitle}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                      {loc.guestDesc}
                    </p>
                  </div>
                </div>
              )}

              {currentUser && (
                <>
                  {/* SECTION 1: ACTIONABLE OBLIGATION TASKS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 font-sans">
                        <FileSignature className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{loc.tasksHeading}</span>
                      </span>
                      {pendingTasks.length > 0 && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded-md">
                          {pendingTasks.length}
                        </span>
                      )}
                    </div>

                    {pendingTasks.length === 0 ? (
                      <div className="p-5 bg-white border border-gray-150 rounded-xl text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500">
                          <Check className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h5 className="text-[11px] font-black text-emerald-800 uppercase">{loc.noTasksTitle}</h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                            {loc.noTasksDesc}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {pendingTasks.map(task => (
                          <div
                            key={task.id}
                            className="p-3 bg-white border border-gray-150 rounded-xl hover:border-indigo-300 hover:shadow-2xs transition-all text-left space-y-2 relative"
                          >
                            {/* Task Header info */}
                            <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                {getCategoryIcon(task.category)}
                                <span className="text-[11px] font-mono bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded border border-slate-150">
                                  {task.contractNumber}
                                </span>
                              </div>
                              
                              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                                {task.priority === 'high' ? loc.priorityHigh : task.priority === 'medium' ? loc.priorityMedium : loc.priorityLow}
                              </span>
                            </div>

                            {/* Task Content */}
                            <div className="space-y-1">
                              <h5 className="text-[12px] font-black text-slate-900 leading-snug">
                                {task.title}
                              </h5>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                {task.description}
                              </p>
                              <p className="text-[11px] text-slate-400 italic font-mono font-medium line-clamp-1">
                                {loc.commodity}: {task.productName}
                              </p>
                            </div>

                            {/* Action Trigger */}
                            <div className="pt-1 flex justify-end">
                              <button
                                onClick={() => handleTaskAction(task)}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
                              >
                                <span>{task.actionLabel}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>

            {/* Dropdown Footer */}
            <div className="p-3 bg-slate-50 border-t border-gray-150 text-center flex justify-between items-center text-[11px] text-slate-400 font-bold">
              <span>{pendingTasks.length} {loc.totalTasksCount}</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-indigo-600 hover:text-indigo-800 transition-colors uppercase cursor-pointer"
              >
                {loc.close}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
