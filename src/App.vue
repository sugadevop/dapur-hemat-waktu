<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { needRefresh, updateServiceWorker } = useRegisterSW()
useDarkMode() // Initialize dark mode on app start
</script>

<template>
  <router-view />

  <!-- PWA Update Prompt -->
  <Transition name="slide-up">
    <div
      v-if="needRefresh"
      class="fixed bottom-20 left-4 right-4 z-50 rounded-card bg-surface p-4 shadow-lg border border-border"
    >
      <p class="text-sm text-text-primary mb-3">
        Versi baru tersedia!
      </p>
      <div class="flex gap-2">
        <button
          @click="updateServiceWorker()"
          class="flex-1 rounded-button bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Update
        </button>
        <button
          @click="needRefresh = false"
          class="rounded-button px-4 py-2 text-sm text-text-secondary"
        >
          Nanti
        </button>
      </div>
    </div>
  </Transition>
</template>

<style>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
