<template>
    <div class="min-h-screen flex flex-col bg-background">
        <NavBar :show-search="false" />

        <div v-if="loading" class="flex items-center justify-center flex-1">
            <div class="w-8 h-8 border-4 border-acent border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="product" class="max-w-5xl mx-auto px-4 md:px-6 py-10 w-full">

            <!-- Produkt info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-10">
                <div
                    class="bg-white rounded-2xl border border-text/8 flex items-center justify-center p-10 aspect-square">
                    <img v-if="product.image" :src="getImageUrl(product.image)" class="object-contain max-h-80" />
                    <span v-else class="text-6xl">📦</span>
                </div>

                <div class="flex flex-col gap-4">
                    <span
                        class="text-xs uppercase tracking-widest text-acent font-medium">{{ product . category }}</span>
                    <h1 class="text-3xl font-bold text-text">{{ product . name }}</h1>
                    <p class="text-text/60 text-sm leading-relaxed">{{ product . description }}</p>

                    <div class="mt-2 flex items-center gap-3">
                        <template v-if="product.discount > 0">
                            <span class="text-xl text-text/40 line-through">{{ product . price }} €</span>
                            <span class="text-3xl font-bold text-red-500">{{ discountedPrice }} €</span>
                            <span
                                class="text-sm px-2.5 py-1 rounded-lg bg-red-100 text-red-500 font-medium">-{{ product . discount }}%</span>
                        </template>
                        <span v-else class="text-3xl font-bold text-text">{{ product . price }} €</span>
                    </div>

                    <div class="text-xs text-text/40">Skladom: {{ product . stock }} ks</div>

                    <button @click="addToCart"
                        class="mt-4 h-[46px] bg-acent hover:bg-acent/80 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition-all">
                        {{ cartMessage || 'Pridať do košíka' }}
                    </button>
                </div>
            </div>

            <!-- Recenzie -->
            <div class="space-y-6">
                <h2 class="text-xl font-bold text-text">Recenzie</h2>

                <!-- Pridať recenziu -->
                <div v-if="auth.user && !userReview" class="bg-white border border-text/8 rounded-2xl p-6 space-y-4">
                    <p class="text-sm font-medium text-text">Napísať recenziu</p>

                    <!-- Hviezdy -->
                    <div class="flex gap-1">
                        <button v-for="star in 5" :key="star" @click="newReview.rating = star"
                            :class="['text-2xl transition-all', star <= newReview.rating ? 'opacity-100' : 'opacity-30']">
                            ⭐
                        </button>
                    </div>

                    <textarea v-model="newReview.content" placeholder="Napíšte recenziu..."
                        class="w-full h-24 px-3.5 py-3 rounded-xl text-sm text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent resize-none placeholder:text-text/25" />

                    <button @click="submitReview"
                        class="h-[42px] px-6 bg-acent hover:bg-acent/80 text-white text-sm font-medium rounded-xl transition-all">
                        Odoslať
                    </button>
                </div>

                <!-- Zoznam recenzii -->
                <div v-if="reviews.length === 0" class="text-text/40 text-sm py-6 text-center">
                    Zatiaľ žiadne recenzie
                </div>

                <ReviewCard v-for="review in reviews" :key="review.id" :review="review"
                    :current-user="auth.user" @delete="deleteReview" @delete-comment="deleteComment"
                    @comment="({ reviewId, content }) => submitComment(reviewId, content)" />
            </div>

        </div>

        <div v-else class="flex flex-col items-center justify-center flex-1 text-text/40">
            <span class="text-4xl mb-3">📦</span>
            <p class="text-sm">Produkt sa nenašiel</p>
            <RouterLink to="/" class="text-acent text-sm mt-4 hover:opacity-75">← Späť na hlavnú</RouterLink>
        </div>
    </div>
</template>

<script setup>
    import {
        ref,
        onMounted,
        onUnmounted,
        computed
    } from 'vue'
    import {
        useRoute
    } from 'vue-router'
    import {
        useAuthStore
    } from '../stores/auth'
    import NavBar from '../components/NavBar.vue'
    import ReviewCard from '../components/ReviewCard.vue'

    let eventSource = null

    const route = useRoute()
    const auth = useAuthStore()
    const product = ref(null)
    const reviews = ref([])
    const loading = ref(true)
    const commentInputs = ref({})
    const cartMessage = ref('')

    const newReview = ref({
        rating: 5,
        content: ''
    })

    const userReview = computed(() =>
        reviews.value.find(r => r.user_id === auth.user?.id)
    )

    const discountedPrice = computed(() => {
        if (!product.value?.discount) return null
        return (product.value.price * (1 - product.value.discount / 100)).toFixed(2)
    })

    function formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString('sk-SK')
    }

    onMounted(async () => {
        const [productRes, reviewsRes] = await Promise.all([
            fetch(`http://localhost:3000/products/${route.params.id}`),
            fetch(`http://localhost:3000/products/${route.params.id}/reviews`),
        ])

        if (productRes.ok) product.value = await productRes.json()
        if (reviewsRes.ok) reviews.value = await reviewsRes.json()

        loading.value = false

        // SSE spojenie
        eventSource = new EventSource(`http://localhost:3000/products/${route.params.id}/sse`)
        eventSource.onmessage = async (e) => {
            const data = JSON.parse(e.data)
            if (['review_added', 'review_deleted', 'comment_added', 'comment_deleted'].includes(data
                    .type)) {
                await fetchReviews()
            }
        }
    })

    onUnmounted(() => {
        if (eventSource) {
            eventSource.close()
            eventSource = null
        }
    })

    async function fetchReviews() {
        const res = await fetch(`http://localhost:3000/products/${route.params.id}/reviews`)
        if (res.ok) reviews.value = await res.json()
    }

    async function submitReview() {
        if (!newReview.value.content) return

        const res = await fetch(`http://localhost:3000/products/${route.params.id}/reviews`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(newReview.value),
        })

        if (res.ok) {
            newReview.value = {
                rating: 5,
                content: ''
            }
            await fetchReviews()
        }
    }

    async function addToCart() {
        if (!auth.user) {
            router.push('/login')
            return
        }

        const response = await fetch(`http://localhost:3000/cart/${route.params.id}`, {
            method: 'POST',
            credentials: 'include',
        })

        if (response.ok) {
            cartMessage.value = '✓ Pridané'
            setTimeout(() => cartMessage.value = '', 2000)
        } else {
            cartMessage.value = 'Vypredané'
        }
    }

    async function deleteReview(id) {
        const res = await fetch(`http://localhost:3000/reviews/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        })
        if (res.ok) await fetchReviews()
    }

    async function submitComment(reviewId, content) {
        const res = await fetch(`http://localhost:3000/reviews/${reviewId}/comments`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                content
            }),
        })
        if (res.ok) await fetchReviews()
    }

    async function deleteComment(id) {
        const res = await fetch(`http://localhost:3000/comments/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        })
        if (res.ok) await fetchReviews()
    }

    function getImageUrl(image) {
        if (!image) return null
        if (image.startsWith('http')) return image
        return `http://localhost:3000/files/${image}`
    }
</script>
