import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/wyongqin',
      name: 'wyongqin',
      component: () => import('../views/resume/index.vue'),
    },
    {
      path: '/2048',
      name: 'game',
      component: () => import('../views/2048/index.vue'),
    },
    {
      path: '/find48',
      name: 'find48',
      component: () => import('../views/find48/index.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/test/index.vue'),
    },
  ],
})

export default router
