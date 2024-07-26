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

const store = createStore({
    state() {
        let islandData = [];
        for(var x=0;x<64;x++) {
            islandData.push("00000000");
        }
        for(var x=0;x<128;x++) {
            if(x<64 || x%5==0) islandData.push("0000000" + (Math.random()*100%3+2).toString());
            else islandData.push("00000001");
        }
        for(var x=0;x<192;x++) {
            islandData.push("00000001");
        }
        let pseudoDatabase = [
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
            },
            {
                id: "005",
                name: "grass block",
                RGB: 300,
                image: "/005.png"
            },
            {
                id: "006",
                name: "sand block",
                RGB: 300,
                image: "/006.png"
            }];
        return {
            dashboardCreateCount: false,
            user: null,
            token: null,
            points: [0,0,0],
            selectedBlock: null,
            islandData,
            pseudoDatabase
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
            state.dashboardCreateCount = true;
        },
        resetDashboardVisit(state){
            state.dashboardCreateCount = false;
        },
        resetStore(state) {
            state.dashboardCreateCount = false;
            state.user = null;
            state.token = null;
            state.points = [0,0,0];
        },
        updateIsland(state,data) {
            state.islandData[data.index]=data.newData;
        },
        updateWholeIsland(state,data) {
            state.islandData = data.newData;
        },
        resetIsland(state) {
            state.islandData = [];
            for(var x=0;x<64;x++) {
                state.islandData.push("00000000");
            }
            for(var x=0;x<128;x++) {
                if(x<64 || x%6==0) state.islandData.push("0000000" + ((Math.floor(Math.random()*100)%3)+2).toString());
                else state.islandData.push("00000001");
            }
            for(var x=0;x<192;x++) {
                state.islandData.push("00000001");
            }
        },
        clearIsland(state) {
            state.islandData = [];
            for(var x=0;x<64;x++) {
                state.islandData.push("00000000");
            }
            for(var x=0;x<320;x++) {
                state.islandData.push("00000001");
            }
        },
        setSelectedBlock(state,id) {
            state.selectedBlock=id;
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
        getIslandData(state) {
            return state.islandData;
        },
        getSelectedBlock(state) {
            return state.selectedBlock;
        },
        getPseudoDatabase(state) {
            return state.pseudoDatabase;
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
