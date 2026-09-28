# Vitesse for Nuxt 4 — 二次开发原则与构建/部署操作手册

> 配套文档：技术栈与功能分析见 [info.md](./info.md)
> 源码仓库：https://github.com/antfu/vitesse-nuxt
> 本地路径：`/data/project/frontend/vitesse-nuxt`

---

## 一、二次开发应遵循的原则

### 1. 顺应 Nuxt 4 约定，不要手写脚手架

本项目启用了 `future.compatibilityVersion: 4`，即 **Nuxt 4 目录约定**。二次开发请严格沿用：

- 前端源码放 `app/`（`srcDir`），服务端代码放 `server/`，**不要**把页面/组件挪回根目录。
- 页面放 `app/pages/`，组件放 `app/components/`，布局放 `app/layouts/`，组合式函数放 `app/composables/`，常量放 `app/constants/`，配置放 `app/config/`。
- 新增 API 放 `server/api/`（自动成为 `/api/...` 路由）；新增中间件放 `app/middleware/`，插件放 `app/plugins/`。

**原则**：能用文件约定解决的就别写配置代码——这是 Nuxt 的核心哲学，也是这个模板的价值所在。

### 2. 信任自动导入，不要手写 import

模板开启了组件、composables、Nuxt/Vue/VueUse API 的自动导入：

- `app/components/` 下的 `.vue` 直接在模板里用（`<MyWidget />`），**不要** `import MyWidget from ...`。
- `app/composables/` 导出的 `useXxx` 直接调用，**不要** import。
- `ref`、`computed`、`useFetch`、`useHead`、`useRouter`、`useRoute`、`useOnline`、`useTimeAgo`、`useState` 等都无需 import。

**注意**：自动导入基于目录与命名约定，composables 必须以 `use` 开头才会被识别；组件名按文件路径 PascalCase 推导（如 `app/components/Form/Input.vue` → `<FormInput />`）。

### 3. 路由用文件，布局用 `definePageMeta`

- 新增页面即新增 `app/pages/` 下的 `.vue` 文件；动态路由用 `[param]`，catch-all 用 `[...slug]`。
- 指定布局：在页面 `<script setup>` 里写 `definePageMeta({ layout: 'home' })`（参考 `app/pages/index.vue`）。
- `app.vue` 已经是 `<NuxtLayout><NuxtPage /></NuxtLayout>` 的结构，**不要**破坏这个外壳。

### 4. 状态管理：轻量用 `useState`，复杂用 Pinia

模板演示了两种正确范式，按场景选择：

- **跨组件 + SSR 友好的简单共享状态** → 用 Nuxt `useState('key', init)`（见 `app/composables/count.ts`）。`useState` 会自动在服务端与客户端间序列化同步，避免 hydration 不一致。
- **有逻辑聚合的 store** → 用 Pinia setup store（见 `app/composables/user.ts`），并务必保留：

  ```ts
  if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
  ```

  这两行保证开发时改 store 代码不丢状态。Pinia store 建议放在 `app/composables/` 或 `app/stores/`（若新建该目录，需确保 `@pinia/nuxt` 的 `storesDirs` 配置覆盖，默认含 `stores/`）。

**反模式**：用模块级全局变量存状态（如直接 `const state = ref(...)` 暴露），在 SSR 下会跨请求串状态。

### 5. 样式一律走 UnoCSS，别引入额外 CSS 框架

- 用原子类 + 属性化写法（`<div text="xl gray4" m-5 flex="~ gap3">`），复杂组合用 `uno.config.ts` 的 `shortcuts` 定义复合类（参考 `btn`、`icon-btn`）。
- 图标用 `i-<集合>-<名>`（如 `i-carbon-add`、`i-twemoji:waving-hand`），不要装额外图标库；新增图标集就装对应 `@iconify-json/<集>` 并在 `uno.config.ts` 里默认即可被 `presetIcons` 识别。
- **不要**引入 Tailwind、Bootstrap 等——UnoCSS 的 `presetWind4` 已覆盖 Tailwind 风格语法。
- 暗色用 `dark:` 变体，依赖 `@nuxtjs/color-mode` 注入的 `.dark` class，不要自己监听媒体查询。
- 字体已配 DM Sans/Serif/Mono，走 `presetWebFonts`；如换品牌字体改 `uno.config.ts` 即可。

### 6. 依赖管理：走 pnpm catalog，不要在 package.json 写死版本

