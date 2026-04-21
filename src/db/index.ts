import Dexie, { type EntityTable } from 'dexie'

// === Types ===

export interface AuditRecord {
  id?: number
  weekStart: string // ISO date of Monday
  spending: number[] // 7 days [Mon-Sun]
  totalWeekly: number
  estimasiMasak: number
  hemat: number
  createdAt: string
}

export interface UserProfile {
  id?: number
  name: string
  profileType: 'single' | 'couple' | 'family' | 'shift'
  systemLevel: 1 | 2 | 3
  completedOnboarding: boolean
  createdAt: string
  updatedAt: string
}

export interface Recipe {
  id?: number
  name: string
  emoji: string
  category: string
  waktuMasak: number // minutes
  level: 'Mudah' | 'Sedang' | 'Sulit'
  porsi: number
  bahan: { nama: string; jumlah: string; kategori: string }[]
  langkah: string[]
  tipsPrep: string
  tahanSimpan: string
  isFavorite: boolean
}

export interface MenuPlan {
  id?: number
  weekStart: string
  slots: {
    [day: string]: {
      sarapan?: number // recipe id
      makan_siang?: number
      makan_malam?: number
    }
  }
  createdAt: string
}

export interface ShoppingItem {
  id?: number
  menuPlanId?: number
  name: string
  quantity: string
  category: string
  checked: boolean
  estimasiHarga: number
}

export interface ChallengeDay {
  id?: number
  day: number // 1-14
  date: string
  completed: boolean
  notes: string
}

// === Database ===

class DapurDB extends Dexie {
  audits!: EntityTable<AuditRecord, 'id'>
  profile!: EntityTable<UserProfile, 'id'>
  recipes!: EntityTable<Recipe, 'id'>
  menuPlans!: EntityTable<MenuPlan, 'id'>
  shoppingItems!: EntityTable<ShoppingItem, 'id'>
  challengeDays!: EntityTable<ChallengeDay, 'id'>

  constructor() {
    super('DapurHematWaktu')

    this.version(1).stores({
      audits: '++id, weekStart, createdAt',
      profile: '++id',
      recipes: '++id, name, category, level, isFavorite',
      menuPlans: '++id, weekStart',
      shoppingItems: '++id, menuPlanId, category, checked',
      challengeDays: '++id, day, date',
    })
  }
}

export const db = new DapurDB()
