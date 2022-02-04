import { createApp } from 'vue'
import App from './App.vue'
import SDropdown from '@storinka/dropdown'
import vfmPlugin from 'vue-final-modal'

const app = createApp(App)

app.use(SDropdown)
app.use(vfmPlugin)

app.mount('#app')
