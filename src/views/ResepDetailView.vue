<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Clock, Users, Heart, Share2, Minus, Plus,
  ChefHat, Refrigerator, Lightbulb, Check
} from 'lucide-vue-next'
import { db, type Recipe } from '@/db'

const route = useRoute()
const router = useRouter()
const recipe = ref<Recipe | null>(null)
const servingMultiplier = ref(1)
const completedSteps = ref<Set<number>>(new Set())

const adjustedPorsi = computed(() => {
  if (!recipe.value) return 0
  return recipe.value.porsi * servingMultiplier.value
})

function adjustServings(delta: number) {
  const newVal = servingMultiplier.value + delta
  if (newVal >= 0.5 && newVal <= 5) {
    servingMultiplier.value = newVal
  }
}

function scaleQuantity(qty: string): string {
  if (servingMultiplier.value === 1) return qty
  // Try to find numbers in the quantity string and scale them
  return qty.replace(/(\d+(?:[.,]\d+)?)/g, (match) => {
    const num = parseFloat(match.replace(',', '.'))
    const scaled = num * servingMultiplier.value
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1)
  })
}

function toggleStep(index: number) {
  if (completedSteps.value.has(index)) {
    completedSteps.value.delete(index)
  } else {
    completedSteps.value.add(index)
  }
  // Force reactivity
  completedSteps.value = new Set(completedSteps.value)
}

async function toggleFavorite() {
  if (!recipe.value) return
  await db.recipes.update(recipe.value.id!, { isFavorite: !recipe.value.isFavorite })
  recipe.value.isFavorite = !recipe.value.isFavorite
}

async function shareRecipe() {
  if (!recipe.value) return
  const text = `🍳 ${recipe.value.name}\n\n` +
    `⏱ ${recipe.value.waktuMasak} menit · ${recipe.value.level} · ${recipe.value.porsi} porsi\n\n` +
    `Bahan:\n${recipe.value.bahan.map(b => `• ${b.nama} — ${b.jumlah}`).join('\n')}\n\n` +
    `Langkah:\n${recipe.value.langkah.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\n` +
    `💡 ${recipe.value.tipsPrep}\n\n` +
    `Dari: Dapur Hemat Waktu`

  if (navigator.share) {
    await navigator.share({ title: recipe.value.name, text })
  } else {
    await navigator.clipboard.writeText(text)
    alert('Resep disalin ke clipboard!')
  }
}

function levelColor(level: string) {
  if (level === 'Mudah') return 'bg-secondary/10 text-secondary'
  if (level === 'Sedang') return 'bg-warning/10 text-warning'
  return 'bg-danger/10 text-danger'
}

// Group bahan by kategori
function groupedBahan() {
  if (!recipe.value) return {}
  const groups: Record<string, typeof recipe.value.bahan> = {}
  for (const b of recipe.value.bahan) {
    if (!groups[b.kategori]) groups[b.kategori] = []
    groups[b.kategori].push(b)
  }
  return groups
}

onMounted(async () => {
  const id = Number(route.params.id)
  const found = await db.recipes.get(id)
  if (found) {
    recipe.value = found
  } else {
    router.push('/resep')
  }
})
</script>

