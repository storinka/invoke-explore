import { createApp } from 'vue'
import App from './App.vue'
import SDropdown from '@storinka/dropdown'
import vfmPlugin from 'vue-final-modal'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Root from './Root.vue'

const app = createApp(Root)

app.use(SDropdown)
app.use(vfmPlugin)

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '',
            component: App,
        } as RouteRecordRaw
    ]
} as any)

app.use(router)

app.mount('#app')
