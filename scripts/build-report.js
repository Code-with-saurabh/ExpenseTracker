const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PDFParse } = require('pdf-parse');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'docs', 'ExpenseTracker-Mini-Project-Report.html');
const PDF = path.join(ROOT, 'docs', 'ExpenseTracker-Mini-Project-Report.pdf');

const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

const squash = (s) => decode(s)
  .replace(/<[^>]*>/g, '')
  .replace(/[\u2014\u2013\u2212]/g, '-')
  .replace(/\s+/g, '');

function renumberAndIndex(html) {
  let n = 0;
  const renumbered = html.replace(/<p class="cap">Figure \d+ \u2014 /g, () => `<p class="cap">Figure ${++n} \u2014 `);
  const caps = [];
  const re = /<p class="cap">Figure (\d+) \u2014 ([\s\S]*?)<\/p>/g;
  let m;
  while ((m = re.exec(renumbered))) caps.push({ n: Number(m[1]), cap: m[2] });
  const rows = caps.map((c) => `  <tr><td>${c.n}</td><td>${c.cap}</td></tr>`).join('\n');
  const withIndex = renumbered.replace(
    /(<!--FIGURE_INDEX_START-->)[\s\S]*?(<!--FIGURE_INDEX_END-->)/,
    (_s, a, b) => `${a}\n${rows}\n  ${b}`
  );
  return { html: withIndex, caps };
}

function tocNeedles(html) {
  const toc = html.match(/<table class="toc">[\s\S]*?<\/table>/);
  if (!toc) throw new Error('ToC table not found');
  const rows = [...toc[0].matchAll(/<tr><td class="num">([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><td class="pg">[\s\S]*?<\/td><\/tr>/g)];
  if (!rows.length) throw new Error('No ToC rows found');
  return rows.map((r) => {
    const num = r[1].trim();
    const label = r[2].trim();
    const heading = /^\d+$/.test(num) ? `${num}. ${label}` : label;
    return { num, label, needle: squash(heading) };
  });
}

function fillToc(html, pages) {
  const needles = tocNeedles(html);
  const flat = pages.map(squash);

  const needleHitsPerPage = pages.map((_, i) => needles.filter((nd) => flat[i].includes(nd.needle)).length);
  const tocPages = new Set();
  needleHitsPerPage.forEach((count, i) => {
    if (count >= 5) tocPages.add(i);
  });

  const results = needles.map((nd) => {
    const page = flat.findIndex((t, i) => !tocPages.has(i) && t.includes(nd.needle));
    return page >= 0 ? page + 1 : null;
  });

  let i = 0;
  const filled = html.replace(/(<table class="toc">[\s\S]*?<\/table>)/, (block) =>
    block.replace(/<td class="pg">[\s\S]*?<\/td>/g, (cell) => {
      const val = results[i++];
      return val ? `<td class="pg">${val}</td>` : cell;
    })
  );
  if (i !== needles.length) throw new Error(`ToC fill mismatch: ${i} cells vs ${needles.length} needles`);
  return { html: filled, needles, results, tocPages: [...tocPages].map((x) => x + 1) };
}

function makePdf() {
  const res = spawnSync(process.execPath, [path.join(__dirname, 'make-pdf.js'), HTML, PDF], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status || 1);
}

async function main() {
  let html = fs.readFileSync(HTML, 'utf8');
  const { html: html1, caps } = renumberAndIndex(html);
  fs.writeFileSync(HTML, html1);
  console.log(`figures renumbered: ${caps.length}`);

  makePdf();

  const parsed = await new PDFParse({ data: fs.readFileSync(PDF) }).getText();
  const pages = parsed.pages.map((p) => String(p.text || ''));
  console.log(`pdf pages: ${pages.length}`);

  const { html: html2, needles, results, tocPages } = fillToc(html1, pages);
  needles.forEach((nd, k) => {
    const shown = results[k] === null ? 'NOT FOUND' : results[k];
    console.log(`  ToC p.${shown}  ${nd.label}`);
  });
  console.log(`  ToC pages detected: ${tocPages.join(', ')}`);

  fs.writeFileSync(HTML, html2);
  makePdf();

  console.log('\nfigure map:');
  caps.forEach((c) => console.log(`  Figure ${String(c.n).padStart(2)}  ${squash(c.cap).slice(0, 80)}`));
  console.log(`\ndone: ${HTML}\ndone: ${PDF}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
