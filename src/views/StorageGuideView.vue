<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Thermometer, Clock, AlertTriangle, X, Refrigerator } from 'lucide-vue-next'

interface StorageGuide {
  nama: string
  emoji: string
  kategori: string
  suhuKulkas: string
  durasiKulkas: string
  suhuFreezer: string
  durasiFreezer: string
  wadah: string
  tandaRusak: string
  tips: string
}

const guides: StorageGuide[] = [
  // === SAYURAN ===
  { nama: 'Bayam', emoji: '🥬', kategori: 'Sayuran Daun', suhuKulkas: '1-4°C', durasiKulkas: '2-3 hari', suhuFreezer: '-18°C', durasiFreezer: '1 bulan (blanch dulu)', wadah: 'Wadah tertutup + tisu basah', tandaRusak: 'Layu, berlendir, bau asam', tips: 'Jangan cuci sebelum simpan. Bungkus dengan tisu kering, taruh di wadah tertutup.' },
  { nama: 'Kangkung', emoji: '🥬', kategori: 'Sayuran Daun', suhuKulkas: '1-4°C', durasiKulkas: '2-3 hari', suhuFreezer: 'Tidak disarankan', durasiFreezer: '-', wadah: 'Plastik berlubang / tisu basah', tandaRusak: 'Layu, daun menguning, berlendir', tips: 'Siangi dulu, bungkus batang dengan tisu basah. Sebaiknya langsung dimasak.' },
  { nama: 'Sawi Putih', emoji: '🥬', kategori: 'Sayuran Daun', suhuKulkas: '1-4°C', durasiKulkas: '5-7 hari', suhuFreezer: '-18°C', durasiFreezer: '1 bulan (blanch)', wadah: 'Plastik wrap / wadah tertutup', tandaRusak: 'Bercak coklat, berlendir, bau', tips: 'Lebih tahan dari bayam/kangkung. Simpan utuh, potong saat mau masak.' },
  { nama: 'Wortel', emoji: '🥕', kategori: 'Sayuran', suhuKulkas: '1-4°C', durasiKulkas: '2-3 minggu', suhuFreezer: '-18°C', durasiFreezer: '3 bulan (blanch + potong)', wadah: 'Plastik / wadah tertutup', tandaRusak: 'Lembek, berlendir, berjamur', tips: 'Buang daun hijau di atas. Simpan di drawer kulkas. Sangat tahan lama.' },
  { nama: 'Brokoli', emoji: '🥦', kategori: 'Sayuran', suhuKulkas: '1-4°C', durasiKulkas: '3-5 hari', suhuFreezer: '-18°C', durasiFreezer: '3 bulan (blanch)', wadah: 'Plastik berlubang', tandaRusak: 'Menguning, bau menyengat, lembek', tips: 'Jangan cuci sebelum simpan. Potong per kuntum saat mau blanch untuk freezer.' },
  { nama: 'Labu Siam', emoji: '🫛', kategori: 'Sayuran', suhuKulkas: '7-10°C', durasiKulkas: '1-2 minggu', suhuFreezer: 'Tidak disarankan', durasiFreezer: '-', wadah: 'Suhu ruang / kulkas tanpa plastik', tandaRusak: 'Keriput, lembek, berjamur', tips: 'Bisa disimpan di suhu ruang beberapa hari. Masuk kulkas untuk lebih lama.' },
  { nama: 'Jagung Manis', emoji: '🌽', kategori: 'Sayuran', suhuKulkas: '1-4°C', durasiKulkas: '3-5 hari', suhuFreezer: '-18°C', durasiFreezer: '3 bulan', wadah: 'Plastik wrap dengan kulit', tandaRusak: 'Kering, biji keriput, berjamur', tips: 'Simpan dengan kulit untuk menjaga kelembapan. Bisa dibekukan langsung.' },

  // === PROTEIN ===
  { nama: 'Ayam Segar', emoji: '🍗', kategori: 'Protein', suhuKulkas: '0-4°C', durasiKulkas: '1-2 hari', suhuFreezer: '-18°C', durasiFreezer: '3-6 bulan', wadah: 'Wadah tertutup rapat / zip bag', tandaRusak: 'Bau amis menyengat, berlendir, warna keabu-abuan', tips: 'Langsung masuk kulkas/freezer setelah beli. Marinasi sebelum bekukan untuk hemat waktu.' },
  { nama: 'Daging Sapi', emoji: '🥩', kategori: 'Protein', suhuKulkas: '0-4°C', durasiKulkas: '2-3 hari', suhuFreezer: '-18°C', durasiFreezer: '4-6 bulan', wadah: 'Zip bag (keluarkan udara)', tandaRusak: 'Bau busuk, berlendir, warna kehijauan', tips: 'Potong per porsi sebelum bekukan. Thaw di kulkas semalam, JANGAN di suhu ruang.' },
  { nama: 'Telur', emoji: '🥚', kategori: 'Protein', suhuKulkas: '4°C', durasiKulkas: '3-4 minggu', suhuFreezer: 'Tidak disarankan (utuh)', durasiFreezer: '-', wadah: 'Rak telur / karton asli', tandaRusak: 'Tes air: tenggelam = segar, mengapung = buang', tips: 'Simpan di rak kulkas (bukan pintu). Jangan cuci sebelum simpan.' },
  { nama: 'Tempe', emoji: '🫘', kategori: 'Protein', suhuKulkas: '4°C', durasiKulkas: '2-3 hari', suhuFreezer: '-18°C', durasiFreezer: '1-2 bulan', wadah: 'Plastik berlubang / kertas', tandaRusak: 'Bau amoniak kuat, berlendir hitam, lembek', tips: 'Bungkus kertas/daun untuk sirkulasi udara. Bekukan langsung untuk stop fermentasi.' },
  { nama: 'Tahu', emoji: '🧈', kategori: 'Protein', suhuKulkas: '4°C', durasiKulkas: '3-5 hari (dalam air)', suhuFreezer: '-18°C', durasiFreezer: '1 bulan', wadah: 'Wadah berisi air, ganti air tiap hari', tandaRusak: 'Bau asam, berlendir, air keruh', tips: 'Rendam dalam air bersih, ganti setiap hari. Tahu beku teksturnya berubah (bagus untuk tahu goreng).' },
  { nama: 'Ikan Segar', emoji: '🐟', kategori: 'Protein', suhuKulkas: '0-2°C', durasiKulkas: '1 hari', suhuFreezer: '-18°C', durasiFreezer: '2-3 bulan', wadah: 'Zip bag rapat', tandaRusak: 'Mata keruh, insang coklat, bau menyengat, daging lembek', tips: 'Paling cepat rusak! Langsung bekukan kalau tidak dimasak hari itu.' },

  // === BUMBU SEGAR ===
  { nama: 'Bawang Merah', emoji: '🧅', kategori: 'Bumbu', suhuKulkas: 'Suhu ruang', durasiKulkas: '2-4 minggu', suhuFreezer: '-18°C (iris)', durasiFreezer: '3 bulan', wadah: 'Jaring / tempat terbuka, kering', tandaRusak: 'Lembek, berjamur, bertunas panjang', tips: 'Simpan di tempat kering dan berventilasi. Jangan di plastik tertutup.' },
  { nama: 'Bawang Putih', emoji: '🧄', kategori: 'Bumbu', suhuKulkas: 'Suhu ruang', durasiKulkas: '3-5 bulan (utuh)', suhuFreezer: '-18°C (cincang)', durasiFreezer: '6 bulan', wadah: 'Tempat terbuka, kering', tandaRusak: 'Lembek, berjamur, bertunas hijau', tips: 'Sangat tahan lama kalau utuh. Jangan simpan di kulkas (jadi lembab).' },
  { nama: 'Cabai Merah', emoji: '🌶️', kategori: 'Bumbu', suhuKulkas: '7-10°C', durasiKulkas: '1-2 minggu', suhuFreezer: '-18°C', durasiFreezer: '3 bulan', wadah: 'Plastik berlubang / tisu', tandaRusak: 'Keriput, bercak hitam, lembek', tips: 'Bisa dibekukan langsung tanpa blanch. Iris dulu sebelum bekukan untuk mudah dipakai.' },
  { nama: 'Jahe', emoji: '🫚', kategori: 'Bumbu', suhuKulkas: '4°C', durasiKulkas: '2-3 minggu', suhuFreezer: '-18°C', durasiFreezer: '3 bulan', wadah: 'Plastik / tisu kering', tandaRusak: 'Keriput parah, berjamur, lembek', tips: 'Bisa diparut langsung dari frozen — lebih mudah! Simpan utuh, jangan kupas.' },
  { nama: 'Kunyit', emoji: '🟡', kategori: 'Bumbu', suhuKulkas: '4°C', durasiKulkas: '2-3 minggu', suhuFreezer: '-18°C', durasiFreezer: '3 bulan', wadah: 'Plastik / tisu kering', tandaRusak: 'Kering, keriput, berjamur', tips: 'Sama seperti jahe — bisa diparut dari frozen. Hati-hati noda kuning!' },
  { nama: 'Serai', emoji: '🌿', kategori: 'Bumbu', suhuKulkas: '4°C', durasiKulkas: '2 minggu', suhuFreezer: '-18°C', durasiFreezer: '3 bulan', wadah: 'Plastik / wadah tertutup', tandaRusak: 'Kering, coklat, tidak harum', tips: 'Potong-potong dulu sebelum bekukan. Bisa langsung dipakai dari frozen.' },
  { nama: 'Lengkuas', emoji: '🌿', kategori: 'Bumbu', suhuKulkas: '4°C', durasiKulkas: '2-3 minggu', suhuFreezer: '-18°C', durasiFreezer: '3 bulan', wadah: 'Plastik / tisu kering', tandaRusak: 'Kering, berjamur, lembek', tips: 'Iris/geprek dulu sebelum bekukan. Sangat tahan lama di freezer.' },

  // === STOK ===
  { nama: 'Santan Kemasan', emoji: '🥥', kategori: 'Stok', suhuKulkas: 'Suhu ruang (belum buka)', durasiKulkas: '3-4 hari (sudah buka)', suhuFreezer: '-18°C', durasiFreezer: '1 bulan', wadah: 'Wadah tertutup rapat', tandaRusak: 'Bau asam, menggumpal, berubah warna', tips: 'Setelah buka, langsung masuk kulkas. Bisa dibekukan di ice cube tray untuk porsi kecil.' },
  { nama: 'Kecap Manis', emoji: '🫗', kategori: 'Stok', suhuKulkas: 'Suhu ruang', durasiKulkas: '6-12 bulan', suhuFreezer: '-', durasiFreezer: '-', wadah: 'Botol asli, tutup rapat', tandaRusak: 'Berjamur, bau aneh, berubah tekstur', tips: 'Tidak perlu kulkas. Pastikan tutup rapat setelah pakai.' },
  { nama: 'Minyak Goreng', emoji: '🫗', kategori: 'Stok', suhuKulkas: 'Suhu ruang', durasiKulkas: '6-12 bulan', suhuFreezer: '-', durasiFreezer: '-', wadah: 'Botol tertutup, jauh dari cahaya', tandaRusak: 'Bau tengik, warna gelap, berbusa saat dipanaskan', tips: 'Simpan di tempat gelap dan sejuk. Minyak bekas max 2-3x pakai.' },
  { nama: 'Beras', emoji: '🍚', kategori: 'Stok', suhuKulkas: 'Suhu ruang', durasiKulkas: '6-12 bulan', suhuFreezer: '-', durasiFreezer: '-', wadah: 'Wadah tertutup rapat, kering', tandaRusak: 'Kutu, bau apek, berubah warna', tips: 'Taruh daun pandan di wadah beras untuk mengusir kutu dan memberi aroma.' },
]

