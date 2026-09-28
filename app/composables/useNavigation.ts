import type { FooterLinkColumn, NavLink, SocialLink } from '~/types/navigation'

/**
 * 顶部导航链接。
 * 结构对标 nuxt.com（Docs / Modules / Templates / Resources / Enterprise / Updates），
 * 内容适配本项目：首页 / 表格为站内真实路由，资源 / 社区为带下拉的外部链接。
 */
function _useHeaderLinks() {
  const headerLinks = computed<NavLink[]>(() => [
    {
      label: '首页',
      icon: 'i-lucide-home',
      to: '/',
    },
    {
      label: '表格',
      icon: 'i-lucide-table-2',
      to: '/table',
    },
    {
      label: '资源',
      icon: 'i-lucide-book-open',
      to: '#resources',
      children: [
        {
          label: 'Nuxt 文档',
          description: 'Nuxt 4 官方文档与指南。',
          icon: 'i-lucide-book-marked',
          to: 'https://nuxt.com/docs',
          target: '_blank',
        },
        {
          label: 'vxe-table 文档',
          description: '已集成表格组件的官方文档。',
          icon: 'i-lucide-table-2',
          to: 'https://vxetable.cn/',
          target: '_blank',
        },
        {
          label: 'UnoCSS 文档',
          description: '原子化 CSS 引擎文档。',
          icon: 'i-lucide-palette',
          to: 'https://unocss.dev/',
          target: '_blank',
        },
        {
          label: 'Vue 3 文档',
          description: 'Vue 3 组合式 API 文档。',
          icon: 'i-lucide-code-xml',
          to: 'https://vuejs.org/',
          target: '_blank',
        },
        {
          label: 'Iconify 图标',
          description: '海量图标按需加载。',
          icon: 'i-lucide-shapes',
          to: 'https://iconify.design/',
          target: '_blank',
        },
      ],
    },
    {
      label: '社区',
      icon: 'i-lucide-users',
      to: '#community',
      children: [
        {
          label: 'GitHub 仓库',
          description: '本项目源码（基于 vitesse-nuxt）。',
          icon: 'i-lucide-github',
          to: 'https://github.com/antfu/vitesse-nuxt',
          target: '_blank',
        },
        {
          label: 'Nuxt Discord',
          description: '加入 Nuxt 社区讨论。',
          icon: 'i-lucide-message-circle',
          to: 'https://go.nuxt.com/discord',
          target: '_blank',
        },
        {
          label: 'Nuxt on X',
          description: '关注 Nuxt 最新动态。',
          icon: 'i-lucide-twitter',
          to: 'https://go.nuxt.com/x',
          target: '_blank',
        },
        {
          label: 'Nuxt on BlueSky',
          description: '在 BlueSky 上关注 Nuxt。',
          icon: 'i-lucide-cloud',
          to: 'https://go.nuxt.com/bluesky',
          target: '_blank',
        },
      ],
    },
  ])

  return { headerLinks }
}

export const useHeaderLinks = _useHeaderLinks

/** 底部信息栏链接列，对标 nuxt.com AppFooter 的三列结构 */
const footerLinks: FooterLinkColumn[] = [
  {
    label: '资源',
    children: [
      { label: 'Nuxt 文档', to: 'https://nuxt.com/docs', target: '_blank' },
      { label: 'vxe-table', to: 'https://vxetable.cn/', target: '_blank' },
      { label: 'UnoCSS', to: 'https://unocss.dev/', target: '_blank' },
      { label: 'Vue 3', to: 'https://vuejs.org/', target: '_blank' },
    ],
  },
  {
    label: '社区',
    children: [
      { label: 'GitHub', to: 'https://github.com/antfu/vitesse-nuxt', target: '_blank' },
      { label: 'Discord', to: 'https://go.nuxt.com/discord', target: '_blank' },
      { label: 'X (Twitter)', to: 'https://go.nuxt.com/x', target: '_blank' },
      { label: 'BlueSky', to: 'https://go.nuxt.com/bluesky', target: '_blank' },
    ],
  },
  {
    label: '关于',
    children: [
      { label: '首页', to: '/' },
      { label: '表格示例', to: '/table' },
      { label: 'MIT License', to: 'https://github.com/antfu/vitesse-nuxt/blob/main/LICENSE', target: '_blank' },
    ],
  },
]

export const useFooterLinks = () => ({ footerLinks })

/** 社交媒体链接，用于底栏右侧图标按钮 */
const socialLinks: SocialLink[] = [
  { label: 'GitHub', icon: 'i-simple-icons-github', to: 'https://github.com/antfu/vitesse-nuxt' },
  { label: 'Nuxt on X', icon: 'i-simple-icons-x', to: 'https://go.nuxt.com/x' },
  { label: 'Nuxt on BlueSky', icon: 'i-simple-icons-bluesky', to: 'https://go.nuxt.com/bluesky' },
  { label: 'Nuxt on Discord', icon: 'i-simple-icons-discord', to: 'https://go.nuxt.com/discord' },
  { label: 'Nuxt on LinkedIn', icon: 'i-simple-icons-linkedin', to: 'https://go.nuxt.com/linkedin' },
]

export const useSocialLinks = () => ({ socialLinks })
