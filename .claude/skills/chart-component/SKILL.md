---
name: chart-component
description: 图表组件构建模式（在 Nuxt/UnoCSS 中集成图表：响应式尺寸、ClientOnly 包裹、暗色适配）。当构建数据可视化、图表、dashboard 时加载。配色/调色板设计交由内置 dataviz 技能。
---

# chart-component — 图表组件模式

在 Nuxt 4 + UnoCSS 中集成图表（ECharts/Chart.js/vxe-table 图表等）。**配色与调色板设计先加载内置 `dataviz` 技能**，本技能聚焦工程集成。

## 集成要点

- **SSR 安全**：图表依赖 DOM/Canvas，必须 `<ClientOnly>` 包裹，给 `#fallback` 占位（骨架/加载提示）。
- **响应式尺寸**：容器 `w-full`，图表 `resize` 监听窗口；用 `useResizeObserver`（VueUse）触发 `chart.resize()`。
- **高度**：不写死 `height: 400px`，用 `h-64 sm:h-80 lg:h-96` 或容器 `aspect-*`。
- **暗色适配**：监听 `useColorMode()`，切主题时更新图表主题（`chart.setOption({ theme })` 或重渲染）。
- **数据获取**：`useFetch`/`useAsyncData` 取数，`watch` 数据变化重渲染。

## 组件骨架

```vue
<script setup lang="ts">
import type { EChartsOption } from 'echarts'

const props = defineProps<{ option: EChartsOption }>()
const el = ref<HTMLElement | null>(null)
let chart: ReturnType<typeof import('echarts')['init']> | null = null
const color = useColorMode()

function render() {
  if (!el.value || !chart) return
  chart.setOption(props.option)
}

onMounted(async () => {
  const { init } = await import('echarts')
  chart = init(el.value, color.value === 'dark' ? 'dark' : undefined)
  render()
  useResizeObserver(el, () => chart?.resize())
})

watch(() => props.option, render, { deep: true })
watch(color, () => {
  if (!el.value) return
  chart?.dispose()
  import('echarts').then(({ init }) => {
    chart = init(el.value, color.value === 'dark' ? 'dark' : undefined)
    render()
  })
})

onBeforeUnmount(() => chart?.dispose())
</script>

<template>
  <ClientOnly>
    <div ref="el" class="h-64 sm:h-80 lg:h-96 w-full" />
    <template #fallback>
      <div class="h-64 sm:h-80 lg:h-96 w-full animate-pulse bg-gray:20 rounded" />
    </template>
  </ClientOnly>
</template>
```

## 懒加载
- 大库（echarts 全量）用 `await import('echarts')` 按需；或 `echarts/core` + 按需注册组件。
- 多图表页用 `defineAsyncComponent` 拆包。

## 与 dataviz 协作
- 调色板、配色公式、mark 规格、无障碍对比度 → 先读 `dataviz` 技能。
- 本技能负责把 dataviz 给出的 option 落到响应式 + 暗色 + SSR 安全的组件里。

## 常见反模式
- 顶层 `import 'echarts'` 后直接 `onMounted` 用（SSR 报错）—— 必须 `ClientOnly` + 动态 import。
- 写死像素高度 → 移动端溢出或留白。
- 忘 `onBeforeUnmount` dispose → 内存泄漏。
- 忘暗色重渲染 → 暗色下图表白底刺眼。
