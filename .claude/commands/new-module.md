---
description: 脚手架新建一个完整功能模块（七件套）
argument-hint: "[模块名，如 novel 或 gallery] [功能简述]"
---

加载 `new-module` 技能，端到端搭建模块 `$1`。

按七件套顺序建（见 `.claude/skills/new-module/SKILL.md` 与 `.claude/rules/module-structure.md`）：
1. `app/types/<module>.ts` — 类型
2. `app/composables/use<Module>*.ts` — 逻辑
3. `app/stores/<module>.ts`（需要时） — Pinia 持久状态
4. `server/api/<module>/`（需要时） — Nitro 接口
5. `app/components/<module>/` — 组件
6. `app/pages/<module>/` — 页面与路由
7. 阅读类模块复用 `prose` + `reader-page` 技能

功能简述：$2

数据来源未指定时用示例数据占位。移动优先 + 暗色覆盖 + 严格 TS。
完成后：跑 `pnpm typecheck` + `pnpm lint` 零报错，按技能里的"产出汇报格式"汇报。
