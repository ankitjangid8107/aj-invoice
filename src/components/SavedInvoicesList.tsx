import { InvoiceData } from '@/types/invoice';
import { motion } from 'framer-motion';
import { FileText, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  invoices: InvoiceData[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SavedInvoicesList({ invoices, onLoad, onDelete }: Props) {
  if (invoices.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        No saved invoices yet. Create and save your first invoice!
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Saved Invoices</h3>
      {invoices.map((inv, idx) => (
        <motion.div key={inv.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="glass-panel rounded-lg p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1" onClick={() => onLoad(inv.id)} role="button">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{inv.invoiceNumber}</div>
              <div className="text-[10px] text-muted-foreground">{inv.companyName} • {inv.invoiceDate}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onDelete(inv.id)}>
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
