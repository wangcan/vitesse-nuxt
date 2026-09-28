// 顶部导航 / 底部信息栏共享类型
// 参照 nuxt.com 的导航数据结构，适配本项目

export interface NavLinkChild {
  label: string
  description?: string
  icon?: string
  to: string
  target?: '_blank'
}

export interface NavLink {
  label: string
  icon?: string
  to: string
  target?: '_blank'
  /** 有 children 时，桌面端展示为下拉菜单，移动端展示为可折叠分组 */
  children?: NavLinkChild[]
}

export interface FooterLinkColumn {
  label: string
  children: NavLinkChild[]
}

export interface SocialLink {
  label: string
  icon: string
  to: string
}