<template>
  <div v-if="recipe" class="space-y-5 pb-8">
    <!-- Header -->
    <div class="flex items-center justify-between pt-2">
      <button @click="router.back()" class="flex items-center gap-1 text-sm text-primary">
        <ArrowLeft :size="16" /> Kembali
      </button>
      <div class="flex items-center gap-2">
        <button
          @click="shareRecipe"
          class="p-2 rounded-full text-text-secondary hover:bg-border/50"
        >
          <Share2 :size="18" />
        </button>
        <button
          @click="toggleFavorite"
          class="p-2 rounded-full transition-colors"
          :class="recipe.isFavorite ? 'text-danger' : 'text-text-secondary hover:bg-border/50'"
        >
          <Heart :size="18" :fill="recipe.isFavorite ? 'currentColor' : 'none'" />
        </button>
      </div>
    </div>

    <!-- Title -->
    <div>
      <div class="flex items-center gap-3 mb-2">
        <span class="text-4xl">{{ recipe.emoji }}</span>
        <div>
          <h1 class="text-xl font-bold text-text-primary">{{ recipe.name }}</h1>
          <div class="mt-1 flex items-center gap-2 flex-wrap">
            <span class="flex items-center gap-1 text-xs text-text-secondary">
              <Clock :size="12" /> {{ recipe.waktuMasak }} menit
            </span>
            <span
              class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              :class="levelColor(recipe.level)"
            >
              {{ recipe.level }}
            </span>
            <span class="flex items-center gap-1 text-xs text-text-secondary">
              <Users :size="12" /> {{ recipe.porsi }} porsi
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Serving adjuster -->
    <div class="rounded-card border border-border bg-surface p-3 flex items-center justify-between">
      <span class="text-sm text-text-primary font-medium">Porsi</span>
      <div class="flex items-center gap-3">
        <button
          @click="adjustServings(-0.5)"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary active:bg-border/50"
          :class="servingMultiplier <= 0.5 ? 'opacity-30' : ''"
        >
          <Minus :size="16" />
        </button>
        <span class="text-lg font-bold text-primary w-12 text-center">{{ adjustedPorsi }}</span>
        <button
          @click="adjustServings(0.5)"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary active:bg-border/50"
          :class="servingMultiplier >= 5 ? 'opacity-30' : ''"
        >
          <Plus :size="16" />
        </button>
      </div>
    </div>

    <!-- Bahan (Ingredients) -->
    <div>
      <h2 class="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
        🧂 Bahan
        <span v-if="servingMultiplier !== 1" class="text-xs text-primary font-normal">
          (×{{ servingMultiplier }})
        </span>
      </h2>
      <div class="space-y-3">
        <div v-for="(items, kategori) in groupedBahan()" :key="kategori">
          <p class="text-[10px] uppercase tracking-wider text-text-secondary mb-1 px-1">{{ kategori }}</p>
          <div class="rounded-card border border-border bg-surface divide-y divide-border">
            <div
              v-for="bahan in items"
              :key="bahan.nama"
              class="flex items-center justify-between px-3 py-2.5"
            >
              <span class="text-sm text-text-primary">{{ bahan.nama }}</span>
              <span class="text-sm text-text-secondary">{{ scaleQuantity(bahan.jumlah) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Langkah (Steps) -->
    <div>
      <h2 class="text-base font-semibold text-text-primary mb-3">👨‍🍳 Langkah</h2>
      <div class="space-y-2">
        <button
          v-for="(step, i) in recipe.langkah"
          :key="i"
          @click="toggleStep(i)"
          class="flex w-full items-start gap-3 rounded-card border bg-surface p-3 text-left transition-all"
          :class="completedSteps.has(i) ? 'border-secondary/30 bg-secondary/5' : 'border-border'"
        >
          <div
            class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors"
            :class="
              completedSteps.has(i)
                ? 'border-secondary bg-secondary text-white'
                : 'border-border text-text-secondary'
            "
          >
            <Check v-if="completedSteps.has(i)" :size="14" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <p
            class="text-sm flex-1"
            :class="completedSteps.has(i) ? 'text-text-secondary line-through' : 'text-text-primary'"
          >
            {{ step }}
          </p>
        </button>
      </div>
    </div>

    <!-- Tips Prep -->
    <div class="rounded-card bg-primary/5 border border-primary/20 p-4">
      <p class="text-sm font-semibold text-primary mb-1 flex items-center gap-1">
        <Lightbulb :size="14" /> Tips Meal Prep
      </p>
      <p class="text-sm text-text-primary">{{ recipe.tipsPrep }}</p>
    </div>

    <!-- Tahan Simpan -->
    <div class="rounded-card bg-secondary/5 border border-secondary/20 p-4">
      <p class="text-sm font-semibold text-secondary mb-1 flex items-center gap-1">
        <Refrigerator :size="14" /> Daya Tahan Simpan
      </p>
      <p class="text-sm text-text-primary">{{ recipe.tahanSimpan }}</p>
    </div>
  </div>

  <!-- Loading -->
  <div v-else class="flex items-center justify-center min-h-[50vh]">
    <div class="text-center">
      <p class="text-3xl mb-2">🍳</p>
      <p class="text-sm text-text-secondary">Memuat resep...</p>
    </div>
  </div>
</template>
