import { createRouter, createWebHistory } from 'vue-router';
import Start from '../views/Start.vue';
import ApiDocument from '../views/ApiDocument.vue';

const router = createRouter({
    history: createWebHistory(window.__storinka_ix_base_path__),
    routes: window.__storinka_ix_api_document_url__ ? [
        {
            name: 'ApiDocument',
            path: '/',
            component: ApiDocument,
        },
    ] : [
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
