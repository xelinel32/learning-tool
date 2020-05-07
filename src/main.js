import Vue from "vue";
import App from "@/App.vue";
import router from "@/router/router";
import store from "@/store/store";
import "@/registerServiceWorker";

// Firebase bindings for Vue.js
import { firestorePlugin } from "vuefire";
Vue.use(firestorePlugin);

// Client-side validation library for user form inputs
import VeeValidate from "vee-validate";
Vue.use(VeeValidate);

import Notification from "vue-notification";
Vue.use(Notification);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
