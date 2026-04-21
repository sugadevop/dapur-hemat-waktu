<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, ChefHat, Check } from 'lucide-vue-next'
import { db } from '@/db'

const router = useRouter()
const currentStep = ref(0)
const answers = ref<Record<string, string>>({})
const isComplete = ref(false)

interface Question {
  id: string
  question: string
  subtitle: string
  options: { value: string; label: string; emoji: string; desc: string }[]
}

const questions: Question[] = [
  {
    id: 'living',
    question: 'Kamu tinggal dengan siapa?',
    subtitle: 'Ini menentukan porsi dan kompleksitas menu',
    options: [
      { value: 'single', label: 'Sendiri / Kos', emoji: '🏠', desc: 'Porsi kecil, dapur terbatas, budget ketat' },
      { value: 'couple', label: 'Berdua / Pasangan', emoji: '👫', desc: 'Selera berbeda, jadwal padat, ingin variasi' },
      { value: 'family', label: 'Keluarga dengan Anak', emoji: '👨‍👩‍👧‍👦', desc: 'Volume besar, selera anak, waktu pagi sempit' },
      { value: 'shift', label: 'Jadwal Tidak Tetap', emoji: '🔄', desc: 'Shift kerja berubah-ubah, butuh fleksibel' },
    ],
  },
  {
    id: 'experience',
    question: 'Seberapa sering kamu masak?',
    subtitle: 'Jujur aja, gak ada jawaban salah',
    options: [
      { value: 'never', label: 'Hampir tidak pernah', emoji: '🙈', desc: 'Makan luar terus atau beli jadi' },
      { value: 'rarely', label: 'Kadang-kadang', emoji: '🤔', desc: '1-2x seminggu, biasanya weekend' },
      { value: 'sometimes', label: 'Lumayan sering', emoji: '👍', desc: '3-4x seminggu tapi belum konsisten' },
      { value: 'often', label: 'Sering masak', emoji: '💪', desc: 'Hampir tiap hari, mau lebih efisien' },
    ],
  },
  {
    id: 'kitchen',
    question: 'Kondisi dapur kamu?',
    subtitle: 'Ini menentukan alat dan teknik yang cocok',
    options: [
      { value: 'minimal', label: 'Sangat terbatas', emoji: '🔥', desc: 'Kompor 1 tungku, alat seadanya' },
      { value: 'basic', label: 'Cukup standar', emoji: '🍳', desc: 'Kompor 2 tungku, alat dasar lengkap' },
      { value: 'good', label: 'Lumayan lengkap', emoji: '🏪', desc: 'Kulkas besar, alat masak beragam' },
      { value: 'full', label: 'Lengkap banget', emoji: '👨‍🍳', desc: 'Oven, blender, rice cooker, dll' },
    ],
  },
  {
    id: 'goal',
    question: 'Tujuan utama kamu?',
    subtitle: 'Pilih yang paling penting',
    options: [
      { value: 'save_money', label: 'Hemat uang', emoji: '💰', desc: 'Kurangi pengeluaran makan luar' },
      { value: 'save_time', label: 'Hemat waktu', emoji: '⏰', desc: 'Gak mau mikir mau makan apa tiap hari' },
      { value: 'healthy', label: 'Makan lebih sehat', emoji: '🥗', desc: 'Kontrol bahan dan nutrisi sendiri' },
      { value: 'skill', label: 'Belajar masak', emoji: '📚', desc: 'Mau bisa masak dengan percaya diri' },
    ],
  },
  {
    id: 'time',
    question: 'Berapa waktu yang bisa kamu luangkan?',
    subtitle: 'Per sesi masak / prep',
    options: [
      { value: '15min', label: '15 menit', emoji: '⚡', desc: 'Super cepat, minimal effort' },
      { value: '30min', label: '30 menit', emoji: '🕐', desc: 'Cukup untuk masak 1-2 menu' },
      { value: '60min', label: '1 jam', emoji: '🕑', desc: 'Bisa masak beberapa menu sekaligus' },
      { value: '120min', label: '2+ jam', emoji: '🕒', desc: 'Full batch cooking session' },
    ],
  },
]

const currentQuestion = computed(() => questions[currentStep.value])
const progress = computed(() => ((currentStep.value + 1) / questions.length) * 100)
const canNext = computed(() => answers.value[currentQuestion.value?.id] !== undefined)

function selectAnswer(questionId: string, value: string) {
  answers.value[questionId] = value
}

