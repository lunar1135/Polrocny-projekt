<template>
  <div class="min-h-screen flex flex-col bg-background">
    <NavBar :show-search="false" />

    <div class="max-w-2xl mx-auto w-full px-6 py-10">
      <h1 class="text-2xl font-bold text-text mb-8">Upraviť produkt</h1>

      <div class="bg-white border border-text/8 rounded-2xl p-8 space-y-4">

        <div>
          <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Názov</label>
          <input v-model="form.name" type="text"
            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white" />
        </div>

        <div>
          <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Popis</label>
          <textarea v-model="form.description"
            class="w-full h-24 px-3.5 py-3 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white resize-none" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Cena (€)</label>
            <input v-model="form.price" type="number"
              class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white" />
          </div>
          <div>
            <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Sklad (ks)</label>
            <input v-model="form.stock" type="number"
              class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white" />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Kategória</label>
          <select v-model="form.category"
            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent">
            <option value="Mobily">Mobily</option>
            <option value="Počítače">Počítače</option>
            <option value="Chladničky">Chladničky</option>
            <option value="Práčky">Práčky</option>
            <option value="Tablety">Tablety</option>
            <option value="Gaming">Gaming</option>
            <option value="Kuchyňa">Kuchyňa</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">URL obrázku</label>
          <input v-model="form.image" type="text"
            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white" />
        </div>

        <div>
  <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">
    Zľava (%)
  </label>
  <input v-model="form.discount" type="number" min="0" max="100" placeholder="0"
    class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white" />
</div>
<!-- nahľad ceny -->
<div v-if="form.discount > 0" class="flex items-center gap-3 p-4 bg-background rounded-xl">
  <span class="text-sm text-text/40 line-through">{{ form.price }} €</span>
  <span class="text-lg font-bold text-red-500">{{ discountedPrice }} €</span>
  <span class="text-xs px-2 py-0.5 rounded-lg bg-red-100 text-red-500 font-medium">-{{ form.discount }}%</span>
</div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-600 text-sm">Produkt bol upravený!</p>

        <div class="flex gap-3">
          <button @click="updateProduct"
            class="flex-1 h-[46px] bg-acent hover:bg-acent/80 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all">
            Uložiť zmeny
          </button>
          <RouterLink to="/"
            class="flex-1 h-[46px] border border-text/12 text-text/60 hover:bg-background text-sm font-medium rounded-xl transition-all flex items-center justify-center">
            Zrušiť
          </RouterLink>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>

import { useRoute, useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { ref, onMounted, computed } from 'vue'



const discountedPrice = computed(() => {
  if (!form.value.price || !form.value.discount) return form.value.price
  return (form.value.price * (1 - form.value.discount / 100)).toFixed(2)
})

const route = useRoute()
const router = useRouter()
const error = ref('')
const success = ref(false)

const form = ref({
  name: '',
  description: '',
  price: null,
  category: '',
  image: '',
  stock: null,
  discount: 0,
})

onMounted(async () => {
  const me = await fetch('http://localhost:3000/me', { credentials: 'include' })
  if (!me.ok) return router.push('/login')
  const user = await me.json()
  if (user.role !== 'admin') return router.push('/')

  const response = await fetch(`http://localhost:3000/products/${route.params.id}`)
  if (response.ok) {
    const product = await response.json()
    form.value = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image ?? '',
      stock: product.stock,
    }
  }
})

async function updateProduct() {
  error.value = ''
  success.value = false

  const response = await fetch(`http://localhost:3000/products/${route.params.id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      ...form.value,
      price: Number(form.value.price),
      stock: Number(form.value.stock),
    }),
  })

  if (response.ok) {
    success.value = true
    setTimeout(() => router.push('/'), 1000)
  } else {
    error.value = 'Nastala chyba'
  }
}
</script>