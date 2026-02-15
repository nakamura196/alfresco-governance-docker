import { chromium } from 'playwright';

const BASE = 'http://localhost:8080';
const IMG_DIR = './images';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  locale: 'ja-JP',
});

async function screenshot(page, name, waitMs = 1000) {
  await page.waitForTimeout(waitMs);
  await page.screenshot({ path: `${IMG_DIR}/${name}.png`, fullPage: false });
  console.log(`  captured: ${name}.png`);
}

// Login first
const page = await context.newPage();
await page.goto(`${BASE}/share/page/`, { waitUntil: 'networkidle', timeout: 60000 });
const usernameInput = await page.$('input[id="username"], input[name="username"], input[placeholder*="ユーザー"]');
const passwordInput = await page.$('input[id="password"], input[name="password"], input[type="password"]');
if (usernameInput && passwordInput) {
  await usernameInput.fill('admin');
  await passwordInput.fill('admin');
  await page.click('button[type="submit"], input[type="submit"], button:has-text("サインイン")');
  await page.waitForTimeout(5000);
}

// ===== RM管理コンソール =====
console.log('9. RM Management Console');
await page.goto(`${BASE}/share/page/site/rm/rm-managementconsole`, { waitUntil: 'networkidle', timeout: 60000 });
await screenshot(page, '09-rm-console', 3000);

// Try alternative URL
console.log('9b. RM Console via rm-console');
await page.goto(`${BASE}/share/page/console/rm-console/rm-audit`, { waitUntil: 'networkidle', timeout: 60000 });
await screenshot(page, '09b-rm-console-audit', 3000);

// ===== 監査ログ via RM site =====
console.log('10. Audit via RM Management Console');
await page.goto(`${BASE}/share/page/site/rm/rma-audit`, { waitUntil: 'networkidle', timeout: 60000 });
await screenshot(page, '10-audit-log', 3000);

// Try the admin tools
console.log('10b. Admin tools');
await page.goto(`${BASE}/share/page/console/admin-console/`, { waitUntil: 'networkidle', timeout: 60000 });
await screenshot(page, '10b-admin-console', 3000);

// ===== Holdsの中身を表示 =====
console.log('13. Holds');
await page.goto(`${BASE}/share/page/site/rm/documentlibrary`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2000);
// Click Holds in sidebar
try {
  await page.click('span:has-text("ホールド")', { timeout: 5000 });
  await page.waitForTimeout(3000);
} catch {
  console.log('  trying English text');
  try {
    await page.click('span:has-text("Holds")', { timeout: 3000 });
    await page.waitForTimeout(3000);
  } catch {
    console.log('  could not find Holds link');
  }
}
await screenshot(page, '13-holds', 2000);

await browser.close();
console.log('\nDone!');
