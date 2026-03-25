import { useState, useRef, useCallback, useEffect } from 'react';
import { BookingCancelledData, defaultBookingCancelled } from '@/types/bookingCancelled';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, FileDown, FilePlus, Trash2, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { exportPDF, exportPNG } from '@/lib/exportUtils';
import { Navigate } from 'react-router-dom';
import AppNavbar from '@/components/AppNavbar';

/* ── tiny helpers ───────────────────────────────────── */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-4 space-y-3">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">{title}</h3>
    {children}
  </motion.div>
);

const Field = ({ label, value, onChange, type = 'text' }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string;
}) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Input type={type} value={value} onChange={e => onChange(e.target.value)}
      className="text-sm h-8 bg-secondary/50"
      inputMode={type === 'number' ? 'decimal' : undefined}
      enterKeyHint="next"
      onFocus={e => { setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); }}
    />
  </div>
);

/* ── Preview (pixel-perfect Paytm style) ───────────── */
const BookingCancelledPreview = ({ data, previewRef }: { data: BookingCancelledData; previewRef: React.RefObject<HTMLDivElement> }) => (
  <div ref={previewRef} className="bg-white text-gray-900 max-w-[420px] mx-auto" style={{ fontFamily: "'Inter', -apple-system, Arial, sans-serif", fontSize: '14px' }}>
    {/* Pink header */}
    <div style={{ background: '#FEE2E2', padding: '24px 20px 18px' }}>
      <div style={{ fontSize: '9px', color: '#666', marginBottom: 4 }}>←</div>
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111', margin: '0 0 6px' }}>{data.headerTitle}</h1>
      <p style={{ fontSize: '13px', color: '#444', margin: 0 }}>{data.headerNote}</p>
    </div>

    <div style={{ padding: '16px 16px 24px' }}>
      {/* Travel card */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
        {/* Operator row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18 }}>🚌</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.operatorName}</p>
            <p style={{ fontSize: 11, color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.busDetails}</p>
          </div>
        </div>

        {/* Route */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '14px 0' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{data.fromCity}</p>
            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{data.departureTime}, {data.departureDate}</p>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0' }}>—— {data.duration} ——</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{data.toCity}</p>
            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{data.arrivalTime}, {data.arrivalDate}</p>
          </div>
        </div>
      </div>

      {/* Passenger card */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
        {/* dashed top */}
        <div style={{ borderTop: '2px dashed #D1D5DB', margin: '-16px -16px 12px', borderRadius: '12px 12px 0 0' }} />
        <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 8px' }}>Passenger Details</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 14, margin: 0 }}>{data.passengerName}</p>
          <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6 }}>{data.status}</span>
        </div>

        {/* dashed */}
        <div style={{ borderTop: '2px dashed #D1D5DB', margin: '0 -16px', padding: '0 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>Order ID:</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{data.orderId}</span>
            <span style={{ fontSize: 14, color: '#999' }}>📋</span>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#666' }}>Ticket no: </span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{data.ticketNo}</span>
          </div>
        </div>

        {/* dashed */}
        <div style={{ borderTop: '2px dashed #D1D5DB', margin: '0 -16px', padding: '0 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0' }}>
          <span style={{ fontSize: 18 }}>🚌</span>
          <span style={{ fontSize: 13, color: '#666' }}>Bus Number: </span>
          <span style={{ fontWeight: 800, fontSize: 16 }}>{data.busNumber}</span>
        </div>

        {/* dashed */}
        <div style={{ borderTop: '2px dashed #D1D5DB', margin: '0 -16px', padding: '0 16px' }} />
        <p style={{ fontSize: 12, color: '#666', textAlign: 'center', padding: '10px 0 0', margin: 0 }}>Booked on: {data.bookedOn}</p>
      </div>

      {/* Refund Summary card */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 16px', marginBottom: 12 }}>
        <h3 style={{ fontWeight: 800, fontSize: 18, margin: '0 0 16px' }}>Refund Summary</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{data.totalAmountLabel} ({data.travellerCount} Traveller)</p>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{data.currency}{data.totalAmount}</p>
            <p style={{ fontSize: 12, color: '#0D9488', margin: 0, cursor: 'pointer' }}>View Details</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Refundable Amount</p>
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{data.currency}{data.refundableAmount}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Refund Processed</p>
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{data.currency}{data.refundProcessed}</p>
        </div>

        <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '10px', textAlign: 'center', marginTop: 8 }}>
          <p style={{ fontSize: 12, color: '#444', margin: 0 }}>Ticket booked on: {data.ticketBookedOn}</p>
        </div>
      </div>
    </div>
  </div>
);

/* ── Main Page ─────────────────────────────────────── */
export default function BookingCancelledEditor() {
  const { user, loading } = useAuth();
  const [data, setData] = useState<BookingCancelledData>({ ...defaultBookingCancelled });
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [savedList, setSavedList] = useState<{ id: string; data: BookingCancelledData }[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const update = useCallback((u: Partial<BookingCancelledData>) => setData(p => ({ ...p, ...u, updatedAt: new Date().toISOString() })), []);

  // Load saved list
  const loadSaved = useCallback(async () => {
    if (!user) return;
    const { data: rows } = await supabase.from('saved_tickets')
      .select('*').eq('user_id', user.id).eq('ticket_type', 'booking_cancelled')
      .order('created_at', { ascending: false });
    if (rows) setSavedList(rows.map((r: any) => ({ id: r.id, data: r.ticket_data as BookingCancelledData })));
  }, [user]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  // Save to cloud
  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Check admin for expiry
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
      const isAdmin = roleData && roleData.length > 0;
      
      // Get save days setting
      const { data: settingData } = await supabase.from('site_settings').select('value').eq('key', 'invoice_save_days').maybeSingle();
      const saveDays = settingData ? Number(settingData.value) || 20 : 20;
      
      const expiresAt = isAdmin
        ? new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + saveDays * 24 * 60 * 60 * 1000).toISOString();

      // Upsert by order ID
      const { data: existing } = await supabase.from('saved_tickets')
        .select('id').eq('user_id', user.id).eq('ticket_type', 'booking_cancelled')
        .eq('ticket_data->>orderId', data.orderId).maybeSingle();

      if (existing) {
        await supabase.from('saved_tickets').update({
          ticket_data: data as any, expires_at: expiresAt,
        }).eq('id', existing.id);
      } else {
        await supabase.from('saved_tickets').insert({
          user_id: user.id, ticket_type: 'booking_cancelled',
          ticket_data: data as any, expires_at: expiresAt,
        });
      }
      await loadSaved();
      toast.success('Saved to cloud!');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  }, [user, data, loadSaved]);

  const handleDelete = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('saved_tickets').delete().eq('id', id).eq('user_id', user.id);
    await loadSaved();
    toast.success('Deleted');
  }, [user, loadSaved]);

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    toast.info('Generating PDF...');
    try { await exportPDF(previewRef.current, `booking-cancelled-${data.orderId || 'new'}.pdf`); toast.success('PDF exported!'); }
    catch { toast.error('Export failed'); }
  };
  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    toast.info('Generating PNG...');
    try { await exportPNG(previewRef.current, `booking-cancelled-${data.orderId || 'new'}.png`); toast.success('PNG exported!'); }
    catch { toast.error('Export failed'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <AppNavbar />
      {/* Sub-header */}
      <div className="sticky top-14 z-40 border-b border-border/30 bg-background/60 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-10">
          <div className="flex items-center gap-1.5">
            <Button onClick={handleSave} size="sm" disabled={saving} className="h-7 text-xs bg-primary text-primary-foreground">
              <Save className="w-3 h-3 mr-1" /> {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={() => setShowSaved(s => !s)} variant="outline" size="sm" className="h-7 text-xs">
              <List className="w-3 h-3 mr-1" /> Saved
            </Button>
            <Button onClick={() => setData({ ...defaultBookingCancelled, id: crypto.randomUUID() })} variant="outline" size="sm" className="hidden sm:flex h-7 text-xs"><FilePlus className="w-3 h-3 mr-1" /> New</Button>
            <Button onClick={handleExportPDF} variant="outline" size="sm" className="h-7 text-xs"><FileDown className="w-3 h-3 mr-1" /> PDF</Button>
            <Button onClick={handleExportPNG} variant="outline" size="sm" className="h-7 text-xs"><FileDown className="w-3 h-3 mr-1" /> PNG</Button>
          </div>
          <Button variant="outline" size="sm" className="lg:hidden h-7 text-xs" onClick={() => setMobileView(v => v === 'edit' ? 'preview' : 'edit')}>
            {mobileView === 'edit' ? 'Preview' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Saved List Drawer */}
      {showSaved && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowSaved(false)}>
          <div className="absolute left-0 top-14 bottom-0 w-80 bg-card border-r border-border shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-foreground">Saved Cancelled Tickets</h3>
              {savedList.length === 0 && <p className="text-sm text-muted-foreground">No saved tickets yet</p>}
              {savedList.map(item => (
                <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
                  <p className="text-sm font-semibold text-foreground truncate">{item.data.fromCity} → {item.data.toCity}</p>
                  <p className="text-xs text-muted-foreground">Order: {item.data.orderId} | {item.data.passengerName}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setData(item.data); setShowSaved(false); toast.info('Loaded'); }}>Load</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Editor */}
        <div className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-border/50 bg-card/30 overflow-y-auto ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}
          style={{ height: 'calc(100vh - 96px)' }}>
          <div className="space-y-4 p-4">
            <Section title="Header">
              <Field label="Title" value={data.headerTitle} onChange={v => update({ headerTitle: v })} />
              <Field label="Note" value={data.headerNote} onChange={v => update({ headerNote: v })} />
            </Section>

            <Section title="Operator & Bus">
              <Field label="Operator Name" value={data.operatorName} onChange={v => update({ operatorName: v })} />
              <Field label="Bus Details (type/class)" value={data.busDetails} onChange={v => update({ busDetails: v })} />
              <Field label="Bus Number" value={data.busNumber} onChange={v => update({ busNumber: v })} />
            </Section>

            <Section title="Journey">
              <div className="grid grid-cols-2 gap-2">
                <Field label="From City" value={data.fromCity} onChange={v => update({ fromCity: v })} />
                <Field label="To City" value={data.toCity} onChange={v => update({ toCity: v })} />
                <Field label="Departure Time" value={data.departureTime} onChange={v => update({ departureTime: v })} />
                <Field label="Departure Date" value={data.departureDate} onChange={v => update({ departureDate: v })} />
                <Field label="Arrival Time" value={data.arrivalTime} onChange={v => update({ arrivalTime: v })} />
                <Field label="Arrival Date" value={data.arrivalDate} onChange={v => update({ arrivalDate: v })} />
                <Field label="Duration" value={data.duration} onChange={v => update({ duration: v })} />
              </div>
            </Section>

            <Section title="Passenger & IDs">
              <Field label="Passenger Name" value={data.passengerName} onChange={v => update({ passengerName: v })} />
              <Field label="Status (Refunded/Cancelled)" value={data.status} onChange={v => update({ status: v })} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Order ID" value={data.orderId} onChange={v => update({ orderId: v })} />
                <Field label="Ticket No" value={data.ticketNo} onChange={v => update({ ticketNo: v })} />
              </div>
              <Field label="Booked On" value={data.bookedOn} onChange={v => update({ bookedOn: v })} />
            </Section>

            <Section title="Refund Summary">
              <Field label="Total Amount Label" value={data.totalAmountLabel} onChange={v => update({ totalAmountLabel: v })} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Total Amount" value={data.totalAmount} onChange={v => update({ totalAmount: v })} />
                <Field label="Traveller Count" value={data.travellerCount} onChange={v => update({ travellerCount: Number(v) || 1 })} type="number" />
                <Field label="Refundable Amount" value={data.refundableAmount} onChange={v => update({ refundableAmount: v })} />
                <Field label="Refund Processed" value={data.refundProcessed} onChange={v => update({ refundProcessed: v })} />
              </div>
              <Field label="Ticket Booked On" value={data.ticketBookedOn} onChange={v => update({ ticketBookedOn: v })} />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Currency</Label>
                <select value={data.currency} onChange={e => update({ currency: e.target.value })}
                  className="w-full h-8 text-sm rounded-md border border-input bg-secondary/50 px-2">
                  <option value="₹">₹ INR</option>
                  <option value="$">$ USD</option>
                  <option value="€">€ EUR</option>
                </select>
              </div>
            </Section>
          </div>
        </div>

        {/* Preview */}
        <div className={`flex-1 overflow-y-auto bg-muted/30 ${mobileView === 'edit' ? 'hidden lg:block' : ''}`}
          style={{ height: 'calc(100vh - 56px)' }}>
          <div className="p-4 lg:p-8 flex justify-center">
            <div className="shadow-2xl rounded-lg overflow-hidden">
              <BookingCancelledPreview data={data} previewRef={previewRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
