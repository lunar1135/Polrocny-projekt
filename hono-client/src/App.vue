<script setup>
import { ref } from 'vue'

const users = ref([])

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
  <div class="bg-primary w-full h-15 flex items-center justify-between ">
    <div class="flex items-center ">
      <img href="" src="/images/logo.png" alt="Voltix Logo" class="h-12 w-12 ml-4 mr-0.5 aspect-5">
      <h1 class="text-text font-bold">Voltix</h1>
    </div>
    
    <div class="flex items-center bg-white rounded border-2 border-secondary ">
      🔍<input type="text" v-model="text" class="bg-white ml-auto mr-4 px-2 py-1 rounded" placeholder="Search...">
      <button class="bg-secondary text-white px-4 py-1 ">search</button>
    </div>

    <div class="">
      <button class="bg-secondary text-white px-4 py-1 rounded flex items-center gap-2">
        <img src="/images/default.webp" alt="profile picture" class="h-8 w-8 rounded-full">
        <p>name</p>
      </button>
    </div>

    
        
  </div>

  <!--sidebar-->
  <div class="w-50 h-auto  flex items-center flex-col">
      <div class="w-50 h-auto bg-secondary hover:bg-gradient-to-r from-secondary to-white flex items-center flex-col">
        <p class="text-text h-10 flex items-center ">mobily</p>
      </div>

      <div class="w-50 h-auto bg-secondary hover:bg-gradient-to-r from-secondary to-white flex items-center flex-col">
        <p class="text-text h-10 flex items-center ">Pocitace,noteboky</p>
      </div>

      <div class="w-50 h-auto bg-secondary hover:bg-gradient-to-r from-secondary to-white flex items-center flex-col">
        <p class="text-text h-10 flex items-center ">chladnicky</p>
      </div>

      <div class="w-50 h-auto bg-secondary hover:bg-gradient-to-r from-secondary to-white flex items-center flex-col">
        <p class="text-text h-10 flex items-center ">pracky</p>
      </div>

      <div class="w-50 h-auto bg-secondary hover:bg-gradient-to-r from-secondary to-white flex items-center flex-col">
        <p class="text-text h-10 flex items-center ">tablety</p>
      </div>

      <div class="w-50 h-auto bg-secondary hover:bg-gradient-to-r from-secondary to-white flex items-center flex-col">
        <p class="text-text h-10 flex items-center ">gaming</p>
      </div>

      <div class="w-50 h-auto bg-secondary hover:bg-gradient-to-r from-secondary to-white flex items-center flex-col">
        <p class="text-text h-10 flex items-center ">kuchyna</p>
      </div>
      
      
  </div>
  

</template>