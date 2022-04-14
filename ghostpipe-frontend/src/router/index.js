import { createRouter, createWebHistory } from 'vue-router'
import Homepage from '../components/Homepage.vue'
import PlatformVideoPage from '../components/PlatformVideoPage.vue'
import ChangeAPI from '../components/ChangeAPI.vue'
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Homepage,
    },{
        path: '/watch',
        name: 'Watch',
        component: PlatformVideoPage
    },{
        path: "/choose_api",
        name: "Set api to use",
        component: ChangeAPI
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes
})
export default router;