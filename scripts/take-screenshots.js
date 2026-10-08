const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:5173';
const OUT = path.join(__dirname, '..', 'doc', 'screenshots');

fs.mkdirSync(OUT, { recursive: true });

const shot = async (page, name, fullPage = false) => {
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, name), fullPage });
  console.log(`saved: ${name}`);
};

const login = async (page, email, password) => {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 15000 });
  await page.waitForTimeout(1500);
};

const run = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE}/login`);
    await shot(page, '01-login.png');

    await login(page, 'demo@example.com', 'password123');
    await shot(page, '02-dashboard.png');

    await page.goto(`${BASE}/transactions`);
    await shot(page, '03-transactions.png');

    await page.click('button:has-text("Add transaction")');
    await shot(page, '04-add-transaction-modal.png');
    await page.keyboard.press('Escape');

    await page.goto(`${BASE}/budgets`);
    await shot(page, '05-budgets.png');

    await page.goto(`${BASE}/analytics`);
    await page.waitForTimeout(1200);
    await shot(page, '06-analytics-bar.png');

    await page.click('button:has-text("Line")');
    await shot(page, '07-analytics-line.png');

    await page.goto(`${BASE}/reports`);
    await page.waitForTimeout(1200);
    await shot(page, '08-reports.png', true);

    await page.goto(`${BASE}/goals`);
    await shot(page, '09-goals.png');

    await page.goto(`${BASE}/recurring`);
    await shot(page, '10-recurring.png');

    await page.goto(`${BASE}/categories`);
    await shot(page, '11-categories.png');

    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(800);
    await shot(page, '12-theme-selector.png', true);

    await page.click('[title="Toggle dark mode"]');
    await page.goto(`${BASE}/`);
    await shot(page, '13-dashboard-dark.png');

    await page.click('[title="Toggle dark mode"]');
    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(600);
    await page.click('button:has-text("Cream + Burgundy")');
    await page.goto(`${BASE}/`);
    await shot(page, '14-theme-burgundy.png');

    const emptyPage = await context.newPage();
    await emptyPage.goto(`${BASE}/register`);
    await emptyPage.fill('input[name="name"]', 'Report User');
    await emptyPage.fill('input[name="email"]', 'report-user@test.com');
    await emptyPage.fill('input[name="password"]', 'test1234');
    await emptyPage.fill('input[name="confirmPassword"]', 'test1234');
    await emptyPage.click('button[type="submit"]');
    await emptyPage.waitForURL(`${BASE}/`, { timeout: 15000 });
    await emptyPage.waitForTimeout(1500);
    await emptyPage.goto(`${BASE}/transactions`);
    await emptyPage.waitForTimeout(900);
    await emptyPage.screenshot({ path: path.join(OUT, '15-empty-state.png') });
    console.log('saved: 15-empty-state.png');
    await emptyPage.close();
  } catch (error) {
    console.error(`STEPS FAILED: ${error.message}`);
  } finally {
    await browser.close();
  }
};

run();
