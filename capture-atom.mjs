import { chromium } from 'playwright';

const BASE = 'http://localhost:63001';
const IMG_DIR = './screenshots';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: 'ja-JP',
});

async function screenshot(page, name, opts = {}) {
  const { waitMs = 1500, fullPage = false, clip } = opts;
  await page.waitForTimeout(waitMs);
  const ssOpts = { path: `${IMG_DIR}/${name}.png` };
  if (clip) {
    ssOpts.clip = clip;
  } else {
    ssOpts.fullPage = fullPage;
  }
  await page.screenshot(ssOpts);
  console.log(`  captured: ${name}.png`);
}

// ===== Login =====
console.log('0. Login to AtoM');
const page = await context.newPage();
await page.goto(`${BASE}/user/login`, { waitUntil: 'networkidle', timeout: 30000 });

// Use the visible accordion login form (input type="email", btn-outline-success)
await page.fill('input[type="email"]', 'demo@example.com');
await page.fill('input[type="password"]:visible', 'demo');
await page.click('button.atom-btn-outline-success[type="submit"]');
await page.waitForTimeout(3000);
console.log('  Logged in');

// ===== Step 0: Top page =====
console.log('Step 0: Top page');
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'step-00-top', { waitMs: 2000 });

// ===== Step 1-3: Repository =====
console.log('Step 1-3: Repository');
await page.goto(`${BASE}/repository/browse`, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'step-01-repository-browse', { waitMs: 2000 });

// Click on the repository card to navigate to detail page
try {
  // Repository browse uses card view - click the repository name link
  const repoLocator = page.locator('.card-body a, .atom-table a, a').filter({ hasText: '橋本市立図書館' }).first();
  await repoLocator.waitFor({ timeout: 5000 });
  const repoHref = await repoLocator.getAttribute('href');
  console.log(`  Repository href: ${repoHref}`);
  if (repoHref) {
    // Use index.php prefix for slug-based URLs
    const url = repoHref.startsWith('http') ? repoHref : `${BASE}${repoHref}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } else {
    await repoLocator.click();
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  }
} catch (e) {
  console.log(`  Repository click failed: ${e.message}`);
  // Fallback: try index.php slug URL pattern
  await page.goto(`${BASE}/index.php/ayya-htm3-5wkd`, { waitUntil: 'networkidle', timeout: 30000 });
}
await page.waitForTimeout(2000);
await screenshot(page, 'step-02-repository-detail', { waitMs: 2000, fullPage: true });

// ===== Step 4-5: Actor =====
console.log('Step 4-5: Actor');
await page.goto(`${BASE}/actor/browse`, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'step-04-actor-browse', { waitMs: 2000 });

// Click on Yamada Hanako to navigate to detail page
try {
  const actorLink = await page.$eval('a:has-text("山田花子")', el => el.href);
  console.log(`  Actor link: ${actorLink}`);
  await page.goto(actorLink, { waitUntil: 'networkidle', timeout: 30000 });
} catch {
  await page.click('text=山田花子', { timeout: 5000 });
  await page.waitForTimeout(3000);
}
await screenshot(page, 'step-05-actor-detail', { waitMs: 2000, fullPage: true });

// ===== Step 6-7: Accession =====
console.log('Step 6-7: Accession');
await page.goto(`${BASE}/accession/browse`, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'step-06-accession-browse', { waitMs: 2000 });

// Click on accession to navigate to detail page
try {
  const accLink = await page.$eval('a:has-text("2026-003"), a:has-text("山田花子寄贈")', el => el.href);
  console.log(`  Accession link: ${accLink}`);
  await page.goto(accLink, { waitUntil: 'networkidle', timeout: 30000 });
} catch {
  await page.goto(`${BASE}/index.php/accession/show/slug/2026-003`, { waitUntil: 'networkidle', timeout: 30000 });
}
await screenshot(page, 'step-07-accession-detail', { waitMs: 2000, fullPage: true });

// ===== Step 8-10: Taxonomy =====
console.log('Step 8-10: Taxonomy');
await page.goto(`${BASE}/taxonomy/browse`, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'step-08-taxonomy-browse', { waitMs: 2000 });

await page.goto(`${BASE}/taxonomy/browse?taxonomy=35`, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'step-09-taxonomy-subjects', { waitMs: 2000 });

// ===== Step 11-12: Information Object + Digital Object =====
console.log('Step 11-12: Information Object');
await page.goto(`${BASE}/informationobject/browse`, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'step-11-io-browse', { waitMs: 2000 });

// Navigate to the IO with digital object
await page.goto(`${BASE}/1`, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'step-12-io-digitalobject', { waitMs: 2000, fullPage: true });

// ===== Step 13: Final state =====
console.log('Step 13: Final state');
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'step-13-final', { waitMs: 2000 });

// ===== Extra: Functions =====
console.log('Extra: Functions');
await page.goto(`${BASE}/function/browse`, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'extra-functions-browse', { waitMs: 2000 });

// ===== Extra: Admin > Plugins =====
console.log('Extra: Admin Plugins');
await page.goto(`${BASE}/sfPluginAdminPlugin/plugins`, { waitUntil: 'networkidle', timeout: 30000 });
await screenshot(page, 'extra-admin-plugins', { waitMs: 2000 });

await browser.close();
console.log('\nAll AtoM screenshots captured!');
