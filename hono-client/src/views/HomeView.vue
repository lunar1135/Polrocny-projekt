<script setup>
import { RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import NavBar from '../components/NavBar.vue'

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

async function deleteProduct(id) {
  const response = await fetch(`http://localhost:3000/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (response.ok) await fetchProducts()
}

function openEdit(product) {
  router.push(`/admin/edit/${product.id}`)
}

function adminView() {
  router.push('/admin')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background font-sans">

    <!-- Navbar -->
    <NavBar />

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
         <ProductCard
  v-for="product in products"
  :key="product.id"
  :product="product"
  :is-admin="userRole === 'admin'"
  @delete="deleteProduct"
  @edit="openEdit"
/>
        </div>
      </div>
    </div>

  </div>
</template>