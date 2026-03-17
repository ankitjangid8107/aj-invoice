import { useState, useCallback, useEffect } from 'react';
import { InvoiceData, defaultInvoice } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useCloudInvoiceStore() {
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceData>({ ...defaultInvoice, id: crypto.randomUUID() });
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('invoicepro_dark') === 'true';
    return false;
  });

  // Load saved invoices from cloud (filter expired)
  const loadSavedInvoices = useCallback(async () => {
    if (!user) { setSavedInvoices([]); return; }
    const { data } = await supabase
      .from('saved_invoices')
      .select('*')
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (data) {
      setSavedInvoices(data.map((d: any) => d.invoice_data as InvoiceData));
    }
  }, [user]);

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
    const { data: existing } = await supabase
      .from('saved_invoices')
      .select('id')
      .eq('user_id', user.id)
      .eq('invoice_number', invoice.invoiceNumber)
      .maybeSingle();

    if (existing) {
      await supabase.from('saved_invoices').update({
        invoice_data: invoice as any,
        expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('saved_invoices').insert({
        user_id: user.id,
        invoice_data: invoice as any,
        invoice_number: invoice.invoiceNumber,
        expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    await loadSavedInvoices();
  }, [user, invoice, loadSavedInvoices]);

  const loadInvoice = useCallback((id: string) => {
    const found = savedInvoices.find(i => i.id === id);
    if (found) setInvoice(found);
  }, [savedInvoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    if (!user) return;
    const inv = savedInvoices.find(i => i.id === id);
    if (inv) {
      await supabase.from('saved_invoices').delete()
        .eq('user_id', user.id)
        .eq('invoice_number', inv.invoiceNumber);
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
    darkMode, setDarkMode,
  };
}
