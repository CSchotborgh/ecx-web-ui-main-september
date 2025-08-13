<template>
    
    <ToastComponent />

    <!-- Modal for confirming clearing of logs -->
    <fwb-modal v-if="isShowFileUpdate" :style="{top: `${scrollTop}px`, left: `${scrollLeft}px`}" class="fixed z-10" @close="closeFileUpdate">
        <template #body>
            <p class="text-base leading-relaxed text-gray-400">
                Selected file will begin transferring and immediately apply the upgrade! Total time to upgrade will vary on connection speed,
                and once upgrade runs, will take approximately two (2) minutes to complete. System will then reboot with the updated system files.
                <br /><br/>
                Proceed?
            </p>
        </template>
        <template #footer>
            <div class="flex justify-between">
                <fwb-button @click="closeFileUpdate" color="alternative">Cancel</fwb-button>
                <fwb-button @click="uploadFile" gradient="blue">Accept</fwb-button>
            </div>
        </template>
    </fwb-modal>

    <main class="container text-white">
        <!-- Top level container for file updates -->
        <div class="max-h-fit my-6 grid grid-rows-1 rounded-2xl" style="background-color: #060511; border: 1.8px solid white;">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex items-start text-2xl">Software Package Upgrading:</div>
                </div>
                <div class="container mx-auto">
                    <form @submit.prevent="showFileUpdate">
                        <div class="flex mx-10 justify-center align-center">
                            <div class="flex-1 justify-end">
                                <fwb-file-input @change="handleFileChange" v-model="file" label="Select package file..." class="m-4 align-center" />   
                            </div>
                            <div class="flex-2 justify-start align-bottom my-7">                             
                                <fwb-button gradient="blue" :disabled="uploadInProgress" type="submit" pill class="m-4 align-center">Upload Upgrade File</fwb-button>
                            </div>
                        </div>
                        <div v-show="uploadInProgress" class="flex mx-10 justify-center">
                            <fwb-progress :progress="progress" max="100" label-position="outside" label-progress label="File Upload Status" class="my-10 mx-2 w-full" />
                        </div>
                    </form>
                </div>  
                <div v-show="fwErrorMessage !== ''" class="container mx-auto flex flex-row justify-center text-red-400">{{ fwErrorMessage }}
                </div>    

                <div v-show="file_transferred" class="container mx-auto my-5 flex flex-row justify-center">
                    <ul class="list-none pl-5">
                        <li v-for="(line, index) in lines" :key="index" class="mb-2">
                            {{ line }}
                        </li>
                    </ul>

                </div>

                <div v-show="updateComplete" class="container mx-auto mt-10 flex flex-row justify-center">
                    *** System rebooting! Redirecting to the homepage in {{ countdown }} seconds. ***
                </div>    
                
                <div class="container mx-auto mt-10 flex justify-center align-center"> Upgrade Log:</div>
                <div class="container mx-auto mt-2 flex justify-center align-center">
                    <div class="flex justify-center">
                        <fwb-table>
                            <fwb-table-head>
                                <fwb-table-head-cell>Start Time</fwb-table-head-cell>
                                <fwb-table-head-cell>Duration</fwb-table-head-cell>
                                <fwb-table-head-cell>Hash</fwb-table-head-cell>
                                <fwb-table-head-cell>Result</fwb-table-head-cell>
                            </fwb-table-head>
                            <fwb-table-body>
                                <fwb-table-row v-for="log in logs" :key="log.timestamp">
                                    <fwb-table-cell>{{ log.start_timestamp }}</fwb-table-cell>
                                    <fwb-table-cell>{{ convertSecondsToTime(log.duration) }}</fwb-table-cell>
                                    <fwb-table-cell>{{ log.hash }}</fwb-table-cell>
                                    <fwb-table-cell>{{ log.result }}</fwb-table-cell>

                                </fwb-table-row>
                            </fwb-table-body>
                        </fwb-table>
                    </div>
                </div>

           </div>
        </div>
    </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { FwbFileInput, FwbProgress, FwbButton, FwbTable, FwbTableBody, FwbTableRow, FwbTableCell, FwbTableHead, FwbTableHeadCell, FwbModal } from 'flowbite-vue';
