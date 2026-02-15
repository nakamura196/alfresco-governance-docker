import { chromium } from 'playwright';

const BASE = 'http://localhost:63001';
const SCREENSHOTS = '/Users/nakamura/git/hashimoto/alfresco/screenshots';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Login via navbar dropdown
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');

  // Open the login dropdown
  await page.click('#user-menu');
  await page.waitForTimeout(300);

  // Fill navbar login form
  await page.fill('input[name="email"].form-control-sm', 'demo@example.com');
  await page.fill('input[name="password"].form-control-sm', 'demo');

  // Click the submit button inside the dropdown
  await page.locator('form >> button:has-text("Log in")').first().click();
  await page.waitForLoadState('networkidle');

  // Debug: check login state
  const url = page.url();
  console.log(`After login: url="${url}"`);
  await page.screenshot({ path: `${SCREENSHOTS}/debug-login-after.png` });

  const loggedIn = await page.locator('text=demo').count();
  console.log(`Logged in: ${loggedIn > 0}`);

  const screenshots = [
    {
      name: 'step-03-repository-contact',
      url: `${BASE}/index.php/ayya-htm3-5wkd`,
      desc: 'Repository detail with contact info',
    },
    {
      name: 'extra-functions-browse',
      url: `${BASE}/index.php/function/browse`,
      desc: 'Functions browse page',
    },
    {
      name: 'extra-functions-detail',
      url: `${BASE}/index.php/nk6h-b7tf-3h7n`,
      desc: 'Function detail',
    },
    {
      name: 'extra-subjects-browse',
      url: `${BASE}/index.php/subjects`,
      desc: 'Subjects taxonomy browse',
    },
    {
      name: 'extra-places-browse',
      url: `${BASE}/index.php/places`,
      desc: 'Places taxonomy browse',
    },
    {
      name: 'extra-io-hierarchy',
      url: `${BASE}/index.php/2w49-r69d-tbpt`,
      desc: 'IO hierarchy (Fonds)',
    },
    {
      name: 'extra-repository-logo',
      url: `${BASE}/index.php/repository/browse`,
      desc: 'Repository browse with logo',
    },
  ];

  for (const s of screenshots) {
    try {
      await page.goto(s.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOTS}/${s.name}.png`, fullPage: true });
      console.log(`OK: ${s.name} - ${s.desc}`);
    } catch (e) {
      console.log(`FAIL: ${s.name} - ${e.message}`);
    }
  }

  await browser.close();
  console.log('Done');
}

main().catch(e => { console.error(e); process.exit(1); });
