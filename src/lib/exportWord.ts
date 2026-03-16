import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, BorderStyle, WidthType, ImageRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { InvoiceData, calcItemNet, calcItemTax, calcItemTotal, calcTotalTax, calcGrandTotal, numberToWords } from '@/types/invoice';

const border = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
};

function cell(text: string, opts?: { bold?: boolean; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; width?: number }) {
  return new TableCell({
    borders: border,
    width: opts?.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        alignment: opts?.alignment || AlignmentType.LEFT,
        children: [new TextRun({ text, bold: opts?.bold, size: 18, font: 'Arial' })],
      }),
    ],
  });
}

export async function exportToWord(invoice: InvoiceData) {
  const c = invoice.currency;
  const fmt = (n: number) => n.toFixed(2);
  const grandTotal = calcGrandTotal(invoice.items, invoice.shippingCharges, invoice.shippingDiscount);
  const totalTax = calcTotalTax(invoice.items);
  const amountWords = invoice.amountInWords || numberToWords(grandTotal);

  const headerRows = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: 'Tax Invoice / Bill of Supply / Cash Memo', bold: true, size: 28, font: 'Arial' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: '(Original for Recipient)', size: 16, font: 'Arial', italics: true, color: '666666' })],
    }),
  ];

  const sellerBillingTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: border,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Sold By:', bold: true, size: 18, font: 'Arial' })] }),
              new Paragraph({ children: [new TextRun({ text: invoice.companyName, bold: true, size: 20, font: 'Arial' })] }),
              new Paragraph({ children: [new TextRun({ text: invoice.companyAddress, size: 18, font: 'Arial' })] }),
              new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: `PAN No: ${invoice.panNumber}`, size: 18, font: 'Arial' })] }),
              new Paragraph({ children: [new TextRun({ text: `GST No: ${invoice.gstNumber}`, size: 18, font: 'Arial' })] }),
            ],
          }),
          new TableCell({
            borders: border,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Billing Address:', bold: true, size: 18, font: 'Arial' })] }),
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: invoice.billingName, size: 20, font: 'Arial' })] }),
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: invoice.billingAddress, size: 18, font: 'Arial' })] }),
              new Paragraph({ spacing: { before: 120 }, alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Shipping Address:', bold: true, size: 18, font: 'Arial' })] }),
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: invoice.shippingName, size: 20, font: 'Arial' })] }),
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: invoice.shippingAddress, size: 18, font: 'Arial' })] }),
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Place of Supply: ${invoice.placeOfSupply}`, size: 18, font: 'Arial' })] }),
            ],
          }),
        ],
      }),
    ],
  });

  const orderInfoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: border,
            children: [
              new Paragraph({ children: [new TextRun({ text: `Order Number: ${invoice.orderNumber}`, size: 18, font: 'Arial' })] }),
              new Paragraph({ children: [new TextRun({ text: `Order Date: ${invoice.orderDate}`, size: 18, font: 'Arial' })] }),
            ],
          }),
          new TableCell({
            borders: border,
            children: [
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Invoice Number: ${invoice.invoiceNumber}`, size: 18, font: 'Arial' })] }),
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Invoice Date: ${invoice.invoiceDate}`, size: 18, font: 'Arial' })] }),
            ],
          }),
        ],
      }),
    ],
  });

  // Items table
  const headerRow = new TableRow({
    children: [
      cell('Sl.', { bold: true, width: 5 }),
      cell('Description', { bold: true, width: 25 }),
      cell('Unit Price', { bold: true, alignment: AlignmentType.RIGHT, width: 12 }),
      cell('Qty', { bold: true, alignment: AlignmentType.CENTER, width: 8 }),
      cell('Discount', { bold: true, alignment: AlignmentType.RIGHT, width: 10 }),
      cell('Net Amt', { bold: true, alignment: AlignmentType.RIGHT, width: 12 }),
      cell('Tax', { bold: true, alignment: AlignmentType.CENTER, width: 10 }),
      cell('Tax Amt', { bold: true, alignment: AlignmentType.RIGHT, width: 10 }),
      cell('Total', { bold: true, alignment: AlignmentType.RIGHT, width: 12 }),
    ],
  });

  const itemRows = invoice.items.map((item, idx) =>
    new TableRow({
      children: [
        cell(`${idx + 1}`),
        cell(`${item.description}${item.hsn ? ` (HSN: ${item.hsn})` : ''}`),
        cell(`${c}${fmt(item.unitPrice)}`, { alignment: AlignmentType.RIGHT }),
        cell(`${item.quantity}`, { alignment: AlignmentType.CENTER }),
        cell(`${c}${fmt(item.discount)}`, { alignment: AlignmentType.RIGHT }),
        cell(`${c}${fmt(calcItemNet(item))}`, { alignment: AlignmentType.RIGHT }),
        cell(`${item.taxRate}% ${item.taxType}`, { alignment: AlignmentType.CENTER }),
        cell(`${c}${fmt(calcItemTax(item))}`, { alignment: AlignmentType.RIGHT }),
        cell(`${c}${fmt(calcItemTotal(item))}`, { bold: true, alignment: AlignmentType.RIGHT }),
      ],
    })
  );

  const totalRow = new TableRow({
    children: [
      new TableCell({ borders: border, columnSpan: 7, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'TOTAL:', bold: true, size: 20, font: 'Arial' })] })] }),
      cell(`${c}${fmt(totalTax)}`, { bold: true, alignment: AlignmentType.RIGHT }),
      cell(`${c}${fmt(grandTotal)}`, { bold: true, alignment: AlignmentType.RIGHT }),
    ],
  });

  const itemsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...itemRows, totalRow],
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        ...headerRows,
        sellerBillingTable,
        new Paragraph({ spacing: { before: 200, after: 200 } }),
        orderInfoTable,
        new Paragraph({ spacing: { before: 200, after: 200 } }),
        itemsTable,
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: 'Amount in Words: ', bold: true, size: 20, font: 'Arial' }),
            new TextRun({ text: amountWords, size: 20, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({ text: `Tax payable under reverse charge: ${invoice.reverseCharge ? 'Yes' : 'No'}`, size: 18, font: 'Arial' }),
          ],
        }),
        new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `For ${invoice.companyName}:`, size: 18, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.RIGHT, children: [new TextRun({ text: invoice.authorizedSignatory, bold: true, size: 20, font: 'Arial' })] }),
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Authorized Signatory', size: 16, font: 'Arial', italics: true })] }),
        ...(invoice.footerNote ? [new Paragraph({
          spacing: { before: 300 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: invoice.footerNote, size: 16, font: 'Arial', color: '888888', italics: true })],
        })] : []),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${invoice.invoiceNumber}.docx`);
}
