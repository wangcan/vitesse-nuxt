# 需求1：顶部导航栏（Header）与底部信息栏（Footer）

> 对标 https://nuxt.com/ 的顶部菜单导航栏与底部信息栏，适配本项目（vitesse-nuxt + vxe-table），同时支持 PC 与移动端、亮色/暗色主题。

## 需求来源

- 参考站点：https://nuxt.com/
- 参考源码：`/data/project/frontend/nuxt.com/`
- 目标：为本项目生成与 nuxt.com 一致的顶部 header 菜单导航栏与底部 footer 信息栏。

## 执行结果概览

| 类别 | 文件 | 说明 |
| --- | --- | --- |
| 新增组件 | `app/components/AppHeader.vue` | 顶部导航栏：Logo + 桌面端下拉菜单 + 主题切换 + GitHub Star + 移动端汉堡菜单 |
| 新增组件 | `app/components/AppFooter.vue` | 底部信息栏：分隔线 + 链接列 + 订阅表单 + 版权 + 社交图标 |
| 新增组件 | `app/components/NewsletterForm.vue` | 底栏订阅表单（本地邮箱校验 + 模拟提交反馈） |
| 新增组件 | `app/components/NuxtLogo.vue` | Nuxt 品牌 Logo（SVG，绿色三角形 #00DC82 + currentColor 适配明暗） |
| 新增 composable | `app/composables/useNavigation.ts` | 导航数据源：`useHeaderLinks` / `useFooterLinks` / `useSocialLinks` |
| 新增类型 | `app/types/navigation.ts` | 共享类型：`NavLink` / `NavLinkChild` / `FooterLinkColumn` / `SocialLink` |
| 调整布局 | `app/layouts/default.vue` | 改为 `AppHeader + main(flex-1) + AppFooter` 的粘性页脚结构 |
| 调整布局 | `app/layouts/home.vue` | 同上，首页布局保留居中内容区 |
| 调整入口 | `app/app.vue` | `height: 100vh` → `min-height: 100vh`，配合 flex 布局避免内容溢出裁切 |
| 调整样式 | `uno.config.ts` | 新增快捷类 `nav-link`、`header-icon-btn`（品牌绿、触控目标 ≥44px、暗色适配） |
| 调整依赖 | `package.json` / `pnpm-workspace.yaml` / `pnpm-lock.yaml` | 新增图标集 `@iconify-json/lucide`、`@iconify-json/simple-icons`（catalog: icons） |
| 删除组件 | `app/components/DarkToggle.vue` | 主题切换已内联到 `AppHeader`，独立组件不再需要 |
| 删除组件 | `app/components/Footer.vue` | 由 `AppFooter.vue` 替代 |

## 实现要点

### 1. 顶部导航栏（AppHeader）

- **结构对标 nuxt.com**：左侧 Logo → 中部主导航（首页 / 表格 / 资源 / 社区）→ 右侧操作区（主题切换、GitHub Star、汉堡菜单）。
- **桌面端（`lg:flex`）**：带 `children` 的链接渲染为点击式下拉菜单（`Transition` 动画 + `onClickOutside` 点击外部收起）；普通链接直接渲染。
- **移动端（`lg:hidden`）**：汉堡按钮触发的抽屉式菜单；带子项的链接用原生 `<details>` 折叠分组，无需额外 JS，触屏友好。
- **路由联动**：`watch(route.fullPath)` 在路由切换时自动收起移动菜单与下拉；`isActive` 判断当前路由高亮。
- **GitHub Star 数**：`useFetch` 仅客户端（`server: false`）拉取 `api.github.com/repos/antfu/vitesse-nuxt`，失败/未加载回退为 "Star"，不影响 SSR。
- **品牌主色**：green-600 / green-400（暗色），与 nuxt.com 的 #00DC82 一致。

### 2. 底部信息栏（AppFooter）

- **顶部装饰**：nuxt.com 风格的「双横线 + Nuxt 图标」分隔条。
- **链接列**：资源 / 社区 / 关于 三列（`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`），最后一列为订阅表单。
- **订阅表单**：`NewsletterForm.vue`，邮箱正则校验 + 模拟提交（`setTimeout`），预留 `useFetch('/api/newsletter/subscribe')` 替换点。
- **底栏**：版权 `2016-{当前年份}` + MIT License 链接 + 社交图标行（GitHub / X / BlueSky / Discord / LinkedIn）。

### 3. 数据与类型

- 导航数据集中在 `useNavigation.ts`，组件通过 `useHeaderLinks()` / `useFooterLinks()` / `useSocialLinks()` 获取，便于后续扩展。
- 「首页」「表格」为站内真实路由（`/`、`/table`），「资源」「社区」为带下拉的外部链接，内容已适配本项目实际集成的技术栈（Nuxt / vxe-table / UnoCSS / Vue 3 / Iconify）。
- 类型定义在 `app/types/navigation.ts`，前后端共享，`target` 限定为 `'_blank'` 字面量。

### 4. 响应式（PC + 移动端）

- 移动优先：先写移动端（汉堡菜单、单列/双列网格），再用 `sm:`(640) / `lg:`(1024) 断点增强到桌面端。
- 容器最大宽度 `max-w-7xl mx-auto`，左右内边距 `px-4 sm:px-6 lg:px-8`，无整页横向滚动。
- 触控目标 ≥ 44px：`min-h-11 min-w-11`（`header-icon-btn`、`nav-link`、订阅按钮、输入框均满足）。
- 桌面下拉 vs 移动折叠分组：避免 hover 菜单在触屏失效，移动端全部改为点击展开。

### 5. 暗色模式

- 全部关键可视元素覆盖 `dark:` 变体（`classSuffix: ''`，`html.dark` 触发）。
- header 使用 `dark:bg-[#020420]/80` 半透明背景 + `backdrop-blur-md`，对标 nuxt.com 暗色底色。
- 主题切换按钮图标 `i-lucide-sun dark:i-lucide-moon` 自动随主题切换。

### 6. 样式约定

- `uno.config.ts` 新增两个快捷类，避免组件内重复长串类名：
  - `nav-link`：导航链接基础样式（hover 背景 + 文字色 + 暗色适配）。
  - `header-icon-btn`：图标按钮（44px 触控目标 + hover 品牌绿）。
- 图标统一用 `i-lucide-*`（线性图标）与 `i-simple-icons-*`（品牌图标，如 GitHub / Nuxt / X / Discord）。

## 验证

- `pnpm typecheck`（vue-tsc）：通过，零报错。
- `pnpm lint`（eslint）：通过，零报错。
- 已确认无对已删除组件（`DarkToggle` / `Footer`）的残留引用。

## 自测断点建议

按 `.claude/rules/responsive.md` 在以下三档自测无溢出、无错位：
- ≥360px（小手机）：汉堡菜单 + 双列 footer 链接。
- 768px（平板）：三列 footer 链接。
- 1024px（桌面）：完整桌面导航 + 下拉菜单 + 四列 footer。

## 后续可扩展

- 订阅表单接入真实后端：`server/api/newsletter/subscribe.post.ts` + `useFetch`。
- 导航数据可改为由 `server/api` 或 `@nuxt/content` 提供，实现动态菜单。
- 按需新增站内路由（如 `/docs`、`/modules`）后，在 `useNavigation.ts` 中补充对应 `headerLinks` 即可。
