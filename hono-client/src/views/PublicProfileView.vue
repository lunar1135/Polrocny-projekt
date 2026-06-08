<template>
  <div class="min-h-screen flex flex-col bg-background">
    <NavBar :show-search="false" />

    <div v-if="loading" class="flex items-center justify-center flex-1">
      <div class="w-8 h-8 border-4 border-acent border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="user" class="max-w-xl mx-auto w-full px-6 py-10">
      <div class="bg-white border border-text/8 rounded-2xl p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full overflow-hidden bg-acent/10 flex items-center justify-center">
            <img v-if="user.avatar"
              :src="`http://localhost:3000/files/${user.avatar}`"
              class="w-full h-full object-cover" />
            <span v-else class="text-2xl font-bold text-acent">
              {{ user.username?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <p class="text-xl font-bold text-text">{{ user.username }}</p>
            <p class="text-sm text-text/40">Člen od {{ formatDate(user.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center flex-1 text-text/40">
      <p class="text-sm">Používateľ sa nenašiel</p>
      <RouterLink to="/" class="text-acent text-sm mt-4 hover:opacity-75">← Späť na hlavnú</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'

const route = useRoute()
const user = ref(null)
const loading = ref(true)

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString('sk-SK')
}

onMounted(async () => {
  const response = await fetch(`http://localhost:3000/users/${route.params.id}/public`)
  if (response.ok) user.value = await response.json()
  loading.value = false
})
</script>