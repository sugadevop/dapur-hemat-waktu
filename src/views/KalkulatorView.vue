<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calculator } from 'lucide-vue-next'

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const spending = ref<number[]>([0, 0, 0, 0, 0, 0, 0])

const totalWeekly = computed(() => spending.value.reduce((a, b) => a + b, 0))
const totalMonthly = computed(() => totalWeekly.value * 4)
const totalYearly = computed(() => totalWeekly.value * 52)
const estimasiMasak = computed(() => Math.round(totalWeekly.value * 0.4))
const hematPerMinggu = computed(() => totalWeekly.value - estimasiMasak.value)
const hematPerBulan = computed(() => hematPerMinggu.value * 4)

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <div class="min-h-dvh bg-background px-4 py-6">
    <div class="mx-auto max-w-lg space-y-6">
      <!-- Header -->
      <div>
        <router-link to="/" class="text-sm text-primary mb-2 inline-block">← Kembali</router-link>
        <h1 class="text-xl font-bold">Audit Pengeluaran Makan</h1>
        <p class="text-sm text-text-secondary mt-1">
          Catat pengeluaran makan luar minggu ini
        </p>
      </div>

      <!-- Input per hari -->
      <div class="space-y-2">
        <div
          v-for="(day, i) in days"
          :key="day"
          class="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
        >
          <span class="w-16 text-sm font-medium text-text-primary">{{ day }}</span>
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">Rp</span>
            <input
              v-model.number="spending[i]"
              type="number"
              min="0"
              step="5000"
              placeholder="0"
              class="w-full rounded-input border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="totalWeekly > 0" class="space-y-3">
        <h2 class="text-lg font-semibold">Hasil Audit</h2>

        <div class="rounded-card bg-danger/10 border border-danger/20 p-4">
          <p class="text-sm text-text-secondary">Total makan luar per minggu</p>
          <p class="text-2xl font-bold text-danger">{{ formatRp(totalWeekly) }}</p>
          <p class="text-xs text-text-secondary mt-1">
            Per bulan: {{ formatRp(totalMonthly) }} · Per tahun: {{ formatRp(totalYearly) }}
          </p>
        </div>

        <div class="rounded-card bg-secondary/10 border border-secondary/20 p-4">
          <p class="text-sm text-text-secondary">Estimasi kalau masak sendiri (40%)</p>
          <p class="text-2xl font-bold text-secondary">{{ formatRp(estimasiMasak) }}</p>
        </div>

        <div class="rounded-card bg-primary/10 border border-primary/20 p-4">
          <p class="text-sm text-text-secondary">Potensi hemat per bulan</p>
          <p class="text-2xl font-bold text-primary">{{ formatRp(hematPerBulan) }}</p>
          <p class="text-xs text-text-secondary mt-1">
            Itu {{ formatRp(hematPerBulan * 12) }} per tahun! 🔥
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
