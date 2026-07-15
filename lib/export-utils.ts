import Papa from 'papaparse';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toJpeg } from "html-to-image";
import { toast } from "sonner";
import { Purchase } from '@/components/dashboard/dashboard-ui';

export function exportToCSV(purchases: Purchase[], filename = 'ownly_purchases.csv') {
  if (!purchases || purchases.length === 0) {
    console.warn("No data to export");
    return;
  }

  const data = purchases.map(p => ({
    Item: p.item_name || 'N/A',
    Store: p.store || 'Unknown',
    Price: p.price ? p.price.toString() : '0',
    WarrantyMonths: p.warranty_months ? p.warranty_months.toString() : '0',
    Date: p.purchase_date || p.created_at,
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(purchases: Purchase[], filename = 'ownly_purchases.pdf') {
  if (!purchases || purchases.length === 0) {
    console.warn("No data to export");
    return;
  }

  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Ownly Purchases Report', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 14, 30);

  const tableColumn = ["Item", "Store", "Price (INR)", "Date"];
  const tableRows = purchases.map(p => [
    p.item_name || 'N/A',
    p.store || 'Unknown',
    p.price ? p.price.toLocaleString() : '0',
    new Date(p.purchase_date || p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  ]);

  autoTable(doc, {
    startY: 35,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(filename);
}

export async function exportVisualToPDF(elementId: string, filename = 'ownly_visual_report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn("Could not find the content to export");
    return;
  }

  // Add a slight delay or handle loading states if needed
  try {
    const dataUrl = await toJpeg(element, { 
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: 2, // High resolution
      filter: (node) => {
        // Exclude elements with data-html2canvas-ignore (we'll reuse the same attribute name for convenience)
        if (node instanceof HTMLElement && node.dataset.html2canvasIgnore === 'true') {
          return false;
        }
        return true;
      }
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [img.width, img.height]
    });

    pdf.addImage(dataUrl, 'JPEG', 0, 0, img.width, img.height);
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating visual PDF:", error);
    toast.error("Failed to generate visual report.");
  }
}

export async function exportReceiptsWithImagesToPDF(purchases: Purchase[], filename = 'ownly_receipts_with_images.pdf') {
  if (!purchases || purchases.length === 0) {
    console.warn("No data to export");
    return;
  }

  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Ownly Receipts Export', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 14, 30);
  
  let yOffset = 45;

  for (let i = 0; i < purchases.length; i++) {
    const p = purchases[i];
    
    if (i > 0) {
      doc.addPage();
      yOffset = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Item: ${p.item_name || 'N/A'}`, 14, yOffset);
    yOffset += 7;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Store: ${p.store || 'Unknown'}  |  Date: ${new Date(p.purchase_date || p.created_at).toLocaleDateString()}  |  Price: INR ${p.price?.toLocaleString() || '0'}`, 14, yOffset);
    yOffset += 15;

    if (p.receipt_url && p.signed_url) {
      const isPdf = p.receipt_url.toLowerCase().endsWith(".pdf");
      
      if (isPdf) {
        doc.setTextColor(41, 128, 185);
        doc.textWithLink('View Original PDF Document', 14, yOffset, { url: p.signed_url });
        doc.setTextColor(100);
        yOffset += 20;
      } else {
        try {
          const response = await fetch(p.signed_url);
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          
          const img = new Image();
          img.src = objectUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            
            const maxWidth = 180;
            const maxHeight = 120;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const xOffset = (pageWidth - width) / 2;
            
            doc.addImage(dataUrl, 'JPEG', xOffset, yOffset, width, height);
            yOffset += height + 15;
          }
          URL.revokeObjectURL(objectUrl);
        } catch (err) {
          console.error("Failed to fetch/embed image for", p.item_name, err);
          doc.setTextColor(255, 0, 0);
          doc.text('Image could not be loaded.', 14, yOffset);
          doc.setTextColor(100);
          yOffset += 15;
        }
      }
    } else {
      doc.text('No receipt image available.', 14, yOffset);
      yOffset += 15;
    }
    
    yOffset += 5;
  }

  doc.save(filename);
}
