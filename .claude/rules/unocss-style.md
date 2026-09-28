# UnoCSS 样式约定

- 优先原子类 + attributify 模式（`<div btn text-gray:80 px-4>`）。
- 复用快捷类在 `uno.config.ts` `shortcuts` 定义；不在组件里重复长串类名。已有：`btn`、`icon-btn`。
- 图标：`i-carbon-xxx`、`i-twemoji-xxx`（纯 CSS，无需 import）。
- 暗色：`dark:` 变体（`classSuffix: ''`，`html.dark` 触发）。
- 长文阅读：`prose` 容器（presetTypography），`prose-sm`/`prose-lg` 调字号，`dark:prose-invert`。
- 字体：sans=DM Sans、serif=DM Serif Display、mono=DM Mono（presetWebFonts）。
- 变体组：`hover:(bg-teal-600 text-white)` 可用（transformerVariantGroup）。
- 指令：`--at-apply` 可用（transformerDirectives），但优先原子类。
