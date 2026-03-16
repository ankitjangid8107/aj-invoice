import { forwardRef } from 'react';
import { PaymentReceiptData, numberToWordsINR } from '@/types/payment';
import { CheckCircle2, XCircle, Clock, Copy, ChevronDown } from 'lucide-react';

interface Props {
  receipt: PaymentReceiptData;
}

const appColors = {
  paytm: { bg: '#ffffff', accent: '#00BAF2', text: '#1a1a1a', headerBg: '#ffffff' },
  phonepe: { bg: '#ffffff', accent: '#5f259f', text: '#1a1a1a', headerBg: '#5f259f' },
  googlepay: { bg: '#ffffff', accent: '#1a73e8', text: '#1a1a1a', headerBg: '#ffffff' },
};

const PaymentReceiptPreview = forwardRef<HTMLDivElement, Props>(({ receipt }, ref) => {
  const colors = appColors[receipt.app];
  const amountFormatted = receipt.amount.toLocaleString('en-IN');
  const amountWords = numberToWordsINR(receipt.amount);
  const statusIcon = receipt.status === 'success'
    ? <CheckCircle2 className="w-8 h-8" style={{ color: '#00C853' }} />
    : receipt.status === 'failed'
    ? <XCircle className="w-8 h-8 text-red-500" />
    : <Clock className="w-8 h-8 text-yellow-500" />;
  const statusText = receipt.status === 'success' ? 'Paid Successfully' : receipt.status === 'failed' ? 'Payment Failed' : 'Payment Pending';

  return (
    <div ref={ref} className="w-full max-w-[400px] mx-auto bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">←</span>
          <span className="font-bold text-base">{statusText}</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium" style={{ color: colors.accent }}>
          <span>Share</span>
          <span>Help</span>
        </div>
      </div>

      {/* Amount Card */}
      <div className="m-4 p-5 rounded-xl border border-gray-200">
        <div className="text-sm font-medium text-gray-500 mb-1">Amount</div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-3xl font-extrabold text-gray-900">{receipt.currency}{amountFormatted}</span>
          {receipt.status === 'success' && (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 0C6.268 0 0 6.268 0 14s6.268 14 14 14 14-6.268 14-14S21.732 0 14 0z" fill="#00C853"/>
              <path d="M11 14l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-4">{amountWords}</div>

        {/* Transaction ID */}
        <div className="flex items-center gap-2 mb-4">
          <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2">
            {receipt.transactionId}
            <Copy className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center gap-3 mb-3">
          <div className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1.5">
            <span className="text-base">📦</span> {receipt.category}
          </div>
          <span className="text-sm font-medium" style={{ color: colors.accent }}>Edit</span>
        </div>

        {/* Split */}
        <div className="px-3 py-1.5 border rounded-lg text-sm font-medium inline-block" style={{ borderColor: colors.accent, color: colors.accent }}>
          Split this Payment
        </div>
      </div>

      {/* Separator */}
      <div className="mx-4 border-t border-gray-200"></div>

      {/* To Section */}
      <div className="px-5 py-4">
        <div className="text-xs font-bold text-gray-500 mb-1">To</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-gray-900">{receipt.receiverName}</div>
            <div className="text-xs text-gray-500 mt-0.5">UPI ID:</div>
            <div className="text-xs text-gray-600">{receipt.receiverUpiId}</div>
          </div>
          {receipt.receiverIcon ? (
            <img src={receipt.receiverIcon} alt="Receiver" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl">🏦</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="px-3 py-1.5 border rounded-lg text-sm font-medium inline-block" style={{ borderColor: colors.accent, color: colors.accent }}>
            View History
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-4 border-t border-gray-200"></div>

      {/* From Section */}
      <div className="px-5 py-4">
        <div className="text-xs font-bold text-gray-500 mb-1">From</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-gray-900">{receipt.senderName}</div>
            <div className="text-xs text-gray-500">UPI ID: {receipt.senderUpiId}</div>
            <div className="text-xs text-gray-500">{receipt.senderBank} - {receipt.senderBankLast4} 🔰</div>
          </div>
          {receipt.senderAvatar ? (
            <img src={receipt.senderAvatar} alt="Sender" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details */}
      <div className="px-5 pb-2">
        <div className="text-xs text-gray-500">Paid at {receipt.dateTime}</div>
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          UPI Ref No: {receipt.upiRefNo}
          <span className="text-xs font-medium ml-2" style={{ color: colors.accent }}>Copy</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100 mt-3">
        {receipt.app === 'paytm' && (
          <>
            <span className="text-sm font-bold" style={{ color: '#00BAF2' }}>Pay<span className="text-gray-700">tm</span></span>
            <span className="text-gray-300">|</span>
            <span className="text-[10px] text-gray-400">Powered by</span>
            <span className="text-xs font-bold text-blue-700">UPI</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-blue-600">YES BANK</span>
          </>
        )}
        {receipt.app === 'phonepe' && (
          <>
            <span className="text-sm font-bold" style={{ color: '#5f259f' }}>PhonePe</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-blue-700">UPI</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-green-600">YES BANK</span>
          </>
        )}
        {receipt.app === 'googlepay' && (
          <>
            <span className="text-sm font-bold text-gray-700">Google Pay</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-blue-700">UPI</span>
          </>
        )}
      </div>
    </div>
  );
});

PaymentReceiptPreview.displayName = 'PaymentReceiptPreview';
export default PaymentReceiptPreview;
