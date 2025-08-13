
<template>
  <div class="modal" v-if="show">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <!-- Modal header -->
      <div class="modal-header">
        <h3 class="text-xl font-semibold text-primary mb-4">
          EdgeRack™ Access - Forgot Password
        </h3>
      </div>
      
      <!-- Modal body -->
      <div class="modal-body">
        <div class="text-sm text-center text-gray-300 mb-4">
          To reset password for a user, input the username and either of the MAC addresses for the ethernet interfaces.
        </div>
        <div class="text-sm text-center text-gray-300 mb-6">
          Example: if your MAC address is 01:63:42:AD:45:00, type in "016342ad4500"
        </div>

        <form class="space-y-4" @submit.prevent="forgotpass">
          <div>
            <label for="username" class="form-label">Username</label>
            <input 
              type="text" 
              v-model="username" 
              id="username" 
              class="form-input w-full p-2 border rounded" 
              :class="readyForNewPassword ? 'bg-gray-200 text-gray-500' : ''"
              placeholder="Username" 
              :disabled="readyForNewPassword"
              required 
            />
          </div>
          <div>
            <label for="mac_address" class="form-label">MAC Address (ETH1 or ETH2)</label>
            <input 
              type="text" 
              v-model="mac_address" 
              id="mac_address" 
              class="form-input w-full p-2 border rounded" 
              :class="readyForNewPassword ? 'bg-gray-200 text-gray-500' : ''"
              placeholder="00aabbccddee" 
              :disabled="readyForNewPassword"
              required 
            />
          </div>
          <div class="flex mx-auto text-sm justify-center text-red-500" v-show="errorForgotPassMessage">
            {{ errorForgotPassMessage }}
          </div>
          <div class="flex mx-auto text-sm justify-center text-green-500" v-show="resultForgotPassMessage">
            {{ resultForgotPassMessage }}
          </div>
          <button 
            type="submit" 
            :disabled="readyForNewPassword"
            class="btn-primary w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            :class="readyForNewPassword ? 'opacity-50 cursor-not-allowed' : ''"
          >
            Verify MAC
          </button>
        </form>
      </div>
      
      <!-- Success message section -->
      <div v-show="readyForNewPassword" class="modal-body">
        <div class="text-sm text-center text-gray-300">
          Password for <span class="font-bold text-white">{{ username }}</span> has been successfully reset to <span class="font-bold text-white">enconnex</span>! 
          You may now close this popup. To change your password, refresh homepage and log in again, click the "Hi {{ username }}!" link at the nav-bar to modify user settings.
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { computed, ref, watch } from 'vue';
import { useUserStore } from '../stores/user.js';
import axios from 'axios';

const show = ref(false);
const username = ref('');
const mac_address = ref('');

const readyForNewPassword = ref(false);
const userStore = useUserStore();

const errorForgotPassMessage = ref('');
const resultForgotPassMessage = ref('');

watch(() => username.value, (newValue, oldValue) => {
  if (errorForgotPassMessage.value){
    errorForgotPassMessage.value = '';
  }
}, { immediate: true }
);

watch(() => mac_address.value, (newValue, oldValue) => {
  if (errorForgotPassMessage.value){
    errorForgotPassMessage.value = '';
  }
}, { immediate: true }
);

const forgotpass = async () => {
  
  resultForgotPassMessage.value = '';
  readyForNewPassword.value = false;
  errorForgotPassMessage.value = '';

  try {
    // Prepare the POST data
    const data = {
      username: username.value,
      mac_address: mac_address.value.replace(/:/g, '')  // Remove colons from the MAC address
    };

    // Send the data via POST request to the local API server
    await axios.post('/v1/api/auth/account-recovery', data);
    resultForgotPassMessage.value = "Successfully verified MAC!"
    errorForgotPassMessage.value = '';
    readyForNewPassword.value = true;

  } catch (error) {
    errorForgotPassMessage.value = `ERROR (${error.response.status}): ${error.response.data.message}`;
  }
};

const closeModal = () => {
  show.value = false;
};

const resetForm = () => {
  username.value = '';
  mac_address.value = '';
  readyForNewPassword.value = false;
  errorForgotPassMessage.value = '';
  resultForgotPassMessage.value = '';
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
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content {
  background: linear-gradient(135deg, hsl(258, 28%, 17%) 0%, hsl(253, 25%, 15%) 100%);
  border: 1px solid hsl(276, 25%, 25%);
  color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  max-width: 400px;
  width: 90%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.close {
  cursor: pointer;
  position: absolute;
  right: 15px;
  top: 15px;
  font-size: 24px;
  font-weight: bold;
  color: #9ca3af;
}

.close:hover {
  color: white;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #d1d5db;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #4b5563;
  border-radius: 4px;
  font-size: 14px;
  background-color: hsl(256, 25%, 12%);
  color: white;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-input::placeholder {
  color: #9ca3af;
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

@keyframes fadeIn {
  0% { 
    opacity: 0; 
  }
  100% { 
    opacity: 1; 
  }
}

@keyframes slideUp {
  0% { 
    transform: translateY(20px) scale(0.95); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0) scale(1); 
    opacity: 1; 
  }
}
</style>
