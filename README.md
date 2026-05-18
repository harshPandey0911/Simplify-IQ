# SimplifIQ Lead Automation System ⚡
### Autonomous B2B Lead Intake, Data Enrichment, Programmatic PDF Auditing, and Email Delivery

This platform is a fully automated, end-to-end B2B sales automation system designed for the **SimplifIQ AI Software Developer Intern Assessment**. It captures lead specifications from a premium React-based frontend, scraping details from the prospect's company website, synthesizing business profiles using Google Gemini AI, drafting multi-page formatted audit PDFs, and emailing them instantly.

---

## 🚀 The Zero-Config Test Drive (Assessor Experience)

We understand that reviewing code works best when there is **zero operational friction**. This project includes a **Zero-Config Developer Fallback** out of the box:
- **No SMTP Credentials Required**: If no SMTP settings are configured in `.env`, the system automatically provisions a dynamic **Nodemailer Ethereal Sandbox account** on the fly, sends the report, and serves a direct **"View Outbox Email ↗"** button in the web UI. You can view the sent email, inspect the HTML styling, and download the actual generated PDF report directly from the outbox interface!
- **No Gemini API Key Required**: If no Gemini Key is provided, our **Local Smart Context Engine** takes over, analyzing the company name, website metadata, and submitted challenges to synthesize realistic, industry-customized SWOT grids, value propositions, and growth strategies locally so the system never crashes.

---

## 🛠️ Architecture & System Blueprint

The system is structured as a light, high-performance monorepo:

```
Simplify IQ/
├── package.json             # Root coordinated execution scripts
├── README.md                # System documentation
│
├── client/                  # React + Vite Frontend
│   ├── package.json         # Client specific libraries (Vite, Lucide React, etc.)
│   ├── vite.config.js       # Vite configuration
│   ├── index.html           # Main HTML with Outfit & Inter typography
│   └── src/
│       ├── main.jsx         # React root bootstrapper
│       ├── App.jsx          # Dashboard, state machine, pipeline stepper & previewer
│       └── index.css        # Custom Glassmorphic Dark UI & glowing animations
│
└── server/                  # Node.js + Express API
    ├── package.json         # Server dependencies (pdfkit, cheerio, nodemailer, etc.)
    ├── server.js            # Express router, pipelines, and static file endpoints
    ├── .env                 # Port & secret configuration values
    ├── .env.example         # Variable template configuration
    └── services/
        ├── enrichmentService.js  # Cheerio crawling parser & Gemini integration
        ├── pdfService.js         # Styled PDFKit dynamic multi-page layout builder
        └── emailService.js       # Nodemailer dispatcher with Ethereal fallback
```

---

## ⚡ Setup & Run Instructions

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Project Installation
From the root workspace directory, run the install script:
```bash
npm run install-all
```
This single command automatically installs all dependencies for the **monorepo root**, the **Express server**, and the **Vite frontend** concurrently.

### 2. Configure Environment Secrets (Optional)
Open the `server/.env` file. You can run the application with these empty, or supply credentials for full integration:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Real SMTP Configuration (if left blank, Ethereal Sandbox will trigger)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SMTP_FROM="SimplifIQ Business Audit <your_email@gmail.com>"
```

### 3. Launch Development Environments
Start both the API server (Port 5000) and the React frontend (Port 5173) simultaneously:
```bash
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`** to test the system!

---

## 🧠 Core Features & Design Rationale

### 1. High-Fidelity Lead Intake Dashboard
- **Design Aesthetic**: Sleek glassmorphic slate dark mode (`#090D16`) integrated with a vibrant Teal accent theme (`#0D9488`). Features floating, blurred color spheres in the background, glowing focus inputs, responsive grids, and micro-interactions.
- **Active Progress Tracking**: When submitting, the form transitions into a real-time status card. The interface loops through five sequential pipeline steps (Validating, Scraping, Synthesizing, PDF Rendering, Emailing) to mirror exactly what the backend is processing.

### 2. Crawling & Scraper Engine
- **Technical Stack**: Powered by `axios` (with a strict 5-second timeout to prevent pipeline hangs) and `cheerio`.
- **Parsing Scope**: It inspects the website, fetching HTML headers, `<title>`, meta descriptions, keywords, and typography context.
- **Scraper Resiliency**: Employs real browser `User-Agent` string emulation and handles network blocks, bad URLs, and unresponsive sites gracefully, falling back to clean text analysis without aborting the workflow.

