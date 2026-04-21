<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Flame, TrendingDown, Clock, ChefHat, ArrowRight, Refrigerator, Trophy } from 'lucide-vue-next'
import { db, type UserProfile } from '@/db'

const profile = ref<UserProfile | null>(null)

const levelNames: Record<number, string> = {
  1: 'Quick Prep',
  2: 'Partial Cook',
  3: 'Full Batch',
}

const tips = [
  '80% masakan sehari-hari hanya butuh 5–10 teknik dasar yang bisa dikuasai dalam 2 minggu.',
  'Masak 4 porsi sekaligus hanya butuh 15–20 menit lebih lama dari masak 1 porsi.',
  'Rendang, tempe bacem, dan ayam bumbu justru makin enak setelah didiamkan sehari.',
  'Rata-rata orang Jakarta habiskan 5+ jam/minggu cuma untuk mikir dan pergi beli makan.',
  'Nasi dingin dari kulkas justru lebih bagus untuk nasi goreng — teksturnya lebih kering.',
  'Teknik blanching sayuran sebelum disimpan bisa perpanjang kesegaran 2-3x lipat.',
  'Investasi wadah penyimpanan yang bagus lebih penting dari alat masak mahal.',
  'Meal prep bukan makan hal yang sama — variasi assembly bikin menu berbeda dari bahan sama.',
]

const todayTip = tips[new Date().getDate() % tips.length]

onMounted(async () => {
  const profiles = await db.profile.toArray()
  if (profiles.length > 0) {
    profile.value = profiles[0]
  }
})
</script>

<template>
  <div class="space-y-6 pb-4">
    <!-- Header -->
    <div class="pt-2">
      <p class="text-sm text-text-secondary">Selamat datang 👋</p>
      <h1 class="text-2xl font-bold text-text-primary">Dapur Hemat Waktu</h1>
    </div>

    <!-- Profile banner (if onboarding done) -->
    <div v-if="profile" class="rounded-card bg-primary/10 border border-primary/20 p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-text-secondary">Profil kamu</p>
          <p class="font-semibold text-text-primary">
            Level {{ profile.systemLevel }} — {{ levelNames[profile.systemLevel] }}
          </p>
        </div>
        <router-link to="/onboarding" class="text-xs text-primary underline">Ubah</router-link>
      </div>
    </div>

    <!-- Onboarding CTA (if not done) -->
    <router-link
      v-else
      to="/onboarding"
      class="flex items-center gap-3 rounded-card border-2 border-dashed border-primary/30 bg-primary/5 p-4"
    >
      <span class="text-3xl">🍳</span>
      <div class="flex-1">
        <p class="font-semibold text-text-primary">Temukan Profil Dapurmu</p>
        <p class="text-sm text-text-secondary">Quiz 2 menit untuk rekomendasi personal</p>
      </div>
      <ArrowRight :size="20" class="text-primary" />
    </router-link>

    <!-- Stats Cards (Bento Grid) -->
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-card bg-primary/10 p-4">
        <Flame :size="20" class="text-primary mb-2" />
        <p class="text-2xl font-bold text-primary">0</p>
        <p class="text-xs text-text-secondary">Hari masak minggu ini</p>
      </div>
      <div class="rounded-card bg-secondary/10 p-4">
        <TrendingDown :size="20" class="text-secondary mb-2" />
        <p class="text-2xl font-bold text-secondary">Rp 0</p>
        <p class="text-xs text-text-secondary">Hemat minggu ini</p>
      </div>
      <div class="rounded-card bg-warning/10 p-4">
        <Clock :size="20" class="text-warning mb-2" />
        <p class="text-2xl font-bold text-warning">0 jam</p>
        <p class="text-xs text-text-secondary">Waktu dihemat</p>
      </div>
      <div class="rounded-card bg-surface border border-border p-4">
        <ChefHat :size="20" class="text-text-secondary mb-2" />
        <p class="text-2xl font-bold text-text-primary">0</p>
        <p class="text-xs text-text-secondary">Resep dicoba</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div>
      <h2 class="mb-3 text-lg font-semibold text-text-primary">Mulai dari sini</h2>
      <div class="space-y-2">
        <router-link
          to="/kalkulator"
          class="flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-md"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <TrendingDown :size="20" class="text-primary" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-text-primary">Audit Pengeluaran Makan</p>
            <p class="text-sm text-text-secondary">Hitung berapa yang terbuang minggu ini</p>
          </div>
          <ArrowRight :size="18" class="text-text-secondary" />
        </router-link>

        <router-link
          to="/resep"
          class="flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-md"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
            <ChefHat :size="20" class="text-secondary" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-text-primary">Jelajahi Resep</p>
            <p class="text-sm text-text-secondary">12 resep Indonesia siap meal prep</p>
          </div>
          <ArrowRight :size="18" class="text-text-secondary" />
        </router-link>

        <router-link
          to="/panduan-simpan"
          class="flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-md"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Refrigerator :size="20" class="text-blue-600" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-text-primary">Panduan Simpan Bahan</p>
            <p class="text-sm text-text-secondary">23 bahan Indonesia + tips penyimpanan</p>
          </div>
          <ArrowRight :size="18" class="text-text-secondary" />
        </router-link>
      </div>
    </div>

    <!-- 14-Day Challenge CTA -->
    <router-link
      to="/challenge"
      class="flex items-center gap-3 rounded-card border-2 border-primary/20 bg-primary/5 p-4"
    >
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Trophy :size="20" class="text-primary" />
      </div>
      <div class="flex-1">
        <p class="font-semibold text-text-primary">14-Day Challenge</p>
        <p class="text-sm text-text-secondary">Bangun sistem masak dalam 2 minggu</p>
      </div>
      <ArrowRight :size="18" class="text-primary" />
    </router-link>

    <!-- Tip of the Day -->
    <div class="rounded-card bg-primary/5 border border-primary/20 p-4">
      <p class="text-sm font-semibold text-primary mb-1">💡 Tips Hari Ini</p>
      <p class="text-sm text-text-primary">{{ todayTip }}</p>
    </div>
  </div>
</template>
