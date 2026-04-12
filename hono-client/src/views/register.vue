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

        <!-- Register card -->
        <div class="flex-1 flex items-center justify-center px-4 py-10">
            <div
                class="w-full max-w-[400px] bg-white border border-text/8 rounded-2xl
                  p-10 shadow-[0_8px_40px_rgba(2,30,24,0.07)]">

                <!-- Header -->
                <div class="text-center mb-8">
                    <h1 class="text-2xl font-bold text-text tracking-tight mb-1.5">Vytvorte účet</h1>
                    <p class="text-sm text-text/45">Zaregistrujte sa zadarmo</p>
                </div>

                <!-- Form -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">
                            Meno a priezvisko
                        </label>
                        <input v-model="name" type="text" placeholder="Ján Novák"
                            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background
                          border-[1.5px] border-text/12 outline-none transition-colors
                          focus:border-acent focus:bg-white placeholder:text-text/25" />
                    </div>

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



                    <div>
                        <label class="block text-[11px] font-medium text-text/50 uppercase tracking-wide mb-1.5">
                            Potvrdiť heslo
                        </label>
                        <input v-model="passwordConfirm" type="password" placeholder="••••••••"
                            class="w-full h-11 px-3.5 rounded-xl text-sm text-text bg-background
                          border-[1.5px] border-text/12 outline-none transition-colors
                          focus:border-acent focus:bg-white placeholder:text-text/25" />
                    </div>

                    <button @click="register"
                        class="w-full h-[46px] bg-acent hover:bg-acent/80 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all">
                        Zaregistrovať sa
                    </button>
                </div>

                <p class="text-center text-sm text-text/40 mt-6">
                    Už máte účet?
                    <RouterLink to="/login" class="text-acent font-medium hover:opacity-75">
                        Prihláste sa
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
    import { useRouter } from 'vue-router'


    const router = useRouter()

    const name = ref('')
    const email = ref('')
    const password = ref('')
    const passwordConfirm = ref('')


    async function register() {
  if (password.value !== passwordConfirm.value) {
    alert('Heslá sa nezhodujú')
    return
  }

  const response = await fetch('http://localhost:3000/register', {
    method: 'post',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: name.value,
      email: email.value,
      password: password.value,
    }),
  })

  if (response.ok) {
    router.push('/login')
  } else {
    alert('Tento email už existuje')
  }
}
</script>

