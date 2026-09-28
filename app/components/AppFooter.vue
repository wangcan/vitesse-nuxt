<script setup lang="ts">
import { appName } from '~/constants'

const { footerLinks } = useFooterLinks()
const { socialLinks } = useSocialLinks()

const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-auto border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-[#020420]">
    <!-- 顶部：带 Nuxt 图标的分隔线 -->
    <div class="mx-auto px-4 max-w-7xl lg:px-8 sm:px-6">
      <div class="py-6 flex gap-4 items-center">
        <div class="bg-gray-200 flex-1 h-px dark:bg-gray-800" />
        <i class="i-simple-icons-nuxtdotjs text-green-500 size-5" />
        <div class="bg-gray-200 flex-1 h-px dark:bg-gray-800" />
      </div>
    </div>

    <!-- 链接列 + 订阅表单 -->
    <div class="mx-auto px-4 max-w-7xl lg:px-8 sm:px-6">
      <div class="pb-10 gap-8 grid grid-cols-2 lg:grid-cols-4 sm:grid-cols-3">
        <div v-for="col in footerLinks" :key="col.label">
          <h3 class="text-xs text-gray-500 tracking-wide font-semibold uppercase dark:text-gray-400">
            {{ col.label }}
          </h3>
          <ul class="mt-3 space-y-2">
            <li v-for="item in col.children" :key="item.to">
              <NuxtLink
                :to="item.to"
                :target="item.target"
                class="text-sm text-gray-600 inline-flex min-h-8 transition-colors items-center dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 订阅表单（占据最后一列，移动端跨两列） -->
        <div class="col-span-2 lg:col-span-1 sm:col-span-3">
          <NewsletterForm />
        </div>
      </div>
    </div>

    <!-- 底栏：版权 + 社交图标 -->
    <div class="border-t border-gray-200 dark:border-gray-800">
      <div class="mx-auto px-4 py-6 flex flex-col gap-4 max-w-7xl items-center justify-between lg:px-8 sm:px-6 sm:flex-row">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2016-{{ year }} {{ appName }} ·
          <NuxtLink
            to="https://github.com/antfu/vitesse-nuxt/blob/main/LICENSE"
            target="_blank"
            class="hover:text-green-600 hover:underline dark:hover:text-green-400"
          >
            MIT License
          </NuxtLink>
        </p>
        <div class="flex gap-1 items-center">
          <a
            v-for="s in socialLinks"
            :key="s.to"
            :href="s.to"
            target="_blank"
            rel="noopener"
            class="header-icon-btn"
            :aria-label="s.label"
          >
            <i :class="s.icon" class="size-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
