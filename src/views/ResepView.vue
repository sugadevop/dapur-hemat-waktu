<script setup lang="ts">
import { Clock, Flame } from 'lucide-vue-next'

const resepList = [
  { id: 1, name: 'Ayam Goreng Bumbu Kuning', waktu: '30 menit', level: 'Mudah', emoji: '🍗' },
  { id: 2, name: 'Tumis Kangkung Terasi', waktu: '15 menit', level: 'Mudah', emoji: '🥬' },
  { id: 3, name: 'Telur Balado', waktu: '20 menit', level: 'Mudah', emoji: '🥚' },
  { id: 4, name: 'Tempe Bacem', waktu: '45 menit', level: 'Sedang', emoji: '🫘' },
  { id: 5, name: 'Sayur Asem', waktu: '40 menit', level: 'Sedang', emoji: '🍲' },
  { id: 6, name: 'Nasi Goreng Spesial', waktu: '20 menit', level: 'Mudah', emoji: '🍳' },
  { id: 7, name: 'Rendang Daging', waktu: '120 menit', level: 'Sulit', emoji: '🥩' },
  { id: 8, name: 'Soto Ayam', waktu: '60 menit', level: 'Sedang', emoji: '🍜' },
]

function levelColor(level: string) {
  if (level === 'Mudah') return 'bg-secondary/10 text-secondary'
  if (level === 'Sedang') return 'bg-warning/10 text-warning'
  return 'bg-danger/10 text-danger'
}
</script>

<template>
  <div class="space-y-4 pb-4">
    <h1 class="text-xl font-bold pt-2">Resep</h1>

    <!-- Search -->
    <input
      type="search"
      placeholder="Cari resep..."
      class="w-full rounded-input border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    />

    <!-- Recipe Cards -->
    <div class="space-y-2">
      <router-link
        v-for="resep in resepList"
        :key="resep.id"
        :to="`/resep/${resep.id}`"
        class="flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-md"
      >
        <span class="text-3xl">{{ resep.emoji }}</span>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-text-primary truncate">{{ resep.name }}</p>
          <div class="mt-1 flex items-center gap-2">
            <span class="flex items-center gap-1 text-xs text-text-secondary">
              <Clock :size="12" /> {{ resep.waktu }}
            </span>
            <span
              class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              :class="levelColor(resep.level)"
            >
              {{ resep.level }}
            </span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
