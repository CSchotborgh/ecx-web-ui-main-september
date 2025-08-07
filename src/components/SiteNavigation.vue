<template>
    <nav class="nav-container sticky top-0 z-50">
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between h-16">
                <!-- Logo -->
                <div class="flex items-center space-x-3">
                    <img src="/images/ecx_logo.png" alt="ECX Logo" class="h-8 w-8">
                    <span class="text-xl font-bold text-white">EDGERACK</span>
                </div>

                <!-- Desktop Navigation -->
                <div class="hidden md:flex items-center space-x-1">
                    <!-- User Greeting -->
                    <RouterLink v-show="greeting" :to="{ name: 'user' }" class="nav-link">
                        <span class="text-blue-400 font-semibold">{{ greeting }}</span>
                    </RouterLink>
                    
                    <!-- Navigation Links -->
                    <RouterLink :to="{ name: 'home' }" class="nav-link">
                        Home
                    </RouterLink>
                    
                    <RouterLink :to="{ name: 'cooling' }" class="nav-link">
                        Cooling Unit
                    </RouterLink>
                    
                    <RouterLink v-show="loggedIn" :to="{ name: 'config' }" class="nav-link">
                        Config
                    </RouterLink>
                    
                    <RouterLink v-show="loggedIn" :to="{ name: 'upgrade' }" class="nav-link">
                        Upgrade
                    </RouterLink>
                    
                    <!-- Auth Buttons -->
                    <button v-show="!loggedIn" @click.prevent="showLoginModal" class="btn-primary ml-4">
                        Log In
                    </button>
                    
                    <button v-show="loggedIn" @click.prevent="showLogoutModal" class="btn-secondary ml-4">
                        Log Out
                    </button>
                    
                    <!-- Theme Toggle -->
                    <div class="ml-4">
                        <ThemeToggle />
                    </div>
                </div>

                <!-- Mobile menu button -->
                <div class="md:hidden">
                    <button @click="mobileMenuOpen = !mobileMenuOpen" class="nav-link">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Mobile Navigation -->
            <div v-show="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-700">
                <div class="flex flex-col space-y-2">
                    <RouterLink v-show="greeting" :to="{ name: 'user' }" class="nav-link block">
                        <span class="text-blue-400 font-semibold">{{ greeting }}</span>
                    </RouterLink>
                    
                    <RouterLink :to="{ name: 'home' }" class="nav-link block">
                        Home
                    </RouterLink>
                    
                    <RouterLink :to="{ name: 'cooling' }" class="nav-link block">
                        Cooling Unit
                    </RouterLink>
                    
                    <RouterLink v-show="loggedIn" :to="{ name: 'config' }" class="nav-link block">
                        Config
                    </RouterLink>
                    
                    <RouterLink v-show="loggedIn" :to="{ name: 'upgrade' }" class="nav-link block">
                        Upgrade
                    </RouterLink>
                    
                    <div class="pt-4 border-t border-gray-700 mt-4">
                        <button v-show="!loggedIn" @click.prevent="showLoginModal" class="btn-primary w-full mb-2">
                            Log In
                        </button>
                        
                        <button v-show="loggedIn" @click.prevent="showLogoutModal" class="btn-secondary w-full mb-2">
                            Log Out
                        </button>
                        
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </div>
    </nav>
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
let mobileMenuOpen = ref(false);



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