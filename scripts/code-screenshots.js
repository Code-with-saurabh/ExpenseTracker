const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const hljs = require('highlight.js');

const OUT = path.join(__dirname, '..', 'doc', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const files = [
  { src: 'server/src/controllers/analyticsController.js', lines: [76, 130], name: 'code-01-dashboard-aggregation.png', caption: 'server/src/controllers/analyticsController.js — Dashboard aggregation (sequential awaits, no Promise.all)' },
  { src: 'server/src/utils/processRecurring.js', lines: [25, 52], name: 'code-02-recurring-auto-post.png', caption: 'server/src/utils/processRecurring.js — Recurring expense auto-posting' },
  { src: 'server/src/utils/notify.js', lines: [1, 30], name: 'code-03-smart-notifications.png', caption: 'server/src/utils/notify.js — Smart notification helper with de-duplication' },
  { src: 'client/src/themes/option8WarmEspressoSage.js', lines: [1, 30], name: 'code-04-theme-file.png', caption: 'client/src/themes/option8WarmEspressoSage.js — One theme = one separate file' },
  { src: 'client/src/pages/Analytics.jsx', lines: [115, 150], name: 'code-05-chart-selector.png', caption: 'client/src/pages/Analytics.jsx — Vertical multi-chart selector' },
  { src: 'client/src/utils/amount.js', lines: [1, 34], name: 'code-06-amount-sanitization.png', caption: 'client/src/utils/amount.js — Amount sanitization helper' },
  { src: 'server/src/controllers/transactionController.js', lines: [137, 175], name: 'code-07-csv-export.png', caption: 'server/src/controllers/transactionController.js — CSV export endpoint' },
];

const template = (codeHtml, caption) => `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "JetBrains Mono", ui-monospace, Consolas, monospace;
    background: #1e1a16;
    padding: 26px 30px 22px;
    width: 980px;
  }
  pre { background: #26211c; border: 1px solid #3a322b; border-radius: 10px; padding: 18px 20px; overflow: hidden; }
  code { font-size: 12.5px; line-height: 1.65; color: #e6ded4; white-space: pre; display: block; }
  .caption { color: #9ba586; font-size: 12px; margin-top: 14px; letter-spacing: 0.03em; }
  .hljs-keyword, .hljs-built_in { color: #c9a66b; }
  .hljs-string { color: #9ba586; }
  .hljs-number { color: #d99a6c; }
  .hljs-title, .hljs-function { color: #e6ded4; }
  .hljs-comment { color: #7d766c; font-style: italic; }
  .hljs-attr, .hljs-property { color: #a9c1ff; }
  .hljs-variable { color: #e6ded4; }
  .hljs-literal { color: #c9a66b; }
</style>
</head>
<body>
<pre><code>${codeHtml}</code></pre>
<div class="caption">${caption}</div>
</body>
</html>`;

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });

  for (const item of files) {
    const full = path.join(__dirname, '..', item.src);
    if (!fs.existsSync(full)) {
      console.log(`skip (missing): ${item.src}`);
      continue;
    }

    const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
    const sliced = lines.slice(item.lines[0] - 1, item.lines[1]).join('\n');
    const highlighted = hljs.highlight(sliced, { language: 'javascript' }).value;
    const html = template(highlighted, item.caption);

    await page.setViewportSize({ width: 980, height: 600 });
    await page.setContent(html);
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(OUT, item.name), fullPage: true });
    console.log(`saved: ${item.name}`);
  }

  await browser.close();
};

run();
