import { createRouter, createWebHistory } from 'vue-router'
import Homepage from '../components/Homepage.vue'
import PlatformVideoPage from '../components/PlatformVideoPage.vue'
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Homepage,
    },{
        path: '/watch',
        name: 'Watch',
        component: PlatformVideoPage
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes
})
export default router;