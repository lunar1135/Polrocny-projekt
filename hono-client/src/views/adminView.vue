<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-2xl mx-auto px-6 py-10">
      
      <h1 class="text-2xl font-bold text-text mb-8">Pridať produkt</h1>

      <div class="bg-white border border-text/8 rounded-2xl p-8 space-y-4">
        
        <div>
          <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Názov</label>
          <input v-model="form.name" type="text" placeholder="iPhone 15 Pro"
            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white placeholder:text-text/25" />
        </div>

        <div>
          <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Popis</label>
          <textarea v-model="form.description" placeholder="Popis produktu..."
            class="w-full h-24 px-3.5 py-3 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white placeholder:text-text/25 resize-none" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Cena (€)</label>
            <input v-model="form.price" type="number" placeholder="999"
              class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white placeholder:text-text/25" />
          </div>
          <div>
            <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Sklad (ks)</label>
            <input v-model="form.stock" type="number" placeholder="10"
              class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white placeholder:text-text/25" />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Kategória</label>
          <select v-model="form.category"
            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent">
            <option value="">Vyber kategóriu</option>
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
          <input v-model="form.image" type="text" placeholder="https://..."
            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white placeholder:text-text/25" />
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-600 text-sm">Produkt bol pridaný!</p>

        <button @click="addProduct"
          class="w-full h-[46px] bg-acent hover:bg-acent/80 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all">
          Pridať produkt
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

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
})

function adminView() {
  router.push('/admin')
}

onMounted(() => {
  const stored = localStorage.getItem('user')
  if (!stored) return router.push('/login')
  
  const user = JSON.parse(stored)
  if (user.role !== 'admin') return router.push('/')
})

async function addProduct() {
  error.value = ''
  success.value = false

  if (!form.value.name || !form.value.price || !form.value.category) {
    error.value = 'Vyplň všetky povinné polia'
    return
  }

  const response = await fetch('http://localhost:3000/products', {
    method: 'post',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      ...form.value,
      price: Number(form.value.price),
      stock: Number(form.value.stock),
    }),
  })

  if (response.ok) {
    success.value = true
    form.value = { name: '', description: '', price: null, category: '', image: '', stock: null }
  } else {
    error.value = 'Nastala chyba'
  }
}
</script>