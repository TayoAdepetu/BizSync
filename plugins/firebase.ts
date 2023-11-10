import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const firebaseConfig = {
    apiKey: "AIzaSyAKovL5IwG_nuf1DOWng7A0QdEPnLikQf8",
    authDomain: "bizsync-90be9.firebaseapp.com",
    projectId: "bizsync-90be9",
    storageBucket: "bizsync-90be9.appspot.com",
    messagingSenderId: "129305152862",
    appId: "1:129305152862:web:f7848ca8b9dadf833513cf",
  };

  const app = initializeApp(firebaseConfig);

  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  nuxtApp.vueApp.provide("auth", auth);
  nuxtApp.provide("auth", auth);

  nuxtApp.vueApp.provide("firestore", firestore);
  nuxtApp.provide("firestore", firestore);
});
