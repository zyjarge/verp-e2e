import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

/**
 * 登录失败冒烟测试
 *
 * 覆盖三种错误输入：
 *   1. 用户名错（admin 不存在）+ 密码对
 *   2. 用户名对 + 密码错
 *   3. 用户名错 + 密码错
 *
 * 断言：
 *   - URL 仍在 /login（没跳走）
 *   - Element Plus 错误 toast 可见（.el-message--error）
 *   - 错误 toast 文本非空（后端 message 至少有内容）
 *
 * 故意不复用 loggedInPage fixture（它默认登录成功）。
 */

const BAD_USER = 'definitely_no_such_user';
const GOOD_USER = 'admin';
const GOOD_PASS = 'Admin@123';
const BAD_PASS = 'WrongPass_9999';

async function attempt(page: Page, user: string, pass: string) {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(user, pass);
  await login.assertLoginFailed();
  const msg = await login.waitForError();
  return { login, msg };
}

test.describe('登录失败冒烟', () => {
  test('用户名错 + 密码对 → 看到错误提示', async ({ page }) => {
    const { msg } = await attempt(page, BAD_USER, GOOD_PASS);
    expect(msg.length).toBeGreaterThan(0);
    expect(msg.toLowerCase()).not.toContain('success'); // 防御：别让成功文案混进来
    console.log(`[case 1] error msg: "${msg}"`);
  });

  test('用户名对 + 密码错 → 看到错误提示', async ({ page }) => {
    const { msg } = await attempt(page, GOOD_USER, BAD_PASS);
    expect(msg.length).toBeGreaterThan(0);
    expect(msg.toLowerCase()).not.toContain('success');
    console.log(`[case 2] error msg: "${msg}"`);
  });

  test('用户名错 + 密码错 → 看到错误提示', async ({ page }) => {
    const { msg } = await attempt(page, BAD_USER, BAD_PASS);
    expect(msg.length).toBeGreaterThan(0);
    expect(msg.toLowerCase()).not.toContain('success');
    console.log(`[case 3] error msg: "${msg}"`);
  });
});