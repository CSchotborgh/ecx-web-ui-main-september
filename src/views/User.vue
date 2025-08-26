<template>

    <ToastComponent />
    <AlertModal 
        :show="showAlertModal" 
        title="Password Change" 
        message="Do you want to apply password change?"
        :onConfirm="handleConfirm"
        @update:show="showAlertModal = $event"
        />
    <main class="container text-white">
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-900">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex items-start text-2xl">User Settings for "{{ user }}":</div>
                </div>
                
                <div class="flex items-center justify-center w-full">
                    <hr class="w-11/12 h-px my-6 bg-gray-200 border-0 dark:bg-gray-300">
                </div>

                <div class="container flex flex-row">
                    <div class="flex items-start">Statistics</div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showStatisticsView = !showStatisticsView">
                            <div v-if="showStatisticsView">[ - ]</div>
                            <div v-else>[ + ]</div>
                        </button>
                    </div>
                </div>

                <div v-show="showStatisticsView" class="border rounded-3xl mx-6 my-2">
                    <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                        <div class="mx-4 my-2">Password Last modified:</div>
                        <div class="mx-4 my-2">{{ last_modified }}</div>
                    </div>
                    <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                        <div class="mx-4 my-2">Current Login Timestamp:</div>
                        <div class="mx-4 my-2">{{ last_login }}</div>
                    </div>
                    <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                        <div class="mx-4 my-2">Current Login Interface:</div>
                        <div class="mx-4 my-2">{{ last_login_interface }}</div>
                    </div>
                    <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                        <div class="mx-4 my-2">Previous Login Timestamp:</div>
                        <div class="mx-4 my-2">{{ second_last_login }}</div>
                    </div>
                    <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                        <div class="mx-4 my-2">Previous Login Interface:</div>
                        <div class="mx-4 my-2">{{ second_last_login_interface }}</div>
                    </div>
                </div>

                <div class="flex items-center justify-center w-full">
                    <hr class="w-11/12 h-px my-6 bg-gray-200 border-0 dark:bg-gray-300">
                </div>

                <div class="container flex flex-row">
                    <div class="flex items-start">Change Password</div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showChangePasswordView = !showChangePasswordView">
                            <div v-if="showChangePasswordView">[ - ]</div>
                            <div v-else>[ + ]</div>
                        </button>
                    </div>
                </div>

                <Transition>
                    <div v-show="showChangePasswordView" class="border rounded-3xl mx-6 my-2">
                        <form @submit.prevent="handlePasswordChange">
                            <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                                <div class="m-4">
                                    <fwb-input v-model="currentPassword" type="password" label="Current Password" placeholder="Enter current password" required />
                                </div >
                                <div class="m-4">
                                </div>
                            </div>  
                            <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                                <div class="m-4">
                                    <fwb-input 
                                        v-model="newPassword" 
                                        type="password" 
                                        label="New Password" 
                                        placeholder="Enter new password" 
                                        minlength="8" 
                                        required 
                                        />
                                </div >
                                <div class="m-4">
                                    <fwb-input 
                                        v-model="confirmNewPassword" 
                                        type="password" 
                                        label="Confirm New Password" 
                                        placeholder="Confirm new password"
                                        minlength="8" 
                                        required 
                                        />
                                </div>
                            </div> 
                            <div class="container mx-auto justify-center">
                                <div class="m-4">
                                    <p v-if="!passwordsMatch && confirmNewPassword" class="text-red-500 text-sm mt-1">
                                        Passwords do not match!
                                    </p>
                                </div >
                            </div>
                            <div class="container mx-auto justify-center">
                                <div class="m-4">
                                    <fwb-button type="submit" :disabled="!readyForUpdatePassword" gradient="blue" @click.prevent="showAlertModal = true">Update Password</fwb-button>
                                </div>
                            </div>      
                        </form>
                    </div>    
                </Transition>    


           </div>
        </div>
    </main>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useUserStore } from '../stores/user.js';
import { addToast } from '@/stores/toastManager.js';
import ToastComponent from '@/components/ToastComponent.vue';
import { FwbInput, FwbButton } from 'flowbite-vue';
import AlertModal from '@/components/AlertModal.vue';
import axios from 'axios';

const userStore = useUserStore();
const loggedIn = ref(userStore.isLoggedIn);
const user = ref(userStore.loggedInUser);

const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

const last_modified = ref(userStore.last_modified);
const last_login = ref(userStore.last_login);
const last_login_interface = ref(userStore.last_login_interface);
const second_last_login = ref(userStore.second_last_login);
const second_last_login_interface = ref(userStore.second_last_login_interface);

const showChangePasswordView = ref(false);
const showStatisticsView = ref(true);

const showAlertModal = ref(false);
const handleCancel = () => {
    showAlertModal.value = false;
};
const handleConfirm = async() => {
    try {
        await axios.post('/v1/api/auth/password-update', {
            currentPassword: currentPassword.value,
            newPassword: newPassword.value
        });
        addToast('success', `Password for ${user.value} successfully changed!`);
        currentPassword.value = '';
        newPassword.value = '';
        confirmNewPassword.value = '';

    } catch (error) {
        addToast('danger', `Password change failed! ${error.response.message}`);
    }
};

const readyForUpdatePassword = computed(() => {
    return (
        currentPassword.value.trim().length > 0 &&
        newPassword.value.trim().length > 0 &&
        confirmNewPassword.value.trim().length > 0 &&
        newPassword.value === confirmNewPassword.value
    );
});


const passwordsMatch = computed(() => {
    return newPassword.value === confirmNewPassword.value;
});

watch(() => userStore.isLoggedIn,
  (newValue) => {
    loggedIn.value = newValue;
  },
  { immediate: true }
);

watch(() => userStore.loggedInUser,
  (newValue) => {
    user.value = newValue;
  },
  { immediate: true }
);

watch(() => userStore.last_modified,
  (newValue) => {
    last_modified.value = newValue;
  },
  { immediate: true }
);

watch(() => userStore.last_login,
  (newValue) => {
    last_login.value = newValue;
  },
  { immediate: true }
);

watch(() => userStore.last_login_interface,
  (newValue) => {
    last_login_interface.value = newValue;
  },
  { immediate: true }
);

watch(() => userStore.second_last_login,
  (newValue) => {
    second_last_login.value = newValue;
  },
  { immediate: true }
);

watch(() => userStore.second_last_login_interface,
  (newValue) => {
    second_last_login_interface.value = newValue;
  },
  { immediate: true }
);

onMounted( async() => {
    loggedIn.value = userStore.isLoggedIn;
    user.value = userStore.loggedInUser;

    await userStore.retrieveUserStats();
    last_modified.value = userStore.last_modified;
    last_login.value = userStore.last_login;
    last_login_interface.value = userStore.last_login_interface;
    second_last_login.value = userStore.second_last_login;
    second_last_login_interface.value = userStore.second_last_login_interface;
    
});

</script>

