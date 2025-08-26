<template>
  <SiteNavigation />
  <LoginModal ref="loginModal" />
  <LogoutModal ref="logoutModal" />
  <ForgotPassword ref="forgotpassModal" />
  <div v-if="userStore.isLoggedIn || !requiresAuth">
    <RouterView />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from './stores/user.js';
import { useThemeStore } from './stores/theme.js';
import SiteNavigation from './components/SiteNavigation.vue';
import LoginModal from './components/LoginModal.vue';
import LogoutModal from './components/LogoutModal.vue';
import ForgotPassword from './components/ForgotPassword.vue';
import bus from './bus.js'
import axios from 'axios';

axios.defaults.baseURL = 'https://' + window.location.hostname;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'Vue.js';


const userStore = useUserStore();
const themeStore = useThemeStore();
const route = useRoute();
const router = useRouter();
const loginModal = ref(null);
const logoutModal = ref(null);
const forgotpassModal = ref(null);

const authRequiredRoutes = ['config', 'user', 'upgrade']; // Add your protected route names here

const requiresAuth = computed(() => {
  return authRequiredRoutes.includes(route.name);
});

onMounted( async () => {
  if (requiresAuth.value && !userStore.isLoggedIn) {
    loginModal.value.show = true;
  };
  
  // Initialize theme
  themeStore.applyThemeToDocument();
  
  await userStore.retrieveCsrfToken();
});

watch(
  () => userStore.isLoggedIn,
  (isLoggedIn) => {
    if (!isLoggedIn && requiresAuth.value) {
      loginModal.value.show = true;
    }
  }
);

router.beforeEach(async (to, from, next) => {
  if (authRequiredRoutes.includes(to.name) && !userStore.isLoggedIn) {
    const validTokens = await userStore.validateTokens();
    if (!validTokens) {
      userStore.isLoggedIn = false;
      loginModal.value.show = true;
      next(false); // Cancel navigation
    } else {
      next(); // Proceed with navigation
    }
  } else {
    next(); // Proceed with navigation
  }
});

bus.on('show-login-modal', () => {
  loginModal.value.show = true;
});
bus.on('hide-login-modal', () => {
  loginModal.value.show = false;
});
const closeLoginModal = () => {
  loginModal.value.show = false;
};

bus.on('show-logout-modal', () => {
  logoutModal.value.show = true;
});
bus.on('hide-logout-modal', () => {
  logoutModal.value.show = false;
});
const closeLogoutModal = () => {
  logoutModal.value.show = false;
};

bus.on('show-forgot-password-modal', () => {
  forgotpassModal.value.show = true;
});
bus.on('hide-forgot-password-modal', () => {
  forgotpassModal.value.show = false;
});
const closeForgotPasswordModal = () => {
  forgotpassModal.value.show = false;
};

</script>
