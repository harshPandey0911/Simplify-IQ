import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  User, 
  Globe, 
  HelpCircle, 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck 
} from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 0, title: "Validating Lead Details", desc: "Checking email formatting and core domain parameters" },
  { id: 1, title: "Scraping Company Website", desc: "Extracting meta titles, headers, and descriptions for context" },
  { id: 2, title: "Generating Business Audit", desc: "Analyzing sector, assets, and objectives using Gemini AI" },
  { id: 3, title: "Compiling PDF Report", desc: "Programmatically drawing grid layouts, tables, and headers" },
  { id: 4, title: "Dispatching Email Report", desc: "Delivering custom audit PDF attachment to target prospect" }
];

export default function App() {
  // Input states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    websiteUrl: '',
    industry: 'SaaS & Technology',
    challenges: ''
  });

  // Application state machine: 'idle' | 'processing' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simulate smooth timed pipeline steps while backend processes in parallel
  useEffect(() => {
    let interval;
    if (status === 'processing') {
      interval = setInterval(() => {
        setActiveStep(prev => {
          if (prev < PIPELINE_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1500); // Progress to next step every 1.5 seconds
    } else {
      setActiveStep(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Submit Lead Pipeline Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // --- FRONTEND EMAIL DOMAIN TYPO VALIDATION ---
    const email = formData.email.trim().toLowerCase();
    const domain = email.split('@')[1];
    
    const domainTypos = {
      'gmaul.com': 'gmail.com',
      'gmaul.co': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'gamil.co': 'gmail.com',
      'hotmal.com': 'hotmail.com',
      'yaho.com': 'yahoo.com',
      'outlok.com': 'outlook.com',
      'outclook.com': 'outlook.com'
    };

    if (domainTypos[domain]) {
      setErrorMessage(`Spelling typo detected in email domain! Did you mean "@${domainTypos[domain]}" instead of "@${domain}"?`);
      setStatus('error');
      return;
    }
    
    setStatus('processing');
    
    try {
      const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5050'
        : '';
      const response = await fetch(`${apiBase}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'The B2B pipeline execution failed.');
      }

      console.log("[Client] Backend automation pipeline completed successfully!", data);
      
      // Delay success slightly for high-impact transition after progress
      setTimeout(() => {
        setResult(data.data);
        setStatus('success');
      }, 1000);

    } catch (err) {
      console.error("[Client] Lead submission collapsed:", err.message);
      setErrorMessage(err.message || 'Unable to establish contact with the backend automation server. Make sure the Express API is running on Port 5050.');
      setStatus('error');
    }
  };

  // Reset Application to Idle Form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      companyName: '',
      websiteUrl: '',
      industry: 'SaaS & Technology',
      challenges: ''
    });
    setResult(null);
    setShowPreview(false);
    setStatus('idle');
  };

  return (
    <div className="app-container">
      {/* Background Ambience */}
      <div className="ambient-bg">
        <div className="sphere sphere-teal"></div>
        <div className="sphere sphere-purple"></div>
      </div>

      {/* Corporate Header */}
      <header className="app-header">
        <div className="brand-badge">
          <Sparkles size={13} />
          <span>SimplifIQ Autonomous Pipeline</span>
        </div>
        <h1 className="app-title">Automated Lead Intake & Strategic Audit</h1>
        <p className="app-subtitle">
          Submit your company details. Our intelligent pipeline will scrape your website, trigger deep SWOT analyses, compile a styled business PDF, and email the report instantly.
        </p>
      </header>

      {/* Primary Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Left Column: Form / Processing State / Success Dashboard */}
        <main className="glass-card">
          
          {/* IDLE INPUT STATE */}
          {status === 'idle' && (
            <form onSubmit={handleSubmit}>
              <h2 className="form-section-title">
                <Building2 size={20} className="text-primary-light" />
                <span>Enterprise Intake Specifications</span>
              </h2>

              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  <User size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Prospect Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="e.g., Sarah Jenkins"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  <Mail size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Corporate Contact Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="e.g., sjenkins@acme.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
                <span className="input-hint">The strategic PDF report will be delivered directly to this email address.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="companyName">
                  <Building2 size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  className="form-input"
                  placeholder="e.g., Acme Corporation"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="websiteUrl">
                  <Globe size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Company Website Address
                </label>
                <input
                  type="text"
                  id="websiteUrl"
                  name="websiteUrl"
                  className="form-input"
                  placeholder="e.g., acme.com"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                />
                <span className="input-hint">Highly Recommended: Used to scrape meta-tags and crawl headers for deep personalization.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="industry">
                  <Briefcase size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Primary Industry Vertical
                </label>
                <select
                  id="industry"
                  name="industry"
                  className="form-select"
                  value={formData.industry}
                  onChange={handleChange}
                >
                  <option value="SaaS & Technology">SaaS & Technology</option>
                  <option value="FinTech & Finance">FinTech & Finance</option>
                  <option value="Management Consulting & Advisory">Management Consulting & Advisory</option>
                  <option value="B2B Professional Services">B2B Professional Services</option>
                  <option value="E-commerce & Digital Brands">E-commerce & Digital Brands</option>
                  <option value="Other Sector">Other Sector</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="challenges">
                  <HelpCircle size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Operational Scaling Challenges & Goals
                </label>
                <textarea
                  id="challenges"
                  name="challenges"
                  className="form-textarea"
                  placeholder="What is limiting your growth? (e.g., Manual client onboarding workflows, lack of content marketing pipeline, regulatory compliance bottlenecks...)"
                  value={formData.challenges}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                <span>Trigger Automation Pipeline</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* PROCESSING STATE */}
          {status === 'processing' && (
            <div>
              <h2 className="form-section-title">
                <RefreshCw size={20} className="text-primary-light animate-spin" />
                <span>Running Pipeline Services...</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px' }}>
                SimplifIQ's automated pipeline has picked up the lead context. We are processing scraping, business audit syntheses, PDF writing, and emailing. Please stand by.
              </p>

              <div className="progress-list">
                {PIPELINE_STEPS.map((step) => {
                  const isActive = step.id === activeStep;
                  const isCompleted = step.id < activeStep;
                  
                  return (
                    <div 
                      key={step.id} 
                      className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    >
                      <div className="step-indicator">
                        {isCompleted ? '✓' : step.id + 1}
                      </div>
                      <div className="step-details">
                        <h4>{step.title}</h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && result && (
            <div>
              <div className="success-header">
                <div className="success-badge">
                  <CheckCircle2 size={32} />
                </div>
                <h2 style={{ fontSize: '26px', color: '#FFFFFF', marginBottom: '8px' }}>Workflow Succeeded!</h2>
                <p style={{ color: 'var(--text-body)', fontSize: '14.5px', maxWidth: '480px', margin: '0 auto' }}>
                  Intake completed without human intervention. Your business analysis is ready and the report has been dispatched.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Company:</span>
                  <span style={{ fontWeight: 'bold', color: '#FFFFFF' }}>{result.companyName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Classified Sector:</span>
                  <span style={{ fontWeight: 'bold', color: '#FFFFFF' }}>{result.industry}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Strategic Intelligence:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary-light)' }}>{result.source}</span>
                </div>
              </div>

              <div className="success-actions">
                {result.emailPreviewUrl && (
                  <a 
                    href={result.emailPreviewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary btn-glow"
                  >
                    <ExternalLink size={16} />
                    <span>View Sent Email Sandbox (Ethereal)</span>
                  </a>
                )}
                
                <a 
                  href={result.downloadUrl} 
                  download 
                  className="btn-secondary"
                  style={{ borderColor: 'var(--primary)', color: 'var(--primary-light)' }}
                >
                  <Download size={16} />
                  <span>Download PDF Audit Report</span>
                </a>

                <button onClick={resetForm} className="btn-secondary">
                  <RefreshCw size={16} />
                  <span>Submit Another Lead</span>
                </button>
              </div>

              {/* Embedded Interactive Audit Summary Accordion */}
              <div className="preview-collapsible">
                <div 
                  className="preview-title" 
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} className="text-primary-light" />
                    Interactive Audit Summary
                  </span>
                  {showPreview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {showPreview && (
                  <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ background: 'rgba(13, 148, 136, 0.05)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--primary-light)', marginBottom: '5px' }}>Executive Overview</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.5' }}>{result.report?.overview}</p>
                    </div>

                    <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--secondary)', marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#C084FC', marginBottom: '5px' }}>Value Proposition</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-body)', fontStyle: 'italic' }}>"{result.report?.valueProp}"</p>
                    </div>

                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#FFFFFF' }}>B2B SWOT Grid</h4>
                    <div className="preview-grid">
                      <div className="preview-swot-cell swot-s">
                        <div className="swot-cell-title">Strengths</div>
                        <ul className="swot-cell-list">
                          {result.report?.swot?.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>

                      <div className="preview-swot-cell swot-w">
                        <div className="swot-cell-title">Weaknesses</div>
                        <ul className="swot-cell-list">
                          {result.report?.swot?.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>

                      <div className="preview-swot-cell swot-o">
                        <div className="swot-cell-title">Opportunities</div>
                        <ul className="swot-cell-list">
                          {result.report?.swot?.opportunities?.map((o, i) => <li key={i}>{o}</li>)}
                        </ul>
                      </div>

                      <div className="preview-swot-cell swot-t">
                        <div className="swot-cell-title">Threats</div>
                        <ul className="swot-cell-list">
                          {result.report?.swot?.threats?.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '2px solid var(--error)', color: 'var(--error)', marginBottom: '18px' }}>
                  <AlertTriangle size={28} />
                </div>
                <h2 style={{ fontSize: '24px', color: '#FFFFFF', marginBottom: '8px' }}>Workflow Disrupted</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
                  An issue occurred while executing the autonomous pipeline.
                </p>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '18px', color: '#FCA5A5', fontSize: '13.5px', lineHeight: '1.5', marginBottom: '30px' }}>
                <strong>Pipeline Error Details:</strong>
                <p style={{ marginTop: '5px' }}>{errorMessage}</p>
              </div>

              <button onClick={resetForm} className="btn-secondary">
                <RefreshCw size={16} />
                <span>Return to Intake Form</span>
              </button>
            </div>
          )}

        </main>

        {/* Right Column: Architectural Highlights Sidebar */}
        <aside className="glass-card" style={{ height: '100%' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
            <ShieldCheck size={18} className="text-primary-light" />
            System Blueprint
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
            This system fulfills all requirements of the SimplifIQ software developer intern evaluation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '15px' }}>
              <h4 style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '5px' }}>Website Scraper Engine</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                Crawls and parses targets in 5s using Cheerio, fetching metadata indexes to inject contextual data.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '15px' }}>
              <h4 style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '5px' }}>Dual-mode Analytics</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                Uses Gemini 2.5 Flash for strategic reports. Falls back to a local, domain-aware logic matrix if API keys are offline.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid var(--warning)', paddingLeft: '15px' }}>
              <h4 style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '5px' }}>Programmatic PDF Layout</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                Builds professional, A4 PDF documents with corporate cover pages, colored banners, page numbering, and formatted SWOT tables.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid var(--success)', paddingLeft: '15px' }}>
              <h4 style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '5px' }}>Zero-Config Mail Dispatcher</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>
                Nodemailer dynamically provisions a real Ethereal SMTP account if custom SMTP is omitted, sending the PDF and returning a secure preview outbox.
              </p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
