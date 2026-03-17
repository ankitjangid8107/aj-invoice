import { forwardRef } from 'react';
import { InvoiceData, calcItemNet, calcItemTax, calcItemTotal, calcSubtotal, calcTotalTax, calcGrandTotal, numberToWords } from '@/types/invoice';

interface Props {
  invoice: InvoiceData;
}

const InvoicePreview = forwardRef<HTMLDivElement, Props>(({ invoice }, ref) => {
  const c = invoice.currency;
  const fmt = (n: number) => n.toFixed(2);
  const grandTotal = calcGrandTotal(invoice.items, invoice.shippingCharges, invoice.shippingDiscount);
  const totalTax = calcTotalTax(invoice.items);
  const amountWords = invoice.amountInWords || numberToWords(grandTotal);

  return (
    <div ref={ref} className="invoice-preview w-full max-w-[210mm] mx-auto p-6 text-[11px] leading-tight" style={{ fontFamily: "'Inter', Arial, sans-serif", color: '#111' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-300 pb-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            {invoice.companyLogo && (
              <img src={invoice.companyLogo} alt="Logo" className="h-12 object-contain" />
            )}
            <div className="text-lg font-bold text-gray-800">{invoice.companyName}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold">Tax Invoice/Bill of Supply/Cash Memo</div>
          <div className="text-[10px] text-gray-500">(Original for Recipient)</div>
        </div>
      </div>

      {/* Seller & Billing */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="font-bold text-[10px] mb-1">Sold By :</div>
          {invoice.soldBy && <div className="text-[10px] mb-1">{invoice.soldBy}</div>}
          <div className="font-semibold">{invoice.companyName}</div>
          <div className="whitespace-pre-line text-[10px]">{invoice.companyAddress}</div>
          <div className="mt-2 text-[10px]">
            <div><strong>PAN No:</strong> {invoice.panNumber}</div>
            <div><strong>GST Registration No:</strong> {invoice.gstNumber}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-[10px] mb-1">Billing Address :</div>
          <div>{invoice.billingName}</div>
          <div className="whitespace-pre-line text-[10px]">{invoice.billingAddress}</div>
          <div className="mt-2 text-right text-[10px]">
            <div><strong>State/UT Code:</strong> {invoice.stateCode}</div>
          </div>
          <div className="mt-2">
            <div className="font-bold text-[10px] mb-1">Shipping Address :</div>
            <div>{invoice.shippingName}</div>
            <div className="whitespace-pre-line text-[10px]">{invoice.shippingAddress}</div>
            <div className="text-[10px]"><strong>State/UT Code:</strong> {invoice.stateCode}</div>
            <div className="text-[10px]"><strong>Place of supply:</strong> {invoice.placeOfSupply}</div>
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-2 gap-4 mb-3 border-t border-gray-200 pt-2">
        <div className="text-[10px]">
          <div><strong>Order Number:</strong> {invoice.orderNumber}</div>
          <div><strong>Order Date:</strong> {invoice.orderDate}</div>
        </div>
        <div className="text-right text-[10px]">
          <div><strong>Invoice Number:</strong> {invoice.invoiceNumber}</div>
          <div><strong>Invoice Date:</strong> {invoice.invoiceDate}</div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border border-gray-400 mb-3 text-[10px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-1 text-left">Sl. No</th>
            <th className="border border-gray-400 p-1 text-left">Description</th>
            <th className="border border-gray-400 p-1 text-right">Unit Price</th>
            <th className="border border-gray-400 p-1 text-right">Discount</th>
            <th className="border border-gray-400 p-1 text-center">Qty</th>
            <th className="border border-gray-400 p-1 text-right">Net Amount</th>
            <th className="border border-gray-400 p-1 text-center">Tax Rate</th>
            <th className="border border-gray-400 p-1 text-center">Tax Type</th>
            <th className="border border-gray-400 p-1 text-right">Tax Amount</th>
            <th className="border border-gray-400 p-1 text-right font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id}>
              <td className="border border-gray-400 p-1">{idx + 1}</td>
              <td className="border border-gray-400 p-1">{item.description}{item.hsn ? ` | HSN: ${item.hsn}` : ''}</td>
              <td className="border border-gray-400 p-1 text-right">{c}{fmt(item.unitPrice)}</td>
              <td className="border border-gray-400 p-1 text-right">{c}{fmt(item.discount)}</td>
              <td className="border border-gray-400 p-1 text-center">{item.quantity}</td>
              <td className="border border-gray-400 p-1 text-right">{c}{fmt(calcItemNet(item))}</td>
              <td className="border border-gray-400 p-1 text-center">{item.taxRate}%</td>
              <td className="border border-gray-400 p-1 text-center">{item.taxType}</td>
              <td className="border border-gray-400 p-1 text-right">{c}{fmt(calcItemTax(item))}</td>
              <td className="border border-gray-400 p-1 text-right font-bold">{c}{fmt(calcItemTotal(item))}</td>
            </tr>
          ))}
          {/* Shipping row */}
          {invoice.shippingCharges > 0 && (
            <tr>
              <td className="border border-gray-400 p-1"></td>
              <td className="border border-gray-400 p-1">Shipping Charges</td>
              <td className="border border-gray-400 p-1 text-right">{c}{fmt(invoice.shippingCharges)}</td>
              <td className="border border-gray-400 p-1 text-right">-{c}{fmt(invoice.shippingDiscount)}</td>
              <td className="border border-gray-400 p-1 text-center">-</td>
              <td className="border border-gray-400 p-1 text-right">{c}{fmt(invoice.shippingCharges - invoice.shippingDiscount)}</td>
              <td className="border border-gray-400 p-1 text-center">0%</td>
              <td className="border border-gray-400 p-1 text-center">-</td>
              <td className="border border-gray-400 p-1 text-right">{c}0.00</td>
              <td className="border border-gray-400 p-1 text-right font-bold">{c}{fmt(invoice.shippingCharges - invoice.shippingDiscount)}</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-50">
            <td colSpan={8} className="border border-gray-400 p-1 text-right">TOTAL:</td>
            <td className="border border-gray-400 p-1 text-right">{c}{fmt(totalTax)}</td>
            <td className="border border-gray-400 p-1 text-right">{c}{fmt(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Amount in words */}
      <div className="border border-gray-400 p-2 mb-3 bg-gray-50">
        <div className="text-[10px]"><strong>Amount in Words:</strong></div>
        <div className="font-bold text-[11px]">{amountWords}</div>
      </div>

      {/* Signature */}
      <div className="flex justify-between items-end mb-3">
        <div className="text-[10px]">
          Whether tax is payable under reverse charge - {invoice.reverseCharge ? 'Yes' : 'No'}
        </div>
        <div className="text-right">
          <div className="text-[10px] mb-1">For {invoice.companyName}:</div>
          {invoice.signatureImage && <img src={invoice.signatureImage} alt="Signature" className="h-10 ml-auto mb-1" />}
          <div className="font-bold text-[10px] border-t border-gray-400 pt-1">{invoice.authorizedSignatory}</div>
        </div>
      </div>

      {/* Footer */}
      {invoice.footerNote && (
        <div className="text-center text-[9px] text-gray-500 border-t border-gray-200 pt-2">
          {invoice.footerNote}
        </div>
      )}
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';
export default InvoicePreview;
