import { createApp } from 'vue'
import SDropdown from '@storinka/dropdown'
import vfmPlugin from 'vue-final-modal'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Root from './Root.vue'
import ApiDocument from './ApiDocument.vue';
import { rippleDirective } from './directives/ripple.js';

const app = createApp(Root)

app.use(SDropdown)
app.use(vfmPlugin)

const router = createRouter({
    history: createWebHistory('/invoke-explore'),
    routes: [
        {
            path: '',
            component: ApiDocument,
        } as RouteRecordRaw
    ]
} as any)

app.use(router)
app.directive('ripple', rippleDirective)

app.mount('#app')
