<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, ChefHat, TrendingDown, RotateCcw, Moon, Sun, Flame } from 'lucide-vue-next'
import { useDarkMode } from '@/composables/useDarkMode'
import { db, type UserProfile } from '@/db'

const profile = ref<UserProfile | null>(null)

const profileLabels: Record<string, { name: string; emoji: string }> = {
  single: { name: 'Single / Anak Kos', emoji: '🏠' },
  couple: { name: 'Pasangan Muda', emoji: '👫' },
  family: { name: 'Keluarga', emoji: '👨‍👩‍👧‍👦' },
  shift: { name: 'Pekerja Shift', emoji: '🔄' },
}

const levelLabels: Record<number, { name: string; emoji: string }> = {
  1: { name: 'Quick Prep', emoji: '🥬' },
  2: { name: 'Partial Cook', emoji: '🍳' },
  3: { name: 'Full Batch Cooking', emoji: '👨‍🍳' },
}

const { isDark, toggle: toggleDark } = useDarkMode()

async function resetProfile() {
  await db.profile.clear()
  profile.value = null
}

onMounted(async () => {
  const profiles = await db.profile.toArray()
  if (profiles.length > 0) profile.value = profiles[0]
})
</script>

<template>
  <div class="space-y-4 pb-4">
    <h1 class="text-xl font-bold pt-2 text-text-primary">Profil</h1>

    <!-- Profile card -->
    <div v-if="profile" class="rounded-card border border-border bg-surface p-4 space-y-4">
      <div class="flex items-center gap-3">
        <div class="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <span class="text-2xl">{{ profileLabels[profile.profileType]?.emoji || '👤' }}</span>
        </div>
        <div>
          <p class="font-semibold text-text-primary">{{ profileLabels[profile.profileType]?.name }}</p>
          <p class="text-sm text-text-secondary">
            Level {{ profile.systemLevel }} — {{ levelLabels[profile.systemLevel]?.name }}
          </p>
        </div>
      </div>

      <button
        @click="resetProfile"
        class="flex items-center gap-2 text-sm text-text-secondary"
      >
        <RotateCcw :size="14" /> Ulangi quiz profil
      </button>
    </div>

    <!-- No profile -->
    <div v-else class="rounded-card border border-border bg-surface p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span class="text-xl">👤</span>
        </div>
        <div>
          <p class="font-semibold text-text-primary">Pengguna Baru</p>
          <p class="text-sm text-text-secondary">Belum isi profil dapur</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="space-y-2">
      <router-link
        to="/onboarding"
        class="flex items-center gap-3 rounded-button bg-primary px-4 py-3 font-semibold text-white"
      >
        <ChefHat :size="18" />
        {{ profile ? 'Ulangi Quiz Profil' : 'Isi Profil Dapur' }}
      </router-link>

      <router-link
        to="/challenge"
        class="flex items-center gap-3 rounded-button border border-border bg-surface px-4 py-3 font-semibold text-text-primary"
      >
        <Flame :size="18" />
        14-Day Challenge
      </router-link>

      <router-link
        to="/kalkulator"
        class="flex items-center gap-3 rounded-button border border-border bg-surface px-4 py-3 font-semibold text-text-primary"
      >
        <TrendingDown :size="18" />
        Kalkulator Pengeluaran
      </router-link>
    </div>

    <!-- Dark Mode Toggle -->
    <div class="rounded-card border border-border bg-surface p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Moon v-if="isDark" :size="18" class="text-text-secondary" />
          <Sun v-else :size="18" class="text-text-secondary" />
          <span class="text-sm font-medium text-text-primary">Mode Gelap</span>
        </div>
        <button
          @click="toggleDark"
          class="relative h-7 w-12 rounded-full transition-colors"
          :class="isDark ? 'bg-primary' : 'bg-border'"
        >
          <span
            class="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform"
            :class="isDark ? 'translate-x-5' : 'translate-x-0.5'"
          ></span>
        </button>
      </div>
    </div>

    <!-- App info -->
    <div class="rounded-card border border-border bg-surface p-4 space-y-2">
      <h3 class="text-sm font-semibold text-text-primary">Tentang App</h3>
      <p class="text-xs text-text-secondary">
        Dapur Hemat Waktu — companion app untuk ebook "Dapur Hemat Waktu: Panduan Mulai Masak Efisien untuk Kehidupan Sehari-hari"
      </p>
      <p class="text-xs text-text-secondary">
        Versi 1.0.0 · Data tersimpan offline di perangkat kamu
      </p>
    </div>
  </div>
</template>
