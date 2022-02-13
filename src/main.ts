import { createApp, Directive } from 'vue'
import SDropdown from '@storinka/dropdown'
import vfmPlugin from 'vue-final-modal'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Root from './Root.vue'
import ApiDocument from './ApiDocument.vue';
import { rippleDirective } from './directives/ripple.js';

function scrollHorizontally(e) {
    e = window.event || e;

    let element = e.currentTarget;
    while (!element.getAttribute("v-hscroll-main"))
        element = element.parentNode;

    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    element.scrollLeft -= (delta * 40);

    if ((delta > 0 && element.scrollLeft > 0) ||
        (delta < 0 && element.offsetWidth + element.scrollLeft < element.scrollWidth)) {
        e.preventDefault();
    }
}

const HScroll: Directive = {
    mounted(el) {
        el.setAttribute("v-hscroll-main", "1");
        el.addEventListener('wheel', scrollHorizontally, false);
    },
    unmounted(el) {
        el.removeEventListener('wheel', scrollHorizontally, false);
    }
};

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
app.directive('hscroll', HScroll);

app.mount('#app')
