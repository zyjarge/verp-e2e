import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const HEADLESS = (process.env.HEADLESS ?? 'true') !== 'false';
const CI = process.env.CI === 'true';

/**
 * Playwright 配置
 *
 * 设计原则：
 *   - 测试代码不负责拉起被测程序（按你的明确要求）
 *   - webServer 已移除；要求目标环境已可访问（CI 由 workflow 起，本地你手动起）
 *   - DB 通过 TEST_DATABASE_URL 配置，独立于开发库
 *   - 失败时保留 trace / video / screenshot，方便复现
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: process.env.VERP_WEB_URL ?? 'https://verpapi.duodutech.com',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    headless: HEADLESS,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});