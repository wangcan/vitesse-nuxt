---
name: reader-page
description: 阅读类页面（古籍/小说/长文）构建模式：prose 排版、章节导航、阅读进度、字号/主题控制 composable 模板。当构建阅读器、小说阅读、长文排版时加载。
---

# reader-page — 阅读类页面模式

适用于小说阅读器、古籍阅读、长文阅读。复用 `prose`（presetTypography）+ 字号/主题控制 composable。

## 页面结构
- `app/pages/<module>/index.vue` — 书籍列表（封面、标题、简介，网格 `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`）。
- `app/pages/<module>/[id].vue` — 阅读器：顶栏（返回、章节目录、字号、主题）+ `prose` 正文 + 底栏（上一章/下一章、进度）。
- 异步章节内容用 `<ClientOnly><Suspense #fallback>…</Suspense></ClientOnly>`。

## composable 模板：useReader

```ts
// app/composables/useReader.ts
import { useLocalStorage } from '@vueuse/core'

export type ReaderSize = 'sm' | 'base' | 'lg' | 'xl'
export type ReaderTheme = 'light' | 'sepia' | 'dark'

export function useReader() {
  const size = useLocalStorage<ReaderSize>('reader:size', 'base')
  const theme = useLocalStorage<ReaderTheme>('reader:theme', 'light')

  const sizeClass = computed(() => ({
    sm: 'prose-sm',
    base: 'prose',
    lg: 'prose-lg',
    xl: 'prose-xl',
  }[size.value]))

  // sepia 由阅读器容器加自定义类；dark 走 html.dark 全局
  const themeClass = computed(() => theme.value === 'sepia'
    ? 'bg-amber-50 text-stone-800'
    : '')

  function setSize(s: ReaderSize) { size.value = s }
  function setTheme(t: ReaderTheme) {
    theme.value = t
    const color = useColorMode()
    color.preference = t === 'dark' ? 'dark' : 'light'
  }

  return { size, theme, sizeClass, themeClass, setSize, setTheme }
}
```

## 阅读进度
- `useScroll` 取滚动百分比；`useIntersectionObserver` 判定当前章节。
- 进度存 `useState('reader:progress:<bookId>')` 或 Pinia store，跨页/刷新恢复。
- 进度条：顶部 `fixed top-0 h-1 bg-teal-600`，宽度绑定百分比。

## 章节导航
- 上一章/下一章：`<NuxtLink :to="...">`，禁用边界章。
- 目录抽屉：移动端 `Drawer`/`Sheet` 风格，点击章节跳转；当前章高亮 `text-teal-600 font-bold`。
- 章节列表数据走 `useFetch`/`useAsyncData`。

## 排版约定
- 容器 `prose dark:prose-invert max-w-none`（阅读器一般占满可用宽）。
- 字号切换绑定 `sizeClass`；主题切换绑定 `themeClass` + 全局 color-mode。
- 移动端正文 `px-4`，桌面 `max-w-3xl mx-auto`。
- 段落间距由 `prose` 控制，不额外加 `my-*`。

## 类型示例
```ts
// app/types/reader.ts
export interface Chapter { id: string; title: string; content: string; order: number }
export interface Book { id: string; title: string; author: string; cover?: string; intro: string; chapters: Chapter[] }
```
