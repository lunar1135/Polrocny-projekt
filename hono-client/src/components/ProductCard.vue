<template>
  <RouterLink :to="`/product/${product.id}`"
    class="bg-white border border-text/8 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer">
    <div class="aspect-square bg-background rounded-xl flex items-center justify-center mb-3">
      <img v-if="product.image" :src="product.image" class="object-contain max-h-32" />
      <span v-else class="text-4xl">📦</span>
    </div>
    <p class="text-xs text-acent uppercase tracking-wide mb-1">{{ product.category }}</p>
    <h3 class="text-sm font-medium text-text mb-1 truncate">{{ product.name }}</h3>
    <p class="text-sm font-bold text-text">{{ product.price }} €</p>
  </RouterLink>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  }
})
</script>