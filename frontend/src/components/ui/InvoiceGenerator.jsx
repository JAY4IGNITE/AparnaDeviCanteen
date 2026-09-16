import jsPDF from 'jspdf';

/**
 * Generates and downloads a professional, colorful half-A4 restaurant invoice PDF.
 * Half A4 = A5 portrait (148mm × 210mm)
 */

const QUOTES = [
  '"People who love to eat are always the best people." — Julia Child',
  '"One cannot think well, love well, sleep well, if one has not dined well." — Virginia Woolf',
  '"Good food is the foundation of genuine happiness." — Auguste Escoffier',
  '"There is no sincere love than the love of food." — George Bernard Shaw',
  '"Cooking is love made visible." — Unknown',
  '"Food is symbolic of love when words are inadequate." — Alan D. Wolfelt',
];

const generateInvoice = async (order, user) => {
  const pw = 148; // page width in mm (A5)
  const ph = 210; // page height in mm (A5)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pw, ph] });

  const margin = 8;
  const cw = pw - margin * 2; // content width
  let y = 0;

  // ── Brand colors ──
  const orange = [249, 115, 22];
  const orangeLight = [255, 237, 220];
  const dark = [30, 30, 30];
  const mid = [80, 80, 80];
  const muted = [130, 130, 130];
  const white = [255, 255, 255];
  const green = [22, 163, 74];

  // ══════════════════════════════════════════════
  // HEADER — Gradient banner with logo + name
  // ══════════════════════════════════════════════
  const headerH = 46;

  // Draw gradient header background (simulate with multiple rects)
  for (let i = 0; i < headerH; i++) {
    const ratio = i / headerH;
    const r = Math.round(249 - ratio * 40);
    const g = Math.round(115 - ratio * 30);
    const b = Math.round(22 + ratio * 10);
    doc.setFillColor(r, g, b);
    doc.rect(0, i, pw, 1, 'F');
  }

  // Load and draw logo
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      logoImg.onload = resolve;
      logoImg.onerror = reject;
      logoImg.src = '/canteen-logo.png';
    });
    const logoS = 16;
    const logoY = 3;
    const circleR = logoS / 2 + 1;

    // White circle behind logo
    doc.setFillColor(...white);
    doc.circle(pw / 2, logoY + logoS / 2, circleR, 'F');

    // Clip the logo into a circle using an offscreen canvas
    const canvasSize = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    // Draw circular clipping path
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Draw the logo image centered preserving aspect ratio
    const scale = Math.min((canvasSize * 0.85) / (logoImg.width || 1), (canvasSize * 0.85) / (logoImg.height || 1));
    const drawW = (logoImg.width || canvasSize) * scale;
    const drawH = (logoImg.height || canvasSize) * scale;
    const drawX = (canvasSize - drawW) / 2;
    const drawY = (canvasSize - drawH) / 2;
    ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);

    // Use the clipped circular image in the PDF
    const circularLogoData = canvas.toDataURL('image/png');
    const circleDiameter = circleR * 2;
    doc.addImage(
      circularLogoData, 'PNG',
      pw / 2 - circleR, logoY + logoS / 2 - circleR,
      circleDiameter, circleDiameter
    );
    y = logoY + logoS + 4; // position text below logo with 4mm gap
  } catch {
    y = 14; // fallback if logo fails to load
  }

  // Canteen name
  doc.setTextColor(...white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const canteenName = 'AparnaCanteen';
  const nameW = doc.getTextWidth(canteenName);
  doc.text(canteenName, (pw - nameW) / 2, y);
  y += 6;

  // Subtitle
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  const sub = 'Delicious Campus Dining';
  doc.text(sub, (pw - doc.getTextWidth(sub)) / 2, y);
  y += 3;

  // Thin decorative line under header
  doc.setDrawColor(...orangeLight);
  doc.setLineWidth(0.5);
  doc.line(margin, headerH + 1, pw - margin, headerH + 1);

  y = headerH + 5;

  // ══════════════════════════════════════════════
  // ORDER NUMBER BADGE — colorful accent
  // ══════════════════════════════════════════════
  const orderNumStr = `#${order.order_number}`;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const badgeTextW = doc.getTextWidth(orderNumStr);
  const badgeW = badgeTextW + 10;
  const badgeX = (pw - badgeW) / 2;

  // Badge background
  doc.setFillColor(...orange);
  doc.roundedRect(badgeX, y - 4, badgeW, 8, 2, 2, 'F');
  doc.setTextColor(...white);
  doc.text(orderNumStr, (pw - badgeTextW) / 2, y + 1.5);
  y += 8;

  // Order ID (UUID short) + Date
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  const orderDate = new Date(order.created_at);
  const dateStr = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const orderIdShort = `Order ID: ${order.id.substring(0, 8).toUpperCase()}`;
  doc.text(orderIdShort, margin, y);
  const dtStr = `${dateStr}  •  ${timeStr}`;
  doc.text(dtStr, pw - margin - doc.getTextWidth(dtStr), y);
  y += 3;

  // Payment method
  if (order.payment_method) {
    const pmLabel = order.payment_method === 'COD' ? 'Cash On Delivery (COD)' : order.payment_method;
    const pmStr = `Payment: ${pmLabel}`;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...green);
    doc.text(pmStr, margin, y);
  }
  y += 5;

  // ══════════════════════════════════════════════
  // CUSTOMER DETAILS SECTION
  // ══════════════════════════════════════════════
  // Section divider
  doc.setDrawColor(...orange);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pw - margin, y);
  y += 4;

  // Section label
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...orange);
  doc.text('CUSTOMER DETAILS', margin, y);
  y += 5;

  // Customer info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...dark);

  const customerName = user?.name || 'Customer';
  const customerPhone = user?.phone || 'N/A';
  const customerBlock = user?.hostelBlock || 'N/A';

  // Row 1: Name
  doc.setFont('helvetica', 'bold');
  doc.text('Name:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(customerName, margin + 18, y);

  // Phone on the right
  doc.setFont('helvetica', 'bold');
  const phoneLabel = 'Phone:';
  const phoneLabelX = pw / 2 + 5;
  doc.text(phoneLabel, phoneLabelX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(customerPhone, phoneLabelX + 16, y);
  y += 5;

  // Row 2: Block
  doc.setFont('helvetica', 'bold');
  doc.text('Block:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(customerBlock, margin + 18, y);
  y += 5;

  // ══════════════════════════════════════════════
  // ITEMS TABLE
  // ══════════════════════════════════════════════
  // Section divider
  doc.setDrawColor(...orange);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pw - margin, y);
  y += 4;

  // Section label
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...orange);
  doc.text('ORDER ITEMS', margin, y);
  y += 5;

  // Table header background
  doc.setFillColor(...orangeLight);
  doc.roundedRect(margin, y - 3, cw, 7, 1, 1, 'F');

  // Column positions
  const cols = {
    sno: margin + 2,
    item: margin + 10,
    qty: margin + 75,
    rate: margin + 90,
    amount: margin + 108
  };

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('S.No', cols.sno, y + 1);
  doc.text('Item', cols.item, y + 1);
  doc.text('Qty', cols.qty, y + 1);
  doc.text('Rate', cols.rate, y + 1);
  doc.text('Amount', cols.amount, y + 1);
  y += 7;

  // Items rows
  const items = order.order_items || [];
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...dark);

  items.forEach((item, idx) => {
    const itemTotal = (Number(item.price) * Number(item.quantity)).toFixed(2);

    // Alternate row background
    if (idx % 2 === 0) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, y - 3, cw, 6, 'F');
    }

    doc.setFontSize(7);
    doc.setTextColor(...dark);
    doc.text(`${idx + 1}`, cols.sno + 2, y);

    // Truncate long names
    let itemName = item.item_name || 'Item';
    doc.setFontSize(7);
    const maxNameW = 60;
    while (doc.getTextWidth(itemName) > maxNameW && itemName.length > 3) {
      itemName = itemName.slice(0, -1);
    }
    if (itemName !== item.item_name) itemName += '..';
    doc.text(itemName, cols.item, y);

    doc.text(`${item.quantity}`, cols.qty + 3, y);
    doc.text(`${Number(item.price).toFixed(2)}`, cols.rate, y);

    doc.setFont('helvetica', 'bold');
    doc.text(`${itemTotal}`, cols.amount, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
  });

  // Bottom line of table
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y - 2, pw - margin, y - 2);
  y += 2;

  // ══════════════════════════════════════════════
  // TOTAL SECTION
  // ══════════════════════════════════════════════
  // Total row background
  doc.setFillColor(...orange);
  doc.roundedRect(margin, y - 1, cw, 10, 1.5, 1.5, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...white);
  doc.text('TOTAL', margin + 4, y + 5.5);

  const totalStr = `Rs. ${Number(order.total_amount).toFixed(2)}`;
  const totalW = doc.getTextWidth(totalStr);
  doc.text(totalStr, pw - margin - 4 - totalW, y + 5.5);
  y += 14;

  // Item count
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  const itemCountStr = `Total Items: ${items.length}  |  Total Qty: ${items.reduce((s, i) => s + Number(i.quantity), 0)}`;
  doc.text(itemCountStr, (pw - doc.getTextWidth(itemCountStr)) / 2, y);
  y += 6;

  // ══════════════════════════════════════════════
  // STATUS
  // ══════════════════════════════════════════════
  const statusColors = {
    'Pending': [234, 160, 28],
    'Preparing': [50, 130, 220],
    'Completed': [22, 163, 74],
    'Cancelled': [220, 53, 69]
  };
  const sc = statusColors[order.status] || muted;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...sc);
  const statusStr = `Status: ${order.status}`;
  doc.text(statusStr, (pw - doc.getTextWidth(statusStr)) / 2, y);
  y += 7;

  // ══════════════════════════════════════════════
  // DECORATIVE DIVIDER
  // ══════════════════════════════════════════════
  doc.setDrawColor(...orange);
  doc.setLineWidth(0.3);
  // Draw a dotted decorative line
  for (let dx = margin; dx < pw - margin; dx += 3) {
    doc.line(dx, y, dx + 1.5, y);
  }
  y += 5;

  // ══════════════════════════════════════════════
  // THANK YOU + QUOTATION
  // ══════════════════════════════════════════════
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...orange);
  const ty = 'Thank You for Your Order!';
  doc.text(ty, (pw - doc.getTextWidth(ty)) / 2, y);
  y += 5;

  // Random quotation
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...mid);

  // Word-wrap the quote
  const quoteLines = doc.splitTextToSize(quote, cw - 10);
  quoteLines.forEach((line) => {
    const lw = doc.getTextWidth(line);
    doc.text(line, (pw - lw) / 2, y);
    y += 3.5;
  });
  y += 3;

  // ══════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════
  // Decorative bottom bar
  const footerY = Math.max(y, ph - 12);
  doc.setFillColor(...orange);
  doc.rect(0, footerY, pw, 12, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...white);
  const footerText = 'Powered by FoodNest  •  AparnaCanteen';
  doc.text(footerText, (pw - doc.getTextWidth(footerText)) / 2, footerY + 5);

  const genText = `Generated: ${new Date().toLocaleString('en-IN')}`;
  doc.setFontSize(5);
  doc.text(genText, (pw - doc.getTextWidth(genText)) / 2, footerY + 9);

  // ══════════════════════════════════════════════
  // DOWNLOAD
  // ══════════════════════════════════════════════
  const fileName = `AparnaCanteen_Invoice_${order.order_number || 'order'}.pdf`;
  doc.save(fileName);
};

export default generateInvoice;
