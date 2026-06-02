<script setup>
import { RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'

const router = useRouter()
const users = ref([])
const userName = ref(null)
const userRole = ref('')
const activeCategory = ref('')
const dropdownOpen = ref(false)
const products = ref([])

const categories = [
  { name: 'Mobily', icon: '📱' },
  { name: 'Počítače', icon: '💻' },
  { name: 'Chladničky', icon: '❄️' },
  { name: 'Práčky', icon: '🌀' },
  { name: 'Tablety', icon: '📟' },
  { name: 'Gaming', icon: '🎮' },
  { name: 'Kuchyňa', icon: '🍳' },
]

onMounted(async () => {
  const response = await fetch('http://localhost:3000/me', {
    credentials: 'include',
  })

  if (response.ok) {
    const user = await response.json()
    userName.value = user.username
    userRole.value = user.role
    localStorage.setItem('user', JSON.stringify(user))
  } else {
    localStorage.removeItem('user')
    userName.value = null
    userRole.value = ''
  }

  document.addEventListener('click', () => dropdownOpen.value = false)
  await fetchProducts()
})

async function fetchProducts(category = '') {
  const url = category
    ? `http://localhost:3000/products?category=${category}`
    : 'http://localhost:3000/products'
  const response = await fetch(url)
  products.value = await response.json()
}

async function logout() {
  await fetch('http://localhost:3000/logout', {
    method: 'post',
    credentials: 'include',
  })
  localStorage.removeItem('user')
  userName.value = null
  userRole.value = ''
  dropdownOpen.value = false
  router.push('/')
}

function adminView() {
  router.push('/admin')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background font-sans">

    <!-- Navbar -->
    <nav class="h-15 flex items-center justify-between px-6 bg-primary shadow-sm">
      <RouterLink to="/">
        <div class="flex items-center gap-2.5">
          <div class="rounded-xl bg-acent flex items-center justify-center">
            <img src="/images/logo.png" alt="logo voltix" class="w-9 h-9">
          </div>
          <span class="font-bold text-lg text-text tracking-widest">VOLTIX</span>
        </div>
      </RouterLink>

      <div class="flex items-center w-65 h-9.5 bg-white border border-text/10
        rounded-xl overflow-hidden focus-within:border-acent transition-colors">
        <span class="px-3 text-secondary text-sm">⌕</span>
        <input v-model="searchText" type="text" placeholder="Hľadaj produkty..."
          class="flex-1 bg-transparent outline-none text-text text-sm placeholder-secondary/50" />
        <button class="h-full px-4 bg-acent hover:bg-acent/80 text-white text-xs font-medium transition-colors">
          Hľadaj
        </button>
      </div>

      <!-- ak nie je prihlaseny -->
      <RouterLink v-if="!userName" to="/login">
        <button class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 border border-text/10 hover:bg-white/80 transition-colors">
          <img src="/images/default.webp" class="w-7.5 h-7.5 rounded-full object-cover" />
          <span class="text-sm text-text">Log in</span>
        </button>
      </RouterLink>

      <!-- ak je prihlaseny -->
      <div v-else class="relative">
        <button @click.stop="dropdownOpen = !dropdownOpen"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 border border-text/10 hover:bg-white/80 transition-colors">
          <img src="/images/default.webp" class="w-7.5 h-7.5 rounded-full object-cover" />
          <span class="text-sm text-text">{{ userName }}</span>
        </button>

        <!-- dropdown -->
        <div v-show="dropdownOpen" @click.stop
          class="absolute right-0 mt-2 w-44 bg-white border border-text/10 rounded-xl shadow-lg overflow-hidden z-50">
          <RouterLink to="/profile" @click="dropdownOpen = false"
            class="flex items-center gap-2.5 px-4 py-3 text-sm text-text hover:bg-background transition-colors">
            👤 Profil
          </RouterLink>
          <button @click="logout"
            class="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-background transition-colors">
            🚪 Odhlásiť sa
          </button>
        </div>
      </div>
    </nav>

    <!-- Body -->
    <div class="flex flex-1">
      <!-- Sidebar -->
      <aside class="w-49 shrink-0 bg-primary border-r border-text/8 py-5">
        <p class="px-5 pb-2.5 text-[10px] tracking-[2px] uppercase text-text/40 font-medium">
          Kategórie
        </p>
        <button v-for="cat in categories" :key="cat.name"
          @click="activeCategory = cat.name; fetchProducts(cat.name)"
          :class="['w-full flex items-center gap-2.5 px-5 py-2.5 text-sm border-l-[3px] transition-all',
            activeCategory === cat.name
              ? 'text-text bg-white/40 border-acent font-medium'
              : 'text-text/60 border-transparent hover:text-text hover:bg-white/25 hover:border-acent/50'
          ]">
          <span class="w-4.5 text-center text-sm">{{ cat.icon }}</span>
          {{ cat.name }}
        </button>

        <button v-if="userRole === 'admin'" @click="adminView"
          class="w-full flex items-center gap-2.5 px-5 py-2.5 text-sm border-l-[3px] transition-all text-text/60 border-transparent hover:text-text hover:bg-white/25 hover:border-acent/50">
          + Pridať produkt
        </button>
      </aside>

      <!-- Page Content -->
      <div class="flex-1 p-6">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
      </div>
    </div>

  </div>
</template>