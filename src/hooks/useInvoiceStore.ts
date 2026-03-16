import { useState, useCallback, useEffect } from 'react';
import { InvoiceData, defaultInvoice } from '@/types/invoice';

const STORAGE_KEY = 'invoicepro_invoices';
const CURRENT_KEY = 'invoicepro_current';

function loadInvoices(): InvoiceData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveInvoices(invoices: InvoiceData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

function loadCurrent(): InvoiceData {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : { ...defaultInvoice };
  } catch { return { ...defaultInvoice }; }
}

export function useInvoiceStore() {
  const [invoice, setInvoice] = useState<InvoiceData>(loadCurrent);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>(loadInvoices);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('invoicepro_dark') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(invoice));
  }, [invoice]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('invoicepro_dark', String(darkMode));
  }, [darkMode]);

  const updateInvoice = useCallback((updates: Partial<InvoiceData>) => {
    setInvoice(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
  }, []);

  const saveInvoice = useCallback(() => {
    setSavedInvoices(prev => {
      const exists = prev.findIndex(i => i.id === invoice.id);
      const next = exists >= 0 ? prev.map((i, idx) => idx === exists ? invoice : i) : [...prev, invoice];
      saveInvoices(next);
      return next;
    });
  }, [invoice]);

  const loadInvoice = useCallback((id: string) => {
    const found = savedInvoices.find(i => i.id === id);
    if (found) setInvoice(found);
  }, [savedInvoices]);

  const deleteInvoice = useCallback((id: string) => {
    setSavedInvoices(prev => {
      const next = prev.filter(i => i.id !== id);
      saveInvoices(next);
      return next;
    });
  }, []);

  const duplicateInvoice = useCallback(() => {
    const dup = {
      ...invoice,
      id: crypto.randomUUID(),
      invoiceNumber: `INV-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoice(dup);
  }, [invoice]);

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
