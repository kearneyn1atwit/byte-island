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
import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { VResizeDrawer } from  '@wdns/vuetify-resize-drawer'

const store = createStore({
    state() {
        return {
            token: null
        }
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
        }
    },
    actions: {},
    getters: {
        isLoggedIn(state) {
            return !!state.token;
        }
    },
    plugins: [createPersistedState()]
})

const app = createApp(App)

app.use(store)

app.component('VResizeDrawer',VResizeDrawer)

registerPlugins(app)

app.mount('#app')
