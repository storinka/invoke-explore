import { createRouter, createWebHistory } from 'vue-router';
import Start from '../views/Start.vue';
import ApiDocument from '../views/ApiDocument.vue';

const router = createRouter({
    history: createWebHistory('/'),
    routes: [
        {
            name: 'Start',
            path: '',
            component: Start,
        },
        {
            name: 'ApiDocument',
            path: '/d',
            component: ApiDocument,
        },
    ],
} as any);

export default router;
