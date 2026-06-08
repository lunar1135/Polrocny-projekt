<template>
  <nav class="h-15 flex items-center justify-between px-6 bg-primary shadow-sm">
    <RouterLink to="/">
      <div class="flex items-center gap-2.5">
        <div class="rounded-xl bg-acent flex items-center justify-center">
          <img src="/images/logo.png" alt="logo voltix" class="w-9 h-9">
        </div>
        <span class="font-bold text-lg text-text tracking-widest">VOLTIX</span>
      </div>
    </RouterLink>

    <div class="flex items-center w-65 h-9.5 bg-white border border-text/10
      rounded-xl overflow-hidden focus-within:border-acent transition-colors">
      <span class="px-3 text-secondary text-sm">⌕</span>
      <input v-model="searchText" type="text" placeholder="Hľadaj produkty..."
        class="flex-1 bg-transparent outline-none text-text text-sm placeholder-secondary/50" />
      <button class="h-full px-4 bg-acent hover:bg-acent/80 text-white text-xs font-medium transition-colors">
        Hľadaj
      </button>
    </div>

    <!-- ak nie je prihlaseny -->
    <RouterLink v-if="!userName" to="/login">
      <button class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 border border-text/10 hover:bg-white/80 transition-colors">
        <img src="/images/default.webp" class="w-7.5 h-7.5 rounded-full object-cover" />
        <span class="text-sm text-text">Log in</span>
      </button>
    </RouterLink>

    <!-- ak je prihlaseny -->
    <div v-else class="relative">
      <button @click.stop="dropdownOpen = !dropdownOpen"
        class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 border border-text/10 hover:bg-white/80 transition-colors">
        <img src="/images/default.webp" class="w-7.5 h-7.5 rounded-full object-cover" />
        <span class="text-sm text-text">{{ userName }}</span>
      </button>

      <div v-show="dropdownOpen" @click.stop
        class="absolute right-0 mt-2 w-44 bg-white border border-text/10 rounded-xl shadow-lg overflow-hidden z-50">
        <RouterLink to="/profile" @click="dropdownOpen = false"
          class="flex items-center gap-2.5 px-4 py-3 text-sm text-text hover:bg-background transition-colors">
          👤 Profil
        </RouterLink>
        <RouterLink v-if="userRole === 'admin'" to="/admin/dashboard" @click="dropdownOpen = false"
          class="flex items-center gap-2.5 px-4 py-3 text-sm text-text hover:bg-background transition-colors">
          ⚙️ Admin
        </RouterLink>
        <button @click="logout"
          class="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-background transition-colors">
          🚪 Odhlásiť sa
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref(null)
const userRole = ref('')
const dropdownOpen = ref(false)
const searchText = ref('')

onMounted(async () => {
  const response = await fetch('http://localhost:3000/me', { credentials: 'include' })
  if (response.ok) {
    const user = await response.json()
    userName.value = user.username
    userRole.value = user.role
  }
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

function closeDropdown() {
  dropdownOpen.value = false
}

async function logout() {
  await fetch('http://localhost:3000/logout', {
    method: 'post',
    credentials: 'include',
  })
  userName.value = null
  userRole.value = ''
  dropdownOpen.value = false
  router.push('/')
}
</script>