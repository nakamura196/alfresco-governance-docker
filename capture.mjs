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

async function tryClick(page, selector, timeout = 5000) {
  try {
    await page.click(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

// ===== 1. Share ログイン画面 =====
console.log('1. Share login page');
const page = await context.newPage();
await page.goto(`${BASE}/share/page/`, { waitUntil: 'networkidle', timeout: 60000 });
await screenshot(page, '01-share-login', 2000);

// ===== 2. Share ログイン =====
console.log('2. Share login');
// Find input fields by placeholder or input type
const usernameInput = await page.$('input[id="username"], input[name="username"], input[placeholder*="ユーザー"]');
const passwordInput = await page.$('input[id="password"], input[name="password"], input[type="password"]');
if (usernameInput && passwordInput) {
  await usernameInput.fill('admin');
  await passwordInput.fill('admin');
  // Click login button
  await page.click('button[type="submit"], input[type="submit"], button:has-text("サインイン"), button:has-text("ログイン")');
  await page.waitForTimeout(5000);
} else {
  console.log('  Login fields not found, trying alternative selectors');
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(i => console.log(i.id, i.name, i.type, i.placeholder));
  });
}
await screenshot(page, '02-share-dashboard', 3000);

// ===== 3. Records Management サイト =====
console.log('3. RM site dashboard');
await page.goto(`${BASE}/share/page/site/rm/dashboard`, { waitUntil: 'networkidle', timeout: 60000 });
await screenshot(page, '03-rm-dashboard', 3000);

// ===== 4. ファイルプラン =====
console.log('4. File plan');
await page.goto(`${BASE}/share/page/site/rm/documentlibrary`, { waitUntil: 'networkidle', timeout: 60000 });
await screenshot(page, '04-file-plan', 3000);

// ===== 5. Contractsカテゴリ =====
console.log('5. Contracts category');
if (await tryClick(page, 'a:has-text("Contracts"), span:has-text("Contracts")')) {
  await page.waitForTimeout(3000);
}
await screenshot(page, '05-contracts-category', 2000);

// ===== 6. 2026-Active フォルダ（カットオフ済み） =====
console.log('6. 2026-Active folder');
if (await tryClick(page, 'a:has-text("2026-Active"), span:has-text("2026-Active")')) {
  await page.waitForTimeout(3000);
}
await screenshot(page, '06-record-folder', 2000);

// ===== 7. レコードの詳細 =====
console.log('7. Record details');
if (await tryClick(page, 'a:has-text("contract-ABC"), span:has-text("contract-ABC")')) {
  await page.waitForTimeout(3000);
}
await screenshot(page, '07-record-details', 2000);

// ===== 8. サンプルサイト (通常のドキュメントライブラリ) =====
console.log('8. Sample site document library');
await page.goto(`${BASE}/share/page/site/swsdp/documentlibrary`, { waitUntil: 'networkidle', timeout: 60000 });
await screenshot(page, '08-doclib', 3000);

// ===== 9. RM管理コンソール =====
console.log('9. RM admin console');
await page.goto(`${BASE}/share/page/site/rm/rm-console`, { waitUntil: 'networkidle', timeout: 60000 });
await screenshot(page, '09-rm-console', 3000);

// ===== 10. 監査ログ =====
console.log('10. Audit log');
if (await tryClick(page, 'a:has-text("Audit"), span:has-text("Audit"), a:has-text("監査")')) {
  await page.waitForTimeout(3000);
}
await screenshot(page, '10-audit-log', 2000);

// ===== 11. Content App =====
console.log('11. Content App');
const page2 = await context.newPage();
await page2.goto(`${BASE}/content-app/`, { waitUntil: 'networkidle', timeout: 60000 });
await page2.waitForTimeout(3000);
// Try login
const caUser = await page2.$('input[id="username"], input[data-automation-id="username"]');
const caPass = await page2.$('input[id="password"], input[data-automation-id="password"]');
if (caUser && caPass) {
  await caUser.fill('admin');
  await caPass.fill('admin');
  const caBtn = await page2.$('button[type="submit"], button[id="login-button"]');
  if (caBtn) await caBtn.click();
  await page2.waitForTimeout(5000);
}
await screenshot(page2, '11-content-app', 2000);

// ===== 12. Control Center =====
console.log('12. Control Center');
const page3 = await context.newPage();
await page3.goto(`${BASE}/control-center/`, { waitUntil: 'networkidle', timeout: 60000 });
await page3.waitForTimeout(3000);
const ccUser = await page3.$('input[id="username"], input[data-automation-id="username"]');
const ccPass = await page3.$('input[id="password"], input[data-automation-id="password"]');
if (ccUser && ccPass) {
  await ccUser.fill('admin');
  await ccPass.fill('admin');
  const ccBtn = await page3.$('button[type="submit"], button[id="login-button"]');
  if (ccBtn) await ccBtn.click();
  await page3.waitForTimeout(5000);
}
await screenshot(page3, '12-control-center', 2000);

// ===== 13. Holds =====
console.log('13. Holds');
await page.goto(`${BASE}/share/page/site/rm/documentlibrary`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2000);
// Click on Holds in the left sidebar or breadcrumb
if (await tryClick(page, 'a:has-text("Holds"), span:has-text("Holds")')) {
  await page.waitForTimeout(3000);
}
await screenshot(page, '13-holds', 2000);

await browser.close();
console.log('\nAll screenshots captured!');
