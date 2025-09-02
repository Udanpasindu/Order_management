const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Generate a PDF report for orders
const generateOrdersReport = async (orders, filters = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary file path
      const tempFilePath = path.join(os.tmpdir(), `orders-report-${Date.now()}.pdf`);
      
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(tempFilePath);
      
      // Pipe the PDF document to the file
      doc.pipe(stream);
      
      // Add company header
      doc.fontSize(25)
         .font('Helvetica-Bold')
         .text('Furniture Order Management', { align: 'center' });
      
      doc.fontSize(15)
         .font('Helvetica')
         .text('Orders Report', { align: 'center' });
         
      // Add date and time
      doc.fontSize(10)
         .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
         .moveDown(2);
      
      // Add filters summary if any
      if (filters.query) {
        doc.fontSize(12)
           .font('Helvetica-Oblique')
           .text(`Search query: "${filters.query}"`, { align: 'left' });
      }
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Total Orders: ${orders.length}`, { align: 'left' })
         .moveDown(1);
      
      // Draw a header for orders table
      doc.fontSize(12).font('Helvetica-Bold');
      const tableTop = doc.y;
      const orderNumX = 50;
      const customerX = 150;
      const dateX = 280;
      const statusX = 400;
      const amountX = 500;
      
      doc.text('Order ID', orderNumX, tableTop)
         .text('Customer', customerX, tableTop)
         .text('Date', dateX, tableTop)
         .text('Status', statusX, tableTop)
         .text('Amount', amountX, tableTop)
         .moveDown(0.5);
      
      // Draw a horizontal line
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke();
      
      // Draw order details
      doc.fontSize(10).font('Helvetica');
      let y = doc.y + 10;
      
      for (const order of orders) {
        // Check if we need a new page
        if (y > 700) {
          doc.addPage();
          y = 50;
          
          // Redraw headers on the new page
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('Order ID', orderNumX, y)
             .text('Customer', customerX, y)
             .text('Date', dateX, y)
             .text('Status', statusX, y)
             .text('Amount', amountX, y)
             .moveDown(0.5);
          
          doc.moveTo(50, doc.y)
             .lineTo(550, doc.y)
             .stroke();
          
          doc.fontSize(10).font('Helvetica');
          y = doc.y + 10;
        }
        
        // Format date
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        
        // Add order details
        doc.text(order._id.toString().substring(0, 8) + '...', orderNumX, y)
           .text(order.customer.name, customerX, y)
           .text(orderDate, dateX, y)
           .text(order.status, statusX, y)
           .text(`$${order.totalAmount.toFixed(2)}`, amountX, y);
        
        y += 20;
      }
      
      // Add summary statistics
      doc.addPage();
      
      doc.fontSize(16).font('Helvetica-Bold')
         .text('Order Summary', { align: 'center' })
         .moveDown(1);
      
      // Calculate statistics
      const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const statusCounts = orders.reduce((counts, order) => {
        counts[order.status] = (counts[order.status] || 0) + 1;
        return counts;
      }, {});
      
      // Display statistics
      doc.fontSize(12).font('Helvetica')
         .text(`Total Revenue: $${totalAmount.toFixed(2)}`, { align: 'left' })
         .moveDown(1);
      
      doc.fontSize(12).font('Helvetica-Bold')
         .text('Orders by Status:', { align: 'left' })
         .moveDown(0.5);
      
      doc.fontSize(10).font('Helvetica');
      Object.entries(statusCounts).forEach(([status, count]) => {
        doc.text(`${status}: ${count} orders`, { align: 'left' });
      });
      
      // Finalize PDF
      doc.end();
      
      // Resolve with the file path when the stream is finished
      stream.on('finish', () => {
        resolve(tempFilePath);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateOrdersReport };
