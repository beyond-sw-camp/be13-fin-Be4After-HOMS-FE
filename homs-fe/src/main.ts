import "./assets/main.css";

import {createApp} from "vue";
import {createPinia} from "pinia";
import {library} from "@fortawesome/fontawesome-svg-core";
import {fas} from "@fortawesome/free-solid-svg-icons";
import {far} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './utils/chart-register.js'

import App from "@/App.vue";
import router from "@/router";
import i18n from "@/i18n";
import { userStore } from './states/user'

library.add(fas, far);

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App);

app.use(i18n);
app.use(pinia);
app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);

// 권한 관련

const userAuth = userStore()
// userAuth.setRole('user')

app.mount("#app");
