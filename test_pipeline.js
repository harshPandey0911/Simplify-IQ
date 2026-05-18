console.log("=================================================");
console.log("   SIMPLIFIQ AUTOMATION PIPELINE VALIDATOR       ");
console.log("=================================================");

const payload = {
  name: "Harsh Pandey",
  email: "hp4270077@gmail.com",
  companyName: "Google",
  websiteUrl: "google.com",
  industry: "SaaS & Technology",
  challenges: "We want to automate lead intake, auto-enrich prospect websites, generate highly styled PDF reports programmatically, and send them directly to our prospects without human intervention."
};

console.log(`[Test] Formulating test payload for: ${payload.companyName}`);
console.log(`[Test] Targeting Local Endpoint: http://localhost:5050/api/leads`);

fetch("http://localhost:5050/api/leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
.then(async (res) => {
  console.log(`[Test] Connection Established. HTTP Status: ${res.status}`);
  const data = await res.json();
  
  if (res.ok && data.success) {
    console.log("\n=================================================");
    console.log(" ✅ PIPELINE VERIFICATION SUCCEEDED! ");
    console.log("=================================================");
    console.log(` Company Enriched : ${data.data.companyName}`);
    console.log(` Sector Classified: ${data.data.industry}`);
    console.log(` Analytics Source : ${data.data.source}`);
    console.log(` PDF Download URL : ${data.data.downloadUrl}`);
    console.log(` Ethereal Mail URL: ${data.data.emailPreviewUrl}`);
    console.log("=================================================");
    console.log("\nGenerated B2B SWOT Overview:");
    console.log(JSON.stringify(data.data.report.swot, null, 2));
    process.exit(0);
  } else {
    console.log("\n=================================================");
    console.log(" ❌ PIPELINE VERIFICATION FAILED ");
    console.log("=================================================");
    console.log("Error details:", data.error || data);
    process.exit(1);
  }
})
.catch(err => {
  console.error("\n[Test Error] Failed to contact the Express server:", err.message);
  console.log("Please make sure the development monorepo is running via 'npm run dev' on port 5050.");
  process.exit(1);
});
