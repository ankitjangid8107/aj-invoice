export type PaymentApp = 'paytm' | 'phonepe' | 'googlepay';

export interface PaymentReceiptData {
  id: string;
  app: PaymentApp;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  // Sender
  senderName: string;
  senderUpiId: string;
  senderBank: string;
  senderBankLast4: string;
  senderAvatar: string;
  // Receiver
  receiverName: string;
  receiverUpiId: string;
  receiverIcon: string;
  // Transaction
  transactionId: string;
  upiRefNo: string;
  dateTime: string;
  category: string;
  note: string;
}

export const defaultPaymentReceipt: PaymentReceiptData = {
  id: crypto.randomUUID(),
  app: 'paytm',
  status: 'success',
  amount: 3190,
  currency: '₹',
  senderName: 'Your Name',
  senderUpiId: 'yourname@upi',
  senderBank: 'ICICI Bank',
  senderBankLast4: '4283',
  senderAvatar: '',
  receiverName: 'Receiver Name',
  receiverUpiId: 'receiver@upi',
  receiverIcon: '',
  transactionId: '5175292997',
  upiRefNo: `${Date.now().toString().slice(0, 12)}`,
  dateTime: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short', year: 'numeric' }),
  category: 'Miscellaneous',
  note: '',
};

export function numberToWordsINR(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };
  const intPart = Math.floor(num);
  return 'Rupees ' + convert(intPart) + ' Only';
}
