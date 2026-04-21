<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
    <span class="text-6xl mb-4">🍳</span>
    <h1 class="text-2xl font-bold text-text-primary mb-2">Dapur Hemat Waktu</h1>
    <p class="text-text-secondary mb-8">
      Kenali gaya hidupmu dan temukan sistem masak yang tepat untukmu
    </p>

    <div class="w-full max-w-sm space-y-3">
      <router-link
        to="/"
        class="block rounded-button bg-primary px-6 py-3 font-semibold text-white"
      >
        Mulai Quiz Profil Dapur
      </router-link>
      <router-link
        to="/"
        class="block rounded-button border border-border px-6 py-3 font-semibold text-text-primary"
      >
        Lewati untuk sekarang
      </router-link>
    </div>
  </div>
</template>
