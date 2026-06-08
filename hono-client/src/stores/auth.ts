import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useAuthStore = defineStore('auth', () => {
  const user = ref(null as any)

  async function fetchMe() {
    const response = await fetch('http://localhost:3000/me', {
      credentials: 'include',
    })
    if (response.ok) {
      user.value = await response.json()
    } else {
      user.value = null
    }
  }

  function logout() {
    user.value = null
  }

  function setUser(newUser: any) {
    user.value = newUser
  }

  return { user, fetchMe, logout, setUser }
})