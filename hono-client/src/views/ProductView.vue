<template>
  <div class="min-h-screen bg-background">
    <div v-if="product" class="max-w-5xl mx-auto px-6 py-10">
      
      <div class="grid grid-cols-2 gap-10">
        <!-- Image -->
        <div class="bg-white rounded-2xl border border-text/8 flex items-center justify-center p-10 aspect-square">
          <img v-if="product.image" :src="product.image" class="object-contain max-h-80" />
          <span v-else class="text-6xl">📦</span>
        </div>

        <!-- Info -->
        <div class="flex flex-col gap-4">
          <span class="text-xs uppercase tracking-widest text-acent font-medium">{{ product.category }}</span>
          <h1 class="text-3xl font-bold text-text">{{ product.name }}</h1>
          <p class="text-text/60 text-sm leading-relaxed">{{ product.description }}</p>

          <div class="mt-2">
            <span class="text-3xl font-bold text-text">{{ product.price }} €</span>
          </div>

          <div class="text-xs text-text/40">
            Skladom: {{ product.stock }} ks
          </div>

          <button class="mt-4 h-[46px] bg-acent hover:bg-acent/80 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all">
            Pridať do košíka
          </button>
        </div>
      </div>

    </div>

    <div v-else class="flex items-center justify-center h-64 text-text/40">
      Produkt sa nenašiel
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const product = ref(null)

onMounted(async () => {
  const response = await fetch(`http://localhost:3000/products/${route.params.id}`)
  if (response.ok) {
    product.value = await response.json()
  }
})
</script>