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
        let islandData = [];
        for(var x=0;x<64;x++) {
            islandData.push("00000000");
        }
        for(var x=0;x<128;x++) {
            if(x<64 || x%5==0) islandData.push("0000000" + (Math.random()*100%3+2).toString());
            else islandData.push("000000001");
        }
        for(var x=0;x<128;x++) {
            islandData.push("00000001");
        }
        return {
            dashboardCreateCount: 0,
            user: null,
            token: null,
            points: [0,0,0],
            counts: [0,0,0],
            islandData,
            pseudoDatabase: [
                {
                    id: "000",
                    name: "nil",
                    RGB: 1,
                    image: "/000.png",
                },
                {
                    id: "001",
                    name: "air",
                    RGB: 1,
                    image: "/001.png",
                },
                {
                    id: "002",
                    name: "simple block",
                    RGB: 10000,
                    image: "/002.png",
                },
                {
                    id: "003",
                    name: "blue block",
                    RGB: 1,
                    image: "/003.png",
                },
                {
                    id: "004",
                    name: "green block",
                    RGB: 100,
                    image: "/004.png"
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
        setCounts(state,counts) {
            state.counts = counts;
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
            state.counts = [0,0,0];
        },
        updateIsland(state,index,newData) {
            state.islandData[index]=newData;
        },
        resetIsland(state) {
            state.islandData = [];
            for(var x=0;x<64;x++) {
                state.islandData.push("00000000");
            }
            for(var x=0;x<128;x++) {
                if(x<64 || x%6==0) state.islandData.push("00000000" + ((Math.floor(Math.random()*100)%3)+2).toString());
                else state.islandData.push("000000001");
            }
            for(var x=0;x<128;x++) {
                state.islandData.push("00000001");
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
        getToken(state) {
            return state.token;
        },
        getPoints(state) {
            return state.points;
        },
        getDashboardCreateCount(state) {
            return state.dashboardCreateCount;
        },
        getCounts(state) {
            return state.counts;
        },
        getIslandData(state) {
            return state.islandData;
        }
    },
    plugins: [createPersistedState()]
})

const app = createApp(App)

app.use(store)

app.component('VResizeDrawer',VResizeDrawer)

registerPlugins(app)

app.mount('#app')
