import { createRouter, createWebHistory } from 'vue-router'

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
},
{
path: '/register',
name: 'register',
component: () => import('../views/register.vue'),
},
{
path: '/product/:id',
name: 'product',
component: () => import('../views/ProductView.vue'),
},
{
path: '/admin',
name: 'admin',
component: () => import('../views/adminView.vue'),
},
{
  path: '/profile',
  name: 'profile',
  component: () => import('../views/ProfileView.vue'),
}
],
})

export default router
