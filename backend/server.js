import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

// Helper to check MX records of a domain with a 2-second timeout
function checkDomainMx(domain) {
  return new Promise((resolve) => {
    // 2-second timeout to keep the pipeline snappy during local network sluggishness
    const timeout = setTimeout(() => {
      console.warn(`[DNS Validation] MX query for ${domain} timed out. Bypassing check.`);
      resolve(true);
    }, 2000);

    dns.resolveMx(domain, (err, addresses) => {
      clearTimeout(timeout);
      if (err) {
        console.warn(`[DNS Validation] DNS query failed for ${domain}: ${err.code || err.message}`);
        // If domain doesn't exist, resolveMx returns ENOTFOUND or ENODATA
        if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
          resolve(false);
        } else {
          // Bypassing check for temporary local network or ISP DNS resolution errors
          resolve(true);
        }
      } else if (!addresses || addresses.length === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Service Imports
import { enrichCompanyData } from './services/enrichmentService.js';
import { generateAuditPdf } from './services/pdfService.js';
import { sendAuditEmail } from './services/emailService.js';

// Setup environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Ensure the temp downloads directory exists (uses OS temp dir on Vercel to avoid read-only filesystem error)
const tempDir = process.env.VERCEL === '1'
  ? path.join('/tmp', 'downloads')
  : path.join(__dirname, 'temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`[Server] Created temp downloads directory at: ${tempDir}`);
}

// Serve the generated PDFs as static files for direct client download
app.use('/downloads', express.static(tempDir));

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date() });
});

/**
 * Root Route for Render Testing
 */
app.get("/", (req, res) => {
  res.json({ message: "Backend running successfully" });
});

/**
 * Main Pipeline Endpoint: POST /api/leads
 * Executes validation -> enrichment -> PDF compilation -> email dispatch
 */
app.post('/api/leads', async (req, res) => {
  const { name, email, companyName, websiteUrl, industry, challenges } = req.body;

  console.log(`[Pipeline] New Lead Ingested: ${companyName} (${name})`);

  // --- STEP 1: VALIDATION ---
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }
  if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'A valid email address is required' });
  }
  if (!companyName || !companyName.trim()) {
    return res.status(400).json({ success: false, error: 'Company Name is required' });
  }

  try {
    // --- STEP 1.5: EMAIL DOMAIN MX RECORD VALIDATION ---
    const emailDomain = email.trim().toLowerCase().split('@')[1];
    console.log(`[Pipeline] Phase 0.5: Checking MX records for domain: ${emailDomain}`);
    const isDomainActive = await checkDomainMx(emailDomain);
    if (!isDomainActive) {
      return res.status(400).json({
        success: false,
        error: `The email domain "${emailDomain}" does not exist or has no active mail server (MX records) to receive emails. Please check for spelling mistakes like "gmaul.com" instead of "gmail.com".`
      });
    }
    // --- STEP 2: COMPANY ENRICHMENT (Scrape + AI Analysis) ---
    console.log('[Pipeline] Phase 1: Enriching company data...');
    const enrichedData = await enrichCompanyData(companyName, websiteUrl, industry, challenges);

    // --- STEP 3: PDF COMPILATION ---
    console.log('[Pipeline] Phase 2: Generating strategic PDF report...');
    const safeFileName = `${companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}_audit.pdf`;
    const pdfPath = path.join(tempDir, safeFileName);
    
    await generateAuditPdf(enrichedData, pdfPath);
    
    // Construct local download link
    const downloadUrl = `${req.protocol}://${req.get('host')}/downloads/${safeFileName}`;

    // --- STEP 4: EMAIL DISPATCH ---
    console.log('[Pipeline] Phase 3: Dispatching email to prospect...');
    const emailResult = await sendAuditEmail(
      { name, email, companyName, industry: enrichedData.industry },
      pdfPath
    );

    // --- STEP 5: PIPELINE SUCCESS ---
    console.log('[Pipeline] Automated workflow completed successfully!');
    
    return res.json({
      success: true,
      message: 'Automated lead workflow succeeded! Deep audit generated and emailed.',
      data: {
        companyName: enrichedData.companyName,
        industry: enrichedData.industry,
        challenges: enrichedData.challenges,
        source: enrichedData.source,
        downloadUrl,
        emailPreviewUrl: emailResult.previewUrl,
        isEthereal: emailResult.isEthereal,
        report: enrichedData.report
      }
    });

  } catch (error) {
    console.error(`[Pipeline Error] Workflow collapsed: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during the automation pipeline.',
      details: error.message
    });
  }
});

// Start the Express Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
