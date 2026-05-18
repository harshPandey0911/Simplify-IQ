import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';

/**
 * Normalizes a URL to ensure it is a valid absolute address.
 */
function normalizeUrl(url) {
  if (!url) return '';
  let cleanUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = 'https://' + cleanUrl;
  }
  return cleanUrl;
}

/**
 * Scrapes metadata and basic page structure from a company website.
 */
async function scrapeWebsite(url) {
  if (!url) return null;
  const cleanUrl = normalizeUrl(url);

  try {
    console.log(`[Scraper] Attempting to scrape: ${cleanUrl}`);
    const response = await axios.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 5000 // 5-second timeout to avoid stalling the pipeline
    });

    const $ = cheerio.load(response.data);
    const title = $('title').text().trim() || '';
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || 
                           $('meta[property="og:description"]').attr('content')?.trim() || '';
    const metaKeywords = $('meta[name="keywords"]').attr('content')?.trim() || '';
    
    // Extract H1 and H2 tags for context
    const headings = [];
    $('h1, h2').slice(0, 5).each((i, el) => {
      const txt = $(el).text().trim().replace(/\s+/g, ' ');
      if (txt && txt.length > 5 && txt.length < 100) {
        headings.push(txt);
      }
    });

    console.log(`[Scraper] Successfully scraped metadata from ${cleanUrl}`);
    return {
      title,
      description: metaDescription,
      keywords: metaKeywords,
      headings: headings.slice(0, 4)
    };
  } catch (err) {
    console.warn(`[Scraper] Failed to scrape website ${cleanUrl}: ${err.message}`);
    // Return null; system handles scraping failure gracefully
    return null;
  }
}

/**
 * Standard fallbacks for specific industries in case Gemini API is not configured.
 */
