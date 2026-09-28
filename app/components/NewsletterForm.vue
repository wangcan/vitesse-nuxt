<script setup lang="ts">
// 底栏右侧订阅表单——对标 nuxt.com NewsletterForm
// 本项目暂无订阅后端，提交时做本地邮箱校验并模拟成功反馈
const email = ref('')
const loading = ref(false)
const done = ref(false)
const error = ref('')

const emailPattern = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

async function onSubmit() {
  error.value = ''
  if (!emailPattern.test(email.value)) {
    error.value = '请输入有效的邮箱地址'
    return
  }
  loading.value = true
  // 模拟提交：实际项目可替换为 useFetch('/api/newsletter/subscribe', ...)
  await new Promise(resolve => setTimeout(resolve, 600))
  loading.value = false
  done.value = true
  email.value = ''
}
</script>

<template>
  <form class="w-full" @submit.prevent="onSubmit">
    <p class="text-sm text-gray-900 font-semibold dark:text-white">
      订阅更新
    </p>
    <p class="text-xs text-gray-500 mt-1 dark:text-gray-400">
      获取最新功能、指南与社区动态。
    </p>
    <div class="mt-3 flex gap-2 max-w-sm items-center">
      <input
        v-model="email"
        type="email"
        placeholder="you@domain.com"
        autocomplete="off"
        aria-label="邮箱地址"
        class="text-sm text-gray-900 px-3 border border-gray-300 rounded-md bg-white min-h-11 w-full dark:text-gray-100 placeholder:text-gray-400 focus:outline-none dark:border-gray-700 focus:border-green-500 dark:bg-gray-900 focus:ring-1 focus:ring-green-500 dark:placeholder:text-gray-500"
      >
      <button
        type="submit"
        :disabled="loading"
        class="text-sm text-white font-medium px-4 rounded-md bg-green-600 inline-flex shrink-0 min-h-11 transition-colors items-center justify-center hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {{ loading ? '订阅中' : '订阅' }}
      </button>
    </div>
    <p v-if="error" class="text-xs text-red-600 mt-2 dark:text-red-400">
      {{ error }}
    </p>
    <p v-else-if="done" class="text-xs text-green-600 mt-2 dark:text-green-400">
      订阅请求已提交，请检查邮件以完成确认。
    </p>
  </form>
</template>
