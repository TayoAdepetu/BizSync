<!-- app.vue -->
<template>
  <div class="h-screen">
    <div class="h-[10vh] w-100 bg-[#5fe65f]">
      <div
        v-if="!user"
        class="h-100 flex justify-between mx-[40px] place-items-center"
      >
        <div>
          <h1 class="text-white"><a href="#" class="">BizSync</a></h1>
        </div>
        <div>
          <v-btn class="mr-[10px]" small depressed @click="userLoginDialog"
            >LOGIN</v-btn
          >
          <v-btn small depressed @click="regDialog">REGISTER</v-btn>
        </div>
      </div>

      <div
        v-else
        class="h-100 flex justify-between mx-[40px] place-items-center"
      >
        <div>
          <h1 class="text-white"><a href="#" class="">BizSync</a></h1>
          <h1>Hi {{ user.displayName }}</h1>
        </div>

        <div>
          <h1>Hi, {{ user.displayName }}.</h1>
        </div>
        <div>
          <v-btn small depressed @click="handleLogout">LOGOUT</v-btn>
        </div>
      </div>
    </div>

    <v-dialog v-model="registrationDialog">
      <v-form>
        <input
          type="text"
          placeholder="Enter your Email Address"
          v-model="email"
        />
        <input
          type="text"
          placeholder="Enter your password"
          v-model="password"
        />

        <v-btn @click="handleRegistration">REGISTER</v-btn>
      </v-form>
    </v-dialog>

    <v-dialog v-model="loginDialog">
      <v-form>
        <input
          type="text"
          placeholder="Enter your Email Address"
          v-model="email"
        />
        <input
          type="text"
          placeholder="Enter your password"
          v-model="password"
        />

        <v-btn @click="handleLogin">LOGIN</v-btn>
      </v-form>

      <v-btn @click="openReset">RESET PASSWORD</v-btn>
    </v-dialog>

    <v-dialog v-model="resetDialog">
      <v-form>
        <input
          type="text"
          placeholder="Enter your Email Address"
          v-model="email"
        />

        <v-btn @click="handlePasswordReset">RESET PASSWORD</v-btn>
      </v-form>
    </v-dialog>
    <NuxtLayout>
      <v-app>
        <NuxtPage />
      </v-app>
    </NuxtLayout>
  </div>
</template>
<script setup>
  const { user, error, registerUser, loginUser, logoutUser, resetPassword } =
    firebaseAuth(); // auto-imported

  var registrationDialog = false;
  var loginDialog = false;
  var resetDialog = false;

  const handleRegistration = async () => {
    const { registerUser } = firebaseAuth(); // auto-imported from composables

    const creds = reactive({
      email: "",
      password: "",
    });
    await registerUser(creds.email, creds.password);
  };

  const regDialog = () => {
    registrationDialog = true;
  };

  const handleLogin = async () => {
    const { loginUser } = firebaseAuth(); // auto-imported from composables

    const creds = reactive({
      email: "",
      password: "",
    });
    await loginUser(creds.email, creds.password);
  };

  const userLoginDialog = () => {
    loginDialog = true;
  };

  const handleLogout = async () => {
    const { logoutUser } = firebaseAuth(); // auto-imported from composables

    const creds = reactive({
      email: "",
      password: "",
    });
    await logoutUser();
  };

  const handlePasswordReset = async () => {
    const { resetPassword } = firebaseAuth(); // auto-imported from composables

    const creds = reactive({
      email: "",
    });
    await resetPassword(creds.email);
  };

  const openReset = () => {
    loginDialog = false;
    resetDialog = true;
  };
</script>
