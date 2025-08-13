<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center">
      <!-- Brand/Logo -->
      <div class="mr-4 hidden md:flex">
        <RouterLink to="/" class="mr-6 flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <img src="/images/ecx_logo.png" alt="ECX Logo" class="h-6 w-auto" />
          <span class="hidden font-bold sm:inline-block">ECX Web UI</span>
        </RouterLink>
      </div>

      <!-- Mobile Brand -->
      <div class="mr-2 flex md:hidden">
        <RouterLink to="/" class="flex items-center space-x-2">
          <img src="/images/ecx_logo.png" alt="ECX Logo" class="h-6 w-auto" />
          <span class="font-bold">ECX</span>
        </RouterLink>
      </div>

      <!-- Desktop Navigation -->
      <div class="mr-4 hidden md:flex">
        <nav class="flex items-center space-x-6 text-sm font-medium">
          <RouterLink to="/" class="nav-link transition-colors hover:text-foreground/80 text-foreground/60" active-class="text-foreground">
            Home
          </RouterLink>
          <RouterLink to="/rcu" class="nav-link transition-colors hover:text-foreground/80 text-foreground/60" active-class="text-foreground">
            RCU
          </RouterLink>
          <RouterLink
            v-if="userStore.isLoggedIn"
            to="/config"
            class="nav-link transition-colors hover:text-foreground/80 text-foreground/60"
            active-class="text-foreground"
          >
            Config
          </RouterLink>
          <RouterLink
            v-if="userStore.isLoggedIn"
            to="/user"
            class="nav-link transition-colors hover:text-foreground/80 text-foreground/60"
            active-class="text-foreground"
          >
            User
          </RouterLink>
          <RouterLink
            v-if="userStore.isLoggedIn"
            to="/upgrade"
            class="nav-link transition-colors hover:text-foreground/80 text-foreground/60"
            active-class="text-foreground"
          >
            Upgrade
          </RouterLink>
        </nav>
      </div>

      <!-- Right side items -->
      <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div class="w-full flex-1 md:w-auto md:flex-none">
          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="btn-ghost btn-sm px-0 md:hidden"
            aria-label="Toggle mobile menu"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span class="sr-only">Toggle menu</span>
          </button>
        </div>

        <!-- Desktop Actions -->
        <nav class="flex items-center space-x-2">
          <ThemeToggle />

          <button
            v-if="!userStore.isLoggedIn"
            @click="showLogin"
            class="btn-default btn-sm"
          >
            Login
          </button>
          <button
            v-else
            @click="showLogout"
            class="btn-outline btn-sm"
          >
            Logout
          </button>
        </nav>
      </div>

      <!-- Mobile Navigation Sheet -->
      <div
        v-if="showMobileMenu"
        class="fixed inset-0 top-14 z-50 grid h-[calc(100vh-3.5rem)] w-full grid-flow-row auto-rows-max overflow-auto p-6 pb-32 md:hidden"
        :class="[
          'bg-popover text-popover-foreground'
        ]"
      >
        <div class="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
          <nav class="grid grid-flow-row auto-rows-max text-sm">
            <RouterLink
              to="/"
              @click="closeMobileMenu"
              class="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              active-class="font-bold"
            >
              Home
            </RouterLink>
            <RouterLink
              to="/rcu"
              @click="closeMobileMenu"
              class="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              active-class="font-bold"
            >
              RCU
            </RouterLink>
            <RouterLink
              v-if="userStore.isLoggedIn"
              to="/config"
              @click="closeMobileMenu"
              class="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              active-class="font-bold"
            >
              Config
            </RouterLink>
            <RouterLink
              v-if="userStore.isLoggedIn"
              to="/user"
              @click="closeMobileMenu"
              class="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              active-class="font-bold"
            >
              User
            </RouterLink>
            <RouterLink
              v-if="userStore.isLoggedIn"
              to="/upgrade"
              @click="closeMobileMenu"
              class="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              active-class="font-bold"
            >
              Upgrade
            </RouterLink>

            <div class="flex flex-col space-y-2 pt-4 border-t">
              <button
                v-if="!userStore.isLoggedIn"
                @click="showLogin; closeMobileMenu()"
                class="btn-default justify-start"
              >
                Login
              </button>
              <button
                v-else
                @click="showLogout; closeMobileMenu()"
                class="btn-outline justify-start"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      <!-- Mobile menu overlay -->
      <div
        v-if="showMobileMenu"
        @click="closeMobileMenu"
        class="fixed inset-0 top-14 z-30 bg-background/80 backdrop-blur-sm md:hidden"
      ></div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useUserStore } from '@/stores/user.js'
import { useThemeStore } from '@/stores/theme.js'
import ThemeToggle from './ThemeToggle.vue'
import bus from '@/bus.js'

const userStore = useUserStore();

let greeting = ref(userStore.greeting);
let loggedIn = ref(userStore.isLoggedIn);
let showMobileMenu = ref(false);



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

const showLogin = () => {
    bus.emit('show-login-modal');
};

const showLogout = () => {
  bus.emit('show-logout-modal');
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

</script>