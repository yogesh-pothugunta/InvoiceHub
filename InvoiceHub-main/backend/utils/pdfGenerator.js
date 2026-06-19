const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const generateInvoicePDF = async (invoice, user) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const company = user.company || {};
  const bank = user.bankDetails || {};
  const sym = (invoice.currency || '₹ INR').split(' ')[0];
  const fmt = (n) => `${sym}${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Header background
  doc.setFillColor(24, 95, 165);
  doc.rect(0, 0, 210, 40, 'F');

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name || 'Your Company', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (company.address) doc.text(company.address, 14, 23);
  if (company.phone) doc.text(company.phone, 14, 28);
  if (company.gst) doc.text(`GST: ${company.gst}`, 14, 33);

  // Invoice title right side
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 196, 16, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${invoice.invoiceNumber}`, 196, 24, { align: 'right' });
  doc.text(`Issue: ${fmtDate(invoice.issueDate)}`, 196, 30, { align: 'right' });
  doc.text(`Due: ${fmtDate(invoice.dueDate)}`, 196, 36, { align: 'right' });

  // Status badge
  const statusColors = { paid: [59, 109, 17], sent: [24, 95, 165], overdue: [163, 45, 45], draft: [95, 94, 90], cancelled: [150, 150, 150] };
  const sc = statusColors[invoice.status] || statusColors.draft;
  doc.setFillColor(...sc);
  doc.roundedRect(14, 44, 30, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.status.toUpperCase(), 29, 49, { align: 'center' });

  // Bill To / From
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO', 14, 62);
  doc.text('FROM', 110, 62);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.clientSnapshot.name, 14, 69);
  doc.text(company.name || user.name, 110, 69);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  let y = 75;
  if (invoice.clientSnapshot.company) { doc.text(invoice.clientSnapshot.company, 14, y); y += 5; }
  if (invoice.clientSnapshot.address) { doc.text(invoice.clientSnapshot.address, 14, y); y += 5; }
  doc.text(invoice.clientSnapshot.email, 14, y); y += 5;
  if (invoice.clientSnapshot.phone) doc.text(invoice.clientSnapshot.phone, 14, y);
  if (invoice.clientSnapshot.gst) doc.text(`GST: ${invoice.clientSnapshot.gst}`, 14, y + 5);

  doc.text(user.email, 110, 75);
  if (company.phone) doc.text(company.phone, 110, 80);

  // Items table
  const tableRows = invoice.items.map((item, i) => [
    i + 1,
    item.description,
    item.quantity,
    fmt(item.rate),
    fmt(item.amount)
  ]);

  doc.autoTable({
    startY: 105,
    head: [['#', 'Description', 'Qty', 'Rate', 'Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [24, 95, 165], textColor: 255, fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 90 }, 2: { cellWidth: 20, halign: 'center' }, 3: { cellWidth: 35, halign: 'right' }, 4: { cellWidth: 35, halign: 'right' } },
    margin: { left: 14, right: 14 }
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 8;
  const totalsX = 130;

  doc.setFillColor(248, 250, 252);
  doc.rect(totalsX, finalY - 4, 66, 30, 'F');

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX + 4, finalY + 3);
  doc.text(fmt(invoice.subtotal), 194, finalY + 3, { align: 'right' });

  doc.text(`Tax (${invoice.taxRate}%):`, totalsX + 4, finalY + 10);
  doc.text(fmt(invoice.taxAmount), 194, finalY + 10, { align: 'right' });

  if (invoice.discount > 0) {
    doc.text('Discount:', totalsX + 4, finalY + 17);
    doc.text(`-${fmt(invoice.discount)}`, 194, finalY + 17, { align: 'right' });
  }

  doc.setDrawColor(24, 95, 165);
  doc.line(totalsX + 4, finalY + 19, 194, finalY + 19);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 95, 165);
  doc.text('Total Due:', totalsX + 4, finalY + 26);
  doc.text(fmt(invoice.total), 194, finalY + 26, { align: 'right' });

  // Bank Details & Notes
  const notesY = finalY + 38;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  if (bank.bankName) {
    doc.text('PAYMENT DETAILS', 14, notesY);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Bank: ${bank.bankName}`, 14, notesY + 6);
    doc.text(`A/C: ${bank.accountNumber}`, 14, notesY + 12);
    doc.text(`IFSC: ${bank.ifsc}`, 14, notesY + 18);
    if (bank.upiId) doc.text(`UPI: ${bank.upiId}`, 14, notesY + 24);
  }

  if (invoice.notes) {
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES', 110, notesY);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(invoice.notes, 80);
    doc.text(noteLines, 110, notesY + 6);
  }

  // Footer
  doc.setFillColor(24, 95, 165);
  doc.rect(0, 282, 210, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Thank you for your business! | ${company.name || 'InvoiceHub'} | ${user.email}`, 105, 291, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
};

module.exports = { generateInvoicePDF };
