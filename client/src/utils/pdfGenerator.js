import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export const generateOrderInvoice = (orderData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const order = orderData.order;
  const items = orderData.items;

  // Header / Logo
  doc.setFillColor(5, 5, 5); // Black
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SHOPSPHERE', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('INVOICE / RECEIPT', pageWidth - 20, 25, { align: 'right' });

  // Order Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Details', 20, 60);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order ID: #${order._id}`, 20, 70);
  doc.text(`Date: ${format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}`, 20, 75);
  doc.text(`Status: ${order.orderStatus}`, 20, 80);
  doc.text(`Payment: ${order.paymentStatus}`, 20, 85);

  // Shipping Address
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Shipping To', pageWidth / 2, 60);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.shippingAddress.street}`, pageWidth / 2, 70);
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, pageWidth / 2, 75);
  doc.text(`${order.shippingAddress.country}`, pageWidth / 2, 80);

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 95, pageWidth - 20, 95);

  // Table Header
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 20, 110);
  doc.text('Qty', pageWidth - 80, 110, { align: 'center' });
  doc.text('Price', pageWidth - 50, 110, { align: 'right' });
  doc.text('Total', pageWidth - 20, 110, { align: 'right' });
  
  doc.line(20, 115, pageWidth - 20, 115);

  // Items
  doc.setFont('helvetica', 'normal');
  let startY = 125;
  items.forEach((item) => {
    const title = item.product?.title || 'Unknown Product';
    // Handle long titles
    const titleLines = doc.splitTextToSize(title, 100);
    doc.text(titleLines, 20, startY);
    
    doc.text(`${item.quantity}`, pageWidth - 80, startY, { align: 'center' });
    doc.text(`$${item.priceAtPurchase.toFixed(2)}`, pageWidth - 50, startY, { align: 'right' });
    doc.text(`$${(item.quantity * item.priceAtPurchase).toFixed(2)}`, pageWidth - 20, startY, { align: 'right' });
    
    startY += (titleLines.length * 5) + 5;
  });

  doc.line(20, startY + 5, pageWidth - 20, startY + 5);

  // Total
  startY += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', pageWidth - 60, startY, { align: 'right' });
  doc.text(`$${order.totalAmount.toFixed(2)}`, pageWidth - 20, startY, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for shopping with ShopSphere!', pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });

  // Save PDF
  doc.save(`ShopSphere_Invoice_${order._id}.pdf`);
};
