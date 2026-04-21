import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'planner',
          name: 'planner',
          component: () => import('@/views/PlannerView.vue'),
        },
        {
          path: 'belanja',
          name: 'belanja',
          component: () => import('@/views/BelanjaView.vue'),
        },
        {
          path: 'resep',
          name: 'resep',
          component: () => import('@/views/ResepView.vue'),
        },
        {
          path: 'resep/:id',
          name: 'resep-detail',
          component: () => import('@/views/ResepDetailView.vue'),
        },
        {
          path: 'profil',
          name: 'profil',
          component: () => import('@/views/ProfilView.vue'),
        },
        {
          path: 'panduan-simpan',
          name: 'panduan-simpan',
          component: () => import('@/views/StorageGuideView.vue'),
        },
      ],
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
    },
    {
      path: '/kalkulator',
      name: 'kalkulator',
      component: () => import('@/views/KalkulatorView.vue'),
    },
    {
      path: '/challenge',
      name: 'challenge',
      component: () => import('@/views/ChallengeView.vue'),
    },
  ],
})

export default router