- 本项目用 pnpm **catalog** 统一版本（`pnpm-workspace.yaml` 的 `build`/`dev`/`frontend`/`icons` 四个目录），`package.json` 里是 `"catalog:build"` 这种引用。
- **新增依赖**：先在 `pnpm-workspace.yaml` 对应 catalog 加 `包名: ^版本`，再在 `package.json` 写 `"包名": "catalog:xxx"`，最后 `pnpm install`。或直接 `pnpm add <pkg>` 后手工把版本回填进 catalog（推荐用 VS Code 的 `antfu.pnpm-catalog-lens` 扩展可视化操作）。
- `resolutions` 统一了 `nuxt`/`vite`/`@nuxt/kit`/`chokidar`/`semver`/`unplugin` 的版本，**不要**随意删除，否则易出现多版本冲突。
- 包管理器固定为 `pnpm@10.32.1`（`packageManager` 字段 + corepack），**不要**用 npm/yarn，会破坏 lockfile 与 catalog。
- `pnpm-workspace.yaml` 顶部有 `shamefullyHoist: true`、`shellEmulator: true` 等 .npmrc 等价配置，迁移或新增脚本时需留意。

### 7. 代码规范：ESLint 是唯一事实源，禁用 Prettier

- 统一用 `@antfu/eslint-config`，**不要**引入 Prettier（`.vscode/settings.json` 已 `prettier.enable: false`）。
- 保存自动修复已在 `.vscode/settings.json` 配好（`source.fixAll.eslint: explicit`）；命令行用 `pnpm lint`。
- 提交前务必过 `pnpm lint` 与 `pnpm typecheck`（CI 对 `main` 分支会跑这两项）。
- 新增 Nuxt 模块时，若需要特殊 ESLint 处理，优先在 `eslint.config.js` 里通过 antfu 的选项配置，而不是另起一套规则。

### 8. TypeScript：保持类型完整

- `tsconfig.json` 用 project references 指向 `.nuxt/` 下由 `nuxt prepare` 生成的四个 tsconfig，**不要**手改根 tsconfig 的内容，也不要把 `.nuxt/` 纳入版本控制（已在 `.gitignore`）。
- 拉取代码后先 `pnpm install` 再 `pnpm prepare`（生成 `.nuxt/` 类型），否则类型检查与 IDE 提示会失效。
- 路由带类型（`experimental.typedPages: true`），`useRoute<'hi-id'>()` 这种写法可用，新增页面后类型会自动更新（需重新 `prepare`）。
- 严格模式由 Nuxt 生成的 tsconfig 控制，尽量补全类型，别用 `any` 绕过。

### 9. SSR 意识：区分服务端与客户端

- 代码默认在服务端与客户端都跑。访问 `window`/`document`/`navigator` 等 DOM API 时，必须包在 `onMounted`、`ClientOnly` 或 `import.meta.client` 判断里。
- 需要客户端才渲染的组件用 `<ClientOnly>`（参考 `app/pages/index.vue` 对 `PageView` 的处理，含 `#fallback` 骨架）。
- 调用浏览器 API 的组合式函数优先从 VueUse 找（`useOnline`、`useTimeAgo` 等），它们已处理 SSR 兼容。

### 10. PWA 与预渲染的耦合点

- `nuxt.config.ts` 里 `experimental.payloadExtraction: false` 是为了配合 `generate`（静态导出）时 PWA 离线不缺资源，**不要**盲目改回 `true`。
- `nitro.prerender` 当前只预渲染 `/`，并忽略 `/hi`；新增需要静态化的路由要手动加到 `routes`，或开启 `crawlLinks: true` 让 Nuxt 爬取链接。
- PWA 开发模式默认关闭，调试 Service Worker 用 `pnpm dev:pwa`（`VITE_PLUGIN_PWA=true`）。
- 改 PWA 配置在 `app/config/pwa.ts`，不要散落到 `nuxt.config.ts`。

---

## 二、环境准备

| 项 | 要求 | 说明 |
| --- | --- | --- |
| Node.js | **≥ 20**（推荐 20 LTS；本地实测 24 亦可） | Dockerfile / netlify 都用 20；CI 用 `lts/*` |
| 包管理器 | **pnpm 10.32.1** | 用 corepack 锁定：`corepack enable` 后 `pnpm -v` 应为 10.32.1 |
| 编辑器 | VS Code + Volar | 见 `.vscode/extensions.json` 推荐扩展 |

首次拉取：

```bash
corepack enable            # 启用 corepack（保证 pnpm 版本与 packageManager 字段一致）
pnpm install               # 按 pnpm-lock.yaml 安装（含 catalog 解析）
pnpm prepare               # nuxt prepare：生成 .nuxt/ 类型与配置（IDE/类型检查依赖它）
```

> `.nuxt/`、`.output/`、`node_modules/`、`dist`、`.env` 均在 `.gitignore`，不要提交。

