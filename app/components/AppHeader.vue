<script setup lang="ts">
import type { NavLink } from '~/types/navigation'

const route = useRoute()
const { headerLinks } = useHeaderLinks()
const color = useColorMode()

const REPO = 'https://github.com/antfu/vitesse-nuxt'

// GitHub Star 数（仅客户端拉取，避免预渲染/SSR 外部请求；未加载或失败时回退为 "Star"）
const { data: stars } = await useFetch<{ stargazers_count?: number }>(
  'https://api.github.com/repos/antfu/vitesse-nuxt',
  {
    server: false,
  },
)
const starLabel = computed(() => {
  const n = stars.value?.stargazers_count
  if (typeof n !== 'number')
    return 'Star'
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n)
})

const mobileOpen = ref(false)
const openDropdown = ref<string | null>(null)
const desktopNavRef = ref<HTMLElement | null>(null)

onClickOutside(desktopNavRef, () => {
  openDropdown.value = null
})

function toggleDropdown(label: string) {
  openDropdown.value = openDropdown.value === label ? null : label
}

function toggleDark() {
  color.preference = color.value === 'dark' ? 'light' : 'dark'
}

// 路由切换时收起移动菜单与下拉
watch(() => route.fullPath, () => {
  mobileOpen.value = false
  openDropdown.value = null
})

function isActive(link: NavLink) {
  if (link.to === '/')
    return route.path === '/'
  if (link.to.startsWith('http') || link.to.startsWith('#'))
    return false
  return route.path.startsWith(link.to)
}
</script>

<template>
  <header
    class="border-b border-gray-200 bg-white/80 top-0 sticky z-50 backdrop-blur-md dark:border-gray-800 dark:bg-[#020420]/80"
  >
    <div class="mx-auto px-4 flex gap-2 h-16 max-w-7xl items-center lg:px-8 sm:px-6 lg:gap-4">
      <!-- Logo -->
      <NuxtLink
        to="/"
        aria-label="返回首页"
        class="flex shrink-0 items-center"
      >
        <NuxtLogo class="h-6 w-auto" />
      </NuxtLink>

      <!-- 桌面端导航 -->
      <nav
        ref="desktopNavRef"
        class="ml-2 hidden items-center relative lg:flex"
        aria-label="主导航"
      >
        <template v-for="link in headerLinks" :key="link.label">
          <!-- 有子项：下拉菜单 -->
          <div v-if="link.children?.length" class="relative">
            <button
              type="button"
              class="nav-link min-h-11"
              :class="openDropdown === link.label && 'bg-gray-100 text-gray-900 dark:bg-gray-800/50 dark:text-white'"
              @click="toggleDropdown(link.label)"
            >
              <span>{{ link.label }}</span>
              <i
                class="i-lucide-chevron-down size-4 transition-transform"
                :class="openDropdown === link.label && 'rotate-180'"
              />
            </button>
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              leave-active-class="transition duration-100 ease-in"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div
                v-show="openDropdown === link.label"
                class="mt-1 p-2 border border-gray-200 rounded-lg bg-white w-72 shadow-lg left-0 top-full absolute z-50 dark:border-gray-800 dark:bg-[#020420]"
              >
                <NuxtLink
                  v-for="child in link.children"
                  :key="child.to"
                  :to="child.to"
                  :target="child.target"
                  class="p-2 rounded-md flex gap-3 transition-colors items-start hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <i v-if="child.icon" :class="child.icon" class="text-green-600 mt-0.5 shrink-0 size-5 dark:text-green-400" />
                  <span class="min-w-0">
                    <span class="text-sm text-gray-900 font-medium flex gap-1 items-center dark:text-white">
                      {{ child.label }}
                      <i v-if="child.target === '_blank'" class="i-lucide-external-link opacity-60 size-3" />
                    </span>
                    <span v-if="child.description" class="text-xs text-gray-500 mt-0.5 block dark:text-gray-400">
                      {{ child.description }}
                    </span>
                  </span>
                </NuxtLink>
              </div>
            </Transition>
          </div>

          <!-- 普通链接 -->
          <NuxtLink
            v-else
            :to="link.to"
            :target="link.target"
            class="nav-link min-h-11"
            :class="isActive(link) && 'text-gray-900 dark:text-white'"
          >
            {{ link.label }}
          </NuxtLink>
        </template>
      </nav>

      <!-- 右侧操作区 -->
      <div class="ml-auto flex gap-1 items-center">
        <!-- 主题切换 -->
        <button
          type="button"
          class="header-icon-btn"
          aria-label="切换主题"
          @click="toggleDark"
        >
          <i class="i-lucide-sun dark:i-lucide-moon size-5" />
        </button>

        <!-- GitHub -->
        <a
          :href="REPO"
          target="_blank"
          rel="noopener"
          class="header-icon-btn px-2 gap-1.5"
          aria-label="在 GitHub 上 Star 本项目"
        >
          <i class="i-simple-icons-github size-5" />
          <span class="text-xs font-semibold hidden sm:inline">{{ starLabel }}</span>
        </a>

        <!-- 移动端汉堡按钮 -->
        <button
          type="button"
          class="header-icon-btn lg:hidden"
          :aria-label="mobileOpen ? '关闭菜单' : '打开菜单'"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = !mobileOpen"
        >
          <i :class="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" />
        </button>
      </div>
    </div>

    <!-- 移动端下拉菜单 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <nav
        v-show="mobileOpen"
        class="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-[#020420] lg:hidden"
        aria-label="移动端导航"
      >
        <div class="mx-auto px-4 py-3 max-w-7xl space-y-1 sm:px-6">
          <template v-for="link in headerLinks" :key="link.label">
            <!-- 有子项：可折叠分组（原生 details，无需额外 JS） -->
            <details v-if="link.children?.length" class="group">
              <summary
                class="nav-link list-none min-h-11 cursor-pointer [&::-webkit-details-marker]:hidden"
              >
                <span>{{ link.label }}</span>
                <i class="i-lucide-chevron-down ml-auto size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div class="ml-2 mt-1 pl-3 border-l border-gray-200 space-y-1 dark:border-gray-800">
                <NuxtLink
                  v-for="child in link.children"
                  :key="child.to"
                  :to="child.to"
                  :target="child.target"
                  class="text-sm text-gray-700 px-3 rounded-md flex gap-2 min-h-11 items-center dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <i v-if="child.icon" :class="child.icon" class="text-green-600 size-4 dark:text-green-400" />
                  {{ child.label }}
                </NuxtLink>
              </div>
            </details>

            <!-- 普通链接 -->
            <NuxtLink
              v-else
              :to="link.to"
              :target="link.target"
              class="nav-link min-h-11 w-full block"
              :class="isActive(link) && 'bg-gray-100 text-gray-900 dark:bg-gray-800/50 dark:text-white'"
            >
              {{ link.label }}
            </NuxtLink>
          </template>
        </div>
      </nav>
    </Transition>
  </header>
</template>
