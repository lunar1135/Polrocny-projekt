<template>
  <div class="bg-white border border-text/8 rounded-2xl p-6 space-y-4">

    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <RouterLink v-if="review.user_id" :to="`/user/${review.user_id}`">
          <div class="w-8 h-8 rounded-full bg-acent/10 flex items-center justify-center text-acent text-sm font-medium overflow-hidden">
            <img v-if="review.avatar"
              :src="`http://localhost:3000/files/${review.avatar}`"
              class="w-full h-full object-cover" />
            <span v-else>{{ review.username?.charAt(0).toUpperCase() }}</span>
          </div>
        </RouterLink>
        <div v-else class="w-8 h-8 rounded-full bg-acent/10 flex items-center justify-center text-acent text-sm font-medium">
          {{ review.username?.charAt(0).toUpperCase() }}
        </div>
        <div>
          <p class="text-sm font-medium text-text">{{ review.username }}</p>
          <p class="text-xs text-text/40">{{ formatDate(review.created_at) }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm">{{ '⭐'.repeat(review.rating) }}</span>
        <button v-if="canDelete"
          @click="$emit('delete', review.id)"
          class="text-xs text-red-400 hover:text-red-600 transition-colors">
          🗑️
        </button>
      </div>
    </div>

    <p class="text-sm text-text/70">{{ review.content }}</p>

    <!-- Komentare -->
    <div v-if="review.comments?.length > 0" class="space-y-3 pl-4 border-l-2 border-text/8">
      <div v-for="comment in review.comments" :key="comment.id" class="flex items-start gap-2">
        <div class="w-6 h-6 rounded-full bg-acent/10 flex items-center justify-center text-acent text-xs font-medium shrink-0">
          {{ comment.username?.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-text">{{ comment.username }}</p>
            <p class="text-[10px] text-text/40">{{ formatDate(comment.created_at) }}</p>
            <button v-if="canDeleteComment(comment)"
              @click="$emit('deleteComment', comment.id)"
              class="text-[10px] text-red-400 hover:text-red-600 ml-auto">🗑️</button>
          </div>
          <p class="text-xs text-text/70 mt-0.5">{{ comment.content }}</p>
        </div>
      </div>
    </div>

    <!-- Pridať komentar -->
    <div v-if="currentUser" class="flex gap-2">
      <input v-model="commentText" type="text" placeholder="Pridať odpoveď..."
        class="flex-1 h-9 px-3 rounded-xl text-xs text-text bg-background border-[1.5px] border-text/12 outline-none transition-colors focus:border-acent placeholder:text-text/25" />
      <button @click="submitComment"
        class="h-9 px-4 bg-acent hover:bg-acent/80 text-white text-xs font-medium rounded-xl transition-all">
        Odoslať
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  review: { type: Object, required: true },
  currentUser: { type: Object, default: null },
})

const emit = defineEmits(['delete', 'deleteComment', 'comment'])

const commentText = ref('')

const canDelete = computed(() =>
  props.currentUser && (props.currentUser.id === props.review.user_id || props.currentUser.role === 'admin')
)

function canDeleteComment(comment) {
  return props.currentUser && (props.currentUser.id === comment.user_id || props.currentUser.role === 'admin')
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString('sk-SK')
}

function submitComment() {
  if (!commentText.value) return
  emit('comment', { reviewId: props.review.id, content: commentText.value })
  commentText.value = ''
}
</script>