function getLocalFallbackReport(companyName, industry, challenges, scrapedData) {
  const ind = (industry || 'SaaS').toLowerCase();
  
  // Use metadata if scraped, or standard template components
  const keywordsStr = scrapedData?.keywords || '';
  const pageTitle = scrapedData?.title || `${companyName} | Premium Business Solutions`;
  const pageDesc = scrapedData?.description || challenges || 'Delivering high-value solutions to business clients.';

  let report = {
    overview: `${companyName} is an emerging enterprise within the ${industry || 'B2B'} sector. Built around delivering efficiency, the company helps clients scale operations, solve bottleneck workflows, and maximize market presence. Based on their core profile, they are currently working to expand their digital reach and build standard, high-converting pipelines.`,
    valueProp: `To empower businesses by resolving operational complexities and delivering top-tier domain solutions that facilitate sustainable scaling.`,
    swot: {
      strengths: [
        "Dynamic business model with localized services",
        "Clear alignment with market demand and client scaling goals",
        "High agility enabling swift adaptation to customer feedback",
        "Dedicated focus on customer satisfaction and high-touch support"
      ],
      weaknesses: [
        "Limited organic search presence and brand recall in highly competitive markets",
        "Resource constraints slowing down comprehensive content marketing and search outreach",
        "High reliance on manual follow-up workflows and sales pipelines",
        "Fragmented customer feedback integration across legacy operational tools"
      ],
      opportunities: [
        "Implement end-to-end automation in sales intake and prospect qualification",
        "Deploy a dedicated content hub targeted around their core industry challenges",
        "Leverage programmatic cold outreach and strategic AI personalizations",
        "Launch strategic B2B affiliate or partnership programs to drive direct organic lead flow"
      ],
      threats: [
        "Aggressive customer acquisition campaigns by larger legacy competitors",
        "Rapid technology updates requiring continuous product/service adjustments",
        "Rising cost of traditional advertising (PPC) squeezing customer acquisition margins",
        "Potential talent shortages in specialized operational or technical support roles"
      ]
    },
    competitors: [
      {
        name: "Legacy Market Leaders",
        differentiation: "Massive advertising budget and broad brand recognition, but suffers from low agility, rigid pricing, and standardized, impersonal customer service."
      },
      {
        name: "Niche Agile Challengers",
        differentiation: "Highly optimized digital marketing funnels and hyper-specialized features, but lacks a high-touch, consultative relationship model."
      }
    ],
    recommendations: [
      "Deploy Automated Nurture Workflows: Set up a trigger-based intake pipeline that immediately follows up with custom, data-enriched PDF audits to convert leads on the spot.",
      "Optimize Search Visibility: Invest in specialized SEO keyword optimization targeting high-intent long-tail keywords relevant to their core service offerings.",
      "Implement Lead Score Modeling: Screen incoming leads by company size and business challenges to automatically prioritize high-value enterprise accounts.",
      "Establish Modern Interactive Portals: Move away from static email exchanges and host personalized interactive client workspaces to drive engagement and retention."
    ]
  };

  // Adjust templates based on detected/selected industry
  if (ind.includes('saas') || ind.includes('software') || ind.includes('tech')) {
    report.overview = `${companyName} provides a highly scalable tech solution designed to eliminate friction in operations. By focusing on modern software design and robust feature sets, they help teams automate routine tasks and unlock data intelligence. Their current priorities involve scaling customer acquisition and improving user retention rates.`;
    report.valueProp = `To provide an intuitive, high-uptime software ecosystem that streamlines digital workflows and delivers real-time business insights.`;
    report.swot.strengths[0] = "Modern architecture with rapid deployment capability";
    report.swot.weaknesses[1] = "High churn risk if the user onboarding experience lacks self-serve guidance";
    report.swot.opportunities[0] = "Launch automated product-led growth (PLG) trials with contextual in-app tooltips";
    report.recommendations[1] = "Refine Product Onboarding: Build interactive walkthroughs to drive new users to their first 'Aha!' moment within 3 minutes of registration.";
  } else if (ind.includes('finance') || ind.includes('fintech') || ind.includes('invest')) {
    report.overview = `${companyName} operates in the financial sector, focusing on securing transactions, maximizing client wealth, or simplifying capital flows. Given the sector's regulatory standards, the company relies heavily on trust, robust risk protocols, and clear advisory services to stand out in a crowded market.`;
    report.valueProp = `To deliver secure, highly compliant, and professional financial services that guarantee peace of mind and compound client growth.`;
    report.swot.strengths[0] = "Strong commitment to compliance, security standards, and capital safety";
    report.swot.weaknesses[0] = "High compliance costs that restrict rapid geographical scaling";
    report.swot.opportunities[1] = "Incorporate AI-driven data screening to speed up loan, capital, or investment approvals";
    report.recommendations[1] = "Enhance Trust Signals: Incorporate interactive security compliance badges, regulatory certificates, and video client testimonials on all high-intent conversion pages.";
  } else if (ind.includes('consult') || ind.includes('agency') || ind.includes('service')) {
    report.overview = `${companyName} is a boutique consulting and service provider that crafts bespoke solutions for enterprise-grade challenges. Their operations rely heavily on senior expert time, custom research reports, and building long-term advisory relationships with decision-makers.`;
    report.valueProp = `To deliver deep, actionable domain expertise and customized strategies that resolve executive roadblocks and drive tangible organizational growth.`;
    report.swot.strengths[0] = "Deep domain expertise and highly personalized, premium advisory relationships";
    report.swot.weaknesses[2] = "Difficulty in scaling delivery due to extreme dependence on human advisor availability";
    report.swot.opportunities[0] = "Develop digitized asset-backed advisory packages and automated introductory diagnostic tools";
    report.recommendations[1] = "Package Strategic Advisory: Productize manual advisory services into repeatable, structured frameworks that can be delivered by junior staff utilizing expert system software.";
  }

  // Inject scraped details if present for dynamic touch
  if (scrapedData) {
    if (scrapedData.title) {
      report.overview += ` As stated in their public profile ("${scrapedData.title.slice(0, 60)}..."), they emphasize quality and customer alignment.`;
    }
    if (scrapedData.headings && scrapedData.headings.length > 0) {
      report.valueProp = `To realize their mission of "${scrapedData.headings[0]}" by offering seamless, highly effective client solutions.`;
    }
  }

  return report;
}

