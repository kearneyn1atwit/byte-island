
/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/test-page', component: () => import("../components/RouterTest.vue") }
  ]
})

router.addRoute('', { path: '/test-page', component: () => import("../components/RouterTest.vue") })

export default router
