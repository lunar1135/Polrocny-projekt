<template>
    <nav class="h-14 flex items-center justify-between px-4 md:px-6 bg-primary shadow-sm">
        <RouterLink to="/">
            <div class="flex items-center gap-2">
                <div class="rounded-xl bg-acent flex items-center justify-center">
                    <img src="/images/logo.png" alt="logo voltix" class="w-8 h-8 md:w-9 md:h-9">
                </div>
                <span class="font-bold text-base md:text-lg text-text tracking-widest">VOLTIX</span>
            </div>
        </RouterLink>

        <!-- Search - skryty na mobile -->
        <div v-if="showSearch"
            class="hidden md:flex items-center w-65 h-9.5 bg-white border border-text/10
  rounded-xl overflow-hidden focus-within:border-acent transition-colors">
            <span class="px-3 text-secondary text-sm">⌕</span>
            <input v-model="searchText" @keyup.enter="search" type="text" placeholder="Hľadaj produkty..."
                class="flex-1 bg-transparent outline-none text-text text-sm placeholder-secondary/50" />
            <button @click="search"
                class="h-full px-4 bg-acent hover:bg-acent/80 text-white text-xs font-medium transition-colors">
                Hľadaj
            </button>
        </div>

        <RouterLink v-if="!auth.user" to="/login">
            <button
                class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 border border-text/10 hover:bg-white/80 transition-colors">
                <img src="/images/default.webp" class="w-7 h-7 rounded-full object-cover" />
                <span class="hidden md:inline text-sm text-text">Log in</span>
            </button>
        </RouterLink>

        <div v-else class="flex items-center gap-2 relative">

            <RouterLink to="/cart">
                <button
                    class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/50 border border-text/10 hover:bg-white/80 transition-colors">
                    🛒
                </button>
            </RouterLink>

            <button @click.stop="dropdownOpen = !dropdownOpen"
                class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 border border-text/10 hover:bg-white/80 transition-colors">
                <img :src="auth.user.avatar ?
                    `http://localhost:3000/files/${auth.user.avatar}` :
                    '/images/default.webp'"
                    class="w-7 h-7 rounded-full object-cover" />
                <span class="hidden md:inline text-sm text-text">{{ auth . user . username }}</span>
            </button>

            <div v-show="dropdownOpen" @click.stop
                class="absolute right-0 top-12 w-44 bg-white border border-text/10 rounded-xl shadow-lg overflow-hidden z-50">
                <RouterLink to="/profile" @click="dropdownOpen = false"
                    class="flex items-center gap-2.5 px-4 py-3 text-sm text-text hover:bg-background transition-colors">
                    👤 Profil
                </RouterLink>
                <RouterLink v-if="auth.user.role === 'admin'" to="/admin/dashboard" @click="dropdownOpen = false"
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
    import {
        useAuthStore
    } from '../stores/auth'
    import {
        useRouter
    } from 'vue-router'
    import {
        ref,
        onMounted,
        onUnmounted,
        watch
    } from 'vue'
    import {
        computed
    } from 'vue'


    const auth = useAuthStore()
    const router = useRouter()
    const dropdownOpen = ref(false)
    const searchText = ref('')


    const userName = computed(() => auth.user?.username ?? null)
    const userRole = computed(() => auth.user?.role ?? '')

    defineProps({
        showSearch: {
            type: Boolean,
            default: true,
        }
    })

    onMounted(() => {
        document.addEventListener('click', closeDropdown)
    })

    onUnmounted(() => {
        document.removeEventListener('click', closeDropdown)
    })

    watch(searchText, (val) => {
        router.push(`/?search=${encodeURIComponent(val.trim())}`)
    })

    function closeDropdown() {
        dropdownOpen.value = false
    }

    function search() {
        if (!searchText.value.trim()) return
        router.push(`/?search=${encodeURIComponent(searchText.value.trim())}`)
    }

    async function logout() {
        await fetch('http://localhost:3000/logout', {
            method: 'post',
            credentials: 'include',
        })
        auth.logout()
        dropdownOpen.value = false
        router.push('/')
    }
</script>
