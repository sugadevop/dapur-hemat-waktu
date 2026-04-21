<script setup lang="ts">
</script>

<template>
  <div class="space-y-4 pb-4">
    <h1 class="text-xl font-bold pt-2">Profil</h1>
    <div class="rounded-card border border-border bg-surface p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span class="text-xl">👤</span>
        </div>
        <div>
          <p class="font-semibold text-text-primary">Pengguna Baru</p>
          <p class="text-sm text-text-secondary">Belum isi profil dapur</p>
        </div>
      </div>
    </div>

    <router-link
      to="/onboarding"
      class="block rounded-button bg-primary px-4 py-3 text-center font-semibold text-white"
    >
      Isi Profil Dapur
    </router-link>

    <router-link
      to="/kalkulator"
      class="block rounded-button border border-border bg-surface px-4 py-3 text-center font-semibold text-text-primary"
    >
      Kalkulator Pengeluaran
    </router-link>
  </div>
</template>
