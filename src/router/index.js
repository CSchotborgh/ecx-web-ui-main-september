import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RCUVue from '@/views/RCU.vue'
import Upgrade from '@/views/Upgrade.vue'
import Config from '@/views/Config.vue'
import User from '@/views/User.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/cooling',
      name: 'cooling',
      component: RCUVue
    },
    {
      path: '/config',
      name: 'config',
      component: Config
    },
    {
      path: '/user',
      name: 'user',
      component: User
    },
    {
      path: '/upgrade',
      name: 'upgrade',
      component: Upgrade
    }
  ]
})

export default router
