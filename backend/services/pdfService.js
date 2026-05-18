import PDFDocument from 'pdfkit';
import fs from 'fs';

/**
 * Helper to wrap text into standard bullet lists with safe line wrapping.
 */
function drawBullet(doc, text, x, y, width, options = {}) {
  const bulletSymbol = '•  ';
  doc.font('Helvetica-Bold').fillColor(options.bulletColor || '#0D9488').text(bulletSymbol, x, y);
  
  const indent = doc.widthOfString(bulletSymbol);
  doc.font('Helvetica').fillColor(options.textColor || '#374151')
     .text(text, x + indent, y, { width: width - indent, lineGap: 3, ...options });
  
  return doc.heightOfString(text, { width: width - indent, lineGap: 3 }) + 6;
}

/**
 * Main PDF Generation Engine.
 * Programmatically builds a beautiful multi-page PDF document.
 */
export async function generateAuditPdf(enrichedData, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`[PDF Engine] Initiating report layout for: ${enrichedData.companyName}`);
      
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 35, left: 50, right: 50 }, // Bottom margin adjusted to 35 so footers at Y: 788-796 do not trigger automatic page breaks
        bufferPages: true // Enables two-pass drawing to inject total page counts in footer
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      const report = enrichedData.report;

      // ==========================================
      // PAGE 1: EXECUTIVE COVER PAGE
      // ==========================================
      
      // Top Decorative Block (Deep HSL Teal)
      doc.rect(0, 0, 595, 300).fill('#075E54');
      
      // Accent Stripe (Bright Coral/Gold Highlight)
      doc.rect(0, 300, 595, 12).fill('#F59E0B');

      // Title Content (Overlaid on Dark Teal Block)
      doc.font('Helvetica-Bold').fontSize(32).fillColor('#FFFFFF')
         .text('STRATEGIC BUSINESS AUDIT', 50, 85, { width: 495 });
      
      const subtitleY = doc.y + 10;
      doc.font('Helvetica').fontSize(11).fillColor('#E0F2FE')
         .text('OPERATIONAL INSIGHTS & COMPETITIVE GROWTH ROADMAP', 50, subtitleY, { width: 495, tracking: 0.5 });

      // Lower White Block Content
      // Subtitle Box
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#1F2937')
         .text(enrichedData.companyName.toUpperCase(), 50, 355, { width: 495 });
 
      const separatorY = doc.y + 12;
 
      // Line Separator
      doc.moveTo(50, separatorY).lineTo(200, separatorY).strokeColor('#0D9488').lineWidth(3).stroke();
 
      const profileY = separatorY + 22;
 
      // Scraped Context Tag
      const websiteDisplay = enrichedData.websiteUrl 
        ? enrichedData.websiteUrl.replace(/^https?:\/\//i, '') 
        : 'Internal Analysis Only';
 
      doc.font('Helvetica').fontSize(11).fillColor('#4B5563')
         .text(`TARGET PROFILE: `, 50, profileY, { continued: true })
         .font('Helvetica-Bold').fillColor('#0D9488').text(websiteDisplay);
 
      const industryY = doc.y + 10;
 
      doc.font('Helvetica').fontSize(11).fillColor('#4B5563')
         .text(`INDUSTRY SECTOR: `, 50, industryY, { continued: true })
         .font('Helvetica-Bold').fillColor('#1F2937').text(enrichedData.industry);

      // Audit Specs Card (Bottom Right Block)
      doc.rect(300, 530, 245, 180).fill('#F9FAFB');
      doc.rect(300, 530, 245, 180).strokeColor('#E5E7EB').lineWidth(1).stroke();
      doc.rect(300, 530, 6, 180).fill('#0D9488'); // Left Border accent

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#374151')
         .text('AUDIT SPECIFICATIONS', 320, 550);

      doc.font('Helvetica').fontSize(9).fillColor('#6B7280')
         .text('PREPARED BY:', 320, 580)
         .font('Helvetica-Bold').fillColor('#1F2937').text('SimplifIQ Automation Hub')
         .moveDown(0.5);

      const auditDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      doc.font('Helvetica').fillColor('#6B7280').text('DATE GENERATED:', 320, 620)
         .font('Helvetica-Bold').fillColor('#1F2937').text(auditDate)
         .moveDown(0.5);

      doc.font('Helvetica').fillColor('#6B7280').text('ANALYSIS SOURCE:', 320, 660)
         .font('Helvetica-Bold').fillColor('#0D9488').text(enrichedData.source || 'Scraper Engine');

      // ==========================================
      // PAGE 2: EXECUTIVE SUMMARY & VP
      // ==========================================
      doc.addPage();

      // Heading
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#075E54').text('1. EXECUTIVE SUMMARY', 50, 70);
      doc.moveTo(50, 92).lineTo(545, 92).strokeColor('#E5E7EB').lineWidth(1).stroke();
      doc.moveTo(50, 92).lineTo(150, 92).strokeColor('#0D9488').lineWidth(2).stroke();

      // Executive Summary Overview Text Box (Enhanced Height & Spacing)
      doc.rect(50, 115, 495, 140).fill('#F0FDF4');
      doc.rect(50, 115, 495, 140).strokeColor('#BBF7D0').lineWidth(1).stroke();
      doc.rect(50, 115, 5, 140).fill('#16A34A');

      doc.font('Helvetica-Bold').fontSize(12).fillColor('#16A34A').text('STRATEGIC OVERVIEW', 70, 130);
      doc.font('Helvetica').fontSize(10).fillColor('#1F2937')
         .text(report.overview || '', 70, 150, { width: 455, height: 95, ellipsis: true, lineGap: 3, align: 'justify' });
 
      // Core Value Proposition Box (Enhanced Height & Spacing)
      doc.rect(50, 285, 495, 90).fill('#EFF6FF');
      doc.rect(50, 285, 495, 90).strokeColor('#DBEAFE').lineWidth(1).stroke();
      doc.rect(50, 285, 5, 90).fill('#2563EB');
 
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#2563EB').text('CORE VALUE PROPOSITION', 70, 300);
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#1E40AF')
         .text(`"${report.valueProp || 'Deliver outstanding business solutions through streamlined workflows.'}"`, 70, 322, { width: 455, height: 45, ellipsis: true, align: 'center' });

      // Core Focus Area Heading
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#1F2937').text('SUBMITTED OPERATIONAL FOCUS & TARGETS', 50, 405);
      doc.moveTo(50, 423).lineTo(545, 423).strokeColor('#E5E7EB').lineWidth(1).stroke();

      // Details Block (Deepened to 260px height to fill vertical space)
      doc.rect(50, 440, 495, 260).fill('#F9FAFB');
      doc.rect(50, 440, 495, 260).strokeColor('#E5E7EB').lineWidth(1).stroke();

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#4B5563').text('TARGET ENTERPRISE:', 75, 465)
         .font('Helvetica-Bold').fontSize(12).fillColor('#1F2937').text(enrichedData.companyName, 75, 480);

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#4B5563').text('PRIMARY INDUSTRY CLASSIFICATION:', 75, 525)
         .font('Helvetica-Bold').fontSize(12).fillColor('#1F2937').text(enrichedData.industry, 75, 540);

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#4B5563').text('OPERATIONAL & SCALING OBSTACLES SUBMITTED:', 75, 585)
         .font('Helvetica').fontSize(10).fillColor('#374151')
         .text(enrichedData.challenges || 'No strategic friction items submitted.', 75, 603, { width: 445, height: 80, ellipsis: true, lineGap: 3 });

      // ==========================================
      // PAGE 3: 2x2 SWOT ANALYSIS PANEL
      // ==========================================
      doc.addPage();

      doc.font('Helvetica-Bold').fontSize(18).fillColor('#075E54').text('2. COMPREHENSIVE SWOT AUDIT', 50, 70);
      doc.moveTo(50, 92).lineTo(545, 92).strokeColor('#E5E7EB').lineWidth(1).stroke();
      doc.moveTo(50, 92).lineTo(150, 92).strokeColor('#0D9488').lineWidth(2).stroke();

      // SWOT Subheader
      doc.font('Helvetica').fontSize(10).fillColor('#4B5563')
         .text('A structural examination of internal performance capabilities alongside macro market threats and strategic opportunities.', 50, 105);

      // --- SWOT 2X2 GRID DRAWING ---
      const gridX = 50;
      const gridY = 135;
      const cellW = 240;
      const cellH = 280; // Changed from 250 to 280 for higher visual density and solid styling
      const gap = 15;

      const swot = report.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };

      // 1. STRENGTHS (Top Left - Emerald)
      const sX = gridX;
      const sY = gridY;
      doc.rect(sX, sY, cellW, cellH).fill('#F0FDF4');
      doc.rect(sX, sY, cellW, cellH).strokeColor('#DCFCE7').lineWidth(1).stroke();
      doc.rect(sX, sY, cellW, 6).fill('#16A34A');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#15803D').text('STRENGTHS (Internal)', sX + 15, sY + 20);
      
      let sOffset = sY + 45;
      (swot.strengths || []).slice(0, 4).forEach(item => {
        sOffset += drawBullet(doc, item, sX + 15, sOffset, cellW - 25, { bulletColor: '#16A34A', fontSize: 9.2, lineGap: 3 });
      });
 
      // 2. WEAKNESSES (Top Right - Rose)
      const wX = gridX + cellW + gap;
      const wY = gridY;
      doc.rect(wX, wY, cellW, cellH).fill('#FFF1F2');
      doc.rect(wX, wY, cellW, cellH).strokeColor('#FFE4E6').lineWidth(1).stroke();
      doc.rect(wX, wY, cellW, 6).fill('#E11D48');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#BE123C').text('WEAKNESSES (Internal)', wX + 15, wY + 20);
 
      let wOffset = wY + 45;
      (swot.weaknesses || []).slice(0, 4).forEach(item => {
        wOffset += drawBullet(doc, item, wX + 15, wOffset, cellW - 25, { bulletColor: '#E11D48', fontSize: 9.2, lineGap: 3 });
      });
 
      // 3. OPPORTUNITIES (Bottom Left - Sky Blue)
      const oX = gridX;
      const oY = gridY + cellH + gap;
      doc.rect(oX, oY, cellW, cellH).fill('#F0F9FF');
      doc.rect(oX, oY, cellW, cellH).strokeColor('#E0F2FE').lineWidth(1).stroke();
      doc.rect(oX, oY, cellW, 6).fill('#0284C7');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0369A1').text('OPPORTUNITIES (External)', oX + 15, oY + 20);
 
      let oOffset = oY + 45;
      (swot.opportunities || []).slice(0, 4).forEach(item => {
        oOffset += drawBullet(doc, item, oX + 15, oOffset, cellW - 25, { bulletColor: '#0284C7', fontSize: 9.2, lineGap: 3 });
      });
 
      // 4. THREATS (Bottom Right - Amber)
      const tX = gridX + cellW + gap;
      const tY = gridY + cellH + gap;
      doc.rect(tX, tY, cellW, cellH).fill('#FEF3C7');
      doc.rect(tX, tY, cellW, cellH).strokeColor('#FDE68A').lineWidth(1).stroke();
      doc.rect(tX, tY, cellW, 6).fill('#D97706');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#B45309').text('THREATS (External)', tX + 15, tY + 20);
 
      let tOffset = tY + 45;
      (swot.threats || []).slice(0, 4).forEach(item => {
        tOffset += drawBullet(doc, item, tX + 15, tOffset, cellW - 25, { bulletColor: '#D97706', fontSize: 9.2, lineGap: 3 });
      });


      // ==========================================
      // PAGE 4: COMPETITORS & RECOMMENDATIONS
      // ==========================================
      doc.addPage();

      // Heading: Competitors
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#075E54').text('3. COMPETITIVE OUTLOOK', 50, 70);
      doc.moveTo(50, 92).lineTo(545, 92).strokeColor('#E5E7EB').lineWidth(1).stroke();
      doc.moveTo(50, 92).lineTo(150, 92).strokeColor('#0D9488').lineWidth(2).stroke();

      const comps = (report.competitors || []).slice(0, 2);
      let compY = 110;
 
      comps.forEach((comp, idx) => {
        doc.rect(50, compY, 495, 70).fill('#FAF5FF');
        doc.rect(50, compY, 495, 70).strokeColor('#F3E8FF').lineWidth(1).stroke();
        doc.rect(50, compY, 4, 70).fill('#8B5CF6');
 
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#6D28D9')
           .text(`${idx + 1}. KEY CHALLENGER: ${comp.name || 'Industry Standard'}`, 65, compY + 12);
        
        doc.font('Helvetica').fontSize(9.5).fillColor('#374151')
           .text(comp.differentiation || 'Standard market player with legacy strategies.', 65, compY + 28, { width: 465, lineGap: 2 });
        
        compY += 82;
      });
 
      // Heading: Recommendations
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#075E54').text('4. STRATEGIC GROWTH RECOMMENDATIONS', 50, compY + 10);
      doc.moveTo(50, compY + 32).lineTo(545, compY + 32).strokeColor('#E5E7EB').lineWidth(1).stroke();
      doc.moveTo(50, compY + 32).lineTo(150, compY + 32).strokeColor('#0D9488').lineWidth(2).stroke();
 
      let recY = compY + 45;
      const recs = (report.recommendations || []).slice(0, 4);

      recs.forEach((rec, idx) => {
        // Parse recommendation into header and details based on first colon
        const parts = rec.split(':');
        const header = parts[0] ? parts[0].trim() : `Action Strategy ${idx + 1}`;
        const desc = parts[1] ? parts[1].trim() : rec;

        // Custom stylized action items
        doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#0D9488')
           .text(`[0${idx + 1}]  ${header.toUpperCase()}`, 50, recY);
        
        doc.font('Helvetica').fontSize(9.5).fillColor('#4B5563')
           .text(desc, 78, recY + 15, { width: 467, lineGap: 3 });

        // Bullet spacer line
        doc.moveTo(50, recY + 18).lineTo(50, recY + 38).strokeColor('#E5E7EB').lineWidth(1).stroke();

        recY += 62;
      });

      // Bottom Call To Action Block on final page
      doc.rect(50, 650, 495, 80).fill('#ECEFEE');
      doc.rect(50, 650, 495, 80).strokeColor('#DFE3E2').lineWidth(1).stroke();
      
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#075E54').text('NEXT STEPS AND ACTIONS', 65, 665);
      doc.font('Helvetica').fontSize(8.5).fillColor('#556260')
         .text('This strategic audit is generated automatically using high-density scraper indexes and machine-intelligence synthesis engines. To schedule a comprehensive manual deep-dive or deploy specialized developer workflows mapped to these obstacles, connect directly with SimplifIQ.', 65, 682, { width: 465, lineGap: 2 });


      // ==========================================
      // TWO-PASS HEADER & FOOTER INJECTIONS
      // ==========================================
      const range = doc.bufferedPageRange();
      const totalPages = range.count;

      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);

        // Skip headers and footers on the cover page (index 0)
        if (i === 0) continue;

        // --- Header ---
        doc.font('Helvetica').fontSize(8.5).fillColor('#9CA3AF')
           .text('SIMPLIFIQ  |  EXECUTIVE INTELLIGENCE SUITE', 50, 30);
        doc.font('Helvetica-Bold').text('STRICTLY CONFIDENTIAL', 430, 30, { align: 'right' });
        doc.moveTo(50, 42).lineTo(545, 42).strokeColor('#E5E7EB').lineWidth(0.5).stroke();

        // --- Footer ---
        doc.moveTo(50, 788).lineTo(545, 788).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
        doc.font('Helvetica').fontSize(8.5).fillColor('#9CA3AF')
           .text('© 2026 SimplifIQ Operations Inc. All rights reserved.', 50, 796);
        doc.font('Helvetica-Bold').fillColor('#4B5563')
           .text(`PAGE ${i + 1} OF ${totalPages}`, 480, 796, { align: 'right' });
      }

      // Conclude document write
      doc.end();

      writeStream.on('finish', () => {
        console.log(`[PDF Engine] Document compiled successfully: ${outputPath}`);
        resolve();
      });

      writeStream.on('error', (err) => {
        console.error(`[PDF Engine] WriteStream error: ${err.message}`);
        reject(err);
      });

    } catch (error) {
      console.error(`[PDF Engine] Generation crashed: ${error.message}`);
      reject(error);
    }
  });
}
