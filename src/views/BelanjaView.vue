<script setup lang="ts">
import { ref } from 'vue'
import { Check, ShoppingCart } from 'lucide-vue-next'

interface BelanjaItem {
  id: number
  name: string
  category: string
  checked: boolean
}

const items = ref<BelanjaItem[]>([
  { id: 1, name: 'Ayam 1 kg', category: 'Protein', checked: false },
  { id: 2, name: 'Telur 1 papan', category: 'Protein', checked: false },
  { id: 3, name: 'Tempe 3 bungkus', category: 'Protein', checked: false },
  { id: 4, name: 'Kangkung 2 ikat', category: 'Sayur', checked: false },
  { id: 5, name: 'Bayam 2 ikat', category: 'Sayur', checked: false },
  { id: 6, name: 'Bawang merah 250g', category: 'Bumbu', checked: false },
  { id: 7, name: 'Bawang putih 100g', category: 'Bumbu', checked: false },
  { id: 8, name: 'Cabai merah 200g', category: 'Bumbu', checked: false },
  { id: 9, name: 'Beras 5 kg', category: 'Karbohidrat', checked: false },
  { id: 10, name: 'Minyak goreng 1L', category: 'Stok', checked: false },
])

const categories = ['Protein', 'Sayur', 'Bumbu', 'Karbohidrat', 'Stok']

function toggleItem(id: number) {
  const item = items.value.find((i) => i.id === id)
  if (item) item.checked = !item.checked
}

function itemsByCategory(cat: string) {
  return items.value.filter((i) => i.category === cat)
}

const checkedCount = () => items.value.filter((i) => i.checked).length
</script>

<template>
  <div class="space-y-4 pb-4">
    <div class="flex items-center justify-between pt-2">
      <h1 class="text-xl font-bold">Daftar Belanja</h1>
      <span class="text-sm text-text-secondary">
        {{ checkedCount() }}/{{ items.length }} ✓
      </span>
    </div>

    <div v-for="cat in categories" :key="cat" class="space-y-1">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-text-secondary px-1">
        {{ cat }}
      </h3>
      <div class="space-y-1">
        <button
          v-for="item in itemsByCategory(cat)"
          :key="item.id"
          @click="toggleItem(item.id)"
          class="flex w-full items-center gap-3 rounded-button bg-surface border border-border p-3 text-left transition-all"
          :class="item.checked ? 'opacity-50' : ''"
        >
          <div
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
            :class="
              item.checked
                ? 'border-secondary bg-secondary'
                : 'border-border'
            "
          >
            <Check v-if="item.checked" :size="14" class="text-white" />
          </div>
          <span
            class="text-sm"
            :class="item.checked ? 'line-through text-text-secondary' : 'text-text-primary'"
          >
            {{ item.name }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
