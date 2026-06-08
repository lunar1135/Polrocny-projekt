<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ProductCard from '../components/ProductCard.vue'
import NavBar from '../components/NavBar.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const activeCategory = ref('')
const products = ref([])
const loading = ref(true)

const userRole = computed(() => auth.user?.role ?? '')

const categories = [
  { name: 'Mobily', icon: '📱' },
  { name: 'Počítače', icon: '💻' },
  { name: 'Chladničky', icon: '❄️' },
  { name: 'Práčky', icon: '🌀' },
  { name: 'Tablety', icon: '📟' },
  { name: 'Gaming', icon: '🎮' },
  { name: 'Kuchyňa', icon: '🍳' },
]

let eventSource = null

onMounted(async () => {
  const query = Array.isArray(route.query.search) ? route.query.search[0] : route.query.search || ''
  if (query) {
    await fetchProducts('', query)
  } else {
    await fetchProducts()
  }

  eventSource = new EventSource('http://localhost:3000/sse')
  eventSource.onmessage = async (e) => {
    const data = JSON.parse(e.data)
    if (['product_added', 'product_updated', 'product_deleted'].includes(data.type)) {
      await fetchProducts(activeCategory.value)
    }
  }
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
})

watch(() => route.query.search, async (newSearch) => {
  activeCategory.value = ''
  await fetchProducts('', newSearch || '')
}, { immediate: false })

async function fetchProducts(category = '', search = '') {
  loading.value = true
  let url = 'http://localhost:3000/products'
  const params = new URLSearchParams()
  if (category) params.append('category', category)
  if (search) params.append('search', search)
  if (params.toString()) url += `?${params.toString()}`

  const response = await fetch(url)
  products.value = await response.json()
  loading.value = false
}

async function deleteProduct(id) {
  const response = await fetch(`http://localhost:3000/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (response.ok) await fetchProducts(activeCategory.value)
}

function openEdit(product) {
  router.push(`/admin/edit/${product.id}`)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background font-sans">
    <NavBar />

    <div class="flex flex-1">
      <!-- Sidebar - len desktop -->
      <aside class="hidden md:flex w-49 shrink-0 bg-primary border-r border-text/8 py-5 flex-col">
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

        <RouterLink v-if="userRole === 'admin'" to="/admin"
          class="w-full flex items-center gap-2.5 px-5 py-2.5 text-sm border-l-[3px] transition-all text-text/60 border-transparent hover:text-text hover:bg-white/25 hover:border-acent/50">
          + Pridať produkt
        </RouterLink>
      </aside>

      <div class="flex-1 flex flex-col min-w-0">

        <!-- Mobile kategorie -->
        <div class="md:hidden relative bg-primary border-b border-text/8">
          <div class="flex gap-2 px-4 py-3 overflow-x-auto">
            <button v-for="cat in categories" :key="cat.name"
              @click="activeCategory = cat.name; fetchProducts(cat.name)"
              :class="['flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-all',
                activeCategory === cat.name
                  ? 'bg-acent text-white font-medium'
                  : 'bg-white/50 text-text/60'
              ]">
              {{ cat.icon }} {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Page Content -->
        <div class="flex-1 p-3 md:p-6">
          <div v-if="loading" class="flex items-center justify-center h-64">
            <div class="w-8 h-8 border-4 border-acent border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center h-64 text-text/40">
            <span class="text-4xl mb-3">📦</span>
            <p class="text-sm">Žiadne produkty v tejto kategórii</p>
          </div>

         <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
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
  </div>
</template>