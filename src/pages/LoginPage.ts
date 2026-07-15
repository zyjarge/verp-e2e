import { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { UserProfile } from '../fixtures/users';

/**
 * 登录页 POM
 *
 * 实际 DOM 来自 Verp Login.vue：
 *   <el-input v-model="form.userName" placeholder="用户名" />
 *   <el-input v-model="form.password" type="password" placeholder="密码" />
 *   <el-button>登录</el-button>
 *
 * Element Plus 的 el-input 在 DOM 里最终渲染为 <input>，
 * 没有 <label> 关联，所以我们用 placeholder 定位更稳。
 */
export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByPlaceholder('用户名');
    this.password = page.getByPlaceholder('密码');
    this.submit = page.getByRole('button', { name: '登录' });
    this.errorToast = page.locator('.el-message--error, .el-notification--error').first();
  }

  async goto() {
    await this.page.goto('/login');
    await this.username.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
  }

  /** 等错误提示出现，最多 5 秒；返回错误文案 */
  async waitForError(): Promise<string> {
    const toast = this.errorToast;
    await toast.waitFor({ state: 'visible', timeout: 5_000 });
    return (await toast.innerText()).trim();
  }

  /** 断言登录失败：URL 仍在 /login + 错误 toast 可见 */
  async assertLoginFailed() {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.errorToast).toBeVisible({ timeout: 5_000 });
  }

  /** 登录成功：URL 离开 /login + 主菜单渲染 */
  async assertLoginSuccess(user: UserProfile) {
    await expect(this.page).not.toHaveURL(/\/login$/);
    // 侧边栏菜单的某个期望项至少出现一个
    await expect(this.page.locator('body')).toContainText(user.expectAfterLogin);
  }
}