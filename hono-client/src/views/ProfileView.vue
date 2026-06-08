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
                        <p class="font-medium text-text">{{ form . username }}</p>
                        <p class="text-sm text-text/40">{{ form . email }}</p>
                    </div>
                </div>



                <div class="h-px bg-text/8"></div>

                <!-- Uprava udajov -->
                <div class="space-y-4">
                    <p class="text-[11px] font-medium text-text/50 uppercase tracking-wide">Upraviť údaje</p>

                    <!-- Avatar sekcia -->
                    <div class="flex items-center gap-4">
                        <div class="relative">
                            <img :src="auth.user?.avatar ?
                                `http://localhost:3000/files/${auth.user.avatar}` :
                                '/images/default.webp'"
                                class="w-16 h-16 rounded-full object-cover" />
                            <button @click="avatarInput.click()"
                                class="absolute bottom-0 right-0 w-6 h-6 bg-acent rounded-full flex items-center justify-center text-white text-xs hover:bg-acent/80 transition-colors">
                                ✏️
                            </button>
                            <input type="file" accept=".jpg,.jpeg,.png,.webp" @change="uploadAvatar" class="hidden"
                                ref="avatarInput" />
                        </div>
                        <div>
                            <p class="font-medium text-text">{{ form . username }}</p>
                            <p class="text-sm text-text/40">{{ form . email }}</p>
                        </div>
                    </div>
                    <div>
                        <label
                            class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Meno</label>
                        <input v-model="form.username" type="text"
                            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white" />
                    </div>

                    <div>
                        <label
                            class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">E-mail</label>
                        <input v-model="form.email" type="email"
                            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white" />
                    </div>

                    <!-- Upload sekcia -->
                    <div class="space-y-3">
                        <p class="text-[11px] font-medium text-text/50 uppercase tracking-wide">Nahrať súbor</p>

                        <div class="border-2 border-dashed border-text/12 rounded-xl p-6 text-center">
                            <input type="file" accept=".jpg,.jpeg,.png,.webp" @change="handleFile" class="hidden"
                                ref="fileInput" />
                            <button @click="fileInput.click()"
                                class="text-sm text-text/50 hover:text-text transition-colors">
                                📎 Vybrať súbor (max 5MB, jpg/png/webp)
                            </button>
                            <p v-if="selectedFile" class="text-xs text-text/40 mt-2">{{ selectedFile . name }}</p>
                        </div>

                        <p v-if="uploadError" class="text-red-500 text-sm">{{ uploadError }}</p>
                        <p v-if="uploadSuccess" class="text-green-600 text-sm">Súbor bol nahratý!</p>

                        <button v-if="selectedFile" @click="uploadFile"
                            class="w-full h-[46px] bg-acent hover:bg-acent/80 text-white text-sm font-medium rounded-xl transition-all">
                            Nahrať
                        </button>
                    </div>

                    <!-- Moje subory -->
                    <div v-if="myFiles.length > 0" class="space-y-3">
                        <p class="text-[11px] font-medium text-text/50 uppercase tracking-wide">Moje súbory</p>
                        <div v-for="f in myFiles" :key="f.id"
                            class="flex items-center justify-between px-4 py-3 bg-background rounded-xl">
                            <div>
                                <p class="text-sm text-text">{{ f . original_name }}</p>
                                <p class="text-xs text-text/40">{{ f . size / 1024 . toFixed(1) }} KB</p>
                            </div>
                            <a :href="`http://localhost:3000/files/${f.filename}`" target="_blank"
                                class="text-xs text-acent hover:opacity-75">
                                Zobraziť
                            </a>
                        </div>
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
    import {
        ref,
        onMounted
    } from 'vue'
    import {
        useRouter
    } from 'vue-router'
    import NavBar from '../components/NavBar.vue'
    import {
        useAuthStore
    } from '../stores/auth'


    const auth = useAuthStore()
    const avatarInput = ref(null)
    const avatarError = ref('')
    const router = useRouter()
    const confirmDelete = ref(false)
    const updateSuccess = ref(false)
    const updateError = ref('')
    const fileInput = ref(null)
    const selectedFile = ref(null)
    const uploadError = ref('')
    const uploadSuccess = ref(false)
    const myFiles = ref([])

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
        await fetchMyFiles()
    })

    async function updateUser() {
        updateSuccess.value = false
        updateError.value = ''

        const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: form.value.username,
                email: form.value.email
            }),
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
    async function uploadAvatar(e) {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('http://localhost:3000/upload/avatar', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        })

        if (response.ok) {
            const updatedUser = await response.json()
            auth.setUser(updatedUser)
        } else {
            avatarError.value = 'Nepodarilo sa nahrať profilovku'
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

    function handleFile(e) {
        selectedFile.value = e.target.files[0]
        uploadError.value = ''
    }

    async function uploadFile() {
        uploadError.value = ''
        uploadSuccess.value = false

        const formData = new FormData()
        formData.append('file', selectedFile.value)

        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        })

        if (response.ok) {
            uploadSuccess.value = true
            selectedFile.value = null
            await fetchMyFiles()
        } else {
            const text = await response.text()
            if (text === 'file too large') uploadError.value = 'Súbor je príliš veľký (max 5MB)'
            else if (text === 'invalid file type') uploadError.value = 'Povolené sú len jpg, png, webp'
            else uploadError.value = 'Nastala chyba'
        }
    }

    async function fetchMyFiles() {
        const response = await fetch('http://localhost:3000/my-files', {
            credentials: 'include',
        })
        if (response.ok) myFiles.value = await response.json()
    }
</script>