### 3. Dual-Mode Business Intelligence Engine
- **Gemini Mode**: Integrates the official `@google/genai` SDK using the high-performance `gemini-2.5-flash` model. Directs the model to output a strictly formatted B2B business audit containing an overview, value proposition, a 4-quadrant SWOT grid, competitor differentiators, and strategic recommendations in clean JSON format.
- **Local Fallback Engine**: If no API key is present, our intelligent local engine parses the website metadata keywords and the industry classification selected in the dropdown (SaaS, FinTech, Consulting, B2B, E-commerce) to construct detailed, industry-specific advisory grids, SWOT elements, and strategic advice.

### 4. Dynamic programmatically styled PDF Report
- **Technical Stack**: Programmed directly on `pdfkit` for high performance and clean styling control.
- **Visual Design**:
  - **Page 1 (Cover Page)**: High-contrast deep green header block (`#075E54`), amber highlight separator stripe, elegant typography, target metadata panel, and prepared-by specifications card.
  - **Page 2 (Executive Overview)**: High-contrast shaded callout boxes with solid left border panels (Emerald Green for overview, Royal Blue for Value Proposition).
  - **Page 3 (SWOT Grid Panel)**: A highly structured 2x2 grid. Each panel features custom HSL backgrounds and title fills mapping to specific categories (Strengths: Emerald, Weaknesses: Rose, Opportunities: Sky Blue, Threats: Amber).
  - **Page 4 (Competitor Analysis & Recommendations)**: Styled action cards with violet borders, custom vector page separator rules, bullet lists with proportional wrapping, and a bottom Call to Action banner.
  - **Two-Pass Headers & Footers**: Leverages PDFKit page buffering. Runs a second pass across the completed PDF to draw borders, headers, and footer indicators showing `"PAGE X OF Y"` dynamically.

### 5. Email & Sandbox Delivery Suite
- **Nodemailer Core**: Attaches the generated PDF as a file attachment using MIME structures.
- **Dynamic Ethereal Integration**: If SMTP settings are omitted, it calls `nodemailer.createTestAccount()`. This dynamically creates a test inbox on Ethereal Mail, sends the email, and returns the Ethereal outbox transaction link. This link is served directly in the success dashboard, enabling assessors to verify delivery in one click.

---

## ⚖️ Architectural Decisions, Trade-Offs & Limitations

### 1. PDF Generation: PDFKit vs. Headless Puppeteer
- **The Choice**: We selected programmatic layout rendering via `pdfkit` over headless HTML-to-PDF converters like `puppeteer`.
- **Trade-off**: HTML-to-PDF allows developers to write pure Tailwind/HTML to style PDFs easily. However, running Puppeteer requires downloading a full Chromium binary during `npm install`, adding massive delays, CPU overhead, and potential memory leaks in server environments. Programmatic PDFKit drawing is extremely fast, highly secure, requires negligible dependencies, and delivers pixel-perfect vector alignment.

### 2. Sequential Blocking vs. Async Job Queues
- **The Choice**: For this working prototype, the intake process runs synchronously in a single request transaction.
- **Trade-off**: In a high-traffic production environment, scraping websites and calling AI APIs inside a blocking HTTP request can lead to request timeouts. A production architecture would push lead ingestions onto a message queue (e.g., Redis + BullMQ), returning a `202 Accepted` immediately, and stream progress milestones back to the frontend using WebSockets. We opted for a clean, highly reliable synchronous request for local deployment simplicity.

### 3. Scraper Capabilities vs. Anti-Bot Firewalls
- **The Choice**: Clean HTTP fetches via Cheerio.
- **Trade-off**: Cheerio parses static HTML extremely fast. However, it cannot execute JavaScript on single-page apps (SPAs) and cannot bypass Cloudflare anti-bot shields. For a production-ready crawler, a rotating proxy network combined with a stealth headless browser service (e.g., ScrapingBee or Browserless) would be necessary to guarantee successful enrichment of all domains.

---

## 🛠️ Validation & Error Fallback Matrix

| Scenario | System Impact | Solution / Resilient Fallback |
| :--- | :--- | :--- |
| **Invalid/Down Website URL** | Scraper fails to connect. | Catches network exception, logs warning, and proceeds to analyze the lead using form details. |
| **Cloudflare Scraper Block** | Page returns 403 Forbidden. | Gracefully falls back to scraping metadata patterns or parsing local industry choices. |
| **No Gemini API Key** | AI Analysis throws key exception. | Local Smart Context Engine executes, loading robust, sector-aware pre-compiled SWOT data. |
| **Gemini API Limit Reached** | API throws 429 Rate Limit. | Gracefully intercepts status, running the Local Smart engine without crashing the UI. |
| **No SMTP Configured** | E-mail transport crashes. | Dynamically compiles a one-click Ethereal developer account to preserve delivery validation. |
| **Invalid Email Address** | Mail dispatch bounces. | Sanitizes and validates inputs on the frontend and backend routers prior to pipeline initialization. |