---

## 三、开发与热更新（HMR）命令

### 1. 启动开发服务器

```bash
pnpm dev          # nuxt dev，默认 http://localhost:3000，Vite HMR
```

- 改 `.vue`/`.ts` 等源码即时热替换，**无需重启**。
- Pinia store 接了 `acceptHMRUpdate`，改 store 不丢状态。
- **改 `nuxt.config.ts`、`uno.config.ts`、`eslint.config.js`、`pnpm-workspace.yaml`（依赖增减）需要重启 dev server**——这些是启动期读取的配置。
- 改 `app/config/pwa.ts` 也需重启（dev 阶段 PWA 默认关闭，仅 `dev:pwa` 时生效）。

### 2. PWA 开发模式（调试 Service Worker / 离线）

```bash
pnpm dev:pwa      # VITE_PLUGIN_PWA=true nuxt dev
```

仅此命令会在 dev 下注册 SW，便于调试离线缓存与自动更新行为。

### 3. 代码质量（建议提交前必跑）

```bash
pnpm lint         # eslint . —— 检查并自动修复风格
pnpm typecheck    # nuxt typecheck —— vue-tsc 全量类型检查
pnpm prepare      # 新增页面/模块/依赖后，重新生成 .nuxt 类型（IDE 提示更新）
```

### 4. 常用组合

```bash
pnpm install && pnpm prepare && pnpm dev     # 全新环境一键起开发
pnpm lint && pnpm typecheck                  # 提交前自检
```

> **HMR 限制提示**：新增/删除文件（新页面、新组件、新 composables）一般会被 Nuxt 自动识别并热加载；但若自动导入未生效，先 `pnpm prepare` 再重启 `pnpm dev`。

---

## 四、打包命令

### 1. SSR 生产构建（默认，推荐用于动态站点）

```bash
pnpm build        # nuxt build → 产出 .output/
```

产物：

- `.output/server/index.mjs` — 独立 Node 服务入口
- `.output/public/` — 静态资源
- 运行：`pnpm start` → `node .output/server/index.mjs`（默认监听 3000，可用 `PORT=xxxx` 改）

### 2. 静态站点生成（SSG，适合纯静态/PWA 站点）

```bash
pnpm generate     # nuxt generate → 产出 .output/public/
pnpm start:generate   # npx serve .output/public  本地预览静态产物
```

注意：当前 `nitro.prerender` 只生成 `/` 并忽略 `/hi`，做 SSG 时需在 `nuxt.config.ts` 补充要预渲染的路由，或开启 `crawlLinks: true`。

### 3. 本地预览 build 产物

```bash
pnpm preview      # nuxt preview，本地起服务预览 .output
```

### 4. 生产环境变量

- 运行时配置走 Nuxt 的 `runtimeConfig`（如需新增，在 `nuxt.config.ts` 定义，可用 `.env` 覆盖，前缀 `NUXT_`）。
- 构建期变量用 `process.env`（参考 `app/config/pwa.ts` 里对 `VITE_PLUGIN_PWA` 的读取）。
- `.env` 已被 gitignore，按环境自行维护；不要把密钥写进代码或 catalog。

---

## 五、部署通道

### 1. Docker（已内置 `Dockerfile`，推荐生产 SSR）

```bash
# 构建镜像
docker build -t vitesse-nuxt-app .

# 运行容器（映射 3000）
docker run -d -p 3000:3000 --name vitesse-nuxt vitesse-nuxt-app
```

流程：`node:20-alpine` → `corepack enable` → `pnpm install --frozen-lockfile`（带 pnpm-store 缓存挂载）→ `pnpm build` → 运行阶段只拷贝 `.output` → `node .output/server/index.mjs`，暴露 3000。

> 生产建议加：健康检查、非 root 用户、`NODE_ENV=production`、`PORT` 与日志输出配置。

### 2. Netlify（已内置 `netlify.toml`）

```bash
# netlify.toml 当前配置：
# command = "pnpm run build"
# publish  = "dist"          ⚠️ 历史遗留
```

**注意**：`netlify.toml` 里 `publish = "dist"` 与 Nuxt 实际产物目录 `.output/public`（SSG）或 SSR 部署方式不一致。二次开发上线前请按目标平台校正：

- 若走 **静态导出**：用 `pnpm generate`，并把 `publish` 改为 `.output/public`，`command` 改为 `pnpm run generate`。
- 若走 **SSR**：Netlify 需用 Nitro 的 netlify preset（`NITRO_PRESET=netlify` 或在 `nuxt.config.ts` 的 `nitro.preset` 指定），`nuxt build` 会产出 Netlify Functions，`publish` 留空或按 Netlify Nuxt 文档设置。

