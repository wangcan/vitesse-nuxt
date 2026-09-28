# mcp.md — 项目 MCP 配置建议与说明

> 对应需求：`.requirements/ai/ai.txt` 中的 **需求2**（当前生效）。
>
> 需求：结合项目当前的技术栈，为项目配置几个 MCP，介绍各个 MCP 的特点和所起到的作用，结果存到 `.requirements/ai/mcp.md`（本文件）。

## 项目技术栈回顾

Nuxt 4（SSR + 文件路由）/ Vue 3 `<script setup lang="ts">` / UnoCSS（presetWind4、attributify、icons、typography、webfonts）/ Pinia / VueUse / `@nuxtjs/color-mode` / `@vite-pwa/nuxt` / TypeScript + vue-tsc / `@antfu/eslint-config` + `@nuxt/eslint` / Iconify（carbon、twemoji）/ pnpm workspace + catalog。

模块目标：图片展示浏览、古籍/小说阅读、简易百科、各类表格（vxe-table）、各类图表；**同时支持 PC 与移动端**。

基于以上，推荐以下 4 个 MCP，覆盖"响应式自测、实时文档查询、网页抓取、仓库协作"四个最贴合前端开发的场景。

## 推荐 MCP 一览

| MCP | 包名 | 核心能力 | 对本项目的价值 |
| --- | --- | --- | --- |
| Playwright | `@playwright/mcp` | 浏览器自动化：导航、点击、填表、**多视口截图**、性能 trace | 响应式 PC + 移动端布局自测、灯箱/阅读器交互验证 |
| Context7 | `@upstash/context7-mcp` | 查询**最新版本**的第三方库文档，返回可 cite 的代码片段 | Nuxt 4 / UnoCSS / vxe-table / ECharts API 易变，避免训练数据滞后 |
| Fetch | `@modelcontextprotocol/server-fetch` | 抓取任意 URL 转 markdown 供模型阅读 | 查 vxe-table GitHub、UnoCSS 文档、古籍素材等 |
| GitHub | `@modelcontextprotocol/server-github` | 仓库协作：issue / PR / 代码搜索 / CI 状态 / 文件读写 | 提 PR、查 issue、跨仓库搜索示例 |

---

## 各 MCP 详细说明

### 1. Playwright MCP — `@playwright/mcp`

**特点**
- 微软官方维护，基于 Playwright 驱动真实 Chromium（非无头可配置）。
- 工具集：`browser_navigate`、`browser_click`、`browser_type`、`browser_snapshot`（无障碍树）、`browser_take_screenshot`、`browser_resize`、`browser_tab_*`、`browser_select_option`、`browser_hover`、`browser_evaluate` 等。
- 支持 `--viewport-size`、`--device`（模拟 iPhone/iPad 等 DeviceDescriptors）、`--user-agent`、`--isolated`（每次干净 profile）、`--headless`。
- 通过无障碍树（a11y snapshot）而非像素定位元素，稳健不脆弱。

**对本项目的作用**
- **响应式自测**：`browser_resize` 切到 360 / 768 / 1024 三档视口，`browser_take_screenshot` 截图，Claude 直接"看"布局是否溢出、菜单是否折叠、触控目标是否够大。契合"PC + 移动端"硬性要求，比 `responsive-reviewer` 子代理的静态审查更进一步（真浏览器实测）。
- **交互验证**：图片灯箱放大后拖动、阅读器字号/主题切换与进度恢复、表格排序分页、图表 hover tooltip——都能用 `browser_click`/`browser_hover`/`browser_evaluate` 走一遍。
- **PWA 验证**：`dev:pwa` 起服务后，可测离线 fallback、安装提示。
- **暗色模式**：`browser_evaluate` 切换 `html.dark`，截图对比 `dark:` 覆盖是否到位。

**启用方式（配置后）**
```
claude mcp add playwright -- npx -y @playwright/mcp@latest
```
或直接用下方 `.mcp.json`。首次使用会自动 `npx` 拉取 Playwright 浏览器二进制（约几百 MB，仅一次）。

---

### 2. Context7 MCP — `@upstash/context7-mcp`

**特点**
- Upstash 维护，聚合大量库的**最新版**文档与示例，按版本号返回。
- 工具：`resolve-library-id`（库名 → ID）、`get-library-docs`（按 ID + 主题取文档片段）。
- 返回内容带版本与来源，可 cite，避免"凭记忆写已废弃 API"。

**对本项目的作用**
- **Nuxt 4**：`compatibilityVersion: 4` 后 `app/` 目录、`useFetch`/`useAsyncData` 语义、`definePageMeta`、`useState` 等有细微变化，Context7 取最新文档避免踩旧版用法。
- **UnoCSS**：presetWind4、attributify、transformerVariantGroup、presetTypography 的 `prose` 尺寸档位（`prose-sm`/`prose-lg`/`prose-xl`）等，版本间有调整。
- **vxe-table**：API 庞杂且版本迭代快（项目计划集成，见 `r/vxe-table.txt`），Context7 按版本取表格/网格/树形/虚拟滚动文档。
- **ECharts / 图表库**：option 结构、按需 `echarts/core` 注册方式。
- 弥补 Claude 训练截止后库的新版本变化，写出的代码更可能"一次跑通"。

