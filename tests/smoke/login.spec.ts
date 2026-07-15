import { test, expect } from '../../src/fixtures';

/**
 * 冒烟：登录 + 工作台 + 主要菜单可见
 *
 * 这是整套 E2E 的"健康检查"。每个部署后跑这一条就能确认：
 *   1. 目标站点可访问
 *   2. 登录链路通畅
 *   3. 种子账号 + 权限菜单正确渲染
 *
 * 跑这条前请确认：
 *   - .env 已配置 VERP_WEB_URL 和测试账号
 *   - 目标环境已起好（CI 由 workflow 起，本地你手动起）
 */
test('smoke: 登录成功，菜单渲染', async ({ loggedInPage: page }) => {
  // fixture 已经把 page 停在 /dashboard
  await expect(page).toHaveURL(/\/ZZZ_FAKE_URL_FOR_PAGES_VERIFY$/); // 故意失败：验证 Pages 部署
  await expect(page.getByText('工作台').first()).toBeVisible();
  await expect(page.getByText('采购单').first()).toBeVisible();
  await expect(page.getByText('销售单').first()).toBeVisible();
  await expect(page.getByText('库存').first()).toBeVisible();
});