
/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: []
})

router.addRoute('', { path: '/', name: 'Login', component: () => import("../components/Login.vue") });
router.addRoute('', { path: '/home/:id', name: 'Home', component: () => import("../components/Dashboard.vue") });
router.addRoute('', { path: '/unauthorized', name: 'Unauth', component: () => import("../components/Unauth.vue") });
router.addRoute('', { path: '/:catchAll(.*)', name: 'NotFound', component: () => import("../components/NotFound.vue") });

export default router
