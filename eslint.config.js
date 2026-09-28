// @ts-check
import antfu from '@antfu/eslint-config'
import nuxt from './.nuxt/eslint.config.mjs'

export default antfu(
  {
    unocss: true,
    formatters: true,
    pnpm: true,
    // Claude 配置与需求文档不纳入 lint
    ignores: [
      'CLAUDE.md',
      '.claude/**',
      '.requirements/**',
    ],
  },
)
  .append(nuxt())
