export interface InvoiceItem {
  id: string;
  description: string;
  hsn: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxType: 'IGST' | 'CGST' | 'SGST' | 'None';
  taxRate: number;
}

export interface InvoiceData {
  id: string;
  // Company / Seller
  soldBy: string;
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  panNumber: string;
  gstNumber: string;
  // Billing
  billingName: string;
  billingAddress: string;
  // Shipping
  shippingName: string;
  shippingAddress: string;
  // Order info
  orderNumber: string;
  orderDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  placeOfSupply: string;
  stateCode: string;
  // Items
  items: InvoiceItem[];
  // Shipping
  shippingCharges: number;
  shippingDiscount: number;
  // Footer
  amountInWords: string;
  authorizedSignatory: string;
  signatureImage: string;
  footerNote: string;
  reverseCharge: boolean;
  // Settings
  currency: string;
  template: 'amazon' | 'minimal' | 'corporate';
  createdAt: string;
  updatedAt: string;
}

export const defaultInvoice: InvoiceData = {
  id: crypto.randomUUID(),
  companyName: 'Your Company Name',
  companyLogo: '',
  companyAddress: 'Your Company Address\nCity, State, PIN',
  panNumber: 'XXXXX0000X',
  gstNumber: 'Not Applicable',
  billingName: 'Customer Name',
  billingAddress: 'Customer Billing Address\nCity, State, PIN',
  shippingName: 'Customer Name',
  shippingAddress: 'Customer Shipping Address\nCity, State, PIN',
  orderNumber: `ORD-${Date.now().toString().slice(-10)}`,
  orderDate: new Date().toISOString().split('T')[0],
  invoiceNumber: `INV-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
  invoiceDate: new Date().toISOString().split('T')[0],
  placeOfSupply: 'Your State',
  stateCode: '00',
  items: [
    {
      id: crypto.randomUUID(),
      description: 'Product / Service Description',
      hsn: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxType: 'IGST',
      taxRate: 0,
    },
  ],
  shippingCharges: 0,
  shippingDiscount: 0,
  amountInWords: '',
  authorizedSignatory: 'Authorized Signatory',
  signatureImage: '',
  footerNote: 'Please note that this invoice is not a demand for payment',
  reverseCharge: false,
  currency: '₹',
  template: 'amazon',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function calcItemNet(item: InvoiceItem): number {
  const gross = item.quantity * item.unitPrice;
  return gross - item.discount;
}

export function calcItemTax(item: InvoiceItem): number {
  return calcItemNet(item) * (item.taxRate / 100);
}

export function calcItemTotal(item: InvoiceItem): number {
  return calcItemNet(item) + calcItemTax(item);
}

export function calcSubtotal(items: InvoiceItem[]): number {
  return items.reduce((s, i) => s + calcItemNet(i), 0);
}

export function calcTotalTax(items: InvoiceItem[]): number {
  return items.reduce((s, i) => s + calcItemTax(i), 0);
}

export function calcGrandTotal(items: InvoiceItem[], shippingCharges: number, shippingDiscount: number): number {
  return calcSubtotal(items) + calcTotalTax(items) + shippingCharges - shippingDiscount;
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let result = convert(intPart);
  if (decPart > 0) result += ' and ' + convert(decPart) + ' Paise';
  return result + ' Only';
}
