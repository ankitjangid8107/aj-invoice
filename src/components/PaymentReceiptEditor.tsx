import { PaymentReceiptData, PaymentApp } from '@/types/payment';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, FileImage } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, memo, useCallback } from 'react';

const Section = memo(({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-4 space-y-3">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">{title}</h3>
    {children}
  </motion.div>
));
Section.displayName = 'PaymentSection';

const Field = memo(({ label, value, onChange, type = 'text' }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string;
}) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Input type={type} value={value} onChange={e => onChange(e.target.value)} className="text-sm h-8 bg-secondary/50" />
  </div>
));
Field.displayName = 'PaymentField';

interface Props {
  receipt: PaymentReceiptData;
  onUpdate: (updates: Partial<PaymentReceiptData>) => void;
  onExportPNG: () => void;
  onExportJPG: () => void;
  onExportPDF: () => void;
}

export default function PaymentReceiptEditor({ receipt, onUpdate, onExportPNG, onExportPDF }: Props) {
  const senderAvatarRef = useRef<HTMLInputElement>(null);
  const receiverIconRef = useRef<HTMLInputElement>(null);

  const handleImage = useCallback((field: 'senderAvatar' | 'receiverIcon') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdate({ [field]: reader.result as string });
    reader.readAsDataURL(file);
  }, [onUpdate]);

  return (
    <div className="space-y-4 p-4 overflow-y-auto max-h-screen">
      {/* Export Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onExportPNG} variant="outline" size="sm" className="gap-1">
          <FileImage className="w-3.5 h-3.5" /> Export PNG
        </Button>
        <Button onClick={onExportPDF} variant="outline" size="sm" className="gap-1">
          <Download className="w-3.5 h-3.5" /> Export PDF
        </Button>
      </div>

      {/* App & Status */}
      <Section title="Payment App & Status">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Payment App</Label>
            <Select value={receipt.app} onValueChange={v => onUpdate({ app: v as PaymentApp })}>
              <SelectTrigger className="h-8 bg-secondary/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paytm">Paytm</SelectItem>
                <SelectItem value="phonepe">PhonePe</SelectItem>
                <SelectItem value="googlepay">Google Pay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={receipt.status} onValueChange={v => onUpdate({ status: v as PaymentReceiptData['status'] })}>
              <SelectTrigger className="h-8 bg-secondary/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Amount */}
      <Section title="Transaction Amount">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Amount" value={receipt.amount} onChange={v => onUpdate({ amount: Number(v) || 0 })} type="number" />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Currency</Label>
            <Select value={receipt.currency} onValueChange={v => onUpdate({ currency: v })}>
              <SelectTrigger className="h-8 bg-secondary/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="₹">₹ INR</SelectItem>
                <SelectItem value="$">$ USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Field label="Category" value={receipt.category} onChange={v => onUpdate({ category: v })} />
      </Section>

      {/* Transaction Details */}
      <Section title="Transaction Details">
        <Field label="Transaction ID" value={receipt.transactionId} onChange={v => onUpdate({ transactionId: v })} />
        <Field label="UPI Ref No" value={receipt.upiRefNo} onChange={v => onUpdate({ upiRefNo: v })} />
        <Field label="Date & Time" value={receipt.dateTime} onChange={v => onUpdate({ dateTime: v })} />
        <Field label="Note" value={receipt.note} onChange={v => onUpdate({ note: v })} />
      </Section>

      {/* Receiver */}
      <Section title="Receiver (To)">
        <Field label="Name" value={receipt.receiverName} onChange={v => onUpdate({ receiverName: v })} />
        <Field label="UPI ID" value={receipt.receiverUpiId} onChange={v => onUpdate({ receiverUpiId: v })} />
        <div>
          <input ref={receiverIconRef} type="file" accept="image/*" onChange={handleImage('receiverIcon')} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => receiverIconRef.current?.click()} className="gap-1">
            <Upload className="w-3.5 h-3.5" /> Receiver Icon
          </Button>
          {receipt.receiverIcon && <img src={receipt.receiverIcon} alt="Receiver" className="h-10 mt-2 rounded-full" />}
        </div>
      </Section>

      {/* Sender */}
      <Section title="Sender (From)">
        <Field label="Name" value={receipt.senderName} onChange={v => onUpdate({ senderName: v })} />
        <Field label="UPI ID" value={receipt.senderUpiId} onChange={v => onUpdate({ senderUpiId: v })} />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Bank Name" value={receipt.senderBank} onChange={v => onUpdate({ senderBank: v })} />
          <Field label="Last 4 Digits" value={receipt.senderBankLast4} onChange={v => onUpdate({ senderBankLast4: v })} />
        </div>
        <div>
          <input ref={senderAvatarRef} type="file" accept="image/*" onChange={handleImage('senderAvatar')} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => senderAvatarRef.current?.click()} className="gap-1">
            <Upload className="w-3.5 h-3.5" /> Sender Avatar
          </Button>
          {receipt.senderAvatar && <img src={receipt.senderAvatar} alt="Sender" className="h-10 mt-2 rounded-full" />}
        </div>
      </Section>
    </div>
  );
}
