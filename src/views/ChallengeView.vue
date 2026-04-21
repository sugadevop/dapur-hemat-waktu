<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Flame, Trophy, RotateCcw, Check, Calendar, ArrowLeft } from 'lucide-vue-next'
import { db, type ChallengeDay } from '@/db'

const challengeDays = ref<ChallengeDay[]>([])
const isStarted = ref(false)
const showNotes = ref<number | null>(null)
const noteText = ref('')

const challengePlan = [
  { day: 1, title: 'Baca Bab 1 & 2', desc: 'Isi lembar kalkulasi pengeluaran makan', waktu: '45 menit', emoji: '📖' },
  { day: 2, title: 'Isi Profil Dapur', desc: 'Kuesioner profil dapur, tentukan level sistem', waktu: '30 menit', emoji: '📋' },
  { day: 3, title: 'Audit Pengeluaran', desc: 'Hitung audit pengeluaran makan minggu ini', waktu: '30 menit', emoji: '💰' },
  { day: 4, title: 'Pelajari Penyimpanan', desc: 'Baca panduan simpan bahan, foto isi kulkas', waktu: '30 menit', emoji: '🧊' },
  { day: 5, title: 'Audit Alat Dapur', desc: 'Cek alat yang ada, catat yang perlu dibeli', waktu: '30 menit', emoji: '🍳' },
  { day: 6, title: 'Organisasi Kulkas', desc: 'Reorganisasi kulkas dan lemari bahan', waktu: '60 menit', emoji: '🗄️' },
  { day: 7, title: 'Evaluasi Minggu 1', desc: 'Istirahat, catat 3 hal yang sudah berubah', waktu: '20 menit', emoji: '✨' },
  { day: 8, title: 'Pilih 3 Resep', desc: 'Pilih resep untuk minggu ini, masukkan ke recipe bank', waktu: '30 menit', emoji: '📝' },
  { day: 9, title: 'Buat Menu & Belanja', desc: 'Rencana menu dan daftar belanja 4 hari', waktu: '25 menit', emoji: '📅' },
  { day: 10, title: 'Belanja!', desc: 'Belanja sesuai daftar — tidak boleh di luar daftar', waktu: '60 menit', emoji: '🛒' },
  { day: 11, title: 'Sesi Prep Pertama', desc: 'Potong dan simpan bahan (belum perlu masak penuh)', waktu: '45 menit', emoji: '🔪' },
  { day: 12, title: 'Masak Pertama!', desc: 'Eksekusi masak menggunakan bahan yang sudah diprep', waktu: '30 menit', emoji: '👨‍🍳' },
  { day: 13, title: 'Masak Lagi + Evaluasi', desc: 'Ulangi masak, evaluasi apa yang mudah/perlu diperbaiki', waktu: '30 menit', emoji: '🔄' },
  { day: 14, title: 'Deklarasi Sistem!', desc: 'Tulis komitmen, evaluasi 14 hari, rencanakan bulan pertama', waktu: '45 menit', emoji: '🏆' },
]

const completedCount = computed(() => challengeDays.value.filter(d => d.completed).length)
const streakCount = computed(() => {
  let streak = 0
  const sorted = [...challengeDays.value].sort((a, b) => a.day - b.day)
  for (const d of sorted) {
    if (d.completed) streak++
    else break
  }
  return streak
})
const progressPercent = computed(() => Math.round((completedCount.value / 14) * 100))
const isAllComplete = computed(() => completedCount.value === 14)

function getDayStatus(day: number): ChallengeDay | undefined {
  return challengeDays.value.find(d => d.day === day)
}

async function startChallenge() {
  await db.challengeDays.clear()
  const now = new Date()
  const days: Omit<ChallengeDay, 'id'>[] = []
  for (let i = 1; i <= 14; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() + i - 1)
    days.push({
      day: i,
      date: date.toISOString().split('T')[0],
      completed: false,
      notes: '',
    })
  }
  await db.challengeDays.bulkAdd(days)
  challengeDays.value = await db.challengeDays.toArray()
  isStarted.value = true
}