const searchQuery = ref('')
const activeCategory = ref('Semua')
const expandedItem = ref<string | null>(null)

const categories = ['Semua', 'Sayuran Daun', 'Sayuran', 'Protein', 'Bumbu', 'Stok']

const filteredGuides = computed(() => {
  let result = guides
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(g => g.nama.toLowerCase().includes(q) || g.kategori.toLowerCase().includes(q))
  }
  if (activeCategory.value !== 'Semua') {
    result = result.filter(g => g.kategori === activeCategory.value)
  }
  return result
})

function toggleExpand(nama: string) {
  expandedItem.value = expandedItem.value === nama ? null : nama
}
</script>

<template>
  <div class="space-y-4 pb-4">
    <div class="pt-2">
      <h1 class="text-xl font-bold text-text-primary">Panduan Simpan Bahan</h1>
      <p class="text-xs text-text-secondary">{{ filteredGuides.length }} bahan makanan Indonesia</p>
    </div>

    <!-- Search -->
    <div class="relative">
      <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Cari bahan..."
        class="w-full rounded-input border border-border bg-surface pl-10 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
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
        :class="activeCategory === cat ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Guide cards -->
    <div class="space-y-2">
      <div
        v-for="item in filteredGuides"
        :key="item.nama"
        class="rounded-card border border-border bg-surface overflow-hidden"
      >
        <!-- Header (always visible) -->
        <button
          @click="toggleExpand(item.nama)"
          class="flex w-full items-center gap-3 p-3 text-left"
        >
          <span class="text-2xl shrink-0">{{ item.emoji }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-text-primary">{{ item.nama }}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="flex items-center gap-1 text-[10px] text-text-secondary">
                <Refrigerator :size="10" /> {{ item.durasiKulkas }}
              </span>
              <span class="text-[10px] text-text-secondary">·</span>
              <span class="text-[10px] text-text-secondary">{{ item.kategori }}</span>
            </div>
          </div>
          <span class="text-text-secondary transition-transform" :class="expandedItem === item.nama ? 'rotate-180' : ''">▾</span>
        </button>

        <!-- Expanded detail -->
        <Transition name="expand">
          <div v-if="expandedItem === item.nama" class="border-t border-border px-3 pb-3 pt-2 space-y-2">
            <!-- Storage info grid -->
            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-button bg-blue-50 p-2">
                <p class="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                  <Thermometer :size="10" /> Kulkas
                </p>
                <p class="text-xs text-text-primary font-medium">{{ item.durasiKulkas }}</p>
                <p class="text-[10px] text-text-secondary">{{ item.suhuKulkas }}</p>
              </div>
              <div class="rounded-button bg-cyan-50 p-2">
                <p class="text-[10px] text-cyan-600 font-semibold flex items-center gap-1">
                  ❄️ Freezer
                </p>
                <p class="text-xs text-text-primary font-medium">{{ item.durasiFreezer }}</p>
                <p class="text-[10px] text-text-secondary">{{ item.suhuFreezer }}</p>
              </div>
            </div>

            <!-- Wadah -->
            <div class="rounded-button bg-surface border border-border p-2">
              <p class="text-[10px] text-text-secondary font-semibold">📦 Wadah</p>
              <p class="text-xs text-text-primary">{{ item.wadah }}</p>
            </div>

            <!-- Tanda rusak -->
            <div class="rounded-button bg-danger/5 border border-danger/20 p-2">
              <p class="text-[10px] text-danger font-semibold flex items-center gap-1">
                <AlertTriangle :size="10" /> Tanda Rusak
              </p>
              <p class="text-xs text-text-primary">{{ item.tandaRusak }}</p>
            </div>

            <!-- Tips -->
            <div class="rounded-button bg-primary/5 border border-primary/20 p-2">
              <p class="text-[10px] text-primary font-semibold">💡 Tips</p>
              <p class="text-xs text-text-primary">{{ item.tips }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredGuides.length === 0" class="rounded-card border border-dashed border-border p-8 text-center">
      <p class="text-4xl mb-2">🔍</p>
      <p class="text-sm text-text-secondary">Bahan tidak ditemukan</p>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.2s ease;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
.expand-enter-to, .expand-leave-from {
  max-height: 500px;
  opacity: 1;
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
