<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CalendarDays, Plus, X, ShoppingCart, ChefHat, Trash2 } from 'lucide-vue-next'
import { db, type Recipe, type MenuPlan } from '@/db'
import { useRouter } from 'vue-router'

const router = useRouter()
const recipes = ref<Recipe[]>([])
const showPicker = ref(false)
const pickerDay = ref('')
const pickerSlot = ref<'sarapan' | 'makan_siang' | 'makan_malam'>('makan_siang')
const searchQuery = ref('')

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const slots = [
  { key: 'sarapan' as const, label: 'Pagi', emoji: '🌅' },
  { key: 'makan_siang' as const, label: 'Siang', emoji: '☀️' },
  { key: 'makan_malam' as const, label: 'Malam', emoji: '🌙' },
]

// Menu plan state
const menuSlots = ref<Record<string, Record<string, number | undefined>>>({})

// Initialize empty slots
function initSlots() {
  for (const day of days) {
    if (!menuSlots.value[day]) {
      menuSlots.value[day] = {}
    }
  }
}

function getRecipe(id: number | undefined): Recipe | undefined {
  if (!id) return undefined
  return recipes.value.find(r => r.id === id)
}

function openPicker(day: string, slot: 'sarapan' | 'makan_siang' | 'makan_malam') {
  pickerDay.value = day
  pickerSlot.value = slot
  searchQuery.value = ''
  showPicker.value = true
}

function selectRecipe(recipeId: number) {
  if (!menuSlots.value[pickerDay.value]) menuSlots.value[pickerDay.value] = {}
  menuSlots.value[pickerDay.value][pickerSlot.value] = recipeId
  showPicker.value = false
  saveMenuPlan()
}

function removeRecipe(day: string, slot: string) {
  if (menuSlots.value[day]) {
    delete menuSlots.value[day][slot]
    menuSlots.value = { ...menuSlots.value }
    saveMenuPlan()
  }
}

const filteredPickerRecipes = computed(() => {
  if (!searchQuery.value) return recipes.value
  const q = searchQuery.value.toLowerCase()
  return recipes.value.filter(r => r.name.toLowerCase().includes(q))
})

// Count filled slots
const filledCount = computed(() => {
  let count = 0
  for (const day of days) {
    for (const slot of slots) {
      if (menuSlots.value[day]?.[slot.key]) count++
    }
  }
  return count
})

// Generate shopping list from menu
const shoppingList = computed(() => {
  const items: Record<string, { nama: string; jumlah: string[]; kategori: string }> = {}

  for (const day of days) {
    for (const slot of slots) {
      const recipeId = menuSlots.value[day]?.[slot.key]
      if (!recipeId) continue
      const recipe = getRecipe(recipeId)
      if (!recipe) continue

      for (const bahan of recipe.bahan) {
        const key = bahan.nama.toLowerCase()
        if (!items[key]) {
          items[key] = { nama: bahan.nama, jumlah: [], kategori: bahan.kategori }
        }
        items[key].jumlah.push(bahan.jumlah)
      }
    }
  }

  // Group by kategori
  const grouped: Record<string, { nama: string; jumlah: string; kategori: string }[]> = {}
  for (const item of Object.values(items)) {
    if (!grouped[item.kategori]) grouped[item.kategori] = []
    grouped[item.kategori].push({
      nama: item.nama,
      jumlah: item.jumlah.join(' + '),
      kategori: item.kategori,
    })
  }
  return grouped
})

const hasShoppingItems = computed(() => Object.keys(shoppingList.value).length > 0)

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.setDate(diff)).toISOString().split('T')[0]
}

async function saveMenuPlan() {
  const weekStart = getWeekStart()
  // Delete existing plan for this week
  const existing = await db.menuPlans.where('weekStart').equals(weekStart).first()
  if (existing) {
    await db.menuPlans.update(existing.id!, { slots: JSON.parse(JSON.stringify(menuSlots.value)) })
  } else {
    await db.menuPlans.add({
      weekStart,
      slots: JSON.parse(JSON.stringify(menuSlots.value)),
      createdAt: new Date().toISOString(),
    })
  }
}

async function loadMenuPlan() {
  const weekStart = getWeekStart()
  const plan = await db.menuPlans.where('weekStart').equals(weekStart).first()
  if (plan) {
    menuSlots.value = plan.slots as any
  }
}

async function generateShoppingList() {
  // Clear existing items
  await db.shoppingItems.clear()

  // Add items from shopping list
  for (const [kategori, items] of Object.entries(shoppingList.value)) {
    for (const item of items) {
      await db.shoppingItems.add({
        name: item.nama,
        quantity: item.jumlah,
        category: item.kategori,
        checked: false,
        estimasiHarga: 0,
      })
    }
  }

  router.push('/belanja')
}

