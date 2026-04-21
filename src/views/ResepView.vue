<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Clock, Heart, Filter, X } from 'lucide-vue-next'
import { db, type Recipe } from '@/db'

const recipes = ref<Recipe[]>([])
const searchQuery = ref('')
const activeCategory = ref('Semua')
const activeLevel = ref('Semua')
const showFilter = ref(false)

const categories = ['Semua', 'Protein', 'Sayur', 'Karbohidrat', 'Pendamping']
const levels = ['Semua', 'Mudah', 'Sedang', 'Sulit']

const filteredRecipes = computed(() => {
  let result = recipes.value

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.bahan.some(b => b.nama.toLowerCase().includes(q))
    )
  }

  // Category filter
  if (activeCategory.value !== 'Semua') {
    result = result.filter(r => r.category === activeCategory.value)
  }

  // Level filter
  if (activeLevel.value !== 'Semua') {
    result = result.filter(r => r.level === activeLevel.value)
  }

  return result
})

const favoriteCount = computed(() => recipes.value.filter(r => r.isFavorite).length)

async function toggleFavorite(recipe: Recipe) {
  await db.recipes.update(recipe.id!, { isFavorite: !recipe.isFavorite })
  recipe.isFavorite = !recipe.isFavorite
}

function levelColor(level: string) {
  if (level === 'Mudah') return 'bg-secondary/10 text-secondary'
  if (level === 'Sedang') return 'bg-warning/10 text-warning'
  return 'bg-danger/10 text-danger'
}

function resetFilters() {
  activeCategory.value = 'Semua'
  activeLevel.value = 'Semua'
  searchQuery.value = ''
  showFilter.value = false
}

onMounted(async () => {
  recipes.value = await db.recipes.toArray()
})
</script>

<template>
  <div class="space-y-4 pb-4">
    <!-- Header -->
    <div class="flex items-center justify-between pt-2">
      <h1 class="text-xl font-bold text-text-primary">Resep</h1>
      <span class="text-xs text-text-secondary">{{ filteredRecipes.length }} resep</span>
    </div>

    <!-- Search -->
    <div class="relative">
      <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Cari resep atau bahan..."
        class="w-full rounded-input border border-border bg-surface pl-10 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
      >
        <X :size="16" />
      </button>
    </div>

    <!-- Category chips -->
    <div class="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeCategory = cat"
        class="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
        :class="
          activeCategory === cat
            ? 'bg-primary text-white'
            : 'bg-surface border border-border text-text-secondary'
        "
      >
        {{ cat }}
      </button>
      <button
        @click="showFilter = !showFilter"
        class="shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors"
        :class="
          activeLevel !== 'Semua'
            ? 'bg-primary/10 border-primary text-primary'
            : 'bg-surface border-border text-text-secondary'
        "
      >
        <Filter :size="12" /> Level
      </button>
    </div>

    <!-- Level filter (expandable) -->
    <Transition name="slide">
      <div v-if="showFilter" class="flex gap-2 flex-wrap">
        <button
          v-for="lvl in levels"
          :key="lvl"
          @click="activeLevel = lvl; showFilter = false"
          class="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
          :class="
            activeLevel === lvl
              ? 'bg-primary text-white'
              : 'bg-surface border border-border text-text-secondary'
          "
        >
          {{ lvl }}
        </button>
      </div>
    </Transition>

    <!-- Active filters indicator -->
    <div v-if="activeCategory !== 'Semua' || activeLevel !== 'Semua' || searchQuery" class="flex items-center gap-2">
      <span class="text-xs text-text-secondary">Filter aktif:</span>
      <button
        @click="resetFilters"
        class="text-xs text-primary underline"
      >
        Reset semua
      </button>
    </div>

    <!-- Recipe Cards -->
    <div v-if="filteredRecipes.length > 0" class="space-y-2">
      <div
        v-for="resep in filteredRecipes"
        :key="resep.id"
        class="rounded-card border border-border bg-surface overflow-hidden transition-shadow hover:shadow-md"
      >
        <router-link
          :to="`/resep/${resep.id}`"
          class="flex items-center gap-3 p-4"
        >
          <span class="text-3xl shrink-0">{{ resep.emoji }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-text-primary truncate">{{ resep.name }}</p>
            <div class="mt-1.5 flex items-center gap-2 flex-wrap">
              <span class="flex items-center gap-1 text-xs text-text-secondary">
                <Clock :size="12" /> {{ resep.waktuMasak }} menit
              </span>
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                :class="levelColor(resep.level)"
              >
                {{ resep.level }}
              </span>
              <span class="text-[10px] text-text-secondary">{{ resep.porsi }} porsi</span>
            </div>
            <p class="mt-1 text-xs text-text-secondary truncate">
              {{ resep.tipsPrep }}
            </p>
          </div>
        </router-link>
        <!-- Favorite button -->
        <div class="flex items-center justify-between border-t border-border px-4 py-2">
          <span class="text-[10px] text-text-secondary">
            {{ resep.bahan.length }} bahan · {{ resep.tahanSimpan }}
          </span>
          <button
            @click.prevent="toggleFavorite(resep)"
            class="p-1 transition-colors"
            :class="resep.isFavorite ? 'text-danger' : 'text-text-secondary'"
          >
            <Heart :size="16" :fill="resep.isFavorite ? 'currentColor' : 'none'" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="rounded-card border border-dashed border-border p-8 text-center">
      <p class="text-4xl mb-2">🔍</p>
      <p class="text-sm text-text-secondary">Tidak ada resep yang cocok</p>
      <button @click="resetFilters" class="mt-2 text-sm text-primary underline">
        Reset filter
      </button>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
.slide-enter-to, .slide-leave-from {
  max-height: 100px;
  opacity: 1;
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