import { useUserStore } from '../stores/user.js'
import ToastComponent from '@/components/ToastComponent.vue';
import axios from 'axios';

const workerUrl = new URL('@/assets/sha256Worker.js', import.meta.url);
const worker = new Worker(workerUrl);

worker.onmessage = (e) => {
    localhash.value = e.data.hash;
};

const lines = ref([]);

let logs = ref([]);
let count = ref('');

function convertSecondsToTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - (hours * 3600)) / 60 );
    let remainingSeconds = seconds - (hours * 3600) - (minutes * 60);

    let final_result = '';

    if (hours > 0){
        final_result = `${hours} hr`;
    }
    if (minutes > 0){
        final_result = `${final_result} ${minutes} min`;
    }
    if (remainingSeconds > 0){
        final_result = `${final_result} ${remainingSeconds} sec`;
    }

    return `${final_result}`;
}

const countdown = ref(60);
const router = useRouter();
let restartInterval = null;

const startCountdownTimer =  async () => {
    await axios.post('/v1/api/upgrade/system-reboot')
    .then(response => {
        if (response.status === 200){
            lines.value.push(`[${server_time.value}]  -  System rebooting!`);

            restartInterval = setInterval(() => {
                if (countdown.value > 0){
                    countdown.value--;
                } else {
                    clearInterval(restartInterval);
                    router.push('/');
                }
            }, 1000);
        }
    }).catch(error => {
        fwErrorMessage.value = `ERROR: failed to transmit reboot command! (${error})`;
    });
};

let file = ref(null);
const progress = ref(0);

let serverHash = ref(null);
let localhash = ref('');

// Tracking the file upload progress
let uploadInProgress = ref(false);

const file_transferred = ref(false);
const file_verified = ref(false);

// Tracking the upgrading/updating process
const updateInProgress = ref(false);
const updateComplete = ref(false);

const selectedFile = ref(null);

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
  if (selectedFile.value){
    fwErrorMessage.value = '';
  }
};

async function uploadFile () {

    if (!selectedFile.value) return;

    // Close the modal window begin the upgrade process
    closeFileUpdate();

    // Start the hash computation in the worker
    worker.postMessage({ file: selectedFile.value });

    // Tracking upload progress and showing messages of the result
    uploadInProgress.value = true;

    // Reset all tracking variables
    file_transferred.value = false;
    file_verified.value = false;
    updateInProgress.value = false;
    updateComplete.value = false;

    const chunkSize = 1024 * 1024; // 1MB chunk size
    const totalChunks = Math.ceil(selectedFile.value.size / chunkSize);
    let currentChunk = 0;

    while (currentChunk < totalChunks) {
        const blob = selectedFile.value.slice(currentChunk * chunkSize, (currentChunk + 1) * chunkSize);
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('chunkNumber', currentChunk);
        formData.append('totalChunks', totalChunks);

        // if ((currentChunk + 1) == totalChunks){
        //     const response = await axios.post('/v1/api/firmware/upload', formData);
        //     serverHash.value = response.data.hash;
        // } else {
        //     await axios.post('/v1/api/firmware/upload', formData);
        // }

        await axios.post('/v1/api/upgrade/file', formData);
        progress.value = Math.ceil((currentChunk / totalChunks) * 100);

        currentChunk++;
    }

    if (currentChunk === totalChunks) {
        file_transferred.value = true;

        lines.value.push(`[${server_time.value}]  -  Verifying image...`);

        serverHash.value = '';

        await getHashWithRetry('/v1/api/upgrade/hash', 5000, 30)
        .then(data => {
            serverHash.value = data.serverHash;
        })
        .catch (() => {
            fwErrorMessage.value = 'ERROR: Failed to retrieve hash from server! Refresh page and retry';
            return;
        });

        // All chunks have been uploaded
        console.log("Server hash result: ", serverHash.value)
        console.log("Local Hash result: ", localhash.value);

        if (serverHash.value === localhash.value){
            file_verified.value = true;
            lines.value.push(`[${server_time.value}]  -  Verification successful!`);

        } else {
            fwErrorMessage.value = 'ERROR: Firmware file failed verification! Refresh page and retry';
            return;
        }
    }

    if (file_verified.value){
        await axios.post('/v1/api/upgrade/activation')
        .then(response => {
            if (response.status === 202){
                lines.value.push(`[${server_time.value}]  -  ${response.data.message}`);
                updateInProgress.value = true;

            } else if (response.status === 400){
                lines.value.push(`[${server_time.value}]  -  ${response.data.error}`);
            } else {
                lines.value.push(`[${server_time.value}]  -  ${response.data.error}`);
            }
        })
        .catch (error => {
            lines.value.push(`[${server_time.value}]  -  ${response.data.error}`);
        });
    }

    if (updateInProgress.value){
        lines.value.push(`[${server_time.value}]  -  Upgrade in progress...`);
        startPolling();
    }
}

