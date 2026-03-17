import { useRef, useState, useCallback } from 'react';
import { PaymentReceiptData, defaultPaymentReceipt } from '@/types/payment';
import PaymentReceiptEditor from '@/components/PaymentReceiptEditor';
import PaymentReceiptPreview from '@/components/PaymentReceiptPreview';
import { motion } from 'framer-motion';
import { Smartphone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportPNG, exportJPG, exportReceiptPDF } from '@/lib/exportUtils';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel-strong border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold gradient-text hidden sm:block">Payment Receipt Generator</h1>
          </div>
          <div className="flex lg:hidden">
            <Button variant="outline" size="sm" onClick={() => setMobileView(v => v === 'edit' ? 'preview' : 'edit')}>
              {mobileView === 'edit' ? 'Preview' : 'Edit'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left - Editor */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-border/50 bg-card/30 overflow-y-auto ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}
          style={{ height: 'calc(100vh - 56px)' }}>
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
          style={{ height: 'calc(100vh - 56px)' }}>
          <div className="p-4 lg:p-8 flex justify-center">
            <PaymentReceiptPreview ref={previewRef} receipt={receipt} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
