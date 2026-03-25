import { useRef, useState } from 'react';
import { useCloudInvoiceStore } from '@/hooks/useCloudInvoiceStore';
import { useAuth } from '@/contexts/AuthContext';
import InvoiceEditor from '@/components/InvoiceEditor';
import InvoicePreview from '@/components/InvoicePreview';
import SavedInvoicesList from '@/components/SavedInvoicesList';
import AppNavbar from '@/components/AppNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportPNG, exportPDF } from '@/lib/exportUtils';
import { exportToWord } from '@/lib/exportWord';
import { Navigate } from 'react-router-dom';

type Panel = 'editor' | 'saved';

const Index = () => {
  const { user, loading } = useAuth();
  const store = useCloudInvoiceStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>('editor');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    toast.info('Generating PDF...');
    try { await exportPDF(previewRef.current, `${store.invoice.invoiceNumber}.pdf`); toast.success('PDF exported!'); }
    catch { toast.error('Failed to export PDF'); }
  };
  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    toast.info('Generating PNG...');
    try { await exportPNG(previewRef.current, `${store.invoice.invoiceNumber}.png`); toast.success('PNG exported!'); }
    catch { toast.error('Failed to export PNG'); }
  };
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !previewRef.current) return;
    printWindow.document.write(`<html><head><title>${store.invoice.invoiceNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Inter', Arial, sans-serif; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head>
      <body>${previewRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };
  const handleExportWord = async () => {
    toast.info('Generating Word document...');
    try { await exportToWord(store.invoice); toast.success('Word document exported!'); }
    catch { toast.error('Failed to export Word document'); }
  };
  const handleSave = async () => {
    await store.saveInvoice();
    toast.success(store.isAdmin ? 'Invoice saved permanently!' : `Invoice saved! (expires in ${store.saveDays} days)`);
  };

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <AppNavbar />

      {/* Sub-header for editor/saved toggle */}
      <div className="sticky top-14 z-40 border-b border-border/30 bg-background/60 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-10">
          <div className="flex items-center gap-1">
            <Button variant={panel === 'editor' ? 'default' : 'ghost'} size="sm" onClick={() => setPanel('editor')} className="h-7 text-xs">
              <FileText className="w-3.5 h-3.5 mr-1" /> Editor
            </Button>
            <Button variant={panel === 'saved' ? 'default' : 'ghost'} size="sm" onClick={() => setPanel('saved')} className="h-7 text-xs">
              <List className="w-3.5 h-3.5 mr-1" /> Saved ({store.savedInvoices.length})
            </Button>
          </div>
          <Button variant="outline" size="sm" className="lg:hidden h-7 text-xs" onClick={() => setMobileView(v => v === 'edit' ? 'preview' : 'edit')}>
            {mobileView === 'edit' ? 'Preview' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-border/50 bg-card/30 overflow-y-auto ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}
            style={{ height: 'calc(100vh - 96px)' }}>
            {panel === 'editor' ? (
              <InvoiceEditor invoice={store.invoice} onUpdate={store.updateInvoice} onSave={handleSave}
                onExportJSON={store.exportJSON} onDuplicate={store.duplicateInvoice} onNew={store.newInvoice}
                onExportPDF={handleExportPDF} onExportPNG={handleExportPNG} onPrint={handlePrint}
                onExportWord={handleExportWord} darkMode={store.darkMode} onToggleDark={store.setDarkMode} />
            ) : (
              <SavedInvoicesList invoices={store.savedInvoices}
                onLoad={(id) => { store.loadInvoice(id); setPanel('editor'); toast.success('Invoice loaded!'); }}
                onDelete={async (id) => { await store.deleteInvoice(id); toast.success('Invoice deleted!'); }} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className={`flex-1 overflow-y-auto bg-muted/30 ${mobileView === 'edit' ? 'hidden lg:block' : ''}`}
          style={{ height: 'calc(100vh - 96px)' }}>
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
