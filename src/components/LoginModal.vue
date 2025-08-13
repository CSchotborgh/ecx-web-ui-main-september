
<template>
  <div class="modal" v-if="show">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <!-- Modal header -->
      <div class="modal-header">
        <h3 class="text-xl font-semibold text-primary mb-4">
          EdgeRack™ Access - Sign In
        </h3>
      </div>
      <!-- Modal body -->
      <div class="modal-body">
        <form class="space-y-4" @submit.prevent="login">
          <div>
            <label for="username" class="form-label">Your Username</label>
            <input 
              type="text" 
              v-model="username" 
              id="username" 
              class="form-input placeholder-primary w-full p-2 border rounded" 
              placeholder="Username or name@company.com" 
              required 
            />
          </div>
          <div>
            <label for="password" class="form-label">Your Password</label>
            <input 
              type="password" 
              v-model="password" 
              id="password" 
              placeholder="••••••••" 
              class="form-input placeholder-primary w-full p-2 border rounded" 
              required 
            />
          </div>
          <div class="flex mx-auto text-sm justify-center text-red-500" v-show="errorMessage">
            {{ errorMessage }}
          </div>
          <div class="flex mx-auto text-sm justify-center">
            <fwb-a @click.prevent="openForgotPasswordModal" class="text-blue-500 hover:underline cursor-pointer">Forgot Password?</fwb-a>
          </div>

          <button type="submit" class="btn-primary w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Login to control dashboard
          </button>
        </form>
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

const errorMessage = computed(() => userStore.errorMessage);

const login = async () => {
  await userStore.loginProcess(username.value, password.value);
  if (userStore.isLoggedIn) {
    show.value = false;
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
    resetForm();
  }
});

defineExpose({ show });
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.close {
  cursor: pointer;
  position: absolute;
  right: 15px;
  top: 15px;
  font-size: 24px;
  font-weight: bold;
  color: #999;
}

.close:hover {
  color: #333;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>
