<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Home,
  CalendarDays,
  ShoppingCart,
  ChefHat,
  User,
} from 'lucide-vue-next'

const route = useRoute()

const tabs = [
  { name: 'home', label: 'Beranda', icon: Home, to: '/' },
  { name: 'planner', label: 'Planner', icon: CalendarDays, to: '/planner' },
  { name: 'belanja', label: 'Belanja', icon: ShoppingCart, to: '/belanja' },
  { name: 'resep', label: 'Resep', icon: ChefHat, to: '/resep' },
  { name: 'profil', label: 'Profil', icon: User, to: '/profil' },
]

const activeTab = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  return tabs.find((t) => path.startsWith(t.to) && t.to !== '/')?.name ?? 'home'
})
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface backdrop-blur-md"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <div class="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
      <router-link
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.to"
        class="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 transition-colors"
        :class="
          activeTab === tab.name
            ? 'text-primary'
            : 'text-text-secondary hover:text-text-primary'
        "
      >
        <component :is="tab.icon" :size="22" :stroke-width="activeTab === tab.name ? 2.5 : 1.5" />
        <span class="text-[10px] font-medium">{{ tab.label }}</span>
      </router-link>
    </div>
  </nav>
</template>
