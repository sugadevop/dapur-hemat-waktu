<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Check, ShoppingCart, Plus, Trash2, X } from 'lucide-vue-next'
import { db, type ShoppingItem } from '@/db'

const items = ref<ShoppingItem[]>([])
const showAddForm = ref(false)
const newItemName = ref('')
const newItemCategory = ref('Lainnya')

const categories = computed(() => {
  const cats = new Set(items.value.map(i => i.category))
  return [...cats].sort()
})

const checkedCount = computed(() => items.value.filter(i => i.checked).length)
const totalItems = computed(() => items.value.length)

function itemsByCategory(cat: string) {
  return items.value.filter(i => i.category === cat)
}

async function toggleItem(item: ShoppingItem) {
  await db.shoppingItems.update(item.id!, { checked: !item.checked })
  item.checked = !item.checked
}

async function deleteItem(id: number) {
  await db.shoppingItems.delete(id)
  items.value = items.value.filter(i => i.id !== id)
}

async function addItem() {
  if (!newItemName.value.trim()) return
  const newItem: Omit<ShoppingItem, 'id'> = {
    name: newItemName.value.trim(),
    quantity: '',
    category: newItemCategory.value,
    checked: false,
    estimasiHarga: 0,
  }
  const id = await db.shoppingItems.add(newItem)
  items.value.push({ ...newItem, id: id as number })
  newItemName.value = ''
  showAddForm.value = false
}

async function clearChecked() {
  const checkedIds = items.value.filter(i => i.checked).map(i => i.id!)
  await db.shoppingItems.bulkDelete(checkedIds)
  items.value = items.value.filter(i => !i.checked)
}

async function clearAll() {
  await db.shoppingItems.clear()
  items.value = []
}

const addCategories = ['Protein', 'Sayur', 'Bumbu', 'Karbohidrat', 'Stok', 'Lainnya']

onMounted(async () => {
  items.value = await db.shoppingItems.toArray()
})
</script>

<template>
  <div class="space-y-4 pb-4">
    <!-- Header -->
    <div class="flex items-center justify-between pt-2">
      <div>
        <h1 class="text-xl font-bold text-text-primary">Daftar Belanja</h1>
        <p class="text-xs text-text-secondary" v-if="totalItems > 0">
          {{ checkedCount }}/{{ totalItems }} ✓
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="checkedCount > 0"
          @click="clearChecked"
          class="text-xs text-text-secondary underline"
        >
          Hapus selesai
        </button>
        <button
          @click="showAddForm = !showAddForm"
          class="flex items-center gap-1 rounded-button bg-primary px-3 py-1.5 text-xs font-semibold text-white"
        >
          <Plus :size="14" /> Tambah
        </button>
      </div>
    </div>

    <!-- Add form -->
    <Transition name="slide">
      <div v-if="showAddForm" class="rounded-card border border-primary/30 bg-primary/5 p-3 space-y-2">
        <input
          v-model="newItemName"
          type="text"
          placeholder="Nama bahan..."
          class="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
          @keyup.enter="addItem"
        />
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="cat in addCategories"
            :key="cat"
            @click="newItemCategory = cat"
            class="rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors"
            :class="newItemCategory === cat ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'"
          >
            {{ cat }}
          </button>
        </div>
        <div class="flex gap-2">
          <button
            @click="addItem"
            :disabled="!newItemName.trim()"
            class="flex-1 rounded-button bg-primary py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Tambah
          </button>
          <button
            @click="showAddForm = false"
            class="rounded-button border border-border px-4 py-2 text-sm text-text-secondary"
          >
            Batal
          </button>
        </div>
      </div>
    </Transition>

    <!-- Empty state -->
    <div v-if="totalItems === 0" class="rounded-card border border-dashed border-border p-8 text-center">
      <p class="text-4xl mb-2">🛒</p>
      <p class="text-sm text-text-primary font-medium mb-1">Belum ada daftar belanja</p>
      <p class="text-xs text-text-secondary mb-3">
        Buat dari Menu Planner atau tambah manual
      </p>
      <router-link
        to="/planner"
        class="inline-flex items-center gap-1 rounded-button bg-primary px-4 py-2 text-sm font-semibold text-white"
      >
        <ShoppingCart :size="14" /> Buka Menu Planner
      </router-link>
    </div>

    <!-- Shopping list by category -->
    <div v-else class="space-y-3">
      <div v-for="cat in categories" :key="cat" class="space-y-1">
        <h3 class="text-[10px] font-semibold uppercase tracking-wider text-text-secondary px-1">
          {{ cat }}
        </h3>
        <div class="space-y-1">
          <div
            v-for="item in itemsByCategory(cat)"
            :key="item.id"
            class="flex items-center gap-2 rounded-button bg-surface border border-border p-3 transition-all"
            :class="item.checked ? 'opacity-50' : ''"
          >
            <button
              @click="toggleItem(item)"
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
              :class="item.checked ? 'border-secondary bg-secondary' : 'border-border'"
            >
              <Check v-if="item.checked" :size="14" class="text-white" />
            </button>
            <div class="flex-1 min-w-0">
              <span
                class="text-sm"
                :class="item.checked ? 'line-through text-text-secondary' : 'text-text-primary'"
              >
                {{ item.name }}
              </span>
              <span v-if="item.quantity" class="text-xs text-text-secondary ml-1">
                ({{ item.quantity }})
              </span>
            </div>
            <button
              @click="deleteItem(item.id!)"
              class="p-1 text-text-secondary shrink-0"
            >
              <X :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Clear all -->
      <button
        @click="clearAll"
        class="w-full text-center text-xs text-text-secondary underline mt-2"
      >
        Hapus semua
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
  max-height: 300px;
  opacity: 1;
}
</style>