**启用方式**
```
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

---

### 3. Fetch MCP — `@modelcontextprotocol/server-fetch`

**特点**
- Anthropic 官方参考实现，单一工具 `fetch`：抓取 URL → 转 markdown，可控制 start/stop 行、max 长度。
- 轻量，无状态，无需 token。
- 与 Claude Code 内置 `WebFetch` 互补：MCP 版可在任何支持 MCP 的客户端复用，且抓取策略可控。

**对本项目的作用**
- **查文档/素材**：vxe-table GitHub README、UnoCSS 官网、Nuxt 文档指定页、古籍公共文本等。
- **抓接口示例**：参考其他项目的 Nuxt `server/api` 写法、Pinia setup store 范式。
- **抓需求/规格**：若模块需求挂在某个 URL（如外部 wiki），可直接抓取转为结构化文本。
- 注意：Claude Code 自带 `WebFetch` 已能覆盖大部分场景；此 MCP 主要价值在"团队 MCP 统一、可在其他 MCP 客户端复用、抓取参数更细"。若不追求复用，可只保留内置 `WebFetch` 而省略此 server。

**启用方式**
```
claude mcp add fetch -- npx -y @modelcontextprotocol/server-fetch
```

---

### 4. GitHub MCP — `@modelcontextprotocol/server-github`

**特点**
- Anthropic 官方参考实现，覆盖 GitHub REST/GraphQL：仓库元数据、issue、PR、分支、文件读写、代码搜索（`search_code`）、commit、CI workflow run 状态。
- 需 `GITHUB_PERSONAL_ACCESS_TOKEN`（classic 或 fine-grained，按需给 `repo`/`workflow`/`read` 权限）。
- 工具集大：`create_issue`、`create_pull_request`、`get_pull_request_status`、`list_commits`、`search_repositories`、`search_code` 等。

**对本项目的作用**
- **提 PR**：模块开发完成后直接通过 MCP 创建 PR、写描述（含本仓库要求的 `🤖 Generated with [Claude Code]` 归属行）。
- **查 issue/CI**：看 `dev-ai` 分支的 CI 跑通没、PR review 状态。
- **跨仓库搜索**：搜 vxe-table issue 里某报错的解法、搜 Nuxt 模块示例 `search_code`。
- **文件读写**：批量读/改仓库文件（与 Claude Code 内置 Read/Write/Edit 互补，MCP 版走 GitHub API 可在无本地 checkout 时用）。
- 安全提示：token 走环境变量 `${GITHUB_PERSONAL_ACCESS_TOKEN}`，不要写进文件明文；fine-grained token 仅授权本仓库所需权限。

**启用方式**
```
claude mcp add github --env GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_PERSONAL_ACCESS_TOKEN -- npx -y @modelcontextprotocol/server-github
```

---

## 推荐 `.mcp.json`（项目级，团队共享）

> ⚠️ **落地说明**：本配置文件的写入被 Claude Code auto-mode 分类器拦截（MCP 会扩大 agent 能力，需用户明确确认）。请将以下内容保存为项目根的 `.mcp.json`，或在 auto-mode 外手动批准写入。配置后需**重启 Claude Code 会话**才会加载这些 MCP。

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {}
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "env": {}
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

> `.mcp.json` 放项目根，可提交到 Git 供团队共享；`${VAR}` 语法会被 Claude Code 替换为对应环境变量，避免 token 入库。
>
> 若偏好本地个人配置不入库，可改用 `claude mcp add --scope local ...`（写入 `~/.claude.json` 的项目条目），或加进 `.gitignore`。

## 使用注意

1. **首次启动**：每个 `npx -y` 会下载对应包；Playwright 还会拉浏览器二进制（一次性）。
2. **网络**：MCP 启动与运行需能访问 npm registry 与目标站点；离线环境下 `@vite-pwa/nuxt` 的 PWA 测试可结合本地 server。
3. **权限确认**：Claude Code 首次调用某 MCP 工具会请求授权；项目可在 `.claude/settings.json` 的 `permissions.allow` 里加 `mcp__playwright__*` 等预批（同样需用户确认）。
4. **按需启用**：4 个 MCP 不必全装。最小可用集建议 **Playwright + Context7**（响应式自测 + 实时文档），Fetch/GitHub 按团队协作需要再加。
5. **与现有配置的关系**：本项目已有 `.claude/agents/responsive-reviewer`（静态审查）与 `.claude/skills/responsive-ui`；Playwright MCP 是对它们的"动态实测"补充，不替代。

## 选型小结

- 响应式实测 → Playwright（最契合 PC + 移动端）
- 实时文档 → Context7（Nuxt 4 / UnoCSS / vxe-table 版本敏感）
- 网页抓取 → Fetch（可与内置 WebFetch 二选一）
- 仓库协作 → GitHub（提 PR、查 CI，需 token）
