<template>
  <div class="min-h-screen flex flex-col bg-background">
    <NavBar :show-search="false" />

    <div class="max-w-2xl mx-auto w-full px-6 py-10">
      <h1 class="text-2xl font-bold text-text mb-8">Košík</h1>

      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="w-8 h-8 border-4 border-acent border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center h-64 text-text/40">
        <span class="text-4xl mb-3">🛒</span>
        <p class="text-sm">Košík je prázdny</p>
        <RouterLink to="/" class="text-acent text-sm mt-4 hover:opacity-75">← Späť na hlavnú</RouterLink>
      </div>

      <div v-else class="space-y-4">
        <div v-for="item in items" :key="item.id"
          class="bg-white border border-text/8 rounded-2xl p-4 flex items-center gap-4">
          <div class="w-16 h-16 bg-background rounded-xl flex items-center justify-center shrink-0">
            <img v-if="item.image" :src="getImageUrl(item.image)" class="object-contain max-h-12" />
            <span v-else class="text-2xl">📦</span>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-text truncate">{{ item.name }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <template v-if="item.discount > 0">
                <span class="text-xs text-text/40 line-through">{{ item.price }} €</span>
                <span class="text-sm font-bold text-red-500">{{ discountedPrice(item) }} €</span>
              </template>
              <span v-else class="text-sm font-bold text-text">{{ item.price }} €</span>
            </div>
            <p class="text-xs text-text/40 mt-0.5">Množstvo: {{ item.quantity }}</p>
          </div>

          <button @click="removeItem(item.product_id)"
            class="w-8 h-8 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors flex items-center justify-center text-sm">
            🗑️
          </button>
        </div>

        <!-- Celkova cena -->
        <div class="bg-white border border-text/8 rounded-2xl p-6">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm text-text/60">Celkom</span>
            <span class="text-xl font-bold text-text">{{ totalPrice }} €</span>
          </div>

          <p v-if="checkoutError" class="text-red-500 text-sm mb-3">{{ checkoutError }}</p>
          <p v-if="checkoutSuccess" class="text-green-600 text-sm mb-3">Objednávka bola úspešná!</p>

          <button @click="checkout"
            class="w-full h-[46px] bg-acent hover:bg-acent/80 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all">
            Kúpiť
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import NavBar from '../components/NavBar.vue'

const items = ref([])
const loading = ref(true)
const checkoutError = ref('')
const checkoutSuccess = ref(false)

function getImageUrl(image) {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `http://localhost:3000/files/${image}`
}

function discountedPrice(item) {
  return (item.price * (1 - item.discount / 100)).toFixed(2)
}

const totalPrice = computed(() => {
  return items.value.reduce((sum, item) => {
    const price = item.discount > 0
      ? item.price * (1 - item.discount / 100)
      : item.price
    return sum + price * item.quantity
  }, 0).toFixed(2)
})

onMounted(async () => {
  await fetchCart()
})

async function fetchCart() {
  loading.value = true
  const response = await fetch('http://localhost:3000/cart', {
    credentials: 'include',
  })
  if (response.ok) items.value = await response.json()
  loading.value = false
}

async function removeItem(productId) {
  const response = await fetch(`http://localhost:3000/cart/${productId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (response.ok) await fetchCart()
}

async function checkout() {
  checkoutError.value = ''
  checkoutSuccess.value = false

  const response = await fetch('http://localhost:3000/cart/checkout', {
    method: 'POST',
    credentials: 'include',
  })

  if (response.ok) {
    checkoutSuccess.value = true
    await fetchCart()
  } else {
    const text = await response.text()
    if (text === 'cart is empty') checkoutError.value = 'Košík je prázdny'
    else if (text.includes('not enough stock')) checkoutError.value = 'Nedostatok tovaru na sklade'
    else checkoutError.value = 'Nastala chyba'
  }
}
</script>