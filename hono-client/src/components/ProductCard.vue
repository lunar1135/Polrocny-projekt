<template>
    <div class="relative">
        <RouterLink :to="`/product/${product.id}`"
            class="bg-white border border-text/8 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer block">
            <div class="aspect-square bg-background rounded-xl flex items-center justify-center mb-3">
                <img v-if="product.image" :src="product.image" class="object-contain max-h-32" />
                <span v-else class="text-4xl">📦</span>
            </div>
            <p class="text-xs text-acent uppercase tracking-wide mb-1">{{ product . category }}</p>
            <h3 class="text-sm font-medium text-text mb-1 truncate">{{ product . name }}</h3>
            <div class="flex items-center gap-2 flex-wrap">
                <template v-if="product.discount > 0">
                    <span class="text-xs text-text/40 line-through">{{ product . price }} €</span>
                    <span class="text-sm font-bold text-red-500">{{ discountedPrice }} €</span>
                    <span class="text-xs px-1.5 py-0.5 rounded-md bg-red-100 text-red-500 font-medium">-{{ product . discount }}%</span>
                </template>
                <span v-else class="text-sm font-bold text-text">{{ product . price }} €</span>
            </div>
        </RouterLink>

        <!-- admin tlacitka -->
        <div v-if="isAdmin" class="absolute top-2 right-2 flex gap-1">
            <button @click.prevent="$emit('edit', product)"
                class="w-8 h-8 rounded-lg bg-white border border-text/10 text-text/60 hover:bg-background hover:text-text transition-colors flex items-center justify-center text-sm">
                ✏️
            </button>
            <button @click.prevent="$emit('delete', product.id)"
                class="w-8 h-8 rounded-lg bg-white border border-red-200 text-red-400 hover:bg-red-50 transition-colors flex items-center justify-center text-sm">
                🗑️
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false }
})

defineEmits(['edit', 'delete'])

const discountedPrice = computed(() => {
  return (props.product.price * (1 - props.product.discount / 100)).toFixed(2)
})

    
</script>
