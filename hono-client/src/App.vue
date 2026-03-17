<script setup>
import { ref } from 'vue'

const users = ref([])
const userName = ref('Log in')
const activeCategory = ref('')

const categories = [
  { name: 'Mobily',     icon: '📱' },
  { name: 'Počítače',   icon: '💻' },
  { name: 'Chladničky', icon: '❄️' },
  { name: 'Práčky',     icon: '🌀' },
  { name: 'Tablety',    icon: '📟' },
  { name: 'Gaming',     icon: '🎮' },
  { name: 'Kuchyňa',   icon: '🍳' },
]

async function fetchUsers() {
  const response = await fetch('http://localhost:3000/users')
  const usersResponse = await response.json()

  users.value = usersResponse
}

async function deleteUser(index) {
  const response = await fetch('http://localhost:3000/users/' + index, {
    method: 'delete',
  })

  const deleteUserResponse = await response.text()

  if (deleteUserResponse === 'ok') {
    await fetchUsers()
  }
}

const text = ref('')

async function addUser() {
  const response = await fetch('http://localhost:3000/users', {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      newUsername: text.value,
    }),
  })

  const responseText = await response.text()

  if (responseText === 'ok') {
    await fetchUsers()
  }
}
</script>

<template>
  <!--navbar-->
  <div class="min-h-screen flex flex-col bg-background font-sans">

    <!-- Navbar -->
    <nav class="h-[60px] flex items-center justify-between px-6 bg-primary shadow-sm">

      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-acent flex items-center justify-center
                    text-white font-bold text-base shadow-[0_2px_10px_rgba(218,145,97,0.4)]">
          V
        </div>
        <span class="font-bold text-lg text-text tracking-widest">VOLTIX</span>
      </div>

      <div class="flex items-center w-[260px] h-[38px] bg-white border border-text/10
                  rounded-xl overflow-hidden focus-within:border-acent transition-colors">
        <span class="px-3 text-secondary text-sm">⌕</span>
        <input v-model="searchText" type="text" placeholder="Hľadaj produkty..."
               class="flex-1 bg-transparent outline-none text-text text-sm placeholder-secondary/50" />
        <button class="h-full px-4 bg-acent hover:bg-acent/80 text-white text-xs font-medium transition-colors">
          Hľadaj
        </button>
      </div>

      <button class="flex items-center gap-2 px-3 py-1.5 rounded-xl
                     bg-white/50 border border-text/10 hover:bg-white/80 transition-colors">
        <img src="/images/default.webp" class="w-[30px] h-[30px] rounded-full object-cover" />
        <span class="text-sm text-text">{{ userName }}</span>
      </button>
    </nav>

    <!-- Body -->
    <div class="flex flex-1">

      <!-- Sidebar -->
      <aside class="w-[196px] flex-shrink-0 bg-primary border-r border-text/8 py-5">
        <p class="px-5 pb-2.5 text-[10px] tracking-[2px] uppercase text-text/40 font-medium">
          Kategórie
        </p>
        <button v-for="cat in categories" :key="cat.name"
                @click="activeCategory = cat.name"
                :class="['w-full flex items-center gap-2.5 px-5 py-2.5 text-sm border-l-[3px] transition-all',
                  activeCategory === cat.name
                    ? 'text-text bg-white/40 border-acent font-medium'
                    : 'text-text/60 border-transparent hover:text-text hover:bg-white/25 hover:border-acent/50']">
          <span class="w-[18px] text-center text-sm">{{ cat.icon }}</span>
          {{ cat.name }}
        </button>
      </aside>

     

    </div>
  </div>
  

</template>