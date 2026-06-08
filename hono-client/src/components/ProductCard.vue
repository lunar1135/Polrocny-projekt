<template>
    <div class="relative">
        <RouterLink :to="`/product/${product.id}`"
    class="bg-white border border-text/8 rounded-xl p-2 md:p-4 hover:shadow-md transition-shadow cursor-pointer block">
    <div class="aspect-square bg-background rounded-lg flex items-center justify-center mb-1.5 md:mb-3 max-h-24 md:max-h-48">
        <img v-if="product.image" :src="getImageUrl(product.image)" class="object-contain max-h-16 md:max-h-36" />
        <span v-else class="text-xl md:text-4xl">📦</span>
    </div>
    <p class="text-[9px] md:text-xs text-acent uppercase tracking-wide mb-0.5">{{ product.category }}</p>
    <h3 class="text-[11px] md:text-sm font-medium text-text mb-0.5 truncate">{{ product.name }}</h3>
            <div class="flex items-center gap-1.5 flex-wrap">
                <template v-if="product.discount > 0">
                    <span class="text-[10px] text-text/40 line-through">{{ product.price }} €</span>
                    <span class="text-xs font-bold text-red-500">{{ discountedPrice }} €</span>
                    <span class="text-[9px] px-1 py-0.5 rounded bg-red-100 text-red-500 font-medium">-{{ product.discount }}%</span>
                </template>
                <span v-else class="text-xs font-bold text-text">{{ product.price }} €</span>
            </div>
        </RouterLink>

        <div v-if="isAdmin" class="absolute top-1.5 right-1.5 flex gap-1">
            <button @click.prevent="$emit('edit', product)"
                class="w-6 h-6 rounded-lg bg-white border border-text/10 text-text/60 hover:bg-background transition-colors flex items-center justify-center text-[10px]">
                ✏️
            </button>
            <button @click.prevent="$emit('delete', product.id)"
                class="w-6 h-6 rounded-lg bg-white border border-red-200 text-red-400 hover:bg-red-50 transition-colors flex items-center justify-center text-[10px]">
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

function getImageUrl(image) {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `http://localhost:3000/files/${image}`
}
</script>