const retrieveUpgradeStatus = async () => {
    try {
    const response = await axios.get('/v1/api/upgrade/status');
    if (response.data.success !== undefined) {
        if (response.data.success === true){
            lines.value.push(`[${server_time.value}]  -  Upgrade successful!`);
        } else {
            lines.value.push(`[${server_time.value}]  -  Upgrade failed! (${response.data.error})`);
        }
        return true;
    } else {
        return false;
    }
  } catch (error) {
    lines.value.push(`Error fetching the upgrade status: ${error}`);
    return false;
  }
};

const startPolling = () => {
    const interval = setInterval(async () => {
        const success = await retrieveUpgradeStatus();
        if (success === true) {
            clearInterval(interval);
            updateComplete.value = true;
            startCountdownTimer();
        }
    }, 1000);
};

// Modal-related variables
const scrollTop = ref(0);
const scrollLeft = ref(0);

const updateScroll = () => {
    scrollTop.value = window.scrollY;
    scrollLeft.value = window.scrollX;
}

const isShowFileUpdate = ref(false);

function closeFileUpdate () {
    isShowFileUpdate.value = false;
}
 
let errorTimeout = null;

function showFileUpdate () {

    if (!selectedFile.value){
        fwErrorMessage.value = "Please select a firmware file to upload!";

        // Clear the previous timeout if it exists
        if (errorTimeout) {
            clearTimeout(errorTimeout);
        }

        // Set a timeout to clear the error message after 10 seconds
        errorTimeout = setTimeout(() => {
            fwErrorMessage.value = '';
        }, 10000);

        return;
    }


    isShowFileUpdate.value = true;
}

async function getHashWithRetry(url, retryInterval = 1000, maxRetries = 30) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else if (response.status === 404) {
        console.log('Hash not ready, retrying...');
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching hash:', error);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
  throw new Error('Max retries reached, hash not available');
}

let fwErrorMessage = ref('');
const userStore = useUserStore();

let server_time = ref('N/A');
let loggedIn = ref(userStore.isLoggedIn);

watch (() => {
    loggedIn.value = userStore.isLoggedIn;
})

const fetchServerTime = async () => {
    await axios.get('/v1/api/server/time')
    .then(response => {
        if (response.status === 200){
            server_time.value = response.data.server_time;
        }
    })
    .catch(error => {
        console.error('Error retrieving server time!', error);
    });
};

const fetchUpgradeLogs = async () => {
    await axios.get('/v1/api/edgerack/0/realtime/upgrade-logs/count')
    .then(response => {
        if (response.status === 200){
            count = response.data.count;
        }
    }).catch(error => {
        console.error('Error retrieving upgrade log count')
    });

    await axios.get('/v1/api/edgerack/0/realtime/upgrade-logs/entries')
    .then(response => {
        if (response.status === 200){
            logs.value = response.data;
        }
    }).catch(error => {
        console.error('Error retrieving upgrade log count')
    });
}


let intervalId;

onMounted(async () => {
    loggedIn.value = userStore.isLoggedIn;

    window.addEventListener('scroll', updateScroll);

    fetchServerTime();
    intervalId = setInterval(fetchServerTime, 1000); // Fetch data every second

    await fetchUpgradeLogs();
});

onUnmounted(() => {
    window.removeEventListener('scroll', updateScroll);
    clearInterval(intervalId); // Clear the interval when the component is unmounted
});

</script>

