import { useRef, useState, useCallback } from 'react';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import InvoiceEditor from '@/components/InvoiceEditor';
import InvoicePreview from '@/components/InvoicePreview';
import SavedInvoicesList from '@/components/SavedInvoicesList';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, List, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportToWord } from '@/lib/exportWord';
import { Link } from 'react-router-dom';

type Panel = 'editor' | 'saved';

const Index = () => {
  const store = useInvoiceStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>('editor');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

  const handleExportPDF = useCallback(async () => {
    if (!previewRef.current) return;
    toast.info('Generating PDF...');
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`${store.invoice.invoiceNumber}.pdf`);
      toast.success('PDF exported!');
    } catch { toast.error('Failed to export PDF'); }
  }, [store.invoice.invoiceNumber]);

  const handleExportPNG = useCallback(async () => {
    if (!previewRef.current) return;
    toast.info('Generating PNG...');
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `${store.invoice.invoiceNumber}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('PNG exported!');
    } catch { toast.error('Failed to export PNG'); }
  }, [store.invoice.invoiceNumber]);

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !previewRef.current) return;
    printWindow.document.write(`
      <html><head><title>${store.invoice.invoiceNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>${previewRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  }, [store.invoice.invoiceNumber]);

  const handleSave = useCallback(() => {
    store.saveInvoice();
    toast.success('Invoice saved!');
  }, [store]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel-strong border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold gradient-text hidden sm:block">InvoicePro</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={panel === 'editor' ? 'default' : 'ghost'} size="sm" onClick={() => setPanel('editor')}
              className={panel === 'editor' ? 'btn-3d bg-primary text-primary-foreground' : ''}>
              <FileText className="w-4 h-4 mr-1" /> Editor
            </Button>
            <Button variant={panel === 'saved' ? 'default' : 'ghost'} size="sm" onClick={() => setPanel('saved')}
              className={panel === 'saved' ? 'btn-3d bg-primary text-primary-foreground' : ''}>
              <List className="w-4 h-4 mr-1" /> Saved ({store.savedInvoices.length})
            </Button>
          </div>
          {/* Mobile toggle */}
          <div className="flex lg:hidden">
            <Button variant="outline" size="sm" onClick={() => setMobileView(v => v === 'edit' ? 'preview' : 'edit')}>
              {mobileView === 'edit' ? 'Preview' : 'Edit'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Panel */}
        <AnimatePresence mode="wait">
          <motion.div key={panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-border/50 bg-card/30 overflow-y-auto ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}
            style={{ height: 'calc(100vh - 56px)' }}>
            {panel === 'editor' ? (
              <InvoiceEditor
                invoice={store.invoice}
                onUpdate={store.updateInvoice}
                onSave={handleSave}
                onExportJSON={store.exportJSON}
                onDuplicate={store.duplicateInvoice}
                onNew={store.newInvoice}
                onExportPDF={handleExportPDF}
                onExportPNG={handleExportPNG}
                onPrint={handlePrint}
                darkMode={store.darkMode}
                onToggleDark={store.setDarkMode}
              />
            ) : (
              <SavedInvoicesList
                invoices={store.savedInvoices}
                onLoad={(id) => { store.loadInvoice(id); setPanel('editor'); toast.success('Invoice loaded!'); }}
                onDelete={(id) => { store.deleteInvoice(id); toast.success('Invoice deleted!'); }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Right Panel - Preview */}
        <div className={`flex-1 overflow-y-auto bg-muted/30 ${mobileView === 'edit' ? 'hidden lg:block' : ''}`}
          style={{ height: 'calc(100vh - 56px)' }}>
          <div className="p-4 lg:p-8 flex justify-center">
            <div className="shadow-2xl rounded-lg overflow-hidden">
              <InvoicePreview ref={previewRef} invoice={store.invoice} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
