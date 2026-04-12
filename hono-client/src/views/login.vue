<template>
    <div class="min-h-screen flex flex-col bg-background font-sans">

        <!-- Navbar -->
        <nav class="h-[60px] flex items-center px-7 bg-primary shadow-sm">
            <RouterLink to="/" class="text-acent font-medium hover:opacity-75">
                <div class="flex items-center gap-2.5">
                    <img src="/images/logo.png" alt="logo voltix" class="w-9 h-9 rounded-xl bg-acent">
                    <span class="font-bold text-lg text-text tracking-widest">VOLTIX</span>
                </div>
            </RouterLink>
        </nav>

        <!-- Login card -->
        <div class="flex-1 flex items-center justify-center px-4 py-10">
            <div
                class="w-full max-w-[400px] bg-white border border-text/8 rounded-2xl
                  p-10 shadow-[0_8px_40px_rgba(2,30,24,0.07)]">

                <!-- Header -->
                <div class="text-center mb-8">
                    <h1 class="text-2xl font-bold text-text tracking-tight mb-1.5">Vitajte späť</h1>
                    <p class="text-sm text-text/45">Prihláste sa do svojho účtu</p>
                </div>

                <!-- Form -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">
                            E-mail
                        </label>
                        <input v-model="email" type="email" placeholder="vas@email.sk"
                            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background
                          border-[1.5px] border-text/12 outline-none transition-colors
                          focus:border-acent focus:bg-white placeholder:text-text/25" />
                    </div>

                    <div>
                        <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">
                            Heslo
                        </label>
                        <input v-model="password" type="password" placeholder="••••••••"
                            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background
                          border-[1.5px] border-text/12 outline-none transition-colors
                          focus:border-acent focus:bg-white placeholder:text-text/25" />
                    </div>

                    <div class="text-right">
                        <a class="text-xs text-acent hover:opacity-75 cursor-pointer transition-opacity">
                            Zabudli ste heslo?
                        </a>
                    </div>

                    <button @click="login"
                        class="w-full h-[46px] bg-acent hover:bg-acent/80 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all">
                        Prihlásiť sa
                    </button>

                    <div class="flex items-center gap-3">
                        <div class="flex-1 h-px bg-text/8"></div>
                        <span class="text-xs text-text/30">alebo</span>
                        <div class="flex-1 h-px bg-text/8"></div>
                    </div>


                </div>

                <p class="text-center text-sm text-text/40 mt-6">
                    Nemáte účet?
                    <RouterLink to="/register" class="text-acent font-medium hover:opacity-75">
                        Zaregistrujte sa
                    </RouterLink>
                </p>

            </div>
        </div>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import {
        useRouter
    } from 'vue-router'

    const router = useRouter()
    const email = ref('')
    const password = ref('')

    async function login() {
        const response = await fetch('http://localhost:3000/login', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value,
            }),
        })

        if (response.ok) {
            const user = await response.json()
            localStorage.setItem('user', JSON.stringify(user))
            router.push('/')
        } else {
            alert('Nesprávny email alebo heslo')
        }
    }
</script>
