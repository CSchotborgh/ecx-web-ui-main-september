<!-- src/components/ForgotPassword.vue -->
<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <!-- Modal content -->
        <!-- Modal header -->
        <div class="modal-header flex items-center justify-between p-4 md:p-5 border-b rounded-t">
          <h3 class="text-xl font-semibold text-primary">
            Forgot Password Form
          </h3>
          <button type="button" class="btn-icon text-secondary bg-transparent hover:bg-surface hover:text-primary rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" @click="closeModal">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <!-- Modal body -->
        <div class="modal-body p-4 md:p-5">
          <div class="flex mx-auto text-sm justify-center text-primary">
            To reset password for a user, input the username and either of the MAC addresses for the ethernet interfaces.
          </div>
          <div class="flex mx-auto text-sm justify-center text-primary mt-2">
            Example: if your MAC address is 01:63:42:AD:45:00, type in "016342ad4500"
          </div>
        </div>

        <div class="modal-body p-4 md:p-5">
          <form class="space-y-4" @submit.prevent="forgotpass">
            <div>
              <fwb-input v-model="username" :disabled="readyForNewPassword" type="text" label="Username" placeholder="Username" required  :class="readyForNewPassword ? '!text-tertiary' : 'text-primary'"/>
            </div>
            <div>
              <fwb-input v-model="mac_address" :disabled="readyForNewPassword" type="text" label="MAC Address (ETH1 or ETH2)" placeholder="00aabbccddee" required  :class="readyForNewPassword ? '!text-tertiary' : 'text-primary'"/>
            </div>
            <div class="flex mx-auto text-sm justify-center text-error" v-show="errorForgotPassMessage">
              {{ errorForgotPassMessage }}
            </div>
            <fwb-button gradient="blue" :disabled="readyForNewPassword" class="btn-primary w-full font-medium rounded-lg text-sm px-5 py-2.5 text-center">Verify MAC</fwb-button>
            <div class="flex mx-auto text-sm justify-center text-success" v-show="resultForgotPassMessage">
              {{ resultForgotPassMessage }}
            </div>
         </form>
        </div>
        
        <!-- Second Modal Section: Adjust password -->
        <div v-show="readyForNewPassword" class="modal-body p-4 md:p-5">

          <div class="mx-auto text-sm justify-center text-center text-primary">
              Password for <span class="italic font-bold">{{ username }}</span> has been successfully reset to <span class="italic font-bold">enconnex</span>! You may now close this popup. To change your password, refresh homepage and log in again, click the "Hi {{ username }}!" link at the nav-bar to modify user settings.
          </div>

          <!-- <form class="space-y-4" @submit.prevent="changepass">
            <div class="mx-auto text-sm justify-center text-center text-white">
              Password for <span class="italic font-bold">{{ username }}</span> has been successfully reset to <span class="italic font-bold">enconnex</span>! You may close this popup to accept this password or enter a different password below. Minimum of 8 characters required.
            </div>

            <div>
              <fwb-input v-model="newPassword" type="password" label="New Password" placeholder="Enter new password" minlength="8" required />
            </div>
            <div>
              <fwb-input v-model="confirmNewPassword" type="password" label="Confirm New Password" placeholder="Confirm new password" minlength="8" required />
            </div>
            <div class="flex mx-auto text-sm justify-center text-red-500">
              <p v-if="!passwordLength && newPassword" class="text-red-500 text-sm mt-1">
                  Password must be at least 8 characters!
              </p>
              <p v-if="!passwordsMatch && confirmNewPassword" class="text-red-500 text-sm mt-1">
                  Passwords do not match!
              </p>
            </div>
            <div class="flex mx-auto text-sm justify-center text-red-500" v-show="errorChangePassMessage">
              {{ errorChangePassMessage }}
            </div>
            <fwb-button :disabled="!readyForUpdatePassword" gradient="blue" class="w-full text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Update Password</fwb-button>
            <div class="flex mx-auto text-sm justify-center text-red-500" v-show="resultChangePassMessage">
              {{ resultChangePassMessage }}
            </div>
            <div class="flex mx-auto text-sm justify-center text-white" v-show="passwordChangeComplete">
              Closing pop-up in {{ countdown }} seconds...
            </div>
          </form> -->
        </div>

      </div>
    </div>
  </div>
</template>
  
<script setup>
import { computed, ref, watch } from 'vue';
import { useUserStore } from '../stores/user.js';
import { FwbButton, FwbInput } from 'flowbite-vue';
import axios from 'axios';

const show = ref(false);
const username = ref('');
const mac_address = ref('');
const rememberMe = ref(false);

const newPassword = ref('');
const confirmNewPassword = ref('');

const readyForNewPassword = ref(false);
const passwordChangeComplete = ref(false);
const userStore = useUserStore();

const resultMessage = computed(() => userStore.errorMessage); // Computed property for error message
const errorForgotPassMessage = ref('');
const resultForgotPassMessage = ref('');

const errorChangePassMessage = ref('');
const resultChangePassMessage = ref('');

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

watch(() => newPassword.value, (newValue, oldValue) => {
  if (errorForgotPassMessage.value){
    errorForgotPassMessage.value = '';
  }
}, { immediate: true }
);

watch(() => confirmNewPassword.value, (newValue, oldValue) => {
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

const countdown = ref(10);
let restartInterval = null;

const changepass = async () => {

  errorChangePassMessage.value = '';
  resultChangePassMessage.value = '';

  try {
    // Prepare the POST data
    const data = {
      username: username.value,
      currentPassword: 'enconnex',
      newPassword: newPassword.value
    };

    // Send the data via POST request to the local API server
    await axios.post('/v1/api/auth/password-update', data);
    resultChangePassMessage.value = "Password successfully updated!"
    passwordChangeComplete.value = true;

    restartInterval = setInterval(() => {
      if (countdown.value > 0){
        countdown.value--;
      } else {
        clearInterval(restartInterval);
        closeModal();
      }
    }, 1000);

  } catch (error) {
    errorChangePassMessage.value = `ERROR (${error.response.status}): ${error.response.data.message}`;
  }
};

const passwordsMatch = computed(() => {
  return newPassword.value === confirmNewPassword.value;
});

const passwordLength = computed(() => {
  return newPassword.value.trim().length >= 8;
});

const readyForUpdatePassword = computed(() => {
    return (
        newPassword.value.trim().length >= 8 &&
        confirmNewPassword.value.trim().length >= 8 &&
        newPassword.value === confirmNewPassword.value
    );
});

const closeModal = () => {
  show.value = false;
};

const resetForm = () => {
  username.value = '';
  mac_address.value = '';
  newPassword.value = '';
  confirmNewPassword.value = '';
  passwordChangeComplete.value = false;
  readyForNewPassword.value = false;
}

watch(show, (newVal) => {
  if (newVal) {
    resetForm(); // Reset the form when the modal is shown
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
  background-color: rgba(0, 0, 0, 0.8); /* Dark overlay */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background-color: white; /* Ensure this is solid white */
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
  padding-bottom: 15px;
}

.modal-body {
  margin-bottom: 20px;
}
</style>