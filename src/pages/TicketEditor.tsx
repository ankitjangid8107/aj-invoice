import { useState, useRef, useCallback, useEffect } from 'react';
import { TicketData, TravellerDetail, CancellationPolicy, defaultTicket } from '@/types/ticket';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, FileDown, FilePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { exportPDF, exportPNG } from '@/lib/exportUtils';
import { Navigate } from 'react-router-dom';
import AppNavbar from '@/components/AppNavbar';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-4 space-y-3">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">{title}</h3>
    {children}
  </motion.div>
);

const Field = ({ label, value, onChange, textarea, type = 'text' }: {
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
);

const TicketPreview = ({ ticket, previewRef }: { ticket: TicketData; previewRef: React.RefObject<HTMLDivElement> }) => (
  <div ref={previewRef} className="bg-white text-gray-900 p-6 max-w-[700px] mx-auto" style={{ fontFamily: "'Inter', Arial, sans-serif", fontSize: '13px' }}>
    {/* Header */}
    <div className="text-center border-b-2 border-blue-600 pb-3 mb-4">
      <h2 className="text-lg font-bold text-blue-700">🎫 e-Ticket / Booking Confirmation</h2>
      <p className="text-xs text-gray-500 mt-1">Operator Contact: {ticket.operatorContact} {ticket.operatorPhone2 && `| ${ticket.operatorPhone2}`}</p>
    </div>

    {/* PNR / Ticket / Order */}
    <table className="w-full border border-gray-300 mb-4 text-xs">
      <thead><tr className="bg-blue-50">
        <th className="border border-gray-300 px-3 py-2 text-left">PNR</th>
        <th className="border border-gray-300 px-3 py-2 text-left">Ticket ID</th>
        <th className="border border-gray-300 px-3 py-2 text-left">Order ID</th>
      </tr></thead>
      <tbody><tr>
        <td className="border border-gray-300 px-3 py-2 font-bold">{ticket.pnr}</td>
        <td className="border border-gray-300 px-3 py-2 font-mono text-[11px]">{ticket.ticketId}</td>
        <td className="border border-gray-300 px-3 py-2">{ticket.orderId}</td>
      </tr></tbody>
    </table>

    {/* Departure / Arrival */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
        <p className="text-xs text-green-700 font-semibold uppercase">Departure</p>
        <p className="text-base font-bold text-green-900">{ticket.departureCity}</p>
        <p className="text-xs text-gray-600">{ticket.departureTime}, {ticket.departureDate}</p>
      </div>
      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
        <p className="text-xs text-red-700 font-semibold uppercase">Arrival</p>
        <p className="text-base font-bold text-red-900">{ticket.arrivalCity}</p>
        <p className="text-xs text-gray-600">{ticket.arrivalTime}, {ticket.arrivalDate}</p>
      </div>
    </div>

    {/* Operator & Vehicle */}
    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
      <div>
        <p className="font-semibold text-gray-700">Bus Operator</p>
        <p className="font-bold">{ticket.busOperatorName}</p>
      </div>
      <div>
        <p className="font-semibold text-gray-700">Driver & Vehicle</p>
        <p>Contact: {ticket.driverContact}{ticket.driverContact2 && `, ${ticket.driverContact2}`}</p>
        <p>Vehicle: {ticket.vehicleNumber}</p>
      </div>
    </div>

    {/* Boarding / Dropping */}
    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
      <div className="border-l-4 border-blue-500 pl-3">
        <p className="font-semibold text-blue-700">Boarding Point</p>
        <p className="font-bold">{ticket.boardingPoint}</p>
        <p className="text-gray-500">{ticket.boardingAddress}</p>
      </div>
      <div className="border-l-4 border-orange-500 pl-3">
        <p className="font-semibold text-orange-700">Dropping Point</p>
        <p className="font-bold">{ticket.droppingPoint}</p>
        <p className="text-gray-500">{ticket.droppingAddress}</p>
      </div>
    </div>

    {/* Reporting / Boarding Time / Bus Type */}
    <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
      <div><p className="font-semibold text-gray-600">Reporting Time</p><p className="font-bold">{ticket.reportingTime}</p></div>
      <div><p className="font-semibold text-gray-600">Boarding Time</p><p className="font-bold">{ticket.boardingTime}</p></div>
      <div><p className="font-semibold text-gray-600">Bus Type</p><p className="font-bold">{ticket.busType}, {ticket.busClass}</p></div>
    </div>

    {/* Travellers */}
    <div className="mb-4">
      <p className="font-semibold text-gray-700 mb-2 text-xs uppercase">Traveller Details</p>
      <table className="w-full border border-gray-300 text-xs">
        <thead><tr className="bg-gray-50">
          <th className="border border-gray-300 px-2 py-1 text-left">#</th>
          <th className="border border-gray-300 px-2 py-1 text-left">Name</th>
          <th className="border border-gray-300 px-2 py-1 text-left">Gender</th>
          <th className="border border-gray-300 px-2 py-1 text-left">Age</th>
          <th className="border border-gray-300 px-2 py-1 text-left">Seat</th>
        </tr></thead>
        <tbody>
          {ticket.travellers.map((t, i) => (
            <tr key={t.id}>
              <td className="border border-gray-300 px-2 py-1">{i + 1}</td>
              <td className="border border-gray-300 px-2 py-1 font-bold">{t.name}</td>
              <td className="border border-gray-300 px-2 py-1">{t.gender}</td>
              <td className="border border-gray-300 px-2 py-1">{t.age}</td>
              <td className="border border-gray-300 px-2 py-1 font-bold">{t.seatNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Fare */}
    <div className="mb-4">
      <p className="font-semibold text-gray-700 mb-2 text-xs uppercase">Fare & Payment Details</p>
      <table className="w-full text-xs">
        <tbody>
          <tr><td className="py-1">Base Fare ({ticket.travellerCount} Traveller):</td><td className="text-right font-bold">{ticket.currency} {ticket.baseFare.toFixed(2)}</td></tr>
          <tr><td className="py-1">Operator GST:</td><td className="text-right">{ticket.currency} {ticket.operatorGST.toFixed(2)}</td></tr>
          <tr><td className="py-1">Travel Insurance:</td><td className="text-right">{ticket.currency} {ticket.travelInsurance.toFixed(2)}</td></tr>
          <tr><td className="py-1">Service Charge:</td><td className="text-right">{ticket.currency} {ticket.serviceCharge.toFixed(2)}</td></tr>
          <tr className="border-t-2 border-gray-800"><td className="py-2 font-bold text-sm">Total Amount Paid:</td><td className="text-right font-bold text-sm text-green-700">{ticket.currency} {ticket.totalAmount.toFixed(2)}</td></tr>
        </tbody>
      </table>
    </div>

    {/* Cancellation */}
    {ticket.cancellationPolicies.length > 0 && (
      <div className="mb-4">
        <p className="font-semibold text-gray-700 mb-2 text-xs uppercase">Cancellation Policy</p>
        <p className="text-[11px] text-gray-500 mb-1">Service start time: {ticket.serviceStartTime}</p>
        <table className="w-full border border-gray-300 text-xs">
          <thead><tr className="bg-gray-50">
            <th className="border border-gray-300 px-2 py-1 text-left">Time of Cancellation</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Refund %</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Refund Amount</th>
          </tr></thead>
          <tbody>
            {ticket.cancellationPolicies.map(p => (
              <tr key={p.id}>
                <td className="border border-gray-300 px-2 py-1">{p.timeRange}</td>
                <td className="border border-gray-300 px-2 py-1">{p.refundPercentage}</td>
                <td className="border border-gray-300 px-2 py-1">{p.refundAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Footer */}
    <div className="border-t border-gray-300 pt-3 text-[11px] text-gray-500 text-center">
      <p>{ticket.footerNote}</p>
    </div>
  </div>
);

export default function TicketEditorPage() {
  const { user, loading } = useAuth();
  const [ticket, setTicket] = useState<TicketData>({ ...defaultTicket });
  const [savedTickets, setSavedTickets] = useState<TicketData[]>([]);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const previewRef = useRef<HTMLDivElement>(null);

  const update = useCallback((u: Partial<TicketData>) => setTicket(p => ({ ...p, ...u, updatedAt: new Date().toISOString() })), []);

  // Load saved tickets
  useEffect(() => {
    if (!user) return;
    supabase.from('saved_tickets').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSavedTickets(data.map((d: any) => d.ticket_data as TicketData));
      });
  }, [user]);

  const saveTicket = async () => {
    if (!user) return;
    await supabase.from('saved_tickets').insert({
      user_id: user.id,
      ticket_data: ticket as any,
      ticket_type: 'bus',
    });
    toast.success('Ticket saved!');
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    toast.info('Generating PDF...');
    try { await exportPDF(previewRef.current, `ticket-${ticket.pnr || 'new'}.pdf`); toast.success('PDF exported!'); }
    catch { toast.error('Failed'); }
  };

  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    toast.info('Generating PNG...');
    try { await exportPNG(previewRef.current, `ticket-${ticket.pnr || 'new'}.png`); toast.success('PNG exported!'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const addTraveller = () => {
    const t: TravellerDetail = { id: crypto.randomUUID(), name: '', gender: 'Male', age: 25, seatNo: '' };
    update({ travellers: [...ticket.travellers, t] });
  };
  const removeTraveller = (id: string) => {
    if (ticket.travellers.length <= 1) return;
    update({ travellers: ticket.travellers.filter(t => t.id !== id) });
  };
  const updateTraveller = (id: string, u: Partial<TravellerDetail>) => {
    update({ travellers: ticket.travellers.map(t => t.id === id ? { ...t, ...u } : t) });
  };
  const addPolicy = () => {
    const p: CancellationPolicy = { id: crypto.randomUUID(), timeRange: '', refundPercentage: '', refundAmount: '' };
    update({ cancellationPolicies: [...ticket.cancellationPolicies, p] });
  };
  const removePolicy = (id: string) => update({ cancellationPolicies: ticket.cancellationPolicies.filter(p => p.id !== id) });
  const updatePolicy = (id: string, u: Partial<CancellationPolicy>) => {
    update({ cancellationPolicies: ticket.cancellationPolicies.map(p => p.id === id ? { ...p, ...u } : p) });
  };

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <AppNavbar />
      {/* Sub-header */}
      <div className="sticky top-14 z-40 border-b border-border/30 bg-background/60 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-10">
          <div className="flex items-center gap-1.5">
            <Button onClick={() => setTicket({ ...defaultTicket, id: crypto.randomUUID() })} variant="outline" size="sm" className="h-7 text-xs"><FilePlus className="w-3 h-3 mr-1" /> New</Button>
            <Button onClick={saveTicket} size="sm" className="h-7 text-xs bg-primary text-primary-foreground"><Save className="w-3 h-3 mr-1" /> Save</Button>
            <Button onClick={handleExportPDF} variant="outline" size="sm" className="h-7 text-xs"><FileDown className="w-3 h-3 mr-1" /> PDF</Button>
            <Button onClick={handleExportPNG} variant="outline" size="sm" className="h-7 text-xs"><FileDown className="w-3 h-3 mr-1" /> PNG</Button>
          </div>
          <Button variant="outline" size="sm" className="lg:hidden h-7 text-xs" onClick={() => setMobileView(v => v === 'edit' ? 'preview' : 'edit')}>
            {mobileView === 'edit' ? 'Preview' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Editor */}
        <div className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-border/50 bg-card/30 overflow-y-auto ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}
          style={{ height: 'calc(100vh - 96px)' }}>
          <div className="space-y-4 p-4">
            <Section title="Contact & IDs">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Operator Contact" value={ticket.operatorContact} onChange={v => update({ operatorContact: v })} />
                <Field label="Alt. Phone" value={ticket.operatorPhone2} onChange={v => update({ operatorPhone2: v })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field label="PNR" value={ticket.pnr} onChange={v => update({ pnr: v })} />
                <Field label="Ticket ID" value={ticket.ticketId} onChange={v => update({ ticketId: v })} />
                <Field label="Order ID" value={ticket.orderId} onChange={v => update({ orderId: v })} />
              </div>
            </Section>

            <Section title="Journey Details">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Departure City" value={ticket.departureCity} onChange={v => update({ departureCity: v })} />
                <Field label="Arrival City" value={ticket.arrivalCity} onChange={v => update({ arrivalCity: v })} />
                <Field label="Departure Time" value={ticket.departureTime} onChange={v => update({ departureTime: v })} />
                <Field label="Departure Date" value={ticket.departureDate} onChange={v => update({ departureDate: v })} type="date" />
                <Field label="Arrival Time" value={ticket.arrivalTime} onChange={v => update({ arrivalTime: v })} />
                <Field label="Arrival Date" value={ticket.arrivalDate} onChange={v => update({ arrivalDate: v })} type="date" />
              </div>
            </Section>

            <Section title="Bus Operator & Vehicle">
              <Field label="Operator Name" value={ticket.busOperatorName} onChange={v => update({ busOperatorName: v })} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Driver Contact" value={ticket.driverContact} onChange={v => update({ driverContact: v })} />
                <Field label="Alt. Driver Contact" value={ticket.driverContact2} onChange={v => update({ driverContact2: v })} />
              </div>
              <Field label="Vehicle Number" value={ticket.vehicleNumber} onChange={v => update({ vehicleNumber: v })} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Bus Type" value={ticket.busType} onChange={v => update({ busType: v })} />
                <Field label="Bus Class" value={ticket.busClass} onChange={v => update({ busClass: v })} />
              </div>
            </Section>

            <Section title="Boarding & Dropping">
              <Field label="Boarding Point" value={ticket.boardingPoint} onChange={v => update({ boardingPoint: v })} />
              <Field label="Boarding Address" value={ticket.boardingAddress} onChange={v => update({ boardingAddress: v })} textarea />
              <Field label="Dropping Point" value={ticket.droppingPoint} onChange={v => update({ droppingPoint: v })} />
              <Field label="Dropping Address" value={ticket.droppingAddress} onChange={v => update({ droppingAddress: v })} textarea />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Reporting Time" value={ticket.reportingTime} onChange={v => update({ reportingTime: v })} />
                <Field label="Boarding Time" value={ticket.boardingTime} onChange={v => update({ boardingTime: v })} />
              </div>
            </Section>

            <Section title="Travellers">
              {ticket.travellers.map((t, i) => (
                <div key={t.id} className="border border-border/50 rounded-lg p-3 space-y-2 bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Traveller #{i + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeTraveller(t.id)} disabled={ticket.travellers.length <= 1}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                  <Field label="Name" value={t.name} onChange={v => updateTraveller(t.id, { name: v })} />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Gender</Label>
                      <Select value={t.gender} onValueChange={v => updateTraveller(t.id, { gender: v as any })}>
                        <SelectTrigger className="h-8 bg-secondary/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Field label="Age" value={t.age} onChange={v => updateTraveller(t.id, { age: Number(v) || 0 })} type="number" />
                    <Field label="Seat No" value={t.seatNo} onChange={v => updateTraveller(t.id, { seatNo: v })} />
                  </div>
                </div>
              ))}
              <Button onClick={addTraveller} variant="outline" size="sm" className="w-full gap-1"><Plus className="w-3.5 h-3.5" /> Add Traveller</Button>
            </Section>

            <Section title="Fare & Payment">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Base Fare" value={ticket.baseFare} onChange={v => update({ baseFare: Number(v) || 0 })} type="number" />
                <Field label="Traveller Count" value={ticket.travellerCount} onChange={v => update({ travellerCount: Number(v) || 1 })} type="number" />
                <Field label="Operator GST" value={ticket.operatorGST} onChange={v => update({ operatorGST: Number(v) || 0 })} type="number" />
                <Field label="Travel Insurance" value={ticket.travelInsurance} onChange={v => update({ travelInsurance: Number(v) || 0 })} type="number" />
                <Field label="Service Charge" value={ticket.serviceCharge} onChange={v => update({ serviceCharge: Number(v) || 0 })} type="number" />
                <Field label="Total Amount" value={ticket.totalAmount} onChange={v => update({ totalAmount: Number(v) || 0 })} type="number" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Currency</Label>
                <Select value={ticket.currency} onValueChange={v => update({ currency: v })}>
                  <SelectTrigger className="h-8 bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="₹">₹ INR</SelectItem>
                    <SelectItem value="$">$ USD</SelectItem>
                    <SelectItem value="€">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Section>

            <Section title="Cancellation Policy">
              <Field label="Service Start Time" value={ticket.serviceStartTime} onChange={v => update({ serviceStartTime: v })} />
              {ticket.cancellationPolicies.map((p, i) => (
                <div key={p.id} className="border border-border/50 rounded-lg p-3 space-y-2 bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Policy #{i + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removePolicy(p.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                  <Field label="Time Range" value={p.timeRange} onChange={v => updatePolicy(p.id, { timeRange: v })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Refund %" value={p.refundPercentage} onChange={v => updatePolicy(p.id, { refundPercentage: v })} />
                    <Field label="Refund Amount" value={p.refundAmount} onChange={v => updatePolicy(p.id, { refundAmount: v })} />
                  </div>
                </div>
              ))}
              <Button onClick={addPolicy} variant="outline" size="sm" className="w-full gap-1"><Plus className="w-3.5 h-3.5" /> Add Policy</Button>
            </Section>

            <Section title="Footer">
              <Field label="Footer Note" value={ticket.footerNote} onChange={v => update({ footerNote: v })} textarea />
            </Section>
          </div>
        </div>

        {/* Preview */}
        <div className={`flex-1 overflow-y-auto bg-muted/30 ${mobileView === 'edit' ? 'hidden lg:block' : ''}`}
          style={{ height: 'calc(100vh - 56px)' }}>
          <div className="p-4 lg:p-8 flex justify-center">
            <div className="shadow-2xl rounded-lg overflow-hidden">
              <TicketPreview ticket={ticket} previewRef={previewRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
