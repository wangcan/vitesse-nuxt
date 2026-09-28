# TypeScript 约定

- 严格类型，禁用 `any`；确需时用 `unknown` + 类型收窄。
- 一律 `<script setup lang="ts">`。
- props 用 `defineProps<T>()`，emits 用 `defineEmits<T>()`；不写运行时字面量对象。
- 共享类型放 `app/types/<module>.ts` 或模块内 `types.ts`；页面私有类型随页面写。
- 服务端接口用 Nitro 自动类型，前后端共享；`useFetch`/`useAsyncData` 返回类型自动推断。
- 状态：`useState<T>('key', () => init)`；Pinia store 用 setup 风格 `defineStore('x', () => {...})`。
- 可空/异步数据先判空再用；模板里用 `v-if` 守卫，避免访问 `undefined` 字段。
- 提交前跑 `pnpm typecheck`（vue-tsc），零报错才合并。
- 不写 `// @ts-ignore`；确需豁免用 `// @ts-expect-error` 并注明原因。
