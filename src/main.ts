import { createApp, Directive } from 'vue'
import SDropdown from '@storinka/dropdown'
import vfmPlugin from 'vue-final-modal'
import Root from './Root.vue'
import router from './router';

if (!window.__storinka_ix_base_path__) {
    window.__storinka_ix_base_path__ = "/";
}

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

app.use(router)
app.directive('hscroll', HScroll);

app.mount('#app')
