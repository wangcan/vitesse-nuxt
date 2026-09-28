<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />
    <main class="px-6 py-16 text-center flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
