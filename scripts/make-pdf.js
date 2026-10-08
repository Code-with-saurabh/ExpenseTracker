const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const htmlPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'doc', 'final-report-about-project.html');
const pdfPath = process.argv[3] ? path.resolve(process.argv[3]) : htmlPath.replace(/\.html$/i, '.pdf');

if (!fs.existsSync(htmlPath)) {
  console.error('HTML not found. Run: npm run report-html');
  process.exit(1);
}

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width:100%;font-size:9px;padding:0 40px;color:#7d766c;display:flex;justify-content:space-between;font-family:monospace;">
        <span>ExpenseTracker — Mini Project Report</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`,
    margin: { top: '18mm', bottom: '18mm', left: '12mm', right: '12mm' },
  });

  console.log(`written: ${pdfPath}`);
  await browser.close();
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