### 3. Vercel / Cloudflare / 其他平台

Nuxt Nitro 自带多平台 preset，在 `nuxt.config.ts` 指定即可：

```ts
nitro: {
  preset: 'vercel',          // 或 'cloudflare-pages'、'netlify'、'node-server' 等
}
```

或用环境变量 `NITRO_PRESET=vercel pnpm build`。各平台的发布目录与命令以 Nitro 官方文档为准。

### 4. 纯 Node SSR（VPS / 自建）

```bash
pnpm build
node .output/server/index.mjs         # 或 PORT=8080 node .output/server/index.mjs
# 建议用 pm2 / systemd 守护：
pm2 start .output/server/index.mjs --name vitesse-nuxt
```

---

## 六、热部署 / 滚动更新实践

Nuxt SSR 是无状态 Node 服务（状态在 `useState`/Pinia 里按请求/实例隔离），便于热部署：

1. **构建新镜像**：CI 跑 `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm build`，产出 `.output` 并打包 Docker 镜像。
2. **滚动更新**（Docker / k8s）：新容器起来健康检查通过后，流量切到新容器，再下线旧容器。SSR 无状态，可直接替换。
3. **PWA 自动更新**：`registerType: 'autoUpdate'` 会让浏览器检测到新 SW 后自动激活；上线新版本后用户下次访问会拿到新资源。注意 Workbox 预缓存 glob 为 `**/*.{js,css,html,txt,png,ico,svg}`，新增其他类型静态资源（如 `.woff2` 字体）时需同步更新 `app/config/pwa.ts` 的 `globPatterns`。
4. **回滚**：切回旧镜像/旧 `.output` 即可；PWA 侧若新版本有问题，用户需清缓存或等下次 SW 更新，建议关键变更配合版本号可见化。

> 本地“热更新”指开发期 HMR（见第三节）；生产“热部署”指无停机替换实例，二者概念不同，不要混淆。

---

## 七、二次开发 Checklist（新增功能时对照）

- [ ] 页面放在 `app/pages/`，文件名即路由；动态段用 `[id]`。
- [ ] 组件放 `app/components/`，直接在模板用，不写 import。
- [ ] 组合式函数放 `app/composables/`，命名 `useXxx`，自动导入。
- [ ] 状态：简单共享用 `useState`，复杂逻辑用 Pinia（带 HMR 那两行）。
- [ ] 样式用 UnoCSS 原子类 / `shortcuts`，不引外部 CSS 框架；图标用 `i-<集>-<名>`。
- [ ] 暗色用 `dark:` 变体，不手写媒体查询。
- [ ] SSR 安全：DOM API 包 `ClientOnly`/`onMounted`/`import.meta.client`。
- [ ] 新依赖：加进 `pnpm-workspace.yaml` catalog，`package.json` 引用 `catalog:xxx`，`pnpm install` 后重启 dev。
- [ ] 改 `nuxt.config.ts` / `uno.config.ts` / 依赖后重启 `pnpm dev`；新增页面/模块后 `pnpm prepare`。
- [ ] 提交前 `pnpm lint && pnpm typecheck`。
- [ ] 静态导出新路由 → 更新 `nitro.prerender.routes` 或开 `crawlLinks`。
- [ ] 新增静态资源类型 → 更新 PWA `workbox.globPatterns`。

---

## 八、常用命令速查表

| 命令 | 实际执行 | 用途 |
| --- | --- | --- |
| `pnpm install` | — | 按 lockfile 安装依赖（解析 catalog） |
| `pnpm prepare` | `nuxt prepare` | 生成 `.nuxt/` 类型与配置（IDE/类型依赖） |
| `pnpm dev` | `nuxt dev` | 开发服务器 + HMR（:3000） |
| `pnpm dev:pwa` | `VITE_PLUGIN_PWA=true nuxt dev` | 开发 + PWA/SW 调试 |
| `pnpm build` | `nuxt build` | SSR 生产构建 → `.output` |
| `pnpm generate` | `nuxt generate` | 静态导出 → `.output/public` |
| `pnpm start` | `node .output/server/index.mjs` | 运行 SSR 产物（:3000） |
| `pnpm start:generate` | `npx serve .output/public` | 预览静态产物 |
| `pnpm preview` | `nuxt preview` | 本地预览 build 产物 |
| `pnpm lint` | `eslint .` | 检查并自动修复风格 |
| `pnpm typecheck` | `nuxt typecheck` | vue-tsc 全量类型检查 |
| `docker build -t name .` | — | 构建 SSR 镜像 |
| `docker run -p 3000:3000 name` | — | 运行容器 |
