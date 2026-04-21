<script setup lang="ts">
import { Flame, TrendingDown, Clock, ChefHat } from 'lucide-vue-next'
</script>

<template>
  <div class="space-y-6 pb-4">
    <!-- Header -->
    <div class="pt-2">
      <p class="text-sm text-text-secondary">Selamat datang 👋</p>
      <h1 class="text-2xl font-bold text-text-primary">Dapur Hemat Waktu</h1>
    </div>

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
      <h2 class="mb-3 text-lg font-semibold">Mulai dari sini</h2>
      <div class="space-y-2">
        <router-link
          to="/kalkulator"
          class="flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-md"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <TrendingDown :size="20" class="text-primary" />
          </div>
          <div>
            <p class="font-semibold text-text-primary">Audit Pengeluaran Makan</p>
            <p class="text-sm text-text-secondary">Hitung berapa yang terbuang minggu ini</p>
          </div>
        </router-link>

        <router-link
          to="/planner"
          class="flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-md"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
            <ChefHat :size="20" class="text-secondary" />
          </div>
          <div>
            <p class="font-semibold text-text-primary">Rencana Menu Minggu Ini</p>
            <p class="text-sm text-text-secondary">Buat menu 7 hari pertamamu</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Tip of the Day -->
    <div class="rounded-card bg-primary/5 border border-primary/20 p-4">
      <p class="text-sm font-semibold text-primary mb-1">💡 Tips Hari Ini</p>
      <p class="text-sm text-text-primary">
        80% masakan sehari-hari hanya butuh 5–10 teknik dasar yang bisa dikuasai dalam 2 minggu.
      </p>
    </div>
  </div>
</template>
