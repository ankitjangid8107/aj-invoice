import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload, Save, FileDown, Copy, FilePlus, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, memo, useCallback } from 'react';

const Section = memo(({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-4 space-y-3">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">{title}</h3>
    {children}
  </motion.div>
));
Section.displayName = 'Section';

const Field = memo(({ label, value, onChange, textarea, type = 'text' }: {
  label: string; value: string | number; onChange: (v: string) => void; textarea?: boolean; type?: string;
}) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {textarea ? (
      <Textarea value={value} onChange={e => onChange(e.target.value)} className="text-sm min-h-[60px] bg-secondary/50" />
    ) : (
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} className="text-sm h-8 bg-secondary/50" />
    )}
  </div>
));
Field.displayName = 'Field';

interface Props {
  invoice: InvoiceData;
  onUpdate: (updates: Partial<InvoiceData>) => void;
  onSave: () => void;
  onExportJSON: () => void;
  onDuplicate: () => void;
  onNew: () => void;
  onExportPDF: () => void;
  onExportPNG: () => void;
  onExportWord: () => void;
  onPrint: () => void;
  darkMode: boolean;
  onToggleDark: (v: boolean) => void;
}

export default function InvoiceEditor({
  invoice, onUpdate, onSave, onExportJSON, onDuplicate, onNew,
  onExportPDF, onExportPNG, onExportWord, onPrint, darkMode, onToggleDark,
}: Props) {
  const logoRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);

  const handleLogo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdate({ companyLogo: reader.result as string });
    reader.readAsDataURL(file);
  }, [onUpdate]);

  const handleSig = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdate({ signatureImage: reader.result as string });
    reader.readAsDataURL(file);
  }, [onUpdate]);

  const addItem = useCallback(() => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(), description: '', hsn: '',
      quantity: 1, unitPrice: 0, discount: 0, taxType: 'IGST', taxRate: 0,
    };
    onUpdate({ items: [...invoice.items, newItem] });
  }, [invoice.items, onUpdate]);

  const removeItem = useCallback((id: string) => {
    if (invoice.items.length <= 1) return;
    onUpdate({ items: invoice.items.filter(i => i.id !== id) });
  }, [invoice.items, onUpdate]);

  const updateItem = useCallback((id: string, updates: Partial<InvoiceItem>) => {
    onUpdate({ items: invoice.items.map(i => i.id === id ? { ...i, ...updates } : i) });
  }, [invoice.items, onUpdate]);

  return (
    <div className="space-y-4 p-4 overflow-y-auto max-h-screen">
      {/* Action Bar */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onNew} variant="outline" size="sm" className="gap-1"><FilePlus className="w-3.5 h-3.5" /> New</Button>
        <Button onClick={onSave} size="sm" className="gap-1 btn-3d bg-primary text-primary-foreground"><Save className="w-3.5 h-3.5" /> Save</Button>
        <Button onClick={onDuplicate} variant="outline" size="sm" className="gap-1"><Copy className="w-3.5 h-3.5" /> Duplicate</Button>
        <Button onClick={onExportPDF} variant="outline" size="sm" className="gap-1"><FileDown className="w-3.5 h-3.5" /> PDF</Button>
        <Button onClick={onExportPNG} variant="outline" size="sm" className="gap-1"><FileDown className="w-3.5 h-3.5" /> PNG</Button>
        <Button onClick={onPrint} variant="outline" size="sm" className="gap-1"><FileDown className="w-3.5 h-3.5" /> Print</Button>
        <Button onClick={onExportWord} variant="outline" size="sm" className="gap-1"><FileDown className="w-3.5 h-3.5" /> Word</Button>
        <Button onClick={onExportJSON} variant="outline" size="sm" className="gap-1"><FileDown className="w-3.5 h-3.5" /> JSON</Button>
        <Button onClick={() => onToggleDark(!darkMode)} variant="ghost" size="sm">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      {/* Company */}
      <Section title="Company / Seller">
        <Field label="Sold By" value={invoice.soldBy} onChange={v => onUpdate({ soldBy: v })} />
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Field label="Company Name" value={invoice.companyName} onChange={v => onUpdate({ companyName: v })} />
          </div>
          <div>
            <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()} className="gap-1">
              <Upload className="w-3.5 h-3.5" /> Logo
            </Button>
          </div>
        </div>
        {invoice.companyLogo && <img src={invoice.companyLogo} alt="Logo" className="h-12 object-contain" />}
        <Field label="Address" value={invoice.companyAddress} onChange={v => onUpdate({ companyAddress: v })} textarea />
        <div className="grid grid-cols-2 gap-2">
          <Field label="PAN Number" value={invoice.panNumber} onChange={v => onUpdate({ panNumber: v })} />
          <Field label="GST Number" value={invoice.gstNumber} onChange={v => onUpdate({ gstNumber: v })} />
        </div>
      </Section>

      {/* Billing */}
      <Section title="Billing Address">
        <Field label="Name" value={invoice.billingName} onChange={v => onUpdate({ billingName: v })} />
        <Field label="Address" value={invoice.billingAddress} onChange={v => onUpdate({ billingAddress: v })} textarea />
      </Section>

      {/* Shipping */}
      <Section title="Shipping Address">
        <Field label="Name" value={invoice.shippingName} onChange={v => onUpdate({ shippingName: v })} />
        <Field label="Address" value={invoice.shippingAddress} onChange={v => onUpdate({ shippingAddress: v })} textarea />
      </Section>

      {/* Order Info */}
      <Section title="Order & Invoice Details">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Order Number" value={invoice.orderNumber} onChange={v => onUpdate({ orderNumber: v })} />
          <Field label="Order Date" value={invoice.orderDate} onChange={v => onUpdate({ orderDate: v })} type="date" />
          <Field label="Invoice Number" value={invoice.invoiceNumber} onChange={v => onUpdate({ invoiceNumber: v })} />
          <Field label="Invoice Date" value={invoice.invoiceDate} onChange={v => onUpdate({ invoiceDate: v })} type="date" />
          <Field label="Place of Supply" value={invoice.placeOfSupply} onChange={v => onUpdate({ placeOfSupply: v })} />
          <Field label="State Code" value={invoice.stateCode} onChange={v => onUpdate({ stateCode: v })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Currency</Label>
          <Select value={invoice.currency} onValueChange={v => onUpdate({ currency: v })}>
            <SelectTrigger className="h-8 bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="₹">₹ INR</SelectItem>
              <SelectItem value="$">$ USD</SelectItem>
              <SelectItem value="€">€ EUR</SelectItem>
              <SelectItem value="£">£ GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      {/* Items */}
      <Section title="Products / Services">
        {invoice.items.map((item, idx) => (
          <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="border border-border/50 rounded-lg p-3 space-y-2 bg-secondary/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Item #{idx + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} disabled={invoice.items.length <= 1}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
            <Field label="Description" value={item.description} onChange={v => updateItem(item.id, { description: v })} textarea />
            <div className="grid grid-cols-3 gap-2">
              <Field label="HSN" value={item.hsn} onChange={v => updateItem(item.id, { hsn: v })} />
              <Field label="Qty" value={item.quantity} onChange={v => updateItem(item.id, { quantity: Number(v) || 0 })} type="number" />
              <Field label="Unit Price" value={item.unitPrice} onChange={v => updateItem(item.id, { unitPrice: Number(v) || 0 })} type="number" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Discount" value={item.discount} onChange={v => updateItem(item.id, { discount: Number(v) || 0 })} type="number" />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tax Type</Label>
                <Select value={item.taxType} onValueChange={v => updateItem(item.id, { taxType: v as InvoiceItem['taxType'] })}>
                  <SelectTrigger className="h-8 bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IGST">IGST</SelectItem>
                    <SelectItem value="CGST">CGST</SelectItem>
                    <SelectItem value="SGST">SGST</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Tax %" value={item.taxRate} onChange={v => updateItem(item.id, { taxRate: Number(v) || 0 })} type="number" />
            </div>
          </motion.div>
        ))}
        <Button onClick={addItem} variant="outline" size="sm" className="w-full gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Item
        </Button>
      </Section>

      {/* Shipping */}
      <Section title="Shipping & Extras">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Shipping Charges" value={invoice.shippingCharges} onChange={v => onUpdate({ shippingCharges: Number(v) || 0 })} type="number" />
          <Field label="Shipping Discount" value={invoice.shippingDiscount} onChange={v => onUpdate({ shippingDiscount: Number(v) || 0 })} type="number" />
        </div>
      </Section>

      {/* Footer */}
      <Section title="Footer & Signature">
        <Field label="Authorized Signatory Name" value={invoice.authorizedSignatory} onChange={v => onUpdate({ authorizedSignatory: v })} />
        <div>
          <input ref={sigRef} type="file" accept="image/*" onChange={handleSig} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => sigRef.current?.click()} className="gap-1">
            <Upload className="w-3.5 h-3.5" /> Upload Signature
          </Button>
          {invoice.signatureImage && <img src={invoice.signatureImage} alt="Signature" className="h-10 mt-2" />}
        </div>
        <Field label="Footer Note" value={invoice.footerNote} onChange={v => onUpdate({ footerNote: v })} textarea />
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={invoice.reverseCharge} onChange={e => onUpdate({ reverseCharge: e.target.checked })} className="rounded" />
          <Label className="text-xs">Tax payable under reverse charge</Label>
        </div>
      </Section>
    </div>
  );
}
