// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  devtools: { enabled: true },
  plugins: [{ src: "~/plugins/firebase.ts", mode: "client" }],
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    //...other modules
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  // runtimeConfig: {
  //   // The private keys which are only available server-side
  //   apiSecret: "123",
  //   // Keys within public are also exposed client-side
  //   public: {
  //     apiBase: "/api",
  //   },
  // },
});
