/**
 * 用户档案
 *
 * UI 测试严格区分两种登录身份：
 *   - tenantAdmin：演示商户管理员，看到完整业务菜单（采购/销售/库存/...）
 *   - platformAdmin：平台管理员，看平台菜单
 *
 * 登录成功后，主菜单（el-menu）会渲染一组固定字面量：
 *   工作台、采购单、销售单、库存 ...
 * 我们用"工作台"作为登录成功的统一标志（两种身份都看得到）。
 */
export interface UserProfile {
  userName: string;
  password: string;
  /** 登录成功后期望看到的某个页面特征（用来断点确认登录成功） */
  expectAfterLogin: RegExp;
}

export const tenantAdmin: UserProfile = {
  userName: process.env.VERP_E2E_USER ?? 'admin',
  password: process.env.VERP_E2E_PASSWORD ?? 'Admin@123',
  expectAfterLogin: /工作台/,
};

export const platformAdmin: UserProfile = {
  userName: process.env.VERP_E2E_PLATFORM_USER ?? 'platform',
  password: process.env.VERP_E2E_PLATFORM_PASSWORD ?? 'Admin@123',
  expectAfterLogin: /工作台/,
};