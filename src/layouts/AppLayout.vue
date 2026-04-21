<script setup lang="ts">
import { useRoute } from 'vue-router'
import BottomNav from '@/components/ui/BottomNav.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-dvh bg-background pb-20">
    <!-- Page Content -->
    <main class="mx-auto max-w-lg px-4 pt-4">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
