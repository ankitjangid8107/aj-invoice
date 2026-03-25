import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Mobile-friendly file download using blob URLs + anchor click.
 * Falls back to window.open for iOS Safari if needed.
 */
function downloadBlob(blob: Blob, filename: string) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  if (isIOS) {
    // iOS Safari doesn't support download attribute — open in new tab
    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, '_blank');
    if (!newTab) {
      // Popup blocked — fallback to same-window navigation
      window.location.href = url;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

export async function exportPNG(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  const blob = dataURLtoBlob(canvas.toDataURL('image/png'));
  downloadBlob(blob, filename.endsWith('.png') ? filename : `${filename}.png`);
}

export async function exportJPG(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  const blob = dataURLtoBlob(canvas.toDataURL('image/jpeg', 0.95));
  downloadBlob(blob, filename.endsWith('.jpg') ? filename : `${filename}.jpg`);
}

export async function exportPDF(element: HTMLElement, filename: string, options?: { orientation?: 'p' | 'l'; pageWidth?: number }): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  const imgData = canvas.toDataURL('image/png');
  const orientation = options?.orientation || 'p';
  const pageW = options?.pageWidth || (orientation === 'p' ? 210 : 297);
  const imgH = (canvas.height * pageW) / canvas.width;
  
  const pdf = new jsPDF(orientation, 'mm', orientation === 'p' ? 'a4' : [pageW, imgH]);
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = (canvas.height * pdfW) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
  
  // Use blob for mobile compatibility
  const pdfBlob = pdf.output('blob');
  downloadBlob(pdfBlob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

export async function exportReceiptPDF(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  const imgData = canvas.toDataURL('image/png');
  const w = 100;
  const h = (canvas.height * w) / canvas.width;
  const pdf = new jsPDF('p', 'mm', [w, h]);
  pdf.addImage(imgData, 'PNG', 0, 0, w, h);
  const pdfBlob = pdf.output('blob');
  downloadBlob(pdfBlob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
