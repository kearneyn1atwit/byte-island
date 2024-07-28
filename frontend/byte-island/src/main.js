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
//import { P } from 'dist/assets/index-D9YVqsRE'
//import { P } from 'dist/assets/index-D9YVqsRE'

const store = createStore({
    state() {
        // let islandData = [];
        // for(var x=0;x<64;x++) {
        //     islandData.push("01");
        // }
        // for(var x=0;x<320;x++) {
        //     islandData.push("00");
        // }
        return {
            dashboardCreateCount: false,
            user: null,
            email: '',
            token: null,
            status: false,
            pfp: '',
            points: [0,0,0],
            selectedBlock: null,
            islandData: null
        }
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        setEmail(state, email) {
            state.email = email;
        },
        setPfp(state, pfp) {
            state.pfp = pfp;
        },
        setToken(state, token) {
            state.token = token;
        },
        setAccountStatus(state, status) {
            state.status = status;
        },
        setPoints(state, points) {
            state.points = points;
        },
        // setInv(state,id,inv) {
        //     console.log(id);
        //     console.log(Number(id));
        //     state.pseudoDatabase[Number(id)].inventory=inv;
        // },
        visitDashboard(state){
            state.dashboardCreateCount = true;
        },
        resetDashboardVisit(state){
            state.dashboardCreateCount = false;
        },
        resetStore(state) {
            state.dashboardCreateCount = false;
            state.user = null;
            state.token = null;
            state.status = false;
            state.points = [0,0,0];
        },
        updateIsland(state,data) {
            state.islandData[data.index]=data.newData;
        },
        updateWholeIsland(state,data) {
            state.islandData = data.newData;
        },
        clearIsland(state) {
            state.islandData = [];
            for(var x=0;x<64;x++) {
                state.islandData.push("01");
            }
            for(var x=0;x<320;x++) {
                state.islandData.push("00");
            }
        },
        setSelectedBlock(state,id) {
            state.selectedBlock=id;
        },
        setIsland(state,island) {
            state.islandData = [];
            for(let i=0;i<384;i) {
                state.islandData.push(island.slice(0,2));
                island=island.substring(2);
            }
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
        getEmail(state) {
            return state.email;
        },
        getPfp(state) {
            return state.pfp;
        },
        getToken(state) {
            return state.token;
        },
        getAccountStatus(state) {
            return state.status;
        },
        getPoints(state) {
            return state.points;
        },
        getDashboardCreateCount(state) {
            return state.dashboardCreateCount;
        },
        getIslandData(state) {
            return state.islandData;
        },
        getSelectedBlock(state) {
            return state.selectedBlock;
        }
    },
    plugins: [createPersistedState({
        storage: window.sessionStorage,
    })]
})

const app = createApp(App)

app.use(store)

app.component('VResizeDrawer',VResizeDrawer)

registerPlugins(app)

app.mount('#app')
