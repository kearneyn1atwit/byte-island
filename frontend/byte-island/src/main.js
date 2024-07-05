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
            dashboardCreateCount: 0,
            user: null,
            token: null,
            points: [0,0,0],
            pseudoDatabase: [{
                id: "01",
                name: "simple block",
                RGB: 10000,
                image: "/01.png",
                inventory: 0
            },
            {
                id: "02",
                name: "blue block",
                RGB: 1,
                image: "/02.png",
                inventory: 0
            },
            {
                id: "03",
                name: "placer block",
                RGB: 10101,
                image: "/blockplace.png",
                inventory: 0
            }]
        }
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        setToken(state, token) {
            state.token = token;
        },
        setPoints(state, points) {
            state.points = points;
        },
        setInv(state,id,inv) {
            console.log(id);
            console.log(Number(id));
            state.pseudoDatabase[Number(id)].inventory=inv;
        },
        visitDashboard(state){
            state.dashboardCreateCount++;
        },
        resetDashboardVisit(state){
            state.dashboardCreateCount = 0;
        },
        resetStore(state) {
            state.dashboardCreateCount = 0;
            state.user = null;
            state.token = null;
            state.points = [0,0,0];
        }
    },
    actions: {},
    getters: {
        isLoggedIn(state) {
            return !!state.token;
        },
        getUsername(state) {
            return state.user;
        },
        getToken(state) {
            return state.token;
        },
        getPoints(state) {
            return state.points;
        },
        getDashboardCreateCount(state) {
            return state.dashboardCreateCount;
        }
    },
    plugins: [createPersistedState()]
})

const app = createApp(App)

app.use(store)

app.component('VResizeDrawer',VResizeDrawer)

registerPlugins(app)

app.mount('#app')
