---
description: 脚手架新建一个 Vue 组件
argument-hint: "[组件名/路径，如 gallery/Thumb] [用途]"
---

委托 `vue-component-builder` 子代理创建组件：`app/components/$1.vue`。

要求：
- `<script setup lang="ts">`；`defineProps<T>()` / `defineEmits<T>()`，禁用 `any`。
- UnoCSS 原子类 + attributify；复用 `btn`/`icon-btn`；图标 `i-carbon-xxx` / `i-twemoji-xxx`。
- 自动导入：子目录为命名空间前缀（`gallery/Thumb.vue` → `<GalleryThumb>`）。
- 移动优先 + 暗色 `dark:` 覆盖；触控目标 ≥ 44px（`min-h-11 min-w-11`）。
- 暗色用 `dark:` 变体（`classSuffix: ''`，`html.dark` 触发）。

用途说明：$2

完成后：跑 `pnpm typecheck` 与 `pnpm lint`，汇报文件路径、props/emits 清单、自动导入标签名。
