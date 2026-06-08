import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/register.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/adminView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/dashboard',
      name: 'adminDashboard',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/edit/:id',
      name: 'adminEdit',
      component: () => import('../views/AdminEditProduct.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/product/:id',
      name: 'product',
      component: () => import('../views/ProductView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('../views/erors/eror404Page.vue'),
    },
    {
      path: '/user/:id',
      name: 'publicProfile',
      component: () => import('../views/PublicProfileView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.user) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.user) {
    return '/login'
  }

  if (to.meta.requiresAdmin && auth.user?.role !== 'admin') {
    return auth.user ? '/' : '/login'
  }

  if (to.meta.guestOnly && auth.user) {
    return '/'
  }
})

export default router