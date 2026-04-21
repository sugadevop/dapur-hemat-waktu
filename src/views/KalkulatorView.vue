<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ArrowLeft, Save, Share2, History, TrendingDown, Trash2 } from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js'
import { db, type AuditRecord } from '@/db'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip)

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const dayShort = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const spending = ref<number[]>([0, 0, 0, 0, 0, 0, 0])
const showHistory = ref(false)
const savedAudits = ref<AuditRecord[]>([])
const justSaved = ref(false)
const activeInput = ref(-1)
let blurTimeout: ReturnType<typeof setTimeout> | null = null

// Quick amounts for fast input
const quickAmounts = [15000, 25000, 35000, 50000, 75000]

function addQuickAmount(dayIndex: number, amount: number) {
  const newSpending = [...spending.value]
  newSpending[dayIndex] = (newSpending[dayIndex] || 0) + amount
  spending.value = newSpending
}

function onInputFocus(i: number) {
  if (blurTimeout) clearTimeout(blurTimeout)
  activeInput.value = i
}

function onInputBlur() {
  // Delay blur so quick amount button click registers first
  blurTimeout = setTimeout(() => {
    activeInput.value = -1
  }, 200)
}

// Computeds
const totalWeekly = computed(() => spending.value.reduce((a, b) => a + b, 0))
const totalMonthly = computed(() => totalWeekly.value * 4)
const totalYearly = computed(() => totalWeekly.value * 52)
const avgPerDay = computed(() => {
  const daysWithSpending = spending.value.filter(s => s > 0).length
  return daysWithSpending > 0 ? Math.round(totalWeekly.value / daysWithSpending) : 0
})
const estimasiMasak = computed(() => Math.round(totalWeekly.value * 0.4))
const hematPerMinggu = computed(() => totalWeekly.value - estimasiMasak.value)
const hematPerBulan = computed(() => hematPerMinggu.value * 4)
const hematPerTahun = computed(() => hematPerMinggu.value * 52)
const persenHemat = computed(() => totalWeekly.value > 0 ? Math.round((hematPerMinggu.value / totalWeekly.value) * 100) : 0)

