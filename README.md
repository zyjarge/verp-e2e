# Verp E2E (Playwright)

Verp 端到端 UI 测试套件，**独立仓库**（与 `Verp` 平级）。

## 设计原则

- **测试代码不负责拉起被测程序**（按你的明确要求）
- 范围：**只测 UI**，不调后端 API
- 数据策略：**不重置数据库**，每次跑测试数据自然累积（当前用例都是结构性断言，无影响）
- 失败时：自动保留 trace / video / screenshot

## 目录结构

```
Verp_test/
├── playwright.config.ts         # 主配置
├── .env.example                 # 环境变量样板（复制为 .env 后填值）
├── src/
│   ├── setup/                   # global-setup / global-teardown
│   ├── fixtures/                # 自定义 fixture（loggedInPage / users）
│   └── pages/                   # 页面对象（POM）
└── tests/
    ├── smoke/                   # 健康检查（登录 + 菜单）
    └── e2e/                     # 业务流（采购/销售/取消）
```

## 跑前准备（一次性）

```bash
# 1. 装依赖
npm install

# 2. 装 Chromium
npx playwright install --with-deps chromium

# 3. 复制 .env
cp .env.example .env
# 编辑 .env，至少改 VERP_WEB_URL
```

## 启动被测目标

测试代码**不会**自动拉起 Verp。你需要：

- **本地开发**：另开终端跑 `dotnet run`（API）+ `npm run dev`（前端）
- **CI**：`.github/workflows/e2e.yml` 里在"跑 Playwright"前先起服务
- **远程测试环境**：直接填 `VERP_WEB_URL=https://verpapi.duodutech.com`

## 跑测试

```bash
# 全部
npm test

# 跑某一条
npx playwright test tests/smoke/login.spec.ts

# 有头模式（看浏览器）
npm run test:headed

# UI 模式（看 trace / step 时间线）
npm run test:ui

# 自动生成新用例
npm run test:codegen
```

## 报告

```bash
npm run report
```

HTML 报告在 `playwright-report/`。失败用例的 trace / video / 截图在 `test-results/`。

## 写新用例

参考 `tests/smoke/login.spec.ts` 和 `tests/e2e/purchase-sale-cancel.spec.ts`：

```ts
import { test, expect } from '../../src/fixtures';

test('你的场景', async ({ loggedInPage: page }) => {
  // fixture 已经帮你登录好了，直接写业务步骤
});
```

新页面 → 新建 `src/pages/XxxPage.ts`（POM）。
新账号 → 加到 `src/fixtures/users.ts`。

## 加进 CI

见 `.github/workflows/e2e.yml`。需要的 secrets：

- `VERP_WEB_URL`：被测 URL
- `VERP_E2E_USER` / `VERP_E2E_PASSWORD`：登录账号

## 失败自动开 Issue

CI workflow 集成了"失败 → 自动创建 / 更新 GitHub Issue"：

- **触发条件**：push 到 `main` 分支 + workflow 失败
- **去重策略**：按 commit SHA 7 位前缀查已有 open issue
  - 没找到 → 新建 issue，标题 `❌ E2E failed on main @ <sha7>`
  - 找到 → 在已有 issue 下评论"又失败了 @ run #xxx"
- **标签**：`bug` + `e2e`；若错误信息含 `Timeout` 额外加 `flaky`
- **issue 内容**：commit / run URL / 错误位置 / artifact 下载链接 / 复现步骤

第一次跑前需要：

1. GitHub repo → Settings → Labels 里有 `bug` 和 `e2e` 两个标签（没有就在 Issues 页面手动建一下，否则 `issues.create` 报错）
2. workflow 有默认 `GITHUB_TOKEN` 权限，但创建/更新 issue 需要勾选 **Settings → Actions → General → Workflow permissions → Read and write permissions**

## 故障排查

| 现象 | 原因 | 处理 |
|---|---|---|
| `getaddrinfo ENOTFOUND verpapi.duodutech.com` | 目标环境不通 | 检查 DNS / VPN / 公司内网 |
| 登录后白屏 / 401 | token 写到了错的 key | 看 `src/stores/auth.js`，确认是 `localStorage.setItem('token', ...)` |
| 菜单项找不到 | Element Plus el-menu 文本在 `<span>` 里 | 用 `page.getByText('工作台').first()` 而不是 `getByRole` |

## 数据策略

**E2E 不清数据库**。多次跑测试之间的数据残留是允许的，因为：

- 当前用例都是结构性断言（"页面渲染"、"菜单有这个项"、"URL 跳对了"）
- 不断言"采购单从 N 条变成 N+1 条"这种数据流
- 哪天写了数据断言再考虑加 DB 重置（届时需要解决"测试代码不拉被测对象"与"需要 DB 连接"的边界）