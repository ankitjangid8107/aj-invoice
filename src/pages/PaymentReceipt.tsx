import { useRef, useState, useCallback } from 'react';
import { PaymentReceiptData, defaultPaymentReceipt } from '@/types/payment';
import PaymentReceiptEditor from '@/components/PaymentReceiptEditor';
import PaymentReceiptPreview from '@/components/PaymentReceiptPreview';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportPNG, exportJPG, exportReceiptPDF } from '@/lib/exportUtils';
import AppNavbar from '@/components/AppNavbar';

const PaymentReceipt = () => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [receipt, setReceipt] = useState<PaymentReceiptData>({ ...defaultPaymentReceipt });
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

  const updateReceipt = useCallback((updates: Partial<PaymentReceiptData>) => {
    setReceipt(prev => ({ ...prev, ...updates }));
  }, []);

  const handleExportPNG = useCallback(async () => {
    if (!previewRef.current) return;
    toast.info('Generating PNG...');
    try {
      await exportPNG(previewRef.current, `payment_${receipt.transactionId}.png`);
      toast.success('PNG exported!');
    } catch { toast.error('Export failed'); }
  }, [receipt.transactionId]);

  const handleExportJPG = useCallback(async () => {
    if (!previewRef.current) return;
    toast.info('Generating JPG...');
    try {
      await exportJPG(previewRef.current, `payment_${receipt.transactionId}.jpg`);
      toast.success('JPG exported!');
    } catch { toast.error('Export failed'); }
  }, [receipt.transactionId]);

  const handleExportPDF = useCallback(async () => {
    if (!previewRef.current) return;
    toast.info('Generating PDF...');
    try {
      await exportReceiptPDF(previewRef.current, `payment_${receipt.transactionId}.pdf`);
      toast.success('PDF exported!');
    } catch { toast.error('Export failed'); }
  }, [receipt.transactionId]);

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <AppNavbar />
      {/* Sub-header */}
      <div className="sticky top-14 z-40 border-b border-border/30 bg-background/60 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-10">
          <h2 className="text-sm font-semibold text-foreground">💳 Payment Receipt Generator</h2>
          <Button variant="outline" size="sm" className="lg:hidden h-7 text-xs" onClick={() => setMobileView(v => v === 'edit' ? 'preview' : 'edit')}>
            {mobileView === 'edit' ? 'Preview' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left - Editor */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-border/50 bg-card/30 overflow-y-auto ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}
          style={{ height: 'calc(100vh - 96px)' }}>
          <PaymentReceiptEditor
            receipt={receipt}
            onUpdate={updateReceipt}
            onExportPNG={handleExportPNG}
            onExportJPG={handleExportJPG}
            onExportPDF={handleExportPDF}
          />
        </motion.div>

        {/* Right - Preview */}
        <div className={`flex-1 overflow-y-auto bg-muted/30 ${mobileView === 'edit' ? 'hidden lg:block' : ''}`}
          style={{ height: 'calc(100vh - 96px)' }}>
          <div className="p-4 lg:p-8 flex justify-center">
            <PaymentReceiptPreview ref={previewRef} receipt={receipt} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
