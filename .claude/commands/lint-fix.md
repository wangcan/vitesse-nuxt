---
description: 对当前改动运行 eslint --fix 并汇报
---

对当前 git 工作区改动的文件运行 eslint --fix：

1. `git status --short` 列出改动的 `.vue`/`.ts`/`.tsx`/`.js`/`.mjs` 文件。
2. 对这些文件运行 `pnpm eslint --fix <files>`。
3. 汇报：修复了哪些文件、剩余报错（按文件:行:列 列出）、是否还有需手动处理的问题。
4. 若剩余报错，给出具体修复建议。

不要提交。只修 lint，不改业务逻辑。
