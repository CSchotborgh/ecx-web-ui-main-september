<!-- src/components/LoginModal.vue -->
<template>
    <div v-if="show" id="authentication-modal" tabindex="-1" aria-hidden="true" class="modal-overlay flex justify-center items-center">
      <div class="relative p-4 w-full max-w-md max-h-full">
        <!-- Modal content -->
        <div class="modal-content relative">
          <!-- Close button positioned at top right -->
          <button type="button" class="absolute top-3 right-3 z-10 btn-icon text-secondary bg-transparent hover:bg-surface hover:text-primary rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center" @click="closeModal">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
          <!-- Modal header -->
          <div class="modal-header">
            <h3 class="text-xl font-semibold text-primary">
              EdgeRack™ Access - Sign In
            </h3>
          </div>
          <!-- Modal body -->
          <div class="modal-body">
            <form class="space-y-4" @submit.prevent="login">
              <div>
                <label for="username" class="form-label">Your Username</label>
                <input type="text" v-model="username" id="username" class="form-input placeholder-primary" placeholder="Username or name@company.com" required />
              </div>
              <div>
                <label for="password" class="form-label">Your Password</label>
                <input type="password" v-model="password" id="password" placeholder="••••••••" class="form-input placeholder-primary" required />
              </div>
              <div class="flex mx-auto text-sm justify-center text-error" v-show="errorMessage">
                {{ errorMessage }}
              </div>
              <div class="flex mx-auto text-sm justify-center">
                <fwb-a @click.prevent="openForgotPasswordModal" class="text-link">Forgot Password?</fwb-a>
              </div>

              <button type="submit" class="btn-primary w-full">Login to control dashboard</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
import { computed, ref, watch } from 'vue';
import { useUserStore } from '../stores/user.js';
import { FwbA } from 'flowbite-vue';
import bus from '@/bus.js';

const show = ref(false);
const username = ref('');
const password = ref('');
const rememberMe = ref(false);

const userStore = useUserStore();

const errorMessage = computed(() => userStore.errorMessage); // Computed property for error message

const login = async () => {
  await userStore.loginProcess(username.value, password.value);
  if (userStore.isLoggedIn) {
    show.value = false; // Close the modal after login
  }
};

const closeModal = () => {
  show.value = false;
};

const openForgotPasswordModal = () => {
  closeModal();
  bus.emit('show-forgot-password-modal');
};

const resetForm = () => {
  username.value = '';
  password.value = '';
}

watch(show, (newVal) => {
  if (newVal) {
    resetForm(); // Reset the form when the modal is shown
  }
});
  
defineExpose({ show });
</script>