async function toggleDay(day: number) {
  const record = challengeDays.value.find(d => d.day === day)
  if (!record) return
  await db.challengeDays.update(record.id!, { completed: !record.completed })
  record.completed = !record.completed
}

async function openNotes(day: number) {
  const record = challengeDays.value.find(d => d.day === day)
  noteText.value = record?.notes || ''
  showNotes.value = day
}

async function saveNotes() {
  if (showNotes.value === null) return
  const record = challengeDays.value.find(d => d.day === showNotes.value)
  if (!record) return
  await db.challengeDays.update(record.id!, { notes: noteText.value })
  record.notes = noteText.value
  showNotes.value = null
}

async function resetChallenge() {
  if (!confirm('Reset challenge? Semua progress akan hilang.')) return
  await db.challengeDays.clear()
  challengeDays.value = []
  isStarted.value = false
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

onMounted(async () => {
  challengeDays.value = await db.challengeDays.toArray()
  isStarted.value = challengeDays.value.length > 0
})
</script>

<template>
  <div class="space-y-4 pb-4">
    <div class="pt-2">
      <router-link to="/" class="flex items-center gap-1 text-sm text-primary mb-2">
        <ArrowLeft :size="16" /> Kembali
      </router-link>
      <h1 class="text-xl font-bold text-text-primary">14-Day Challenge</h1>
      <p class="text-xs text-text-secondary">Rencana aksi dari ebook — 2 minggu menuju sistem masak</p>
    </div>

    <!-- Not started -->
    <div v-if="!isStarted" class="space-y-4">
      <div class="rounded-card border border-border bg-surface p-5 text-center space-y-3">
        <span class="text-5xl">🍳</span>
        <h2 class="text-lg font-bold text-text-primary">Siap Mulai?</h2>
        <p class="text-sm text-text-secondary">
          14 hari untuk membangun fondasi sistem masak efisien. Setiap hari ada 1 aksi kecil yang bisa kamu lakukan.
        </p>
        <div class="grid grid-cols-2 gap-2 text-left">
          <div class="rounded-button bg-primary/10 p-2">
            <p class="text-xs font-semibold text-primary">Minggu 1</p>
            <p class="text-[10px] text-text-secondary">Fondasi — belajar & organisasi</p>
          </div>
          <div class="rounded-button bg-secondary/10 p-2">
            <p class="text-xs font-semibold text-secondary">Minggu 2</p>
            <p class="text-[10px] text-text-secondary">Eksekusi — belanja & masak</p>
          </div>
        </div>
        <button
          @click="startChallenge"
          class="w-full rounded-button bg-primary py-3 font-semibold text-white active:scale-[0.98]"
        >
          🔥 Mulai Challenge!
        </button>
      </div>
    </div>

    <!-- In progress -->
    <div v-else class="space-y-4">
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2">
        <div class="rounded-card bg-primary/10 p-3 text-center">
          <Flame :size="18" class="mx-auto text-primary mb-1" />
          <p class="text-lg font-bold text-primary">{{ streakCount }}</p>
          <p class="text-[10px] text-text-secondary">Streak</p>
        </div>
        <div class="rounded-card bg-secondary/10 p-3 text-center">
          <Check :size="18" class="mx-auto text-secondary mb-1" />
          <p class="text-lg font-bold text-secondary">{{ completedCount }}/14</p>
          <p class="text-[10px] text-text-secondary">Selesai</p>
        </div>
        <div class="rounded-card bg-warning/10 p-3 text-center">
          <Trophy :size="18" class="mx-auto text-warning mb-1" />
          <p class="text-lg font-bold text-warning">{{ progressPercent }}%</p>
          <p class="text-[10px] text-text-secondary">Progress</p>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="h-2 rounded-full bg-border overflow-hidden">
        <div
          class="h-full rounded-full bg-primary transition-all duration-500"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <!-- Completion celebration -->
      <div v-if="isAllComplete" class="rounded-card bg-primary/10 border border-primary/20 p-4 text-center">
        <p class="text-3xl mb-2">🎉🏆🎉</p>
        <p class="font-bold text-primary text-lg">Challenge Selesai!</p>
        <p class="text-sm text-text-secondary mt-1">
          Kamu sudah punya fondasi sistem masak efisien. Lanjutkan perjalananmu!
        </p>
      </div>

      <!-- Week 1 -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 px-1">
          Minggu 1 — Fondasi
        </h3>
        <div class="space-y-1.5">
          <div
            v-for="plan in challengePlan.slice(0, 7)"
            :key="plan.day"
            class="rounded-card border bg-surface overflow-hidden transition-all"
            :class="getDayStatus(plan.day)?.completed ? 'border-secondary/30' : 'border-border'"
          >
            <div class="flex items-center gap-3 p-3">
              <button
                @click="toggleDay(plan.day)"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                :class="getDayStatus(plan.day)?.completed ? 'border-secondary bg-secondary' : 'border-border'"
              >
                <Check v-if="getDayStatus(plan.day)?.completed" :size="16" class="text-white" />
                <span v-else class="text-xs font-bold text-text-secondary">{{ plan.day }}</span>
              </button>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold" :class="getDayStatus(plan.day)?.completed ? 'text-text-secondary line-through' : 'text-text-primary'">
                  {{ plan.emoji }} {{ plan.title }}
                </p>
                <p class="text-xs text-text-secondary truncate">{{ plan.desc }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-[10px] text-text-secondary">{{ plan.waktu }}</p>
                <button @click="openNotes(plan.day)" class="text-[10px] text-primary">
                  {{ getDayStatus(plan.day)?.notes ? '📝' : '✏️' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Week 2 -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 px-1">
          Minggu 2 — Eksekusi
        </h3>
        <div class="space-y-1.5">
          <div
            v-for="plan in challengePlan.slice(7)"
            :key="plan.day"
            class="rounded-card border bg-surface overflow-hidden transition-all"
            :class="getDayStatus(plan.day)?.completed ? 'border-secondary/30' : 'border-border'"
          >
            <div class="flex items-center gap-3 p-3">
              <button
                @click="toggleDay(plan.day)"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                :class="getDayStatus(plan.day)?.completed ? 'border-secondary bg-secondary' : 'border-border'"
              >
                <Check v-if="getDayStatus(plan.day)?.completed" :size="16" class="text-white" />
                <span v-else class="text-xs font-bold text-text-secondary">{{ plan.day }}</span>
              </button>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold" :class="getDayStatus(plan.day)?.completed ? 'text-text-secondary line-through' : 'text-text-primary'">
                  {{ plan.emoji }} {{ plan.title }}
                </p>
                <p class="text-xs text-text-secondary truncate">{{ plan.desc }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-[10px] text-text-secondary">{{ plan.waktu }}</p>
                <button @click="openNotes(plan.day)" class="text-[10px] text-primary">
                  {{ getDayStatus(plan.day)?.notes ? '📝' : '✏️' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset -->
      <button
        @click="resetChallenge"
        class="flex w-full items-center justify-center gap-1 text-xs text-text-secondary"
      >
        <RotateCcw :size="12" /> Reset challenge
      </button>
    </div>

    <!-- Notes Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showNotes !== null"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          @click.self="showNotes = null"
        >
          <div class="w-full max-w-lg rounded-t-2xl bg-surface p-4 space-y-3">
            <div class="flex items-center justify-between">
              <p class="font-semibold text-text-primary">Catatan Hari {{ showNotes }}</p>
              <button @click="showNotes = null" class="text-text-secondary">✕</button>
            </div>
            <textarea
              v-model="noteText"
              rows="4"
              placeholder="Tulis catatan, refleksi, atau apa yang kamu pelajari hari ini..."
              class="w-full rounded-input border border-border bg-background p-3 text-sm text-text-primary outline-none focus:border-primary resize-none"
            ></textarea>
            <button
              @click="saveNotes"
              class="w-full rounded-button bg-primary py-2.5 font-semibold text-white"
            >
              Simpan
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: translateY(100%); }
</style>
