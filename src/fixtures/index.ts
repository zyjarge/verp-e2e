import { test as base, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { UserProfile, tenantAdmin } from './users';

/**
 * 自定义 fixtures
 *
 * 设计原则（按你的回答）：
 *   - 不调 API，所有认证走真实 UI 登录（确保测的就是用户视角）
 *   - 默认登录账号 = 商户管理员；要测平台管理员用 test.use({ user: platformAdmin })
 *
 * 对应教程：「Playwright Fixtures」
 *
 * 重要：loggedInPage 直接复用登录好的 page（不要 close 再 newPage，
 * 否则新 page 是 about:blank，丢失登录态 + baseURL）。
 */
type AuthFixtures = {
  loggedInPage: Page;
  loggedInContext: BrowserContext;
};

export const test = base.extend<AuthFixtures & { user: UserProfile }>({
  user: [tenantAdmin, { option: true }],

  loggedInContext: async ({ browser, user }, use) => {
    const ctx = await browser.newContext({
      baseURL: process.env.VERP_WEB_URL ?? 'https://verpapi.duodutech.com',
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
    });
    // 用一个临时 page 走完登录，登录完关掉（cookie / localStorage 留在 context 上）
    const loginPage = await ctx.newPage();
    const login = new LoginPage(loginPage);
    await login.goto();
    await login.login(user.userName, user.password);
    await login.assertLoginSuccess(user);
    await loginPage.close();
    await use(ctx);
    await ctx.close();
  },

  loggedInPage: async ({ loggedInContext }, use) => {
    // 每个 test 一个干净的新 page；context 已带 token，goto('/') 自动进 dashboard
    const page = await loggedInContext.newPage();
    await page.goto('/');
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';