function nextStep() {
  if (currentStep.value < questions.length - 1) {
    currentStep.value++
  } else {
    showResult()
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// Determine profile and level based on answers
function getProfile() {
  const living = answers.value.living
  const experience = answers.value.experience
  const kitchen = answers.value.kitchen
  const time = answers.value.time

  // Profile type
  let profileType: 'single' | 'couple' | 'family' | 'shift' = 'single'
  if (living === 'single') profileType = 'single'
  else if (living === 'couple') profileType = 'couple'
  else if (living === 'family') profileType = 'family'
  else if (living === 'shift') profileType = 'shift'

  // System level
  let systemLevel: 1 | 2 | 3 = 1
  if (experience === 'never' || experience === 'rarely') {
    systemLevel = 1 // Quick Prep
  } else if (experience === 'sometimes') {
    systemLevel = 2 // Partial Cook
  } else {
    systemLevel = 3 // Full Batch
  }

  // Adjust by time
  if (time === '15min') systemLevel = 1
  if (time === '120min' && systemLevel < 3) systemLevel = (systemLevel + 1) as 1 | 2 | 3

  // Adjust by kitchen
  if (kitchen === 'minimal' && systemLevel > 1) systemLevel = (systemLevel - 1) as 1 | 2 | 3

  return { profileType, systemLevel }
}

const profileLabels = {
  single: { name: 'Single / Anak Kos', emoji: '🏠' },
  couple: { name: 'Pasangan Muda', emoji: '👫' },
  family: { name: 'Keluarga', emoji: '👨‍👩‍👧‍👦' },
  shift: { name: 'Pekerja Shift', emoji: '🔄' },
}

const levelLabels = {
  1: { name: 'Quick Prep', desc: 'Siapkan bahan mentah (potong, cuci, marinate) tanpa memasak penuh', emoji: '🥬', color: 'bg-secondary/10 text-secondary' },
  2: { name: 'Partial Cook', desc: 'Masak beberapa komponen (nasi, protein, bumbu) lalu rakit saat makan', emoji: '🍳', color: 'bg-warning/10 text-warning' },
  3: { name: 'Full Batch Cooking', desc: 'Masak semua menu sekaligus untuk 3-5 hari', emoji: '👨‍🍳', color: 'bg-primary/10 text-primary' },
}

async function showResult() {
  const { profileType, systemLevel } = getProfile()

  // Save to database
  await db.profile.clear()
  await db.profile.add({
    name: '',
    profileType,
    systemLevel,
    completedOnboarding: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  isComplete.value = true
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-dvh bg-background">
    <!-- Not complete: Quiz flow -->
    <div v-if="!isComplete" class="mx-auto max-w-lg flex min-h-dvh flex-col">
      <!-- Progress bar -->
      <div class="h-1 bg-border">
        <div
          class="h-full bg-primary transition-all duration-300"
          :style="{ width: progress + '%' }"
        ></div>
      </div>

      <!-- Header -->
      <div class="px-4 pt-4">
        <button
          v-if="currentStep > 0"
          @click="prevStep"
          class="flex items-center gap-1 text-sm text-primary mb-2"
        >
          <ArrowLeft :size="16" /> Kembali
        </button>
        <router-link v-else to="/" class="flex items-center gap-1 text-sm text-primary mb-2">
          <ArrowLeft :size="16" /> Batal
        </router-link>
        <p class="text-xs text-text-secondary">
          Pertanyaan {{ currentStep + 1 }} dari {{ questions.length }}
        </p>
      </div>

      <!-- Question -->
      <div class="flex-1 px-4 py-6">
        <h1 class="text-xl font-bold text-text-primary mb-1">
          {{ currentQuestion.question }}
        </h1>
        <p class="text-sm text-text-secondary mb-6">
          {{ currentQuestion.subtitle }}
        </p>

        <!-- Options -->
        <div class="space-y-3">
          <button
            v-for="opt in currentQuestion.options"
            :key="opt.value"
            @click="selectAnswer(currentQuestion.id, opt.value)"
            class="flex w-full items-start gap-3 rounded-card border-2 p-4 text-left transition-all active:scale-[0.98]"
            :class="
              answers[currentQuestion.id] === opt.value
                ? 'border-primary bg-primary/5'
                : 'border-border bg-surface'
            "
          >
            <span class="text-2xl">{{ opt.emoji }}</span>
            <div class="flex-1">
              <p class="font-semibold text-text-primary">{{ opt.label }}</p>
              <p class="text-sm text-text-secondary mt-0.5">{{ opt.desc }}</p>
            </div>
            <div
              v-if="answers[currentQuestion.id] === opt.value"
              class="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary"
            >
              <Check :size="12" class="text-white" />
            </div>
          </button>
        </div>
      </div>

      <!-- Next button -->
      <div class="px-4 pb-6">
        <button
          @click="nextStep"
          :disabled="!canNext"
          class="flex w-full items-center justify-center gap-2 rounded-button py-3.5 font-semibold transition-all"
          :class="
            canNext
              ? 'bg-primary text-white active:scale-[0.98]'
              : 'bg-border text-text-secondary cursor-not-allowed'
          "
        >
          {{ currentStep === questions.length - 1 ? 'Lihat Hasil' : 'Lanjut' }}
          <ArrowRight :size="18" />
        </button>
      </div>
    </div>

    <!-- Complete: Result -->
    <div v-else class="mx-auto max-w-lg flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div class="w-full max-w-sm space-y-6">
        <!-- Celebration -->
        <div>
          <span class="text-5xl">🎉</span>
          <h1 class="mt-3 text-2xl font-bold text-text-primary">Profil Dapur Kamu</h1>
          <p class="text-sm text-text-secondary mt-1">Berdasarkan jawaban kamu</p>
        </div>

        <!-- Profile Card -->
        <div class="rounded-card border border-border bg-surface p-5 text-left space-y-4">
          <!-- Profile Type -->
          <div>
            <p class="text-xs uppercase tracking-wider text-text-secondary mb-1">Tipe Profil</p>
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ profileLabels[getProfile().profileType].emoji }}</span>
              <p class="text-lg font-bold text-text-primary">
                {{ profileLabels[getProfile().profileType].name }}
              </p>
            </div>
          </div>

          <!-- System Level -->
          <div>
            <p class="text-xs uppercase tracking-wider text-text-secondary mb-1">Level Sistem</p>
            <div
              class="rounded-button p-3"
              :class="levelLabels[getProfile().systemLevel].color"
            >
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ levelLabels[getProfile().systemLevel].emoji }}</span>
                <div>
                  <p class="font-bold">
                    Level {{ getProfile().systemLevel }} — {{ levelLabels[getProfile().systemLevel].name }}
                  </p>
                  <p class="text-xs mt-0.5 opacity-80">
                    {{ levelLabels[getProfile().systemLevel].desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div>
            <p class="text-xs uppercase tracking-wider text-text-secondary mb-2">Rekomendasi</p>
            <ul class="space-y-2 text-sm text-text-primary">
              <li class="flex items-start gap-2">
                <span class="text-primary mt-0.5">✓</span>
                <span v-if="getProfile().systemLevel === 1">Mulai dengan menyiapkan bahan mentah saja — potong, cuci, marinate</span>
                <span v-else-if="getProfile().systemLevel === 2">Masak komponen terpisah (nasi, protein, bumbu) lalu rakit saat makan</span>
                <span v-else>Siapkan 2 jam di weekend untuk masak 3-5 hari sekaligus</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary mt-0.5">✓</span>
                <span v-if="getProfile().profileType === 'single'">Fokus resep porsi 1-2, investasi wadah penyimpanan kecil</span>
                <span v-else-if="getProfile().profileType === 'couple'">Buat menu bersama pasangan, masak porsi 3-4 untuk sisa besok</span>
                <span v-else-if="getProfile().profileType === 'family'">Pilih menu yang anak-anak juga suka, masak porsi besar</span>
                <span v-else>Prep di hari libur, simpan porsi individual di freezer</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary mt-0.5">✓</span>
                <span>Target: masak {{ getProfile().systemLevel === 1 ? '2-3' : getProfile().systemLevel === 2 ? '3-4' : '4-5' }} hari per minggu</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- CTA -->
        <div class="space-y-2">
          <button
            @click="goHome"
            class="w-full rounded-button bg-primary py-3.5 font-semibold text-white active:scale-[0.98]"
          >
            <ChefHat :size="18" class="inline mr-1" />
            Mulai Perjalanan Masak!
          </button>
          <router-link
            to="/kalkulator"
            class="block w-full rounded-button border border-border py-3 text-center font-semibold text-text-primary"
          >
            Hitung Pengeluaran Makan Dulu
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
