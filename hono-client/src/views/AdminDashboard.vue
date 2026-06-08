<template>
  <div class="min-h-screen flex flex-col bg-background">

    <NavBar />

<div v-if="loading" class="flex items-center justify-center py-16">
  <div class="w-8 h-8 border-4 border-acent border-t-transparent rounded-full animate-spin"></div>
</div>

    <div class="max-w-4xl mx-auto w-full px-6 py-10">
      <h1 class="text-2xl font-bold text-text mb-8">Správa používateľov</h1>


      <div class="bg-white border border-text/8 rounded-2xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-text/8">
              <th class="text-left px-6 py-4 text-[11px] uppercase tracking-wide text-text/40 font-medium">Meno</th>
              <th class="text-left px-6 py-4 text-[11px] uppercase tracking-wide text-text/40 font-medium">Email</th>
              <th class="text-left px-6 py-4 text-[11px] uppercase tracking-wide text-text/40 font-medium">Rola</th>
              <th class="text-left px-6 py-4 text-[11px] uppercase tracking-wide text-text/40 font-medium">Registrovaný</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b border-text/8 last:border-0">
              <td class="px-6 py-4 text-sm text-text font-medium">{{ user.username }}</td>
              <td class="px-6 py-4 text-sm text-text/60">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'text-xs px-2.5 py-1 rounded-lg font-medium',
                  user.role === 'admin'
                    ? 'bg-acent/10 text-acent'
                    : 'bg-text/8 text-text/50'
                ]">{{ user.role }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-text/40">
                {{ new Date(user.created_at * 1000).toLocaleDateString('sk-SK') }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 justify-end">
                  <select
                    :value="user.role"
                    @change="changeRole(user.id, $event.target.value)"
                    class="text-xs h-8 px-2 rounded-lg bg-background border border-text/12 outline-none text-text">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    v-if="user.id !== currentUserId"
                    @click="deleteUser(user.id)"
                    class="text-xs px-3 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                    Zmazať
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0" class="px-6 py-12 text-center text-text/40 text-sm">
          Žiadni používatelia
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
const users = ref([])
const currentUserId = ref(null)
const loading = ref(true)

onMounted(async () => {
  const me = await fetch('http://localhost:3000/me', { credentials: 'include' })
  if (!me.ok) return router.push('/login')

  const user = await me.json()
  if (user.role !== 'admin') return router.push('/')
  currentUserId.value = user.id

  await fetchUsers()
})

async function fetchUsers() {
  loading.value = true
  const response = await fetch('http://localhost:3000/admin/users', {
    credentials: 'include',
  })
  users.value = await response.json()
  loading.value = false
}

async function deleteUser(id) {
  const response = await fetch(`http://localhost:3000/admin/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (response.ok) await fetchUsers()
}

async function changeRole(id, role) {
  await fetch(`http://localhost:3000/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ role }),
  })
  await fetchUsers()
}
</script>