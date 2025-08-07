<!-- src/components/LoginModal.vue -->
<template>
    <div v-if="show" id="authentication-modal" tabindex="-1" aria-hidden="true" class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-black bg-opacity-50">
      <div class="relative p-4 w-full max-w-md max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <!-- Modal header -->
          <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              EdgeRack™ Access - Sign In
            </h3>
            <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" @click="closeModal">
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="p-4 md:p-5">
            <form class="space-y-4" @submit.prevent="login">
              <div>
                <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Username</label>
                <input type="text" v-model="username" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Username or name@company.com" required />
              </div>
              <div>
                <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Password</label>
                <input type="password" v-model="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
              </div>
              <div class="flex mx-auto text-sm justify-center text-red-500" v-show="errorMessage">
                {{ errorMessage }}
              </div>
              <div class="flex mx-auto text-sm justify-center text-white">
                <fwb-a @click.prevent="openForgotPasswordModal">Forgot Password?</fwb-a>
              </div>

              <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login to control dashboard</button>
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