/**
 * Enriches company data by scraping their website and requesting analysis from Gemini API
 * (or falling back to the Local Smart Engine if key is unavailable).
 */
export async function enrichCompanyData(companyName, websiteUrl, industry, challenges) {
  console.log(`[Enrichment] Starting pipeline for ${companyName} (${websiteUrl || 'No website'})`);
  
  // 1. Scrape Web Page
  const scrapedData = websiteUrl ? await scrapeWebsite(websiteUrl) : null;

  // 2. Check API Key for Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("[Enrichment] GEMINI_API_KEY not configured. Running Local Smart Engine fallbacks...");
    const report = getLocalFallbackReport(companyName, industry, challenges, scrapedData);
    return {
      companyName,
      websiteUrl,
      industry: industry || 'B2B Services',
      challenges: challenges || 'General business growth',
      source: 'Local Smart Rule Engine (API Key Offline)',
      report
    };
  }

  // 3. AI-Powered Analysis
  try {
    console.log("[Enrichment] Calling Gemini 2.5 Flash for deep business audit...");
    const ai = new GoogleGenAI({ apiKey });
    
    const scraperContext = scrapedData 
      ? `Meta Title: ${scrapedData.title}\nMeta Description: ${scrapedData.description}\nMeta Keywords: ${scrapedData.keywords}\nKey Headers: ${scrapedData.headings.join(' | ')}`
      : 'No website scraped.';

    const systemPrompt = `You are an elite B2B growth consultant, venture capitalist, and market analyst.
Your task is to analyze a company based on its name, sector, submitted business challenges, and website metadata, and return a deeply professional, structured business audit.

You must return EXACTLY a JSON object with this shape:
{
  "overview": "3-4 sentences of highly professional business overview summarizing who they are, what they do, and their market focus. Incorporate scraped metadata logically.",
  "valueProp": "A concise, premium 1-sentence statement explaining their core value proposition.",
  "swot": {
    "strengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4"],
    "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3", "Weakness 4"],
    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3", "Opportunity 4"],
    "threats": ["Threat 1", "Threat 2", "Threat 3", "Threat 4"]
  },
  "competitors": [
    { "name": "Competitor A", "differentiation": "1-sentence summary of Competitor A's strengths and how this company can differentiate." },
    { "name": "Competitor B", "differentiation": "1-sentence summary of Competitor B's strengths and how this company can differentiate." }
  ],
  "recommendations": [
    "Recommendation 1: detailed growth strategy matching their specific challenges.",
    "Recommendation 2: detailed growth strategy matching their specific challenges.",
    "Recommendation 3: detailed growth strategy matching their specific challenges.",
    "Recommendation 4: detailed growth strategy matching their specific challenges."
  ]
}

DO NOT include any markdown blocks, prefix text, or trailing explanations. Return ONLY the JSON object. Be highly specific to the company's real sector and challenges.`;

    const userPrompt = `Company Name: ${companyName}
Website: ${websiteUrl || 'None'}
Industry/Sector: ${industry || 'Not Specified'}
Core Challenges/Goals: ${challenges || 'Scale business, optimize conversions, automate operations'}

--- Scraped Website Meta Context ---
${scraperContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nClient Input Data:\n${userPrompt}` }] }
      ]
    });

    const responseText = response.text || '';
    
    // Clean JSON response (strip potential markdown wrap)
    const jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedReport = JSON.parse(jsonStr);

    console.log("[Enrichment] Gemini audit report parsed successfully.");
    return {
      companyName,
      websiteUrl,
      industry: industry || parsedReport.industry || 'B2B Services',
      challenges: challenges || 'General business growth',
      source: 'Gemini 2.5 Flash',
      report: parsedReport
    };
  } catch (err) {
    console.error(`[Enrichment] Gemini analysis failed: ${err.message}. Falling back to Local Smart Engine...`);
    const report = getLocalFallbackReport(companyName, industry, challenges, scrapedData);
    return {
      companyName,
      websiteUrl,
      industry: industry || 'B2B Services',
      challenges: challenges || 'General business growth',
      source: 'Local Smart Rule Engine (Fallback due to API error)',
      report
    };
  }
}
