<!-- app.vue -->
<template>
  <div class="h-screen">
    <div class="h-[10vh] w-100 bg-[#5fe65f]"><h1>Hi Guest</h1></div>
    <NuxtLayout>
      <v-app>
        <NuxtPage />
      </v-app>
    </NuxtLayout>
  </div>
</template>
<script setup>
const { user, registerUser } = firebaseAuth(); // auto-imported
</script>