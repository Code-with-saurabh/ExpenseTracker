const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = path.join(__dirname, '..');
const mdPath = path.join(ROOT, 'doc', 'final-report-about-project.md');
const htmlPath = path.join(ROOT, 'doc', 'final-report-about-project.html');

const md = fs.readFileSync(mdPath, 'utf8');
const body = marked.parse(md);

const css = `
  * { box-sizing: border-box; }
  body {
    font-family: "JetBrains Mono", ui-monospace, Consolas, "Courier New", monospace;
    color: #29231F;
    background: #FFFFFF;
    font-size: 13px;
    line-height: 1.7;
    margin: 0;
    padding: 46px 56px 70px;
    max-width: 1000px;
  }
  h1, h2, h3 { line-height: 1.35; color: #29231F; }
  h1 { font-size: 25px; border-bottom: 4px solid #493B32; padding-bottom: 14px; margin-bottom: 18px; }
  h2 { font-size: 18px; margin-top: 38px; padding-bottom: 7px; border-bottom: 2px solid #E9EDE4; color: #493B32; }
  h3 { font-size: 15px; margin-top: 26px; color: #493B32; }
  p { margin: 9px 0; }
  table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 12px; }
  th, td { border: 1px solid #D8D2C7; padding: 7px 10px; text-align: left; vertical-align: top; }
  th { background: #E9EDE4; color: #493B32; font-weight: 700; }
  tr:nth-child(even) td { background: #FAF8F3; }
  code { background: #F1EDE6; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
  pre { background: #26211C; color: #E6DED4; padding: 16px 18px; border-radius: 10px; overflow-x: auto; line-height: 1.6; }
  pre code { background: none; color: inherit; padding: 0; font-size: 12px; }
  img { max-width: 100%; border: 1px solid #D8D2C7; border-radius: 10px; margin: 8px 0 4px; display: block; }
  em { color: #7d766c; }
  strong { color: #493B32; }
  hr { border: none; border-top: 2px solid #E9EDE4; margin: 30px 0; }
  li { margin: 4px 0; }
  blockquote { border-left: 4px solid #78816A; margin: 12px 0; padding: 4px 16px; background: #FAF8F3; }
  h2, h3 { page-break-after: avoid; }
  img, pre, table { page-break-inside: avoid; }
  a { color: #493B32; }
`;

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>ExpenseTracker — Final Project Report</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet" />
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;

fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`written: ${htmlPath}`);
