/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import { VResizeDrawer } from  '@wdns/vuetify-resize-drawer';

const app = createApp(App)

app.component('VResizeDrawer',VResizeDrawer);

registerPlugins(app)

app.mount('#app')
