<template>
    <RouterLink :to="{ name: 'home' }">
    </RouterLink>
    <fwb-navbar>
        <template #logo>
            <fwb-navbar-logo alt="ECX Logo" image-url="images/ecx_logo.png" link="#">
                EDGERACK
            </fwb-navbar-logo>
        </template>
        <template #default="{isShowMenu}">
            <fwb-navbar-collapse :is-show-menu="isShowMenu">
                <fwb-navbar-link v-show="greeting" class="align-center mt-1 font-bold">
                    <RouterLink :to="{ name: 'user' }">
                    <span class="text-blue-500">{{ greeting }}</span>
                    </RouterLink>
                </fwb-navbar-link>
                <!-- Home Link -->
                <fwb-navbar-link class="align-center mt-1">
                    <RouterLink :to="{ name: 'home' }">
                    Home
                    </RouterLink>
                </fwb-navbar-link>
                <!-- Grid Link -->
                <fwb-navbar-link class="align-center mt-1">
                    <RouterLink :to="{ name: 'cooling' }">
                    Cooling Unit
                    </RouterLink>
                </fwb-navbar-link>
                <fwb-navbar-link class="align-center mt-1" v-show="loggedIn">
                    <RouterLink :to="{ name: 'config' }">
                    Config
                    </RouterLink>
                </fwb-navbar-link>
                <fwb-navbar-link class="align-center mt-1" v-show="loggedIn">
                    <RouterLink :to="{ name: 'upgrade' }">
                    Upgrade
                    </RouterLink>
                </fwb-navbar-link>
                <fwb-navbar-link v-show="!loggedIn">
                    <fwb-button gradient="blue" size="xs" pill @click.prevent="showLoginModal">Log In</fwb-button>
                </fwb-navbar-link>
                <fwb-navbar-link v-show="loggedIn">
                    <fwb-button gradient="blue" size="xs" pill @click.prevent="showLogoutModal">Log Out</fwb-button>
                </fwb-navbar-link>
                <fwb-navbar-link>
                    <ThemeToggle />
                </fwb-navbar-link>

            </fwb-navbar-collapse>
        </template>
    </fwb-navbar>
  </template>

<script setup>
  import {
    FwbNavbar,
    FwbNavbarCollapse,
    FwbNavbarLink,
    FwbNavbarLogo,
    FwbButton
  } from 'flowbite-vue';
import { ref, watch, onMounted } from 'vue';
import { useUserStore } from '@/stores/user.js'
import { useThemeStore } from '@/stores/theme.js'
import ThemeToggle from './ThemeToggle.vue'
import bus from '@/bus.js'

const userStore = useUserStore();

let greeting = ref(userStore.greeting);
let loggedIn = ref(userStore.isLoggedIn);



watch(() => userStore.isLoggedIn,
  (newValue) => {
    loggedIn.value = newValue;
  },
  { immediate: true }
);

watch(() => userStore.greeting,
  (newValue) => {
    greeting.value = newValue;
  },
  { immediate: true }
);


onMounted(() => {
    loggedIn.value = userStore.isLoggedIn;
    greeting.value = userStore.greeting;
});

const showLoginModal = () => {
    bus.emit('show-login-modal');
};

const showLogoutModal = () => {
  bus.emit('show-logout-modal');
};

</script>