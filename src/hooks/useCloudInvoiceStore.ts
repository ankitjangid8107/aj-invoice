import { useState, useCallback, useEffect } from 'react';
import { InvoiceData, defaultInvoice } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useCloudInvoiceStore() {
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceData>({ ...defaultInvoice, id: crypto.randomUUID() });
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saveDays, setSaveDays] = useState(20);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('invoicepro_dark') === 'true';
    return false;
  });

  // Check admin status and get save days setting
  useEffect(() => {
    if (!user) return;
    supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin')
      .then(({ data }) => setIsAdmin(data && data.length > 0 ? true : false));
    supabase.from('site_settings').select('value').eq('key', 'invoice_save_days').maybeSingle()
      .then(({ data }) => { if (data) setSaveDays(Number(data.value) || 20); });
  }, [user]);

  // Load saved invoices from cloud
  const loadSavedInvoices = useCallback(async () => {
    if (!user) { setSavedInvoices([]); return; }
    let query = supabase.from('saved_invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    // Non-admin: filter expired
    if (!isAdmin) {
      query = query.gte('expires_at', new Date().toISOString());
    }
    const { data } = await query;
    if (data) {
      setSavedInvoices(data.map((d: any) => d.invoice_data as InvoiceData));
    }
  }, [user, isAdmin]);

  useEffect(() => { loadSavedInvoices(); }, [loadSavedInvoices]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('invoicepro_dark', String(darkMode));
  }, [darkMode]);

  const updateInvoice = useCallback((updates: Partial<InvoiceData>) => {
    setInvoice(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
  }, []);

  const saveInvoice = useCallback(async () => {
    if (!user) return;
    // Admin: no expiry (far future), Normal users: saveDays
    const expiresAt = isAdmin
      ? new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toISOString() // 10 years = permanent
      : new Date(Date.now() + saveDays * 24 * 60 * 60 * 1000).toISOString();

    const { data: existing } = await supabase
      .from('saved_invoices').select('id')
      .eq('user_id', user.id).eq('invoice_number', invoice.invoiceNumber).maybeSingle();

    if (existing) {
      await supabase.from('saved_invoices').update({
        invoice_data: invoice as any,
        expires_at: expiresAt,
      }).eq('id', existing.id);
    } else {
      await supabase.from('saved_invoices').insert({
        user_id: user.id,
        invoice_data: invoice as any,
        invoice_number: invoice.invoiceNumber,
        expires_at: expiresAt,
      });
    }
    await loadSavedInvoices();
  }, [user, invoice, loadSavedInvoices, isAdmin, saveDays]);

  const loadInvoice = useCallback((id: string) => {
    const found = savedInvoices.find(i => i.id === id);
    if (found) setInvoice(found);
  }, [savedInvoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    if (!user) return;
    const inv = savedInvoices.find(i => i.id === id);
    if (inv) {
      await supabase.from('saved_invoices').delete()
        .eq('user_id', user.id).eq('invoice_number', inv.invoiceNumber);
      await loadSavedInvoices();
    }
  }, [user, savedInvoices, loadSavedInvoices]);

  const duplicateInvoice = useCallback(() => {
    setInvoice(prev => ({
      ...prev,
      id: crypto.randomUUID(),
      invoiceNumber: `INV-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const newInvoice = useCallback(() => {
    setInvoice({ ...defaultInvoice, id: crypto.randomUUID() });
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [invoice]);

  return {
    invoice, updateInvoice, saveInvoice, loadInvoice, deleteInvoice,
    duplicateInvoice, newInvoice, exportJSON, savedInvoices,
    darkMode, setDarkMode, isAdmin, saveDays,
  };
}
