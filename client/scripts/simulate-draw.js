#!/usr/bin/env node
import puppeteer from 'puppeteer';

const APP_URL = process.env.APP_URL || 'http://localhost:6969';

async function positionWindowForPage(page, { left, top, width, height }) {
  try {
    const session = await page.target().createCDPSession();
    const { windowId } = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {
      windowId,
      bounds: { left, top, width, height, windowState: 'normal' },
    });
  } catch (err) {
    console.warn('Unable to position window (continuing):', err.message || err);
  }
}

async function login(page, name) {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input#name', { timeout: 10000 });
  await page.type('input#name', name, { delay: 20 });
  await page.click('button[type="submit"]');
  await page.waitForSelector('canvas', { timeout: 10000 });
}

async function dispatchOnCanvas(page, type, x, y, pressed) {
  // x,y are in canvas coordinates; we translate to client coords here
  await page.$eval('canvas', (canvas, { type, x, y, pressed }) => {
    const rect = canvas.getBoundingClientRect();
    const eventInit = {
      bubbles: true,
      cancelable: true,
      clientX: Math.round(rect.left + x),
      clientY: Math.round(rect.top + y),
      buttons: pressed ? 1 : 0,
    };
    const evt = new MouseEvent(type, eventInit);
    canvas.dispatchEvent(evt);
  }, { type, x, y, pressed });
}

async function drawInterleaved(pageA, pageB) {
  // Ensure canvas exists and is visible
  await pageA.waitForSelector('canvas', { timeout: 10000, visible: true });
  await pageB.waitForSelector('canvas', { timeout: 10000, visible: true });
  await pageA.evaluate(() => document.querySelector('canvas')?.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await pageB.evaluate(() => document.querySelector('canvas')?.scrollIntoView({ block: 'center', behavior: 'instant' }));

  // Patterns are defined in canvas coordinate space (600x600)
  const radius = 180;
  const centerAX = 300;
  const centerAY = 300;
  const startAX = centerAX + radius;
  const startAY = centerAY;
  await dispatchOnCanvas(pageA, 'mousedown', startAX, startAY, true);

  const startBX = 60;
  const startBY = 300;
  await dispatchOnCanvas(pageB, 'mousedown', startBX, startBY, true);

  const totalSteps = 360;
  for (let i = 0; i < totalSteps; i++) {
    const angle = (i / totalSteps) * Math.PI * 2;
    const ax = centerAX + radius * Math.cos(angle);
    const ay = centerAY + radius * Math.sin(angle);
    await dispatchOnCanvas(pageA, 'mousemove', ax, ay, true);

    const bx = 60 + (i * (600 - 120)) / totalSteps;
    const by = 300 + (600 / 3) * Math.sin(i / 10);
    await dispatchOnCanvas(pageB, 'mousemove', bx, by, true);

    await new Promise((r) => setTimeout(r, 6));
  }

  await dispatchOnCanvas(pageA, 'mouseup', centerAX, centerAY, false);
  await dispatchOnCanvas(pageB, 'mouseup', 540, 300, false);
}

async function main() {
  // Launch two separate Chromium windows so you can see both side-by-side
  const browserA = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--disable-infobars'],
  });
  const browserB = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--disable-infobars'],
  });

  const pageA = await browserA.newPage();
  const pageB = await browserB.newPage();

  // Position both windows to equal halves of the primary screen
  const screen = await pageA.evaluate(() => ({
    width: window.screen.availWidth,
    height: window.screen.availHeight,
  }));
  const halfWidth = Math.max(400, Math.floor(screen.width / 2));
  const height = Math.max(600, screen.height - 48);
  await positionWindowForPage(pageA, { left: 0, top: 24, width: halfWidth, height });
  await positionWindowForPage(pageB, { left: halfWidth, top: 24, width: screen.width - halfWidth, height });

  await login(pageA, 'Alice');
  await login(pageB, 'Bob');

  // Give the app a moment to connect both players
  await new Promise((r) => setTimeout(r, 800));

  await drawInterleaved(pageA, pageB);

  console.log('\nSimulated drawing complete. Windows will stay open. Press Ctrl+C to exit.');
  // Keep process alive so you can inspect both windows
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await new Promise((r) => setTimeout(r, 1000));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