// Chart data
const chartData = computed(() => ({
  labels: dayShort,
  datasets: [
    {
      label: 'Makan Luar',
      data: spending.value,
      backgroundColor: '#E74C3C',
      borderRadius: 6,
    },
    {
      label: 'Estimasi Masak',
      data: spending.value.map(s => Math.round(s * 0.4)),
      backgroundColor: '#27AE60',
      borderRadius: 6,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => formatRp(ctx.raw),
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (val: any) => 'Rp ' + (val / 1000) + 'k',
        font: { size: 10 },
        color: '#7F8C8D',
      },
      grid: { color: '#ECF0F1' },
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: '#2C3E50' },
    },
  },
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

async function saveAudit() {
  const record: Omit<AuditRecord, 'id'> = {
    weekStart: getWeekStart(),
    spending: [...spending.value],
    totalWeekly: totalWeekly.value,
    estimasiMasak: estimasiMasak.value,
    hemat: hematPerMinggu.value,
    createdAt: new Date().toISOString(),
  }
  await db.audits.add(record)
  justSaved.value = true
  setTimeout(() => (justSaved.value = false), 2000)
  await loadHistory()
}

async function deleteAudit(id: number) {
  await db.audits.delete(id)
  await loadHistory()
}

async function loadAudit(audit: AuditRecord) {
  spending.value = [...audit.spending]
  showHistory.value = false
}

async function loadHistory() {
  savedAudits.value = await db.audits.orderBy('createdAt').reverse().toArray()
}

async function shareResult() {
  const text = `🍳 Audit Pengeluaran Makan\n\n` +
    `Makan luar/minggu: ${formatRp(totalWeekly.value)}\n` +
    `Estimasi masak sendiri: ${formatRp(estimasiMasak.value)}\n` +
    `Potensi hemat/bulan: ${formatRp(hematPerBulan.value)} (${persenHemat.value}%)\n` +
    `Potensi hemat/tahun: ${formatRp(hematPerTahun.value)} 🔥\n\n` +
    `Cek di: dapur-hemat-waktu.pages.dev`

  if (navigator.share) {
    await navigator.share({ title: 'Audit Pengeluaran Makan', text })
  } else {
    await navigator.clipboard.writeText(text)
    alert('Hasil disalin ke clipboard!')
  }
}

function resetForm() {
  spending.value = [0, 0, 0, 0, 0, 0, 0]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(loadHistory)
</script>

<template>
  <div class="min-h-dvh bg-background">
    <div class="mx-auto max-w-lg px-4 py-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <router-link to="/" class="flex items-center gap-1 text-sm text-primary mb-2">
            <ArrowLeft :size="16" /> Kembali
          </router-link>
          <h1 class="text-xl font-bold text-text-primary">Audit Pengeluaran Makan</h1>
          <p class="text-sm text-text-secondary mt-1">
            Catat semua pengeluaran makan luar minggu ini
          </p>
        </div>
        <button
          v-if="savedAudits.length > 0"
          @click="showHistory = !showHistory"
          class="flex items-center gap-1 rounded-button border border-border px-3 py-1.5 text-xs text-text-secondary"
        >
          <History :size="14" />
          {{ savedAudits.length }}
        </button>
      </div>

      <!-- History Panel -->
      <Transition name="slide">
        <div v-if="showHistory" class="space-y-2">
          <h3 class="text-sm font-semibold text-text-secondary">Riwayat Audit</h3>
          <div
            v-for="audit in savedAudits"
            :key="audit.id"
            class="flex items-center justify-between rounded-card border border-border bg-surface p-3"
          >
            <button @click="loadAudit(audit)" class="flex-1 text-left">
              <p class="text-sm font-medium text-text-primary">{{ formatDate(audit.createdAt) }}</p>
              <p class="text-xs text-text-secondary">
                {{ formatRp(audit.totalWeekly) }} · Hemat {{ formatRp(audit.hemat) }}
              </p>
            </button>
            <button @click="deleteAudit(audit.id!)" class="p-2 text-text-secondary hover:text-danger">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- Input per hari -->
      <div class="space-y-2">
        <div
          v-for="(day, i) in days"
          :key="day"
          class="rounded-card border bg-surface p-3 transition-colors"
          :class="activeInput === i ? 'border-primary' : 'border-border'"
        >
          <div class="flex items-center gap-3">
            <span class="w-14 text-sm font-medium text-text-primary">{{ day }}</span>
            <div class="relative flex-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">Rp</span>
              <input
                v-model.number="spending[i]"
                type="number"
                inputmode="numeric"
                min="0"
                step="5000"
                placeholder="0"
                @focus="onInputFocus(i)"
                @blur="onInputBlur()"
                class="w-full rounded-input border border-border bg-surface py-2 pl-10 pr-3 text-sm font-medium text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <!-- Quick amount buttons -->
          <div v-if="activeInput === i" class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="amt in quickAmounts"
              :key="amt"
              @click="addQuickAmount(i, amt)"
              class="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary active:bg-primary/20"
            >
              +{{ (amt / 1000) }}k
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <Transition name="fade">
        <div v-if="totalWeekly > 0" class="space-y-4">
          <!-- Chart -->
          <div class="rounded-card border border-border bg-surface p-4">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-text-primary">Perbandingan Pengeluaran</h3>
              <div class="flex items-center gap-3 text-[10px]">
                <span class="flex items-center gap-1 text-text-primary">
                  <span class="h-2 w-2 rounded-full bg-danger"></span> Makan Luar
                </span>
                <span class="flex items-center gap-1 text-text-primary">
                  <span class="h-2 w-2 rounded-full bg-secondary"></span> Masak Sendiri
                </span>
              </div>
            </div>
            <div class="h-48">
              <Bar :data="chartData" :options="chartOptions" />
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-card bg-danger/10 border border-danger/20 p-3">
              <p class="text-[10px] uppercase tracking-wider text-danger/70">Makan Luar</p>
              <p class="text-lg font-bold text-danger">{{ formatRp(totalWeekly) }}</p>
              <p class="text-[10px] text-text-secondary">{{ formatRp(avgPerDay) }}/hari</p>
            </div>
            <div class="rounded-card bg-secondary/10 border border-secondary/20 p-3">
              <p class="text-[10px] uppercase tracking-wider text-secondary/70">Masak Sendiri</p>
              <p class="text-lg font-bold text-secondary">{{ formatRp(estimasiMasak) }}</p>
              <p class="text-[10px] text-text-secondary">40% dari makan luar</p>
            </div>
          </div>

          <!-- Big savings card -->
          <div class="rounded-card bg-primary/10 border border-primary/20 p-4 text-center">
            <TrendingDown :size="24" class="mx-auto mb-1 text-primary" />
            <p class="text-xs text-text-secondary">Potensi hemat per bulan</p>
            <p class="text-3xl font-bold text-primary">{{ formatRp(hematPerBulan) }}</p>
            <p class="text-xs text-text-secondary mt-1">
              {{ persenHemat }}% lebih hemat · {{ formatRp(hematPerTahun) }}/tahun 🔥
            </p>
          </div>

          <!-- Projection -->
          <div class="rounded-card border border-border bg-surface p-4">
            <h3 class="text-sm font-semibold mb-3 text-text-primary">Proyeksi Penghematan</h3>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-text-secondary">1 bulan</span>
                <span class="font-semibold text-primary">{{ formatRp(hematPerBulan) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-secondary">3 bulan</span>
                <span class="font-semibold text-primary">{{ formatRp(hematPerBulan * 3) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-secondary">6 bulan</span>
                <span class="font-semibold text-primary">{{ formatRp(hematPerBulan * 6) }}</span>
              </div>
              <div class="flex justify-between text-sm border-t border-border pt-2">
                <span class="text-text-secondary font-medium">1 tahun</span>
                <span class="font-bold text-primary text-base">{{ formatRp(hematPerTahun) }}</span>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-2">
            <button
              @click="saveAudit"
              class="flex flex-1 items-center justify-center gap-2 rounded-button bg-primary px-4 py-3 font-semibold text-white transition-all active:scale-95"
              :class="justSaved ? 'bg-secondary' : 'bg-primary'"
            >
              <Save :size="18" />
              {{ justSaved ? 'Tersimpan! ✓' : 'Simpan Audit' }}
            </button>
            <button
              @click="shareResult"
              class="flex items-center justify-center gap-2 rounded-button border border-border px-4 py-3 text-text-primary transition-all active:scale-95"
            >
              <Share2 :size="18" />
            </button>
          </div>

          <!-- Reset -->
          <button
            @click="resetForm"
            class="w-full text-center text-sm text-text-secondary underline"
          >
            Reset form
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