function clearAll() {
  menuSlots.value = {}
  initSlots()
  saveMenuPlan()
}

onMounted(async () => {
  recipes.value = await db.recipes.toArray()
  initSlots()
  await loadMenuPlan()
})
</script>

<template>
  <div class="space-y-4 pb-4">
    <!-- Header -->
    <div class="flex items-center justify-between pt-2">
      <div>
        <h1 class="text-xl font-bold text-text-primary">Menu Planner</h1>
        <p class="text-xs text-text-secondary">{{ filledCount }} menu diisi minggu ini</p>
      </div>
      <button
        v-if="filledCount > 0"
        @click="clearAll"
        class="flex items-center gap-1 text-xs text-text-secondary"
      >
        <Trash2 :size="12" /> Reset
      </button>
    </div>

    <!-- Weekly Grid -->
    <div class="space-y-3">
      <div
        v-for="day in days"
        :key="day"
        class="rounded-card border border-border bg-surface overflow-hidden"
      >
        <!-- Day header -->
        <div class="bg-border/30 px-3 py-1.5">
          <p class="text-xs font-semibold text-text-primary">{{ day }}</p>
        </div>

        <!-- Meal slots -->
        <div class="divide-y divide-border">
          <div
            v-for="slot in slots"
            :key="slot.key"
            class="flex items-center gap-2 px-3 py-2"
          >
            <span class="text-sm w-6 text-center">{{ slot.emoji }}</span>

            <!-- Filled slot -->
            <div
              v-if="menuSlots[day]?.[slot.key]"
              class="flex-1 flex items-center justify-between"
            >
              <router-link
                :to="`/resep/${menuSlots[day][slot.key]}`"
                class="flex items-center gap-2 flex-1 min-w-0"
              >
                <span class="text-lg">{{ getRecipe(menuSlots[day][slot.key])?.emoji }}</span>
                <span class="text-sm text-text-primary truncate">
                  {{ getRecipe(menuSlots[day][slot.key])?.name }}
                </span>
              </router-link>
              <button
                @click="removeRecipe(day, slot.key)"
                class="p-1 text-text-secondary shrink-0"
              >
                <X :size="14" />
              </button>
            </div>

            <!-- Empty slot -->
            <button
              v-else
              @click="openPicker(day, slot.key)"
              class="flex-1 flex items-center gap-2 text-text-secondary"
            >
              <Plus :size="14" />
              <span class="text-xs">{{ slot.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Shopping List button -->
    <button
      v-if="hasShoppingItems"
      @click="generateShoppingList"
      class="flex w-full items-center justify-center gap-2 rounded-button bg-primary py-3 font-semibold text-white active:scale-[0.98]"
    >
      <ShoppingCart :size="18" />
      Buat Daftar Belanja ({{ Object.values(shoppingList).flat().length }} bahan)
    </button>

    <!-- Recipe Picker Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showPicker"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          @click.self="showPicker = false"
        >
          <div class="w-full max-w-lg rounded-t-2xl bg-surface max-h-[75vh] flex flex-col">
            <!-- Picker header -->
            <div class="flex items-center justify-between p-4 border-b border-border">
              <div>
                <p class="font-semibold text-text-primary">Pilih Resep</p>
                <p class="text-xs text-text-secondary">
                  {{ pickerDay }} · {{ slots.find(s => s.key === pickerSlot)?.label }}
                </p>
              </div>
              <button @click="showPicker = false" class="p-1 text-text-secondary">
                <X :size="20" />
              </button>
            </div>

            <!-- Search -->
            <div class="px-4 py-2">
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Cari resep..."
                class="w-full rounded-input border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            <!-- Recipe list -->
            <div class="flex-1 overflow-y-auto px-4 pb-4">
              <button
                v-for="recipe in filteredPickerRecipes"
                :key="recipe.id"
                @click="selectRecipe(recipe.id!)"
                class="flex w-full items-center gap-3 rounded-card border border-border p-3 mb-2 text-left active:bg-border/30"
              >
                <span class="text-2xl">{{ recipe.emoji }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-text-primary truncate">{{ recipe.name }}</p>
                  <p class="text-xs text-text-secondary">
                    {{ recipe.waktuMasak }} menit · {{ recipe.level }} · {{ recipe.porsi }} porsi
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div, .modal-leave-to > div {
  transform: translateY(100%);
}
</style>
