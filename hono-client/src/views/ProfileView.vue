<template>
  <div class="min-h-screen flex flex-col bg-background">

    <NavBar />
    
    <div class="max-w-xl mx-auto px-6 py-10">


      <h1 class="text-2xl font-bold text-text mb-8">Môj profil</h1>

      <div class="bg-white border border-text/8 rounded-2xl p-8 space-y-6">



        <!-- Avatar -->
        <div class="flex items-center gap-4">
          <img src="/images/default.webp" class="w-16 h-16 rounded-full object-cover" />
          <div>
            <p class="font-medium text-text">{{ form.username }}</p>
            <p class="text-sm text-text/40">{{ form.email }}</p>
          </div>
        </div>

        <div class="h-px bg-text/8"></div>

        <!-- Uprava udajov -->
        <div class="space-y-4">
          <p class="text-[11px] font-medium text-text/50 uppercase tracking-wide">Upraviť údaje</p>

          <div>
            <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Meno</label>
            <input v-model="form.username" type="text"
              class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white" />
          </div>

          <div>
            <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">E-mail</label>
            <input v-model="form.email" type="email"
              class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white" />
          </div>

          <p v-if="updateSuccess" class="text-green-600 text-sm">Údaje boli uložené!</p>
          <p v-if="updateError" class="text-red-500 text-sm">{{ updateError }}</p>

          <button @click="updateUser"
            class="w-full h-[46px] bg-acent hover:bg-acent/80 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all">
            Uložiť zmeny
          </button>
        </div>

        <div class="h-px bg-text/8"></div>

        <!-- Zmazanie uctu -->
        <div class="space-y-3">
          <p class="text-[11px] font-medium text-text/50 uppercase tracking-wide">Nebezpečná zóna</p>
          <p class="text-sm text-text/50">Po zmazaní účtu sa všetky vaše dáta natrvalo odstránia.</p>

          <button v-if="!confirmDelete" @click="confirmDelete = true"
            class="w-full h-[46px] border border-red-300 text-red-500 hover:bg-red-50 text-sm font-medium rounded-xl transition-all">
            Zmazať účet
          </button>

          <div v-else class="space-y-2">
            <p class="text-sm text-red-500 font-medium">Naozaj chcete zmazať účet?</p>
            <div class="flex gap-2">
              <button @click="deleteUser"
                class="flex-1 h-[46px] bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-all">
                Áno, zmazať
              </button>
              <button @click="confirmDelete = false"
                class="flex-1 h-[46px] border border-text/12 text-text/60 hover:bg-background text-sm font-medium rounded-xl transition-all">
                Zrušiť
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const confirmDelete = ref(false)
const updateSuccess = ref(false)
const updateError = ref('')

const form = ref({
  username: '',
  email: '',
})

let userId = null

onMounted(async () => {
  const response = await fetch('http://localhost:3000/me', {
    credentials: 'include',
  })

  if (!response.ok) return router.push('/login')

  const user = await response.json()
  userId = user.id
  form.value.username = user.username
  form.value.email = user.email
})

async function updateUser() {
  updateSuccess.value = false
  updateError.value = ''

  const response = await fetch(`http://localhost:3000/users/${userId}`, {
  method: 'PATCH',
  headers: { 'content-type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ username: form.value.username, email: form.value.email }),
})

  if (response.ok) {
    const updated = await response.json()
    localStorage.setItem('user', JSON.stringify(updated))
    updateSuccess.value = true
    router.push('/')
  } else {
    updateError.value = 'Nastala chyba pri ukladaní'
  }
}

async function deleteUser() {
  const response = await fetch(`http://localhost:3000/users/${userId}`, {
  method: 'DELETE',
  credentials: 'include',
})

  if (response.ok) {
    localStorage.removeItem('user')
    router.push('/')
  }
}
</script>