<template>
    <NavBar />

    <div class="min-h-screen bg-background">
        <div class="max-w-2xl mx-auto px-6 py-10">

            <h1 class="text-2xl font-bold text-text mb-8">Pridať produkt</h1>

            <div class="bg-white border border-text/8 rounded-2xl p-8 space-y-4">

                <div>
                    <label
                        class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Názov</label>
                    <input v-model="form.name" type="text" placeholder="iPhone 15 Pro"
                        class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white placeholder:text-text/25" />
                </div>

                <div>
                    <label
                        class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Popis</label>
                    <textarea v-model="form.description" placeholder="Popis produktu..."
                        class="w-full h-24 px-3.5 py-3 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white placeholder:text-text/25 resize-none" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Cena
                            (€)</label>
                        <input v-model="form.price" type="number" placeholder="999"
                            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white placeholder:text-text/25" />
                    </div>
                    <div>
                        <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Sklad
                            (ks)</label>
                        <input v-model="form.stock" type="number" placeholder="10"
                            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white placeholder:text-text/25" />
                    </div>
                </div>

                <div>
                    <label
                        class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Kategória</label>
                    <select v-model="form.category"
                        class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent">
                        <option value="">Vyber kategóriu</option>
                        <option value="Mobily">Mobily</option>
                        <option value="Počítače">Počítače</option>
                        <option value="Chladničky">Chladničky</option>
                        <option value="Práčky">Práčky</option>
                        <option value="Tablety">Tablety</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Kuchyňa">Kuchyňa</option>
                    </select>
                </div>

                <div>
                    <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">Obrázok
                        produktu</label>

                    <div class="flex gap-3">
                        <div class="flex-1">
                            <input v-model="form.image" type="text" placeholder="https://... (URL)"
                                class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent focus:bg-white placeholder:text-text/25" />
                        </div>
                        <span class="text-text/30 flex items-center text-sm">alebo</span>
                        <div>
                            <input type="file" accept=".jpg,.jpeg,.png,.webp" @change="uploadProductImage"
                                class="hidden" ref="productImageInput" />
                            <button @click="productImageInput.click()"
                                class="h-11 px-4 border border-text/12 rounded-xl text-sm text-text/60 hover:bg-background transition-colors">
                                📎 Nahrať
                            </button>
                        </div>
                    </div>

                    <div v-if="form.image && !form.image.startsWith('http')" class="mt-2">
                        <img :src="`http://localhost:3000/files/${form.image}`"
                            class="h-16 w-16 object-contain rounded-lg border border-text/8" />
                    </div>
                    <div v-else-if="form.image" class="mt-2">
                        <img :src="form.image" class="h-16 w-16 object-contain rounded-lg border border-text/8" />
                    </div>
                </div>

                <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
                <p v-if="success" class="text-green-600 text-sm">Produkt bol pridaný!</p>

                <button @click="addProduct"
                    class="w-full h-[46px] bg-acent hover:bg-acent/80 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all">
                    Pridať produkt
                </button>

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

    const router = useRouter()
    const error = ref('')
    const success = ref(false)
    const productImageInput = ref(null)


    const form = ref({
        name: '',
        description: '',
        price: null,
        category: '',
        image: '',
        stock: null,
    })

    function adminView() {
        router.push('/admin')
    }

    onMounted(() => {
        if (!auth.user) return router.push('/login')
        if (auth.user.role !== 'admin') return router.push('/')
    })

    async function addProduct() {
        error.value = ''
        success.value = false

        if (!form.value.name || !form.value.price || !form.value.category) {
            error.value = 'Vyplň všetky povinné polia'
            return
        }

        const response = await fetch('http://localhost:3000/products', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                ...form.value,
                price: Number(form.value.price),
                stock: Number(form.value.stock),
                discount: Number(form.value.discount ?? 0),
            }),
        })

        if (response.ok) {
            success.value = true
            form.value = {
                name: '',
                description: '',
                price: null,
                category: '',
                image: '',
                stock: null
            }
        } else {
            error.value = 'Nastala chyba'
        }
    }
    async function uploadProductImage(e) {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (response.ok) {
    const data = await response.json()
    form.value.image = data.filename
  }
}
</script>
